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
    const url = path.match(/^https?:\/\//) ? path : `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    await this.page.goto(url, options);
  }

  async click(selector: Selector, options?: Parameters<Locator['click']>[0]): Promise<void> {
    const loc = this.getLocator(selector);
    await loc.waitFor({ state: 'visible' });
    await loc.click(options);
  }

  async type(selector: Selector, text: string, options?: { delay?: number }): Promise<void> {
    const loc = this.getLocator(selector);
    await loc.waitFor({ state: 'visible' });
    await loc.fill(text);
    if (options?.delay) {
      // emulate some typing delay if requested
      await this.page.waitForTimeout(options.delay);
    }
  }

  async waitForVisible(selector: Selector, timeout = 5000): Promise<void> {
    const loc = this.getLocator(selector);
    await loc.waitFor({ state: 'visible', timeout });
  }

  async getText(selector: Selector): Promise<string> {
    const loc = this.getLocator(selector);
    await loc.waitFor({ state: 'attached' });
    const txt = await loc.textContent();
    return txt ?? '';
  }

  async expectVisible(selector: Selector, timeout = 5000): Promise<void> {
    await this.waitForVisible(selector, timeout);
  }
}

export default BasePage;
