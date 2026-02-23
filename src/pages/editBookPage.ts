import type { Locator, Page } from 'playwright';
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

      const titleInput = this.page.locator('input[name="title"]');
      await titleInput.clear();
      await titleInput.fill(details.title || "");
    
    await this.page.fill('input[name="title"]', details.title || "" );

    await this.page.fill('input[name="author"]', details.author || "");
    await this.page.fill('input[name="genre"]', details.genre || "");
    
    await this.page.fill('input[name="isbn"]', details.isbn || "");
    await this.page.fill('input[name="publicationDate"]', details.publicationDate?.split("/").reverse().join("-") || "");
     await this.page.fill('input[name="price"]', details.price || "");

    await this.submitButton.click();
    await this.page.waitForTimeout(1000);

  }

getExpectedValidationError(book: {
  title?: string;
  author?: string;
  genre?: string;
  isbn?: string;
  publicationDate?: string;
  price?: string;
}): { field: string ; message: string } | null {


  if (!book.title?.trim())
    return { field: "Title", message: "Title is required." };

  if (!book.author?.trim())
    return { field: "Author", message: "Author is required." };

  if (!book.genre?.trim())
    return { field: "Genre", message: "Genre is required." };

  if (!book.isbn?.trim())
    return { field: "ISBN", message: "ISBN is required." };

  if (!book.publicationDate?.trim())
    return { field: "PublicationDate", message: "Publication date is required." };

  if (!book.price?.trim())
    return { field: "Price", message: "Price is required." };

return null; // In case No validation errors matched
}

async assertValidationError(bookDetails: {
  title?: string;
  author?: string;
  genre?: string;
  isbn?: string;
  publicationDate?: string;
  price?: string;
}): Promise<void> {

  const expectedError = this.getExpectedValidationError(bookDetails);

  if (!expectedError)
    throw new Error("Expected validation error but none found.");

  // Map field name to locator dynamically
  const fieldMap: Record<string, string> = {
    Title: 'input[name="title"]',
    Author: 'input[name="author"]',
    Genre: 'input[name="genre"]',
    ISBN: 'input[name="isbn"]',
    PublicationDate: 'input[name="publicationDate"]',
    Price: 'input[name="price"]'
  };

  const selector = fieldMap[expectedError.field];

  if (!selector)
    throw new Error(`No locator mapping found for ${expectedError.field}`);

  console.log(`Expected Priority validation error: ${expectedError.field} - ${expectedError.message}`);
  const locator = this.page.locator(selector);

    await this.assertFieldInvalid(locator);
    const message = await locator.evaluate(el => (el as HTMLInputElement).validationMessage);

    expect([
      'Please fill in this field.',
      'Please fill out this field.'
    ]).toContain(message);

}

async assertFieldInvalid(locator: Locator) {
  const isValid = await locator.evaluate(
    el => (el as HTMLInputElement).checkValidity()
  );

  expect(isValid).toBe(false);
}

}

export default EditBookPage;
