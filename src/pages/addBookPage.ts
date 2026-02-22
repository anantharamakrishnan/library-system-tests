import type { Page } from 'playwright';
import { BasePage } from './basePage';

/**
 * AddBookPage encapsulates interactions for adding a new book
 */
export class AddBookPage extends BasePage {
  private readonly formSelector = 'h2[id="add-book-heading"]';

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
    title: string;
    author: string;
    genre: string;
    isbn: string;
    publicationDate: string;
    price: string;
  }): Promise<void> {
    await this.page.fill('input#title', details.title);
    await this.page.fill('input#author', details.author);
    await this.page.selectOption('select#genre', { label: details.genre });
    await this.page.fill('input#isbn', details.isbn);
    await this.page.fill('input#publicationDate', details.publicationDate);
    await this.page.fill('input#price', details.price);
  }

}

export default AddBookPage;
