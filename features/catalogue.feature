# language: en
@regression
Feature: Catalogue
As a  administrator
I want to add, edit, and delete books
So that I can keep the catalog up-to-date and ensure accurate information for users
Proven by
The books list page also features a welcome message and a logout button. 
A table of books with details such as title, author, genre, isbn, publicationDate and price
Able to add new books with a form in add new book page
Able to edit existing book details with a form in edit book page
Able to navigate to book list page to Previous and next page and see the list of books with pagination
Able to view the page number and total number of pages in the book list page

Background:
    Given user navigates to the login page
    When user logs in with "admin" and "admin"

@smoke @regression @functional
Scenario: Admin navigates to Book List page
    Then admin should be able to see the welcome message with Logout button
    Then "Add Book" button should be visible
    And pagination controls should be visible
    And the page number and total number of pages should be visible
    And the Book List table should be visible
    And "Edit" and "Delete" buttons should be visible for each book entry

@@smoke @regression @functional
Scenario: Admin adds a new book
    When admin clicks on "Add Book" button
    Then admin navigates to "Add New Book" page
    When admin fills in the book details and submits the form
    Then admin should be able to view the new book in the catalog

@smoke
Scenario: Admin verifies the book details in the edit page
    When admin clicks on "Edit" button for a book entry
    |Book Title|Author|Genre|ISBN|Publication Date|
    |The Very Busy Spider|||||
    Then admin should verify the book details in the edit form


@smoke @regression @functional
Scenario: Admin edits an existing book
    When admin clicks on "Edit" button for a book entry
    |Book Title|Author|Genre|ISBN|Publication Date|
    |The Very Busy Spider|Eric Carle|Picture Book|9780694005000|01/09/1984|
    When admin edits the book details and submits the form
    |newTitle|newAuthor|newGenre|newISBN|newPublicationDate|newPrice|
    |The Very Busy SpiderMan|Ben Parker|Comics|9780694005001|01/01/2026|50|
    Then admin should be able to verify the new book details
    |newTitle|newAuthor|newGenre|newISBN|newPublicationDate|newPrice|
    |The Very Busy SpiderMan|Ben Parker|Comics|9780694005001|01/01/2026|50|
  
@smoke @regression @functional
Scenario Outline: Admin verifies the priceo of an edited book always appears in <scenarioName> decimal cases
    When admin clicks on "Edit" button for a book entry
    |Book Title|Author|Genre|ISBN|Publication Date|
    |Charlotte's Web|E.B. White|Children's Fiction|||
    When admin edits the book details and submits the form
    |newTitle|newAuthor|newGenre|newISBN|newPublicationDate|newPrice|
    ||||||<newPrice>|
    Then admin should be able to verify the new book details
    |newTitle|newAuthor|newGenre|newISBN|newPublicationDate|newPrice|
    |Charlotte's Web|E.B. White|Children's Fiction|9780064400558|15/10/1952|<newPrice>|

    Examples:
      |scenarioName|newPrice|
      |validPrice|50.00|
      |singleDecimal|50.0|
      |noDecimal|50.|
      |wholeNumber|50.00|
      |moreThanTwoDecimal|50.444|

@smoke @regression @functional
Scenario: Admin deletes a book
    When admin clicks on "Delete" button for a book entry
    |Book Title|Author|Genre|ISBN|Publication Date|
    |The Very Busy Spider|Eric Carle|Picture Book|9780694005000|01/09/1984|
    Then admin should be able to verify the book is removed from the catalog

@smoke @failure @create-bug 
Scenario: Admin clicks Logout button
    When admin clicks on "Log Out" button
    Then admin should be on the login page

@smoke @failure @create-bug 
Scenario: Admin clicks Logout button
    When admin refreshes the page
    When admin clicks on "Log Out" button
    Then admin should be on the login page


@smoke @regression @functional 
Scenario Outline: Admin is able to verify the pagination button are <paginationState> for <scenarioName>
    When admin validates pagination state "<paginationState>" for the count of "<bookCount>" books
   Example:
   |scenarioName|paginationState|bookCount|
   |lessThan6Books|disabled|5|
   |moreThan6Books|enabled|7|

@ignore @failure @create-bug @wip
Scenario: Admin verfied the invalid date details are stored in the catelogue
    When admin adds a new book with the date as '0001-01-01'
    Then admin should be able to view the new book in the catalog with the date as '01/01/0001'
