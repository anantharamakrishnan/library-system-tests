type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITIES: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function getConfiguredLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (!raw) return 'info';
  if (raw === 'debug') return 'debug';
  if (raw === 'warn') return 'warn';
  if (raw === 'error') return 'error';
  return 'info';
}

function timestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, name: string | undefined, message: string, meta?: Record<string, unknown>): string {
  const parts = [`[${timestamp()}]`, `[${level.toUpperCase()}]`];
  if (name) parts.push(`[${name}]`);
  parts.push(message);
  if (meta && Object.keys(meta).length > 0) {
    try {
      parts.push(JSON.stringify(meta));
    } catch {
      parts.push(String(meta));
    }
  }
  return parts.join(' ');
}

export class Logger {
  private level: LogLevel;

  constructor(private readonly name?: string) {
    this.level = getConfiguredLevel();
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITIES[level] >= LEVEL_PRIORITIES[this.level];
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    // eslint-disable-next-line no-console
    console.debug(formatMessage('debug', this.name, message, meta));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    // eslint-disable-next-line no-console
    console.log(formatMessage('info', this.name, message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    // eslint-disable-next-line no-console
    console.warn(formatMessage('warn', this.name, message, meta));
  }

  error(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    // eslint-disable-next-line no-console
    console.error(formatMessage('error', this.name, message, meta));
  }
}

const rootLogger = new Logger('tests');

export function getLogger(name?: string): Logger {
  if (!name) return rootLogger;
  return new Logger(name);
}

export default rootLogger;
