import type { Page } from 'playwright';
import { BasePage } from './basePage';
import { expect } from '@playwright/test';

/**
 * EditBookPage encapsulates interactions for editing an existing book
 */
export class EditBookPage extends BasePage {
  private readonly formSelector = 'h2.text-3xl';
  private readonly submitButton = this.page.getByRole('button', { name: 'Save' });

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigate(bookId: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}/books/edit/${bookId}`);
    await this.expectVisible(this.formSelector);
  }

     /**
   * Assert edit book page is visible after successful navigation
   */
  async assertEditBookPageVisible(): Promise<void> {
    const navTimeout = Number(process.env.TIMEOUT_NAVIGATION ?? '60000');
    await this.expectVisible(this.formSelector, navTimeout);
  }

  /**
   * Assert the book details in the edit form match the expected details
   * @param details 
   */
  async assertBookDetailsInEditForm(details: {
    title: string;
    author: string;
    genre: string;
    isbn: string;
    publicationDate: string;
    price: string;
  }): Promise<void> {
    await expect(this.page.locator('input[name="title"]')).toHaveValue(details.title);
    await expect(this.page.locator('input[name="author"]')).toHaveValue(details.author);
    await expect(this.page.locator('input[name="genre"]')).toHaveValue(details.genre);
    await expect(this.page.locator('input[name="isbn"]')).toHaveValue(details.isbn);

    const formattedDate = details.publicationDate.split("/").reverse().join("-");

    await expect(this.page.locator('input[name="publicationDate"]')).toHaveValue(formattedDate);
    console.log(`Expected price in edit form: ${details.price}`);

    await expect(this.page.locator('input[name="price"]')).toHaveValue(details.price.replace('£', ''));
  } 

  async fillBookDetails(details: {
    title?: string;
    author?: string;
    genre?: string;
    isbn?: string;
    publicationDate?: string;
    price?: string;
  }): Promise<void> {

        console.log('New book data from DataTable:', details.publicationDate);

    if (details.title) await this.page.fill('input[name="title"]', details.title);
    if (details.author) await this.page.fill('input[name="author"]', details.author);
    if (details.genre) await this.page.fill('input[name="genre"]', details.genre);
    if (details.isbn) await this.page.fill('input[name="isbn"]', details.isbn);
    if (details.publicationDate) await this.page.fill('input[name="publicationDate"]', details.publicationDate.split("/").reverse().join("-"));
    if (details.price) await this.page.fill('input[name="price"]', details.price);

    await this.submitButton.click();
  }


}

export default EditBookPage;
