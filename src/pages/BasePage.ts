import type { Page, Locator, Response } from '@playwright/test';

/**
 * Shared behaviour for every page object.
 *
 * Page objects expose intent ("log in as this user"), never raw selectors.
 * Tests that reach into `page.locator(...)` directly are a smell: when the DOM
 * changes you want to edit one file, not thirty specs.
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  /** Path relative to baseURL, e.g. '/inventory.html'. */
  protected abstract readonly path: string;

  /** Element that proves the page finished rendering. */
  protected abstract readonly readyLocator: Locator;

  async goto(): Promise<Response | null> {
    const response = await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
    await this.waitUntilReady();
    return response;
  }

  /**
   * Playwright auto-waits on actions, but an explicit readiness gate makes
   * failures far easier to read: you get "header never appeared" instead of a
   * timeout on some unrelated click three steps later.
   */
  async waitUntilReady(): Promise<void> {
    await this.readyLocator.waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    try {
      await this.readyLocator.waitFor({ state: 'visible', timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  currentUrl(): string {
    return this.page.url();
  }
}
