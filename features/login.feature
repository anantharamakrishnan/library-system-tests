# language: en
 @regression
Feature: Login
    As a registered user
    I want to log into the application
    So that I can access my catalogue dashboard
    Proven By
    Valid lopin credentials should allow access to the dashboard
    Invalid login credentials should show an error message "Invalid username or password. Please try again." on the login page
    Blank login credentials should show an error message on the login page and on the text fields


  Background:
    Given user navigates to the login page

 @functional @smoke
  Scenario Outline: Login attempts with different test users
    When user logs in with "<username>" and "<password>"
    Then user should see "<outcome>" with "<expMessage>"

    Examples:
      | username      | password     | outcome   | expMessage |
      | admin         | admin        | dashboard |            |
      | invalidUser   | invalidPass  | error     | Invalid username or password. Please try again. |
      |    | invalidUser  | username error     | Please enter your username |
      | invalidUser   |   | password error     | Please enter your password |


@functional  @smoke
Scenario: Show button to toggle password visibility
    Then user should see a button to toggle password visibility
    When user click the toggle password visibility button to "show"
    Then the password input should switch to "unmasked" state
    When user click the toggle password visibility button to "hide"
    Then the password input should switch to "masked" state


@regression @performance @ignore
  Scenario: Login response time should be under acceptable threshold
    When user logs in with valid credentials
    Then login response time should be less than 3 seconds