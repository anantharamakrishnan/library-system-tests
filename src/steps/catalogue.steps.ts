import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import type { CustomWorld } from '../utils/world';
import { getRandomPrice, getRandomDate, getRandomAuthor, getRandomTitle, getRandomGenre } from '../utils/random';
import CataloguePage from '../pages/cataloguePage';
import AddBookPage from '../pages/addBookPage';
import EditBookPage from '../pages/editBookPage';

Then('admin should be able to see the welcome message with Logout button', async function (this: CustomWorld) {
	  if (!this.page) throw new Error('World.page is not initialized');
    const cataloguePage = new CataloguePage(this.page, process.env.BASE_URL);
	await cataloguePage.assertCatalogueVisible();
});

Then('{string} button should be visible', async function (this: CustomWorld, buttonName: string) {
    if (!this.page) throw new Error('World.page is not initialized');
    const cataloguePage = new CataloguePage(this.page, process.env.BASE_URL);

	await cataloguePage.assertButtonByName(buttonName);
});

Then('pagination controls should be visible', async function (this: CustomWorld) {
    if (!this.page) throw new Error('World.page is not initialized');
        const cataloguePage = new CataloguePage(this.page, process.env.BASE_URL);
	await cataloguePage.assertButtonByName('Previous');
	await cataloguePage.assertButtonByName('Next');
});

Then('the page number and total number of pages should be visible', async function (this: CustomWorld) {
    if (!this.page) throw new Error('World.page is not initialized');
	await this.page.locator('span[class="self-center"]').waitFor({ state: 'visible' });
});

Then('the Book List table should be visible', async function (this: CustomWorld) {
    if (!this.page) throw new Error('World.page is not initialized');
    const cataloguePage = new CataloguePage(this.page, process.env.BASE_URL);

    await cataloguePage.validateTableHeaders(['Title', 'Author', 'Genre', 'ISBN', 'Publication Date', 'Price', 'Actions']); 
});

When('admin clicks on {string} button', async function (this: CustomWorld, buttonName: string) {
    if (!this.page) throw new Error('World.page is not initialized');
    const cataloguePage = new CataloguePage(this.page, process.env.BASE_URL);
    
    // Store the existing book count before adding
    this.scenarioContext.existingBookCount = await cataloguePage.getTotalBooks();
        //console.log(`Existing book count: ${this.scenarioContext.existingBookCount}`);
    
	await cataloguePage.clickButtonByName(buttonName);
});

Then('admin navigates to {string} page', async function (this: CustomWorld, pageName: string) {
    if (!this.page) throw new Error('World.page is not initialized');
    const addBookPage = new AddBookPage(this.page, process.env.BASE_URL);
    if (pageName === 'Add New Book') {
        await addBookPage.assertAddBookPageVisible();
    } else if (pageName === 'Edit Book') {
        const editBookPage = new EditBookPage(this.page, process.env.BASE_URL);
        await editBookPage.assertEditBookPageVisible();
    } else {
        throw new Error(`Unknown page name: ${pageName}`);
    }
});

When('admin fills in the book details and submits the form', fillAndSubmitRandomBook);

async function fillAndSubmitRandomBook(this: CustomWorld): Promise<void> {
  if (!this.page) throw new Error('World.page is not initialized');

  const addBookPage = new AddBookPage(this.page, process.env.BASE_URL);
  this.scenarioContext = this.scenarioContext || {};

  const randomBook = {
    title: getRandomTitle(),
    author: getRandomAuthor(),
    genre: getRandomGenre(),
    isbn: '1234567890',
    publicationDate: getRandomDate(),
    price: getRandomPrice(),
  };

  this.scenarioContext.addedBook = randomBook;

  await addBookPage.fillBookDetails(randomBook);
  await addBookPage.clickButtonByName('Submit');
}

Then('admin should be able to view the new book in the catalog', async function (this: CustomWorld) {
    // Validate the new book count and presence of added book
    if (!this.page) throw new Error('World.page is not initialized');
    const cataloguePage = new CataloguePage(this.page, process.env.BASE_URL);
    this.scenarioContext = this.scenarioContext || {};
    const existingCount = this.scenarioContext.existingBookCount;
    await cataloguePage.assertBookCount(existingCount+1);
    await cataloguePage.assertCatalogueForBook(existingCount, this.scenarioContext.addedBook);
});

Given('admin is on the Book List page', async function (this: CustomWorld) {
    if (!this.page) throw new Error('World.page is not initialized');
	const cataloguePage = new CataloguePage(this.page, process.env.BASE_URL);
	await cataloguePage.assertCatalogueVisible();
});

Then('{string} and {string} buttons should be visible for each book entry', async function (this: CustomWorld, editButton: string, deleteButton: string) {
    if (!this.page) throw new Error('World.page is not initialized');
    const rows = await this.page.locator('table tbody tr').count();
    for (let i = 0; i < rows; i++) {
        await this.page.locator('table tbody tr').nth(i).getByRole('button', { name: editButton }).waitFor({ state: 'visible' });
        await this.page.locator('table tbody tr').nth(i).getByRole('button', { name: deleteButton }).waitFor({ state: 'visible' });
    }
});

When('admin clicks on {string} button for a book entry', async function (this: CustomWorld, buttonName: string, dataTable: DataTable) {
    if (!this.page) throw new Error('World.page is not initialized');
    const cataloguePage = new CataloguePage(this.page, process.env.BASE_URL);
    const inputBookData = dataTable.hashes();
    if (inputBookData.length === 0) throw new Error('DataTable must contain at least one book entry');
    const bookTitle = inputBookData[0]['Book Title'];
    
    const getBookDetails = await cataloguePage.getBookDetailsByTitle(bookTitle);
    if (!getBookDetails) throw new Error(`Book with title "${bookTitle}" not found in catalogue`);
    this.scenarioContext = this.scenarioContext || {};
    this.scenarioContext.bookIndex = getBookDetails.index;
    this.scenarioContext.bookDetails = getBookDetails.book;

    await cataloguePage.clickButtonForBookByTitle(getBookDetails.index, bookTitle, buttonName);

});

Then('admin should verify the book details in the edit form', async function (this: CustomWorld) {
    if (!this.page) throw new Error('World.page is not initialized');
    const editBookPage = new EditBookPage(this.page, process.env.BASE_URL);
    this.scenarioContext = this.scenarioContext || {};
    const bookDetails = this.scenarioContext.bookDetails;
    if (!bookDetails) throw new Error('Book details not found in scenario context');
    
    await editBookPage.assertBookDetailsInEditForm(bookDetails);
});


Then('admin should be able to verify the book is removed from the catalog', async function (this: CustomWorld) {
    if (!this.page) throw new Error('World.page is not initialized');
    const cataloguePage = new CataloguePage(this.page, process.env.BASE_URL);
    
    this.scenarioContext = this.scenarioContext || {};
    const bookDetails = this.scenarioContext.bookDetails;
    if (!bookDetails) throw new Error('Book details not found in scenario context');
    
    await cataloguePage.assertBookInCatalogue(false, bookDetails.title);
});

When('admin edits the book details and submits the form', async function (this: CustomWorld,  dataTable: DataTable) {
    if (!this.page) throw new Error('World.page is not initialized');
	const editBookPage = new EditBookPage(this.page, process.env.BASE_URL);

    const [newBookData] = dataTable.hashes();

    const editBookDetails = {
        title: newBookData['newTitle'],   
        author: newBookData['newAuthor'],
        genre: newBookData['newGenre'],
        isbn: newBookData['newISBN'],
        publicationDate: newBookData['newPublicationDate'],
        price: newBookData['newPrice']
    };

    this.scenarioContext = this.scenarioContext || {};
    this.scenarioContext.editedBook = editBookDetails;

	await editBookPage.fillBookDetails({
   ...editBookDetails});


});

When('admin should be able to verify the new book details', async function (this: CustomWorld,  dataTable: DataTable) {
        if (!this.page) throw new Error('World.page is not initialized');

    const cataloguePage = new CataloguePage(this.page, process.env.BASE_URL);
    this.scenarioContext = this.scenarioContext || {};
    
    // Wait for navigation back to catalogue after edit form submit
    await cataloguePage.assertCatalogueVisible();
    
    const [newBookData] = dataTable.hashes();
    //console.log(`The indexed book value is ${this.scenarioContext.bookIndex}`);

    await cataloguePage.assertCatalogueForBook(this.scenarioContext.bookIndex,{
    title: newBookData['newTitle'],
    author: newBookData['newAuthor'],
    genre: newBookData['newGenre'],
    isbn: newBookData['newISBN'],
    publicationDate: newBookData['newPublicationDate'],
    price: newBookData['newPrice'],
	}); 
});

When('admin validates pagination state {string} for the count of {string} books', async function (this: CustomWorld, paginationState: string, bookCount: string) {
    if (!this.page) throw new Error('World.page is not initialized');
    const cataloguePage = new CataloguePage(this.page, process.env.BASE_URL);
    // Store the existing book count before adding
    this.scenarioContext.existingBookCount = await cataloguePage.getTotalBooks();
    
    //Clean up for validation
    if(this.scenarioContext.existingBookCount > parseInt(bookCount, 10)) {
        // If there are more books than expected, remove excess books
        const excessCount = this.scenarioContext.existingBookCount - parseInt(bookCount, 10);
        for (let i = 0; i < excessCount; i++) {
            await cataloguePage.removeBookByRowIndex(0); // Remove the first book
        }
    }else if(this.scenarioContext.existingBookCount < parseInt(bookCount, 10)) {
        // If there are fewer books than expected, add dummy books
        const booksToAdd = parseInt(bookCount, 10) - this.scenarioContext.existingBookCount;
        for (let i = 0; i < booksToAdd; i++) {
            await fillAndSubmitRandomBook.call(this);
        } 
    }
    await cataloguePage.assertPaginationState(paginationState as 'enabled' | 'disabled');

});