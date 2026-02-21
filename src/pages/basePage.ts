import type { Page, Locator } from 'playwright';

type Selector = string | Locator;

export class BasePage {
  protected readonly page: Page;
  protected readonly baseUrl: string;

  constructor(page: Page, baseUrl?: string) {
    this.page = page;
    this.baseUrl = baseUrl ?? process.env.BASE_URL ?? '';
  }

  protected getLocator(selector: Selector): Locator {
    return typeof selector === 'string' ? this.page.locator(selector) : selector;
  }

  async navigate(path: string, options?: Parameters<Page['goto']>[1]): Promise<void> {
    if (path.match(/^https?:\/\//)) {
      const navTimeout = Number(process.env.TIMEOUT_NAVIGATION ?? '60000');
      await this.page.goto(path, { timeout: navTimeout, ...(options ?? {}) });
      return;
    }

    const cleanedBase = this.baseUrl.replace(/\/$/, '');
    const cleanedPath = `/${path.replace(/^\//, '')}`;
    const url = cleanedBase ? (cleanedBase.endsWith(cleanedPath) ? cleanedBase : `${cleanedBase}${cleanedPath}`) : cleanedPath;
    const navTimeout = Number(process.env.TIMEOUT_NAVIGATION ?? '60000');
    await this.page.goto(url, { timeout: navTimeout, ...(options ?? {}) });
  }

  async click(selector: Selector, options?: Parameters<Locator['click']>[0]): Promise<void> {
    const loc = this.getLocator(selector);
    const timeout = Number(process.env.TIMEOUT_ELEMENT ?? '5000');
    await loc.waitFor({ state: 'visible', timeout });
    await loc.click(options);
  }

  async type(selector: Selector, text: string, options?: { delay?: number }): Promise<void> {
    const loc = this.getLocator(selector);
    const timeout = Number(process.env.TIMEOUT_ELEMENT ?? '5000');
    await loc.waitFor({ state: 'visible', timeout });
    await loc.fill(text);
    if (options?.delay) {
      // emulate some typing delay if requested
      await this.page.waitForTimeout(options.delay);
    }
  }

  async waitForVisible(selector: Selector, timeout = Number(process.env.TIMEOUT_ELEMENT ?? '5000')): Promise<void> {
    const loc = this.getLocator(selector);
    await loc.waitFor({ state: 'visible', timeout });
  }

  async getText(selector: Selector): Promise<string> {
    const loc = this.getLocator(selector);
    await loc.waitFor({ state: 'attached' });
    const txt = await loc.textContent();
    return txt ?? '';
  }

  async expectVisible(selector: Selector, timeout = Number(process.env.TIMEOUT_ELEMENT ?? '5000')): Promise<void> {
    await this.waitForVisible(selector, timeout);
  }
}

export default BasePage;
