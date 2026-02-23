# language: en
@regression
Feature: Edit Book Form

As an administrator
I want to edit existing books in the catalog
So that I can keep the catalog up-to-date and ensure accurate information for users
Proven by
Able to navigate to edit book page with the "Edit" button in the book list page
Able to fill in the book details without any errors and submit the form
Able to view the updated book in the catalog after editing a book 

Background:
  Given user navigates to the login page
    When user logs in with "admin" and "admin"
     When admin clicks on "Edit" button for a book entry
    |Book Title|Author|Genre|ISBN|Publication Date|
    |Charlotte's Web|E.B. White|Children's Fiction|||

@smoke @functional
Scenario Outline: Admin navigates to Edit New Book page and validated Form entry
    When admin edits the book details and submits the form
    |newTitle|newAuthor|newGenre|newISBN|newPublicationDate|newPrice|
    |<bookTitle>|<bookAuthor>|<bookGenre>|<bookIsbn>|<bookPublicationDate>|<bookPrice>|
    Then admin should validate the error "<expectedError>" for the "edit" form entry

    Examples:
    |scenarioName|bookTitle|bookAuthor|bookGenre|bookIsbn|bookPublicationDate|bookPrice|expectedError|
    |allFieldsBlank| | | | | | |PRIORITY_LOGIC_ERROR|
   |FewFieldsBlank|Atomic Habits | | | | | |Author is required.|
   |FewFieldsBlank|Atomic Habits |James Clear| | | | | ISBN is required.|
   |FewFieldsBlank|Atomic Habits |James Clear| |978-0-735-21129-2 | | |Price is required. |
   |FewFieldsBlank|Atomic Habits |James Clear| |978-0-735-21129-2 | |44|Publication Date is required. |
   |FewFieldsBlank|Atomic Habits |James Clear|Fiction |978-0-735-21129-2 | |44| Genre is required.|
   |allFieldsBlank|harry potter and the prisoner of azkaban |JK.rowling|Fiction | 3243242342323|1999-09-10 |10 | Title cannot exceed 20 characters.|