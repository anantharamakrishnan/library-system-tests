import type { Page } from 'playwright';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  // Locators
  private readonly usernameInput = 'input[name="username"]';
  private readonly passwordInput = 'input[name="password"]';
  private readonly loginButton = 'button[type="submit"]';
  private readonly dashboardHeading = 'h1:has-text("Dashboard")';
  private readonly errorMessage = '.error-message';

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
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
   * Assert dashboard is visible after successful login
   */
  async assertDashboardVisible(): Promise<void> {
    await this.expectVisible(this.dashboardHeading);
  }

  /**
   * Get error message text if login fails
   */
  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }
}

export default LoginPage;
