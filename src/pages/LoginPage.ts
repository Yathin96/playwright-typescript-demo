import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { TestUser } from '../utils/env';
import { InventoryPage } from './InventoryPage';

/**
 * Login page object.
 *
 * Deliberately mixes locator strategies to show the full toolkit:
 *  - Playwright semantic locators (getByPlaceholder / getByRole) — preferred,
 *    they survive styling changes and assert accessibility at the same time
 *  - CSS selectors — for stable test ids
 *  - XPath — for the cases where you genuinely need structural traversal
 */
export class LoginPage extends BasePage {
  protected readonly path = '/';
  protected readonly readyLocator: Locator;

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorBanner: Locator;
  private readonly errorDismissButton: Locator;

  constructor(page: Page) {
    super(page);

    // Playwright locator — semantic, resilient to markup churn.
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });

    // CSS selector on a stable data attribute.
    this.errorBanner = page.locator('[data-test="error"]');

    // XPath — traversing to a sibling that has no useful attributes of its own.
    this.errorDismissButton = page.locator(
      '//h3[@data-test="error"]/button[contains(@class,"error-button")]',
    );

    this.readyLocator = this.loginButton;
  }

  async login(user: TestUser): Promise<InventoryPage> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.loginButton.click();

    const inventory = new InventoryPage(this.page);
    await inventory.waitUntilReady();
    return inventory;
  }

  /** Submits credentials without asserting success — for negative paths. */
  async attemptLogin(user: TestUser): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.loginButton.click();
  }

  async errorMessage(): Promise<string> {
    await this.errorBanner.waitFor({ state: 'visible' });
    return (await this.errorBanner.textContent())?.trim() ?? '';
  }

  async dismissError(): Promise<void> {
    await this.errorDismissButton.click();
    await this.errorBanner.waitFor({ state: 'hidden' });
  }

  errorLocator(): Locator {
    return this.errorBanner;
  }
}
