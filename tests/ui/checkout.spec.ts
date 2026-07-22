import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Cart', () => {
  test('items added on the inventory page appear in the cart', async ({ loggedInInventory }) => {
    const chosen = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

    for (const item of chosen) {
      await loggedInInventory.addToCart(item);
    }
    expect(await loggedInInventory.cartCount()).toBe(chosen.length);

    const cart = await loggedInInventory.openCart();

    expect(await cart.itemCount()).toBe(chosen.length);
    expect(await cart.itemNames()).toEqual(expect.arrayContaining(chosen));
  });

  test('an empty cart shows no line items', async ({ loggedInInventory }) => {
    const cart = await loggedInInventory.openCart();

    expect(await cart.itemCount()).toBe(0);
    await expect(cart.itemsLocator()).toHaveCount(0);
  });
});
