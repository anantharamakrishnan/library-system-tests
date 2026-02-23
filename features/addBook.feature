# language: en
@regression
Feature: Add Book Form

As an administrator
I want to add new books to the catalog
So that I can keep the catalog up-to-date and ensure accurate information for users
Proven by
Able to navigate to add new book page with the "Add Book" button in the book list page
Able to fill in the book details without any errors and submit the form
Able to view the new book in the catalog after adding a new book 

Background:
    Given user navigates to the login page
    When user logs in with "admin" and "admin"
    When admin clicks on "Add Book" button
    * admin navigates to "Add New Book" page
   
@smoke @functional 
Scenario Outline: Admin navigates to Add New Book page and validated Form entry
    When admin enters the book details in the form
    |newTitle|newAuthor|newGenre|newISBN|newPublicationDate|newPrice|
    |<bookTitle>|<bookAuthor>|<bookGenre>|<bookIsbn>|<bookPublicationDate>|<bookPrice>|
    Then admin should validate the error "<expectedError>" for the "add" form entry

    Examples:
    |scenarioName|bookTitle|bookAuthor|bookGenre|bookIsbn|bookPublicationDate|bookPrice|expectedError|
    |allFieldsBlank| | | | | | |Title is required.|
    |FewFieldsBlank|Atomic Habits | | | | | |Author is required.|
    |FewFieldsBlank|Atomic Habits |James Clear| | | | | ISBN is required.|
    |FewFieldsBlank|Atomic Habits |James Clear| |978-0-735-21129-2 | | |Price is required. |
    |FewFieldsBlank|Atomic Habits |James Clear| |978-0-735-21129-2 | |44|Publication Date is required. |
    |FewFieldsBlank|Atomic Habits |James Clear|Fiction |978-0-735-21129-2 | |44| Genre is required.|
    |allFieldsBlank|harry potter and the prisoner of azkaban |JK.rowling|Fiction | 3243242342323|1999-09-10 |10 | Title cannot exceed 20 characters.|