import type { Page } from 'playwright';
import { BasePage } from './basePage';
import { expect } from '@playwright/test';

/**
 * AddBookPage encapsulates interactions for adding a new book
 */
export class AddBookPage extends BasePage {
  private readonly formSelector = 'h2[id="add-book-heading"]';
  private readonly alertErrorTitleMessage = this.page.locator('div[role="alert"][aria-live="assertive"]');
  private readonly alertErrorFieldMessage = this.page.locator('div[role="alert"][aria-live="assertive"]');

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigate(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/books/add`);
    await this.expectVisible(this.formSelector);
  }

   /**
   * Assert add book page is visible after successful navigation
   */
  async assertAddBookPageVisible(): Promise<void> {
    const navTimeout = Number(process.env.TIMEOUT_NAVIGATION ?? '60000');
    await this.expectVisible(this.formSelector, navTimeout);
  }

  async fillBookDetails(details: {
    title?: string | null;
    author?: string | null;
    genre?: string | null;
    isbn?: string | null;
    publicationDate?: string | null;
    price?: string | null;
  }): Promise<void> {
    await this.fillIfPresent('input#title', details.title);
    await this.fillIfPresent('input#author', details.author);
    await this.fillIfPresent('input#isbn', details.isbn);
    await this.fillIfPresent('input#publicationDate', details.publicationDate);
    await this.fillIfPresent('input#price', details.price);

    if (details.genre?.trim()) {
      await this.page.selectOption('select#genre', { label: details.genre });
    } 
  }

  async validateTitleErrorMessage(bookTitle: string,  expectedMessage: string): Promise<void> {
    if (!bookTitle) {
      await expect(this.alertErrorFieldMessage).toContainText(expectedMessage);
      await this.expectVisible('p#title-error');
      await expect(this.page.locator('p#title-error')).toHaveText(expectedMessage);
    }
  } 

  async assertErrorMessageVisible(bookDetails: { 
    title?: string | null;
    author?: string | null;
    genre?: string | null;
    isbn?: string | null;
    publicationDate?: string | null;
    price?: string | null;
    }): Promise<void> {
    
    const hasEmptyField = Object.values(bookDetails).some(
    value => !value || value.trim() === ""
  );

  if (hasEmptyField) {
    await expect(this.alertErrorTitleMessage).toBeVisible();
  } else {
    await expect(this.alertErrorTitleMessage).not.toBeVisible();
  }

  await this.validateTitleErrorMessage(bookDetails.title ?? '', 'Title is required.');

    if (!bookDetails.author) {
      await expect(this.alertErrorFieldMessage).toContainText('Author is required.');
      await this.expectVisible('p#author-error');
       await expect(this.page.locator('p#author-error')).toHaveText('Author is required.');
   }
    if (!bookDetails.genre) {
      await expect(this.alertErrorFieldMessage).toContainText('Genre is required.');
      await this.expectVisible('p#genre-error');
      await expect(this.page.locator('p#genre-error')).toHaveText('Genre is required.');
    }
    if (!bookDetails.isbn) {
      await expect(this.alertErrorFieldMessage).toContainText('ISBN is required.');
      await this.expectVisible('p#isbn-error');
      await expect(this.page.locator('p#isbn-error')).toHaveText('ISBN is required.');
    }
    if (!bookDetails.publicationDate) {
      await expect(this.alertErrorFieldMessage).toContainText('Publication Date is required.');
      await this.expectVisible('p#publicationDate-error');
      await expect(this.page.locator('p#publicationDate-error')).toHaveText('Publication Date is required.');
    }
    if (!bookDetails.price) {
      await expect(this.alertErrorFieldMessage).toContainText('Price is required.');
      await this.expectVisible('p#price-error');
      await expect(this.page.locator('p#price-error')).toHaveText('Price is required.');
    }

    await this.page.waitForTimeout(1000); // Add a short delay to ensure all assertions are processed
  } 

  
  private async fillIfPresent(selector: string, value?: string | null) {
  if (value?.trim()) {
    await this.page.fill(selector, value);
  }
}

}



export default AddBookPage;
