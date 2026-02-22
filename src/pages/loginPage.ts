import type { Page, } from 'playwright';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  // Locators
  private readonly usernameInput = 'input[id="username"]';
  private readonly passwordInput = 'input[id="password"]';

  private readonly loginButton = 'button[type="submit"]';
  private readonly errorMessageUsername = 'div[aria-labelledby="login-heading"] p[id="username-error"]';
  private readonly errorMessagePassword = 'div[aria-labelledby="login-heading"] p[id="password-error"]';

  private readonly errorMessageTitle = 'div[role="alert"][aria-live="assertive"] h3';
  private readonly errorMessageContent = 'div[role="alert"][aria-live="assertive"] li';

  private readonly passwordToggleButton = 'button[aria-controls="password"]';
  private readonly showPasswordToggle = 'button[aria-label="Show password"]';
  private readonly hidePasswordToggle = 'button[aria-label="Hide password"]';

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  /**
   * Verify login page is visible by checking the presence of username and password fields
   */
  async assertLoginPageVisible(): Promise<void> {
    const timeout = Number(process.env.TIMEOUT_ELEMENT ?? '5000');
    await this.expectVisible(this.usernameInput, timeout);
    await this.expectVisible(this.passwordInput, timeout);
  }     

   
  /**
   * Perform login with provided credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.navigate('/login');
    await this.type(this.usernameInput, username);
    await this.type(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  /**
   * Get error message text if login fails
   */
  async getinlineErrorMessage(inlineField: string): Promise<string> {
    if (inlineField === "username") {
      return this.getText(this.errorMessageUsername);
    } else if (inlineField === "password") {
      return this.getText(this.errorMessagePassword);
    }
    throw new Error(`Unknown inline field: ${inlineField}`);
  }

  /**
   * Assert error message is visible on login page
   */
  async assertLoginErrorMessage(expectedMessage: string): Promise<void> {
    const timeout = Number(process.env.TIMEOUT_ELEMENT ?? '5000');

    const titleOk = await this.assertText(this.errorMessageTitle, 'There is a problem with your submission', timeout);
      if (!titleOk) throw new Error(`Expected error title not found: "There is a problem with your submission"`);

    const ok = await this.assertText(this.errorMessageContent, expectedMessage, timeout);
    if (!ok) throw new Error(`Expected error message not found: "${expectedMessage}"`);
  }


  /**
   * Verify that the password visibility toggle button exists on the login page
   */
  async verifyPasswordToggleButtonExists(): Promise<void> {
    const toggleButton = this.page.locator(this.passwordToggleButton);
    await toggleButton.waitFor({ state: 'visible', timeout: Number(process.env.TIMEOUT_ELEMENT ?? '5000') });
  }

  /**
   * Click the toggle password visibility button to show or hide the password
   */
  async clickPasswordToggle(action: string): Promise<void> {
    if (action === "show") {
      await this.click(this.showPasswordToggle);
    } else if (action === "hide") {
      await this.click(this.hidePasswordToggle);
    }
  }

  /**
   * Assert that the password field is masked or unmasked
   */
  async assertPasswordIsMasked(isMasked: boolean): Promise<void> {
    const passwordInput = this.page.locator(this.passwordInput);
    const isMaskedValue = await passwordInput.getAttribute('type') === 'password';
    if (isMasked !== isMaskedValue) {
      throw new Error(`Expected password to be ${isMasked ? 'masked' : 'unmasked'}, but it was ${isMaskedValue ? 'masked' : 'unmasked'}`);
    }
  }

}

export default LoginPage;
