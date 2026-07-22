import { test, expect } from '../../src/fixtures/test-fixtures';
import { env } from '../../src/utils/env';

test.describe('Authentication', () => {
  test('valid credentials land the user on the inventory page', async ({ loginPage }) => {
    const inventory = await loginPage.login(env.standardUser);

    expect(inventory.currentUrl()).toContain('/inventory.html');
    expect(await inventory.productCount()).toBeGreaterThan(0);
  });

  test('a locked-out account is rejected with an explanatory error', async ({ loginPage }) => {
    await loginPage.attemptLogin(env.lockedUser);

    await expect(loginPage.errorLocator()).toBeVisible();
    expect(await loginPage.errorMessage()).toContain('locked out');
  });

  test('an incorrect password does not reveal whether the user exists', async ({ loginPage }) => {
    await loginPage.attemptLogin({ username: env.standardUser.username, password: 'wrong-password' });

    const message = await loginPage.errorMessage();
    // Generic message only — leaking "no such user" is an enumeration weakness.
    expect(message).toContain('Username and password do not match');
    expect(message).not.toContain('does not exist');
  });

  test('the error banner can be dismissed', async ({ loginPage }) => {
    await loginPage.attemptLogin({ username: 'nobody', password: 'nothing' });
    await expect(loginPage.errorLocator()).toBeVisible();

    await loginPage.dismissError();
    await expect(loginPage.errorLocator()).toBeHidden();
  });
});
