import {  When, DataTable, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../utils/world';
import AddBookPage from '../pages/addBookPage';
import EditBookPage from '../pages/editBookPage';

When('admin enters the book details in the form', async function (this: CustomWorld, dataTable: DataTable) {
   if (!this.page) throw new Error('World.page is not initialized');
   
     const addBookPage = new AddBookPage(this.page, process.env.BASE_URL);
     this.scenarioContext = this.scenarioContext || {};
    
    const [newBookData] = dataTable.hashes();

    const newBookDetails = {
        title: newBookData['newTitle'],   
        author: newBookData['newAuthor'],
        genre: newBookData['newGenre'],
        isbn: newBookData['newISBN'],
        publicationDate: newBookData['newPublicationDate'],
        price: newBookData['newPrice']
    };

    this.scenarioContext.addedBook = newBookDetails;
    await addBookPage.fillBookDetails(newBookDetails);
    await addBookPage.clickButtonByName('Submit');

});


Then('admin should validate the error {string} for the {string} form entry', async function (this: CustomWorld, expectedError: string, formType: string) {
   if (!this.page) throw new Error('World.page is not initialized');
   
     const addBookPage = new AddBookPage(this.page, process.env.BASE_URL);
     const editBookPage = new EditBookPage(this.page, process.env.BASE_URL);
    
     if(formType == 'edit') {
        if(expectedError.includes("PRIORITY_LOGIC_ERROR")) {
                await editBookPage.assertValidationError(this.scenarioContext?.editedBook ?? {});
                return;        
        }
         }else {

     if(expectedError.includes("is required")) {
        await addBookPage.assertErrorMessageVisible(this.scenarioContext.addedBook);
     } else if(expectedError.includes("Title cannot exceed 20 characters")) {
        await addBookPage.validateTitleErrorMessage(this.scenarioContext.addedBook.title ?? '', expectedError);
     } else {
        throw new Error(`Unexpected error message: ${expectedError}`);
     }
    }

});
