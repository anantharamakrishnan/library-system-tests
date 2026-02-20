import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../utils/world';
import LoginPage from '../pages/loginPage';

Given('I am on the login page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('World.page is not initialized');
  const page = this.page;
  const loginPage = new LoginPage(page, process.env.BASE_URL);
  await loginPage.navigate('/login');
  await loginPage.waitForVisible('input[name="username"]');
});

When('I attempt to login with username as {string} and password as {string}', async function (this: CustomWorld, username: string, password: string) {
  if (!this.page) throw new Error('World.page is not initialized');
  const loginPage = new LoginPage(this.page, process.env.BASE_URL);
  await loginPage.login(username, password);
});

Then('I should see {string}', async function (this: CustomWorld, outcome: string) {
  if (!this.page) throw new Error('World.page is not initialized');
  const page = this.page;
  const loginPage = new LoginPage(page, process.env.BASE_URL);

  if (outcome === 'dashboard') {
    await loginPage.assertDashboardVisible();
    const dashboardHeading = page.locator('h1:has-text("Dashboard")');
    await expect(dashboardHeading).toBeVisible();
    return;
  }

  if (outcome === 'error message') {
    const errorLocator = page.locator('.error-message');
    await expect(errorLocator).toBeVisible();
    return;
  }

  // Fallback: check text exists on page
  const body = page.locator('body');
  await expect(body).toContainText(outcome);
});
