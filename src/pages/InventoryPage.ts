import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export interface Product {
  readonly name: string;
  readonly price: number;
}

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';
  protected readonly readyLocator: Locator;

  private readonly itemCards: Locator;
  private readonly sortDropdown: Locator;
  private readonly cartLink: Locator;
  private readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.readyLocator = page.locator('.inventory_list');
    this.itemCards = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    }

  async productCount(): Promise<number> {
    return this.itemCards.count();
  }

  /**
   * Reads every product card into a typed array so tests can assert on data
   * rather than on DOM shape.
   */
  async products(): Promise<Product[]> {
    const count = await this.itemCards.count();
    const products: Product[] = [];

    for (let i = 0; i < count; i++) {
      const card = this.itemCards.nth(i);
      const name = (await card.locator('.inventory_item_name').textContent())?.trim() ?? '';
      const rawPrice = (await card.locator('.inventory_item_price').textContent())?.trim() ?? '';
      const price = Number.parseFloat(rawPrice.replace('$', ''));

      if (Number.isNaN(price)) {
        throw new Error(`Could not parse price "${rawPrice}" for product "${name}"`);
      }
      products.push({ name, price });
    }
    return products;
  }

  /** Custom locator: find a card by its visible product name, then act within it. */
  private cardFor(productName: string): Locator {
    return this.itemCards.filter({ hasText: productName });
  }

  async addToCart(productName: string): Promise<void> {
    await this.cardFor(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.cardFor(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async cartCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) {
      return 0;
    }
    const text = (await this.cartBadge.textContent())?.trim() ?? '0';
    return Number.parseInt(text, 10);
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async openCart(): Promise<CartPage> {
    await this.cartLink.click();
    const cart = new CartPage(this.page);
    await cart.waitUntilReady();
    return cart;
  }

  cartBadgeLocator(): Locator {
    return this.cartBadge;
  }
}
