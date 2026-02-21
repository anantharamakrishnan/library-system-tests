import { setDefaultTimeout } from '@cucumber/cucumber';
import { loadEnvConfig } from './env';

// Ensure TEST_ENV is set (prefer NODE_ENV when present); default to 'qa'
process.env.TEST_ENV = process.env.TEST_ENV ?? process.env.NODE_ENV ?? 'qa';

// Load .env.<env> so BASE_URL and other environment settings are available.
loadEnvConfig();

// Global cucumber configuration executed before step definitions load
setDefaultTimeout(60_000);

export {};
