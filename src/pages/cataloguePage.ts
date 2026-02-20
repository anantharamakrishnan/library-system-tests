import type { Page } from 'playwright';
import { BasePage } from './basePage';

/**
 * CataloguePage encapsulates product list interactions and validations
 */
export class CataloguePage extends BasePage {
  private readonly productItem = '.product-item';
  private readonly productTitle = '.product-title';
  private readonly productSelectButton = '.select-product';

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  /**
   * Select a product either by zero-based index or by matching title text
   */
  async selectProduct(by: number | string): Promise<void> {
    await this.waitForVisible(this.productItem);
    if (typeof by === 'number') {
      const total = await this.page.locator(this.productItem).count();
      if (by < 0 || by >= total) throw new Error(`selectProduct: index ${by} is out of range (0..${total - 1})`);
      const item = this.page.locator(this.productItem).nth(by);
      const button = item.locator(this.productSelectButton);
      await button.click();
      return;
    }

    const candidate = this.page.locator(`${this.productItem}:has-text("${by}")`).first();
    const exists = await candidate.count();
    if (exists === 0) throw new Error(`selectProduct: no product matching title "${by}"`);
    const btn = candidate.locator(this.productSelectButton).first();
    await btn.click();
  }

  /**
   * Validate number of products in the catalogue
   */
  async validateProductCount(expected: number): Promise<void> {
    await this.waitForVisible(this.productItem);
    const actual = await this.page.locator(this.productItem).count();
    if (actual !== expected) throw new Error(`validateProductCount: expected ${expected} products, found ${actual}`);
  }

  /**
   * Validate title text of product at zero-based index
   */
  async validateProductTitle(index: number, expectedTitle: string): Promise<void> {
    await this.waitForVisible(this.productItem);
    const total = await this.page.locator(this.productItem).count();
    if (index < 0 || index >= total) throw new Error(`validateProductTitle: index ${index} out of range (0..${total - 1})`);
    const titleLocator = this.page.locator(this.productItem).nth(index).locator(this.productTitle);
    await titleLocator.waitFor({ state: 'visible' });
    const actual = (await titleLocator.textContent()) ?? '';
    if (actual.trim() !== expectedTitle.trim()) {
      throw new Error(`validateProductTitle: expected "${expectedTitle}", found "${actual}"`);
    }
  }
}

export default CataloguePage;
