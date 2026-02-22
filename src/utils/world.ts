import { setWorldConstructor, IWorldOptions, World } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from 'playwright';

export type TestData = Record<string, unknown>;

export interface ApiResponse<T> {
  status: number;
  headers: Record<string, string>;
  body: T;
}

export class ApiClient {
  constructor(public readonly baseUrl: string) {}

  private buildUrl(path: string): string {
    const base = this.baseUrl.replace(/\/$/, '');
    const p = path.replace(/^\//, '');
    return `${base}/${p}`;
  }

  async get<T = unknown>(path: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const res = await fetch(url, { method: 'GET', headers });
    const text = await res.text();
    const contentType = res.headers.get('content-type') ?? '';
    const body = contentType.includes('application/json') ? (JSON.parse(text) as T) : (text as unknown as T);
    return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body };
  }

  async post<T = unknown, B = unknown>(path: string, body?: B, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(headers ?? {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    const contentType = res.headers.get('content-type') ?? '';
    const parsed = contentType.includes('application/json') ? (JSON.parse(text) as T) : (text as unknown as T);
    return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body: parsed };
  }
}

class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  apiClient?: ApiClient;
  testData: TestData = {};
  scenarioContext: Record<string, any> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  async initApiClient(baseUrl: string): Promise<void> {
    this.apiClient = new ApiClient(baseUrl);
  }

  setTestData(key: string, value: unknown): void {
    this.testData[key] = value;
  }

  getTestData<T = unknown>(key: string): T | undefined {
    return this.testData[key] as T | undefined;
  }

  async newContext(contextOptions?: Parameters<Browser['newContext']>[0]): Promise<BrowserContext> {
    if (!this.browser) throw new Error('Browser instance is not available on the World.');
    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();
    return this.context;
  }

  async closeContext(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = undefined;
      this.page = undefined;
    }
  }
}

setWorldConstructor(CustomWorld);

export type CustomWorldType = CustomWorld;
export { CustomWorld };
