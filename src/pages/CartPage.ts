import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';
  protected readonly readyLocator: Locator;

  private readonly cartItems: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.readyLocator = page.locator('.cart_list');
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async itemNames(): Promise<string[]> {
    const names = await this.cartItems.locator('.inventory_item_name').allTextContents();
    return names.map((n) => n.trim());
  }

  async itemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  itemsLocator(): Locator {
    return this.cartItems;
  }
}
