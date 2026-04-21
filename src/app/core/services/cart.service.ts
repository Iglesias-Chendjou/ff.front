import { Injectable, signal, computed } from '@angular/core';
import { AvailableProduct } from '../model';

export interface CartItem {
  product: AvailableProduct;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly CART_KEY = 'ff_cart';
  private items = signal<CartItem[]>(this.loadCart());

  readonly cartItems = this.items.asReadonly();
  readonly itemCount = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.discountedPrice * item.quantity, 0),
  );

  addAvailableProduct(product: AvailableProduct): void {
    const current = this.items();
    const existing = current.find((i) => i.product.storeInventoryId === product.storeInventoryId);
    if (existing) {
      this.items.set(
        current.map((i) =>
          i.product.storeInventoryId === product.storeInventoryId
            ? { ...i, quantity: Math.min(i.quantity + 1, product.availableQuantity) }
            : i,
        ),
      );
    } else {
      this.items.set([...current, { product, quantity: 1 }]);
    }
    this.saveCart();
  }

  removeItem(storeInventoryId: string): void {
    this.items.set(this.items().filter((i) => i.product.storeInventoryId !== storeInventoryId));
    this.saveCart();
  }

  updateQuantity(storeInventoryId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(storeInventoryId);
      return;
    }
    this.items.set(
      this.items().map((i) =>
        i.product.storeInventoryId === storeInventoryId ? { ...i, quantity } : i,
      ),
    );
    this.saveCart();
  }

  clear(): void {
    this.items.set([]);
    localStorage.removeItem(this.CART_KEY);
  }

  private saveCart(): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(this.items()));
  }

  private loadCart(): CartItem[] {
    const data = localStorage.getItem(this.CART_KEY);
    return data ? JSON.parse(data) : [];
  }
}
