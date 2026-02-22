# language: en
@regression
Feature: Catalogue
As a  administrator
I want to add, edit, and delete books
So that I can keep the catalog up-to-date and ensure accurate information for users
Proven by
A table of books with details such as title, author, genre, isbn, publicationDate and price
Able to add new books with a form in add new book page
Able to edit existing book details with a form in edit book page
Able to navigate to book list page to Previous and next page and see the list of books with pagination
Able to view the page number and total number of pages in the book list page

Background:
    Given user navigates to the login page
    When user logs in with "admin" and "admin"

Scenario: Admin navigates to Book List page
    Then "Add Book" button should be visible
    And pagination controls should be visible
    And the page number and total number of pages should be visible
    And the Book List table should be visible
    And "Edit" and "Delete" buttons should be visible for each book entry

Scenario: Admin validates book details in Book List page
    Then the Book List table should display correct details for each book entry

Scenario: Admin adds a new book
    When admin clicks on "Add Book" button
    Then admin should be navigates to "Add New Book" page
    When admin fills in the book details and submits the form
    Then the new book should be added to the catalog and visible in the Book List page

Scenario: Admin edits an existing book
    Given admin is on the Book List page
    When admin clicks on "Edit" button for a book entry
    |Book Title|Author|Genre|ISBN|Publication Date|
    |The Very Busy Spider|Eric Carle|Picture Book|9780694005000|01/09/1984|
    When admin updates the book details and submits the form
    |Book Title|Author|Genre|ISBN|Publication Date|
    |The Very Busy Spider|Eric Carle|Picture Book|9780694005000|01/09/1984|
    Then admin should be able to save the new book details


Scenario: Admin deletes a book
    Given admin is on the Book List page
    When admin clicks on "Delete" button for a book entry
    |Book Title|Author|Genre|ISBN|Publication Date|
    |The Very Busy Spider|Eric Carle|Picture Book|9780694005000|01/09/1984|
    Then the book should be removed from the catalog and no longer visible in the Book List page

Scenario: Admin adds a book with missing required fields
    When admin clicks on "Add Book" button
    Then admin should be navigates to "Add New Book" page
    When admin enters book details with missing required fields and submits the form
    |Book Title|Author|Genre|ISBN|Publication Date|
    |The Curious Incident of the Dog in the Night-Time|Mark Haddon|Fiction|9780099450252|01-04-2004|
    Then an error message should be displayed indicating the missing required fields
