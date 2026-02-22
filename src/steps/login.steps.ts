import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../utils/world';
import LoginPage from '../pages/loginPage';
import CataloguePage from '../pages/cataloguePage';

Given('user navigates to the login page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('World.page is not initialized');
  const page = this.page;
  const loginPage = new LoginPage(page, process.env.BASE_URL);
  await loginPage.navigate('/login');
});

When('user logs in with {string} and {string}', async function (this: CustomWorld, username: string, password: string) {
  if (!this.page) throw new Error('World.page is not initialized');
  const loginPage = new LoginPage(this.page, process.env.BASE_URL);
  await loginPage.login(username, password);
});


Then('user should see a button to toggle password visibility', async function (this: CustomWorld) {
    if (!this.page) throw new Error('World.page is not initialized');
    const loginPage = new LoginPage(this.page, process.env.BASE_URL);
    loginPage.verifyPasswordToggleButtonExists();
});


Then('user click the toggle password visibility button to {string}', async function (this: CustomWorld, action: string) {
    if (!this.page) throw new Error('World.page is not initialized');
    const loginPage = new LoginPage(this.page, process.env.BASE_URL);
    if (action === "show") {
      await loginPage.clickPasswordToggle("show");
    } else if (action === "hide") {
      await loginPage.clickPasswordToggle("hide");
    }
});

Then('the password input should switch to {string} state', async function (this: CustomWorld, state: string) {
 if (!this.page) throw new Error('World.page is not initialized');
    const loginPage = new LoginPage(this.page, process.env.BASE_URL);
   
 if (state === "masked") {
      await loginPage.assertPasswordIsMasked(true);
    } else if (state === "unmasked") {
      await loginPage.assertPasswordIsMasked(false);
    }

});

Then('user should see {string} with {string}', async function (this: CustomWorld, outcome: string,  expMessage: string) {
  if (!this.page) throw new Error('World.page is not initialized');
  const page = this.page;
  const loginPage = new LoginPage(page, process.env.BASE_URL);
  const cataloguePage = new CataloguePage(page, process.env.BASE_URL);

  if (outcome === 'dashboard' || outcome === 'catalogue') {
    await cataloguePage.assertCatalogueVisible();
    return;
  }

  if (outcome.includes('error')) {
    await loginPage.assertLoginErrorMessage(expMessage)

    if(outcome === 'password') {
      const actualMessage = await loginPage.getinlineErrorMessage("password");
      expect(actualMessage).toEqual(expMessage);
    }

    return;
  }

  // Fallback: check text exists on page
  const body = page.locator('body');
  await expect(body).toContainText(outcome);
});


Then('admin should be on the login page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('World.page is not initialized');
  const loginPage = new LoginPage(this.page, process.env.BASE_URL);
  await loginPage.assertLoginPageVisible(); 
});

When ('admin refreshes the page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('World.page is not initialized');
  await this.page.reload();
});