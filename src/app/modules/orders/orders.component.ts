import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FR } from '../../i18n/fr';
import { OrderService } from '../../core/services/order.service';
import { StatusBadgeWidget } from '../../core/widgets/status-badge.widget';
import { LoadingSpinnerWidget } from '../../core/widgets/loading-spinner.widget';
import { Order, OrderStatus } from '../../core/model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, StatusBadgeWidget, LoadingSpinnerWidget, DecimalPipe],
  template: `
    <div class="orders">
      <div class="page-header">
        <h1>
          <span class="page-icon">📦</span>
          {{ t.orders.title }}
        </h1>
      </div>

      @if (loading()) {
        <div class="loading-wrap"><ff-loading /></div>
      } @else if (error()) {
        <div class="error-state">
          <span class="error-icon">😔</span>
          <p>{{ t.common.error }}</p>
          <button class="btn-retry" (click)="loadOrders()">Reessayer</button>
        </div>
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <span>📦</span>
          </div>
          <h3>{{ t.orders.noOrders }}</h3>
          <p>Vos commandes apparaitront ici une fois que vous aurez passe votre premiere commande.</p>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order.id; let i = $index) {
            <div class="order-card" [style.animation-delay]="i * 60 + 'ms'">
              <!-- Timeline indicator -->
              <div class="order-timeline">
                <div class="timeline-dot" [class]="getStatusClass(order.status)"></div>
                <div class="timeline-line"></div>
              </div>

              <div class="order-content">
                <div class="order-header">
                  <div class="order-left">
                    <span class="order-number">{{ t.orders.orderNumber }}{{ order.orderNumber }}</span>
                    <span class="order-date">{{ order.createdAt | date:'dd/MM/yyyy a HH:mm' }}</span>
                  </div>
                  <ff-status-badge [status]="order.status" />
                </div>

                <div class="order-body">
                  <div class="order-meta">
                    <div class="meta-item">
                      <span class="meta-icon">📋</span>
                      <span>{{ order.items?.length ?? 0 }} article{{ (order.items?.length ?? 0) > 1 ? 's' : '' }}</span>
                    </div>
                    <div class="meta-item total">
                      <span class="meta-icon">💰</span>
                      <span class="total-value">{{ order.totalAmount | number:'1.2-2' }}&euro;</span>
                    </div>
                  </div>

                  <!-- Expandable details -->
                  @if (expandedOrder() === order.id) {
                    <div class="order-detail-expand">
                      @if (order.items && order.items.length > 0) {
                        <div class="detail-items">
                          @for (item of order.items; track item) {
                            <div class="detail-item">
                              <span class="detail-name">{{ item.productName ?? 'Produit' }}</span>
                              <span class="detail-qty">x{{ item.quantity }}</span>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>

                <div class="order-footer">
                  <button class="btn-expand" (click)="toggleExpand(order.id)">
                    {{ expandedOrder() === order.id ? 'Masquer' : 'Details' }}
                    <span class="expand-arrow" [class.open]="expandedOrder() === order.id">▾</span>
                  </button>

                  <div class="order-actions">
                    @if (order.status === OrderStatus.InDelivery) {
                      <button class="btn-track" (click)="trackOrder(order.id)">
                        🗺️ {{ t.orders.trackDelivery }}
                      </button>
                    }
                    @if (order.status === OrderStatus.Delivered && order.delivery) {
                      <button class="btn-rate" (click)="rateDelivery(order.delivery!.id)">
                        ⭐ {{ t.orders.rateDelivery }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .orders {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header h1 {
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
       STATES
       ========================================== */
    .loading-wrap { padding: 4rem; text-align: center; }

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

    .empty-state h3 { color: var(--ff-green-900); margin-bottom: 0.5rem; }
    .empty-state p { color: var(--ff-text-muted); max-width: 400px; margin: 0 auto; }

    .error-state {
      text-align: center;
      padding: 4rem 2rem;

      .error-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
      p { color: var(--ff-text-light); font-size: 1.1rem; margin-bottom: 1.25rem; }
    }

    .btn-retry {
      padding: 0.65rem 1.75rem;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      color: white;
      border: none;
      border-radius: var(--ff-radius);
      cursor: pointer;
      font-weight: 700;
    }

    /* ==========================================
       ORDER LIST
       ========================================== */
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .order-card {
      display: flex;
      gap: 1.25rem;
      animation: slideUp 0.4s ease both;
    }

    /* Timeline */
    .order-timeline {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 1.5rem;
      width: 20px;
      flex-shrink: 0;
    }

    .timeline-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--ff-green-400);
      border: 3px solid var(--ff-green-50);
      box-shadow: 0 0 0 2px var(--ff-green-400);
      flex-shrink: 0;

      &.status-pending { background: var(--ff-orange); box-shadow: 0 0 0 2px var(--ff-orange); }
      &.status-in-delivery { background: #1565c0; box-shadow: 0 0 0 2px #1565c0; }
      &.status-delivered { background: var(--ff-green-700); box-shadow: 0 0 0 2px var(--ff-green-700); }
      &.status-cancelled { background: var(--ff-red); box-shadow: 0 0 0 2px var(--ff-red); }
    }

    .timeline-line {
      flex: 1;
      width: 2px;
      background: var(--ff-green-100);
      margin-top: 4px;
    }

    /* Content */
    .order-content {
      flex: 1;
      background: white;
      border-radius: var(--ff-radius-lg);
      padding: 1.5rem;
      box-shadow: var(--ff-shadow-sm);
      margin-bottom: 1rem;
      transition: all 0.2s;
      border: 1px solid transparent;

      &:hover { box-shadow: var(--ff-shadow); border-color: var(--ff-green-100); }
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .order-left {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .order-number {
      font-weight: 700;
      color: var(--ff-green-900);
      font-size: 1rem;
    }

    .order-date {
      font-size: 0.8rem;
      color: var(--ff-text-muted);
    }

    .order-meta {
      display: flex;
      gap: 1.5rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--ff-text-light);
      font-size: 0.9rem;

      &.total { font-weight: 700; }
    }

    .meta-icon { font-size: 1rem; }
    .total-value { color: var(--ff-green-700); font-size: 1.05rem; }

    /* Expand */
    .order-detail-expand {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--ff-green-50);
      animation: slideDown 0.3s ease;
    }

    .detail-items {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--ff-text-light);
      padding: 0.35rem 0;
    }

    .detail-qty { font-weight: 600; color: var(--ff-text); }

    /* Footer */
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid #f5f5f5;
    }

    .btn-expand {
      background: none;
      border: none;
      color: var(--ff-text-muted);
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0.25rem 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: color 0.2s;

      &:hover { color: var(--ff-green-700); }
    }

    .expand-arrow {
      display: inline-block;
      transition: transform 0.2s;

      &.open { transform: rotate(180deg); }
    }

    .order-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-track {
      padding: 0.5rem 1rem;
      background: var(--ff-blue-light);
      color: var(--ff-blue);
      border: none;
      border-radius: var(--ff-radius);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s;

      &:hover { background: #bbdefb; transform: translateY(-1px); }
    }

    .btn-rate {
      padding: 0.5rem 1rem;
      background: var(--ff-green-50);
      color: var(--ff-green-700);
      border: none;
      border-radius: var(--ff-radius);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s;

      &:hover { background: var(--ff-green-100); transform: translateY(-1px); }
    }

    /* ==========================================
       RESPONSIVE
       ========================================== */
    @media (max-width: 600px) {
      .order-timeline { display: none; }
      .order-header { flex-direction: column; gap: 0.5rem; }
      .order-footer { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);

  t = FR;
  OrderStatus = OrderStatus;
  loading = signal(true);
  error = signal('');
  orders = signal<Order[]>([]);
  expandedOrder = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set('');
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.t.common.error);
        this.loading.set(false);
      },
    });
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<string, string> = {
      [OrderStatus.Pending]: 'status-pending',
      [OrderStatus.Paid]: 'status-pending',
      [OrderStatus.Preparing]: 'status-pending',
      [OrderStatus.ReadyForCollection]: 'status-pending',
      [OrderStatus.Collected]: 'status-in-delivery',
      [OrderStatus.InDelivery]: 'status-in-delivery',
      [OrderStatus.Delivered]: 'status-delivered',
      [OrderStatus.Cancelled]: 'status-cancelled',
      [OrderStatus.Refunded]: 'status-cancelled',
    };
    return map[status] ?? '';
  }

  toggleExpand(orderId: string): void {
    this.expandedOrder.set(this.expandedOrder() === orderId ? null : orderId);
  }

  trackOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId, 'track']);
  }

  rateDelivery(deliveryId: string): void {
    this.router.navigate(['/rating', deliveryId]);
  }
}
