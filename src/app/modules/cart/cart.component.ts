import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FR } from '../../i18n/fr';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { ProfileService } from '../../core/services/profile.service';
import { LoadingSpinnerWidget } from '../../core/widgets/loading-spinner.widget';
import { switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerWidget, DecimalPipe, RouterLink],
  template: `
    <div class="cart">
      <h1>
        <span class="page-icon">🛒</span>
        {{ t.cart.title }}
      </h1>

      @if (cartService.cartItems().length === 0) {
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <span>🛒</span>
          </div>
          <h3>{{ t.cart.empty }}</h3>
          <p>Parcourez notre catalogue pour decouvrir des produits anti-gaspi a -50%</p>
          <a routerLink="/catalog" class="btn-browse">Voir le catalogue</a>
        </div>
      } @else {
        <div class="cart-layout">
          <!-- Items -->
          <div class="cart-items">
            @for (item of cartService.cartItems(); track item.product.storeInventoryId; let i = $index) {
              <div class="cart-item" [style.animation-delay]="i * 50 + 'ms'">
                <div class="item-image">
                  @if (item.product.imageUrl) {
                    <img [src]="item.product.imageUrl" [alt]="item.product.name" />
                  } @else {
                    <span class="item-placeholder">🥫</span>
                  }
                </div>
                <div class="item-details">
                  <h3>{{ item.product.name }}</h3>
                  <p class="item-store">📍 {{ item.product.storeName }}</p>
                  <div class="price-display">
                    <span class="price-original">{{ item.product.originalPrice | number:'1.2-2' }}&euro;</span>
                    <span class="price-discounted">{{ item.product.discountedPrice | number:'1.2-2' }}&euro;</span>
                  </div>
                </div>
                <div class="item-actions">
                  <div class="qty-controls">
                    <button class="qty-btn minus" (click)="updateQuantity(item.product.storeInventoryId, item.quantity - 1)">
                      <span>-</span>
                    </button>
                    <span class="qty-value">{{ item.quantity }}</span>
                    <button class="qty-btn plus" (click)="updateQuantity(item.product.storeInventoryId, item.quantity + 1)">
                      <span>+</span>
                    </button>
                  </div>
                  <button class="remove-btn" (click)="removeItem(item.product.storeInventoryId)">
                    🗑️ {{ t.cart.remove }}
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Summary Sidebar -->
          <div class="cart-sidebar">
            <div class="summary-card">
              <h2>Recapitulatif</h2>

              <div class="summary-rows">
                <div class="summary-row">
                  <span>{{ t.cart.subtotal }}</span>
                  <span>{{ cartService.subtotal() | number:'1.2-2' }}&euro;</span>
                </div>
                <div class="summary-row">
                  <span>{{ t.cart.deliveryFee }}</span>
                  <span>{{ deliveryFee | number:'1.2-2' }}&euro;</span>
                </div>
                <div class="summary-row savings">
                  <span>Economie estimee</span>
                  <span>~{{ cartService.subtotal() | number:'1.2-2' }}&euro;</span>
                </div>
              </div>

              <div class="summary-total">
                <span>{{ t.cart.total }}</span>
                <span>{{ total() | number:'1.2-2' }}&euro;</span>
              </div>

              @if (error()) {
                <div class="error-msg">
                  <span>⚠️</span>
                  <span>{{ error() }}</span>
                </div>
              }

              @if (checkingOut()) {
                <div class="checkout-loading">
                  <ff-loading />
                </div>
              } @else {
                <button class="btn-checkout" (click)="checkout()">
                  {{ t.cart.checkout }}
                </button>
              }

              <p class="secure-text">🔒 Paiement securise par Stripe</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    h1 {
      color: var(--ff-green-900);
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .page-icon { font-size: 1.5rem; }

    /* ==========================================
       EMPTY STATE
       ========================================== */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: var(--ff-radius-lg);
      box-shadow: var(--ff-shadow);
    }

    .empty-icon-wrap {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: var(--ff-green-50);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      margin-bottom: 1.5rem;
    }

    .empty-state h3 {
      color: var(--ff-green-900);
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--ff-text-muted);
      margin-bottom: 1.5rem;
    }

    .btn-browse {
      display: inline-flex;
      padding: 0.8rem 2rem;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      color: white;
      border-radius: var(--ff-radius);
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(46, 125, 50, 0.25);

      &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(46, 125, 50, 0.35); }
    }

    /* ==========================================
       CART LAYOUT
       ========================================== */
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 2rem;
      align-items: start;
    }

    /* ==========================================
       CART ITEMS
       ========================================== */
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem;
      background: white;
      border-radius: var(--ff-radius-lg);
      box-shadow: var(--ff-shadow-sm);
      transition: all 0.3s ease;
      animation: slideUp 0.3s ease both;
      border: 1px solid transparent;

      &:hover {
        box-shadow: var(--ff-shadow);
        border-color: var(--ff-green-100);
      }
    }

    .item-image {
      width: 80px;
      height: 80px;
      border-radius: var(--ff-radius);
      overflow: hidden;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      img { width: 100%; height: 100%; object-fit: contain; padding: 0.25rem; }
    }

    .item-placeholder { font-size: 2.5rem; }

    .item-details {
      flex: 1;
      min-width: 0;

      h3 {
        color: var(--ff-green-900);
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 600;
      }
    }

    .item-store {
      color: var(--ff-text-muted);
      font-size: 0.8rem;
      margin: 0 0 0.35rem 0;
    }

    .price-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .price-original {
      text-decoration: line-through;
      color: var(--ff-text-muted);
      font-size: 0.8rem;
    }

    .price-discounted {
      color: var(--ff-green-700);
      font-weight: 800;
      font-size: 1.1rem;
    }

    .item-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.75rem;
    }

    .qty-controls {
      display: flex;
      align-items: center;
      gap: 0;
      background: var(--ff-green-50);
      border-radius: 2rem;
      overflow: hidden;
    }

    .qty-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--ff-green-700);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover { background: var(--ff-green-100); }

      &.minus:hover { background: #ffebee; color: var(--ff-red); }
    }

    .qty-value {
      min-width: 32px;
      text-align: center;
      font-weight: 700;
      color: var(--ff-green-900);
      font-size: 0.95rem;
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--ff-text-muted);
      cursor: pointer;
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      transition: all 0.2s;

      &:hover { color: var(--ff-red); background: var(--ff-red-light); }
    }

    /* ==========================================
       SUMMARY SIDEBAR
       ========================================== */
    .summary-card {
      background: white;
      border-radius: var(--ff-radius-lg);
      padding: 2rem;
      box-shadow: var(--ff-shadow);
      position: sticky;
      top: 84px;
      border: 1px solid var(--ff-green-100);

      h2 {
        color: var(--ff-green-900);
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
      }
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      color: var(--ff-text-light);
      font-size: 0.95rem;

      &.savings {
        color: var(--ff-green-700);
        font-weight: 600;
        background: var(--ff-green-50);
        margin: 0 -0.5rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
      }
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      padding-top: 1rem;
      border-top: 2px solid var(--ff-green-700);
      font-weight: 800;
      font-size: 1.25rem;
      color: var(--ff-green-900);
      margin-bottom: 1.25rem;
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #ffebee;
      color: #c62828;
      padding: 0.65rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }

    .checkout-loading {
      padding: 1rem 0;
      text-align: center;
    }

    .btn-checkout {
      width: 100%;
      padding: 0.9rem;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      color: white;
      border: none;
      border-radius: var(--ff-radius);
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(46, 125, 50, 0.25);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(46, 125, 50, 0.35);
      }
    }

    .secure-text {
      text-align: center;
      color: var(--ff-text-muted);
      font-size: 0.8rem;
      margin-top: 1rem;
    }

    /* ==========================================
       RESPONSIVE
       ========================================== */
    @media (max-width: 768px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }

      .cart-item {
        flex-wrap: wrap;
      }

      .item-actions {
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
        align-items: center;
      }

      .summary-card {
        position: static;
      }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class CartComponent {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  t = FR;
  deliveryFee = 3.50;
  checkingOut = signal(false);
  error = signal('');

  total = computed(() => this.cartService.subtotal() + this.deliveryFee);

  updateQuantity(storeInventoryId: string, quantity: number): void {
    this.cartService.updateQuantity(storeInventoryId, quantity);
  }

  removeItem(storeInventoryId: string): void {
    this.cartService.removeItem(storeInventoryId);
  }

  checkout(): void {
    const items = this.cartService.cartItems().map(item => ({
      storeInventoryId: item.product.storeInventoryId,
      quantity: item.quantity,
    }));

    if (items.length === 0) return;

    this.checkingOut.set(true);
    this.error.set('');

    this.profileService.getAddresses().pipe(
      switchMap(addresses => {
        if (addresses.length === 0) {
          return throwError(() => new Error('Aucune adresse de livraison disponible.'));
        }
        const addr = addresses.find(a => a.isDefault) ?? addresses[0];
        return this.orderService.createOrder({
          deliveryAddressId: addr.id,
          items,
        }).pipe(
          switchMap((order: any) => {
            const orderId = order.id ?? order.orderId;
            return this.paymentService.createIntent(orderId).pipe(
              switchMap(intent =>
                this.paymentService.confirmMock(intent.paymentIntentId).pipe(
                  switchMap(payment => {
                    if (payment.status !== 'Succeeded') {
                      return throwError(() => new Error('Echec confirmation paiement.'));
                    }
                    return [payment];
                  }),
                ),
              ),
            );
          }),
        );
      }),
    ).subscribe({
      next: () => {
        this.cartService.clear();
        this.router.navigate(['/orders']);
      },
      error: (e) => {
        this.error.set(e?.message || this.t.common.error);
        this.checkingOut.set(false);
      },
    });
  }
}
