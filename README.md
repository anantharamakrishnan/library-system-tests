# library-system-tests
A BDD test library to validate Login and Catalogu Page
-Used default standardised templates for base framework,

## Feature File
- Written in Gherkin syntax as third person as the login account is admin
- Created custom user story acceptance criteria
- Included Scenario,  Scenario Outline, Datatable, Datatable examples
- Included tags at Feature and Scenario level  ,  @failure @wip are for examples
- package.json reflects tags to include and exclude the test run
- Scenario validate one isloated expected conditions. [PREFERRED]
- One scenario included with multiple When-Then-When-Then implementation [Demo purpose only] 

## Step definition File
-  Hook files included for the Before and After Scenario , Allure report
-  Include world.ts to ensure centralised state management
-  Included implementation for steps, steps with string,  steps with datatable, steps with function
-  Steps file performs actions and asserts in Page object [PREFERRED]
-  Step file Performs actions and asserts in Browser [DEMO purpose]

## Page 
-  Included Page Object Model design pattern
-  Actions, Assertions at Page level, Native Browser error validations
-  Included Playwright assertions [PREFERRED] and typescript validations [Demo purpose only]
-  Base Page for frequently required actions

## Locators
Have provided examples
 - As a class level readonly variable  [PREFERRED]
 - As a class level page element [PREFERRED] 
 - As a function page object [DEMO purpose]

## Code 
npx tsc --noEmit
npm install
cp .env.example .env.qa

[OPTIONAL]
update cucumber count in the variable -->   "parallel": 1

npm run test
npm run allure:generate
npm run allure:open
