
import type { Page } from 'playwright';
import { expect } from '@playwright/test';
import { BasePage } from './basePage';


/**
 * CataloguePage encapsulates product list interactions and validations
 */
export class CataloguePage extends BasePage {
  
  // Locators
  private readonly productItem = '.product-item';
  private readonly productTitle = '.product-title';
  private readonly productSelectButton = '.select-product';
  private readonly logoutButton = this.page.getByRole('button', { name: 'Log Out' });

  private readonly catalogueTableHeader = 'table thead th';
  private readonly catalogueTableRow = 'table tbody tr';
  private readonly catalogueBookCount = 'h3.text-lg';
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  
  /**
   * Validate the catalogue page table headers
   */
  async validateTableHeaders(expectedHeaders: string[]): Promise<void> {
    const headerLocators = this.page.locator(this.catalogueTableHeader);

    await headerLocators.first().waitFor({ state: 'visible' });
    const count = await headerLocators.count();
    if (count !== expectedHeaders.length) {
      throw new Error(`validateTableHeaders: expected ${expectedHeaders.length} headers, found ${count}`);
    }
    for (let i = 0; i < count; i++) {
      const actual = (await headerLocators.nth(i).textContent())?.trim() ?? '';
      if (actual !== expectedHeaders[i]) {
        throw new Error(`validateTableHeaders: at index ${i}, expected "${expectedHeaders[i]}", found "${actual}"`);
      }
    }
  }
  
  /**
   * Assert catalogue is visible after successful login
   */
  async assertCatalogueVisible(): Promise<void> {
    const navTimeout = Number(process.env.TIMEOUT_NAVIGATION ?? '60000');
    await this.expectVisible(this.logoutButton, navTimeout);
    // Also check for dashboard welcome text
    const body = this.page.locator('body');
    await body.waitFor({ state: 'visible', timeout: navTimeout });
    const bodyText = await body.textContent();
    if (!bodyText || !bodyText.includes('Welcome, Admin!')) {
      throw new Error('Dashboard welcome text not found');
    }
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


  /**
   * Get total number of bookks displayed in the catalogue
   * Also Validate Row count and the text content matches
   */
  async getTotalBooks(): Promise<number> {
    const rowLocator = this.page.locator(this.catalogueBookCount);
    const rowData = await rowLocator.textContent();
    if (!rowData) {
      throw new Error('Row locator text content is null');
    }
    const totalBooks = parseInt(rowData.replace('Total Book Titles: ', '').trim(), 10);
    console.log(`Total books from catalogue header: ${totalBooks}`);
      const tableRowCount = await this.page.locator(this.catalogueTableRow).count();
    console.log(`Total book rows in table: ${tableRowCount}`);
      if (totalBooks !== tableRowCount) {
        throw new Error(`Total books count ${totalBooks} does not match table row count ${tableRowCount}`);
      }

    return totalBooks;
  }

  /**
   * Validate the book count in the catalogue
   */
  async assertBookCount(expectedCount: number): Promise<void> {
    const rowLocator = this.page.locator(this.catalogueBookCount);
    await rowLocator.first().waitFor({ state: 'visible' });
    const rowData = await rowLocator.textContent();
    if (!rowData) {
    throw new Error('Row locator text content is null');
    }

    const actualCount = parseInt(rowData.replace('Total Book Titles: ', '').trim(),10);
    
    if (actualCount !== expectedCount) {
      throw new Error(`assertBookCount: expected ${expectedCount} books, found ${actualCount}`);
    }
  }

/**
 * Assert the book details in the catalogue table match the expected details
 */
async assertBookInCatalogue(isBookExist: boolean, title: string): Promise<void> {

  const getBookByRow = this.page.locator(this.catalogueTableRow, { hasText: title });

    await expect(getBookByRow).toHaveCount(isBookExist ? 1 : 0);

} 


/**
 * Get book details from the book list table based on table properties
 */
async getBookDetailsByTitle(title: string): Promise<{
  index: number;
  book: {
    title: string;
    author: string;
    genre: string;
    isbn: string;
    publicationDate: string;
    price: string;
  };
} | null> {
  const rows = this.page.locator(this.catalogueTableRow);
  const rowCount = await rows.count();
  
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const titleCell = await row.locator('td').nth(0).textContent();
    if (titleCell?.trim() === title) {
      const author = (await row.locator('td').nth(1).textContent())?.trim() ?? '';
      const genre = (await row.locator('td').nth(2).textContent())?.trim() ?? '';
      const isbn = (await row.locator('td').nth(3).textContent())?.trim() ?? '';
      const publicationDate = (await row.locator('td').nth(4).textContent())?.trim() ?? '';
      const price = (await row.locator('td').nth(5).textContent())?.trim() ?? '';
      return { index: i, book: { title: titleCell.trim(), author, genre, isbn, publicationDate, price } };
    }
  }
  return null;
} 

  /**
   * Click a button (Edit/Delete) for a specific book by its title
   */
  async clickButtonForBookByTitle(bookIndex: number, bookTitle: string, buttonName: string): Promise<void> {
    const rows = this.page.locator(this.catalogueTableRow);
    
      const row = rows.nth(bookIndex);
      const titleCell = await row.locator('td').nth(0).textContent();
      if (titleCell?.trim() === bookTitle) {
        await row.getByRole('button', { name: buttonName }).click();
        return;
      }
    throw new Error(`Book with title "${bookTitle}" not found in catalogue`);
  }


  /**
   * Delete book by Row Index
   */
  async removeBookByRowIndex(bookIndex: number): Promise<void> {
    const rows = this.page.locator(this.catalogueTableRow);
    const row = rows.nth(bookIndex);
    await row.getByRole('button', { name: 'Delete' }).click();
  }


  /**
   * Assert Pagination buttons based on book count
   * 
   */
  async assertPaginationState(expectedState: 'enabled' | 'disabled'): Promise<void> {
    const nextButton = this.page.getByRole('button', { name: 'Next' });
    const prevButton = this.page.getByRole('button', { name: 'Previous' });

    if (expectedState === 'enabled') {
      await expect(nextButton).toBeEnabled();
      await expect(prevButton).toBeEnabled();
    } else {
      await expect(nextButton).toBeDisabled();
      await expect(prevButton).toBeDisabled();
    }
  }

  /**
   * Assert the book Catalogue
   * @param newBookCounter 
   * @param book 
   */

  async assertCatalogueForBook( newBookCounter: number,  book: { title: string; author: string;  genre:string, isbn?: string; publicationDate?: string; price?: string }): Promise<void> {
    let found = false;
      const row = this.page.locator('table tbody tr').nth(newBookCounter);
      // Title
      if (book.title) {
        await expect(row.locator('td').nth(0)).toHaveText(book.title, { timeout: 15000 });
      }
      // Author
      if (book.author) {
        await expect(row.locator('td').nth(1)).toHaveText(book.author, { timeout: 15000 });
      }
       // Genre
      if (book.genre) {
        await expect(row.locator('td').nth(2)).toHaveText(book.genre, { timeout: 15000 });
      }
     
      // ISBN
      if (book.isbn) {
        await expect(row.locator('td').nth(3)).toHaveText(book.isbn, { timeout: 15000 });
      }
      // Publication Date
      if (book.publicationDate) {
        const formattedDate = book.publicationDate.split("-").reverse().join("/");
        await expect(row.locator('td').nth(4)).toHaveText(formattedDate, { timeout: 15000 });
      }
      // Price
      if (book.price) {
        console.log(`Validating price: expected "${book.price}"`);
        const formattedBookPrice = Number(book.price).toFixed(2);

        await expect(row.locator('td').nth(5)).toHaveText("£" + formattedBookPrice, { timeout: 15000 });
      }
      // If all match, set found
      found = true;
    
    if (!found) throw new Error(`Book with title "${book.title}" and author "${book.author}" not found in catalogue`);
  }
   
}

export default CataloguePage;
