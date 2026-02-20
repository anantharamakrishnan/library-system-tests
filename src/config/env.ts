import path from 'path';
import dotenv from 'dotenv';

// ─── Supported Environments ───────────────────────────────────────────────────

const SUPPORTED_ENVS = ['dev', 'qa', 'prod'] as const;
export type SupportedEnv = (typeof SUPPORTED_ENVS)[number];

// ─── Typed Configuration Interface ───────────────────────────────────────────

export interface EnvConfig {
    // Runtime context
    readonly testEnv: SupportedEnv;

    // Application endpoints
    readonly baseUrl: string;
    readonly apiBaseUrl: string;

    // Browser settings
    readonly browser: 'chromium' | 'firefox' | 'webkit';
    readonly headless: boolean;
    readonly slowMo: number;
    readonly recordVideo: boolean;
    readonly trace: boolean;

    // Credentials
    readonly adminUsername: string;
    readonly adminPassword: string;
    readonly standardUsername: string;
    readonly standardPassword: string;
    readonly readonlyUsername: string;
    readonly readonlyPassword: string;

    // Timeouts (ms)
    readonly timeoutNavigation: number;
    readonly timeoutElement: number;
    readonly timeoutApi: number;
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Resolves and loads the correct .env.<environment> file from the project root.
 * Must be called before any process.env access.
 */
function loadEnvFile(env: SupportedEnv): void {
    const envFilePath = path.resolve(process.cwd(), `.env.${env}`);
    const result = dotenv.config({ path: envFilePath });

    if (result.error) {
        throw new Error(
            `[EnvLoader] Failed to load "${envFilePath}".\n` +
            `  Cause: ${result.error.message}\n` +
            `  Ensure the file exists or create it from .env.example`,
        );
    }
}

/**
 * Reads a required string environment variable.
 * Throws immediately (fail-fast) if the variable is absent or empty.
 */
function requireString(key: string): string {
    const value = process.env[key];
    if (value === undefined || value.trim() === '') {
        throw new Error(
            `[EnvLoader] Required environment variable "${key}" is missing or empty.\n` +
            `  Check your .env.<environment> file or CI secret store.`,
        );
    }
    return value.trim();
}

/**
 * Reads a required integer environment variable.
 * Throws if the variable is absent, empty, or not a valid integer.
 */
function requireInt(key: string): number {
    const raw = requireString(key);
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
        throw new Error(
            `[EnvLoader] Environment variable "${key}" must be a valid integer. Got: "${raw}".`,
        );
    }
    return parsed;
}

/**
 * Reads a boolean environment variable ("true"/"false"/"1"/"0").
 */
function requireBool(key: string, defaultValue: boolean): boolean {
    const raw = process.env[key];
    if (raw === undefined || raw.trim() === '') return defaultValue;
    const normalised = raw.trim().toLowerCase();
    if (normalised === 'true' || normalised === '1') return true;
    if (normalised === 'false' || normalised === '0') return false;
    throw new Error(
        `[EnvLoader] Environment variable "${key}" must be "true" or "false". Got: "${raw}".`,
    );
}

/**
 * Validates the resolved browser string is one of the supported Playwright types.
 */
function requireBrowser(key: string): EnvConfig['browser'] {
    const value = requireString(key).toLowerCase();
    if (value === 'chromium' || value === 'firefox' || value === 'webkit') {
        return value;
    }
    throw new Error(
        `[EnvLoader] Environment variable "${key}" must be one of: chromium, firefox, webkit. ` +
        `Got: "${value}".`,
    );
}

// ─── Environment Validation & Resolution ──────────────────────────────────────

/**
 * Resolves the target environment from TEST_ENV.
 * Falls back to "dev" if not set, but throws on an unrecognised value.
 */
function resolveTargetEnv(): SupportedEnv {
    const raw = (process.env['TEST_ENV'] ?? 'dev').toLowerCase().trim();

    if ((SUPPORTED_ENVS as ReadonlyArray<string>).includes(raw)) {
        return raw as SupportedEnv;
    }

    throw new Error(
        `[EnvLoader] Unrecognised TEST_ENV value: "${raw}".\n` +
        `  Valid options are: ${SUPPORTED_ENVS.join(', ')}.`,
    );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Loads and validates the complete environment configuration.
 *
 * Execution order:
 *  1. Determine target environment from TEST_ENV.
 *  2. Load the corresponding .env.<environment> file.
 *  3. Validate and coerce every variable — fail-fast on the first missing value.
 *  4. Return a frozen, typed EnvConfig object.
 *
 * This function is intentionally NOT memoised here — the singleton pattern
 * lives in the Cucumber World so that parallel workers each own their config.
 *
 * @throws {Error} On any missing required variable or invalid value.
 */
export function loadEnvConfig(): EnvConfig {
    // Step 1: resolve env name (uses TEST_ENV already in process.env if set externally
    //         e.g. via cross-env in an npm script before .env is loaded)
    const testEnv = resolveTargetEnv();

    // Step 2: load .env.<env> — populates process.env for steps 3+
    loadEnvFile(testEnv);

    // Step 3: re-resolve TEST_ENV now that the file is loaded (file value wins if
    //         the caller did not set it externally — consistency guard)
    const confirmedEnv = resolveTargetEnv();

    // Step 4: validate and build the typed config
    const config: EnvConfig = {
        testEnv: confirmedEnv,

        baseUrl: requireString('BASE_URL'),
        apiBaseUrl: requireString('API_BASE_URL'),

        browser: requireBrowser('BROWSER'),
        headless: requireBool('HEADLESS', true),
        slowMo: requireInt('SLOW_MO'),
        recordVideo: requireBool('RECORD_VIDEO', false),
        trace: requireBool('TRACE', false),

        adminUsername: requireString('ADMIN_USERNAME'),
        adminPassword: requireString('ADMIN_PASSWORD'),
        standardUsername: requireString('STANDARD_USERNAME'),
        standardPassword: requireString('STANDARD_PASSWORD'),
        readonlyUsername: requireString('READONLY_USERNAME'),
        readonlyPassword: requireString('READONLY_PASSWORD'),

        timeoutNavigation: requireInt('TIMEOUT_NAVIGATION'),
        timeoutElement: requireInt('TIMEOUT_ELEMENT'),
        timeoutApi: requireInt('TIMEOUT_API'),
    };

    // Step 5: freeze — prevents accidental mutation inside step definitions
    return Object.freeze(config);
}

/**
 * Convenience re-export. Consumers should call this only once (in World/Before hook)
 * and pass the result down. Avoids repeated file-system hits.
 */
export type { EnvConfig as Config };
