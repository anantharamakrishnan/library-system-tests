# language: en
@smoke @regression
Feature: User Login
  Validate that users can authenticate and access the dashboard when credentials are valid.

  Background:
    Given I am on the login page

  # `userKey` maps to keys provided by the centralized TestDataProvider (no hardcoded creds)
  Scenario Outline: Login attempts with different test users
    When I attempt to login with username as "<username>" and password as "<password>"
    Then I should see "<outcome>"

    Examples:
      | username | password | outcome         |
      | validUser   | validPass       | dashboard       |
      |  invalidUser   | invalidPass | error message   |
