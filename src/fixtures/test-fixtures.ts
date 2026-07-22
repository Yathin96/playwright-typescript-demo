import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { PostsClient } from '../api/PostsClient';
import { env } from '../utils/env';

/**
 * Typed fixtures.
 *
 * Declaring page objects and API clients as fixtures means a spec asks for
 * exactly what it needs and Playwright constructs it. No `beforeEach` boilerplate,
 * no shared mutable state between tests, and full type inference at the call site.
 */
interface Fixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  postsClient: PostsClient;
  /** Already-authenticated inventory page — skips login noise in the spec body. */
  loggedInInventory: InventoryPage;
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  postsClient: async ({ request }, use) => {
    await use(new PostsClient(request));
  },

  loggedInInventory: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const inventory = await loginPage.login(env.standardUser);
    await use(inventory);
  },
});

export { expect };
