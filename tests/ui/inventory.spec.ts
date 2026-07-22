import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Inventory', () => {
  test('sorting by price low-to-high returns a non-decreasing sequence', async ({
    loggedInInventory,
  }) => {
    await loggedInInventory.sortBy('lohi');
    const prices = (await loggedInInventory.products()).map((p) => p.price);

    expect(prices.length).toBeGreaterThan(1);
    // Assert the property, not a hard-coded list — this survives catalogue changes.
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorting by name Z-to-A reverses alphabetical order', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('za');
    const names = (await loggedInInventory.products()).map((p) => p.name);

    expect(names).toEqual([...names].sort().reverse());
  });

  test('adding and removing an item keeps the cart badge in sync', async ({ loggedInInventory }) => {
    const item = 'Sauce Labs Backpack';

    expect(await loggedInInventory.cartCount()).toBe(0);

    await loggedInInventory.addToCart(item);
    await expect(loggedInInventory.cartBadgeLocator()).toHaveText('1');

    await loggedInInventory.removeFromCart(item);
    await expect(loggedInInventory.cartBadgeLocator()).toBeHidden();
    expect(await loggedInInventory.cartCount()).toBe(0);
  });

  test('every product exposes a parseable price', async ({ loggedInInventory }) => {
    const products = await loggedInInventory.products();

    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
      expect(product.name).not.toBe('');
      expect(product.price).toBeGreaterThan(0);
    }
  });
});
