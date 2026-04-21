import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FR } from '../../i18n/fr';
import { OrderService } from '../../core/services/order.service';
import { DeliveryTrackingService } from '../../core/services/delivery-tracking.service';
import { LoadingSpinnerWidget } from '../../core/widgets/loading-spinner.widget';
import { StatusBadgeWidget } from '../../core/widgets/status-badge.widget';
import { Order, Delivery } from '../../core/model';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerWidget, StatusBadgeWidget, DecimalPipe],
  template: `
    <div class="tracking">
      <button class="btn-back" (click)="goBack()">
        ← Retour aux commandes
      </button>

      <h1>
        <span class="page-icon">🗺️</span>
        {{ t.orders.trackDelivery }}
      </h1>

      @if (loading()) {
        <div class="loading-wrap"><ff-loading /></div>
      } @else if (error()) {
        <div class="error-state">
          <span class="error-icon">😔</span>
          <p>{{ error() }}</p>
          <button class="btn-retry" (click)="loadData()">Reessayer</button>
        </div>
      } @else {
        <!-- Order Info -->
        @if (order()) {
          <div class="order-info-card">
            <div class="order-header">
              <span class="order-number">{{ t.orders.orderNumber }}{{ order()!.orderNumber }}</span>
              <ff-status-badge [status]="order()!.status" />
            </div>
          </div>
        }

        <!-- Delivery Timeline Steps -->
        @if (delivery()) {
          <div class="timeline-card">
            <h2>Suivi de livraison</h2>
            <div class="delivery-timeline">
              <div class="timeline-step completed">
                <div class="step-dot"></div>
                <div class="step-content">
                  <span class="step-label">Commande confirmee</span>
                  <span class="step-icon">✅</span>
                </div>
              </div>
              <div class="timeline-step completed">
                <div class="step-dot"></div>
                <div class="step-content">
                  <span class="step-label">En preparation</span>
                  <span class="step-icon">👨‍🍳</span>
                </div>
              </div>
              <div class="timeline-step active">
                <div class="step-dot pulse"></div>
                <div class="step-content">
                  <span class="step-label">{{ t.delivery.driverOnTheWay }}</span>
                  <span class="step-icon">🚚</span>
                </div>
              </div>
              <div class="timeline-step">
                <div class="step-dot"></div>
                <div class="step-content">
                  <span class="step-label">Livree</span>
                  <span class="step-icon">📦</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Driver Card -->
          <div class="driver-card">
            <div class="driver-avatar">🧑‍💼</div>
            <div class="driver-info">
              <h3>Votre livreur</h3>
              <p class="driver-name">En route vers vous</p>
            </div>
            <div class="eta-badge">
              <span class="eta-icon">⏱️</span>
              <div class="eta-text">
                <span class="eta-label">{{ t.delivery.estimatedArrival }}</span>
                <span class="eta-time">{{ delivery()!.estimatedDeliveryTime | date:'HH:mm' }}</span>
              </div>
            </div>
          </div>

          <!-- Map Placeholder -->
          <div class="map-placeholder">
            <div class="map-inner">
              <span class="map-icon">🗺️</span>
              <p>Carte en cours de chargement</p>
              <span class="map-subtitle">La position du livreur sera affichee ici</span>
            </div>
          </div>

          <!-- Location Data -->
          @if (trackingService.driverLocation()) {
            <div class="location-card">
              <h3>📍 Position du livreur</h3>
              <div class="coords">
                <div class="coord">
                  <span class="coord-label">Latitude</span>
                  <span class="coord-value">{{ trackingService.driverLocation()!.latitude | number:'1.6-6' }}</span>
                </div>
                <div class="coord">
                  <span class="coord-label">Longitude</span>
                  <span class="coord-value">{{ trackingService.driverLocation()!.longitude | number:'1.6-6' }}</span>
                </div>
              </div>
              <p class="update-time">Derniere mise a jour : {{ trackingService.driverLocation()!.timestamp | date:'HH:mm:ss' }}</p>
            </div>
          }

          <!-- Connection Status -->
          @if (trackingService.isConnected()) {
            <div class="connected-badge">
              <span class="pulse-dot"></span>
              Suivi en temps reel actif
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .tracking {
      max-width: 700px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .btn-back {
      background: none;
      border: none;
      color: var(--ff-text-muted);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      padding: 0.5rem 0;
      margin-bottom: 1rem;
      transition: color 0.2s;

      &:hover { color: var(--ff-green-700); }
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
       STATES
       ========================================== */
    .loading-wrap { padding: 4rem; text-align: center; }

    .error-state {
      text-align: center;
      padding: 4rem 2rem;
      .error-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
      p { color: var(--ff-text-light); font-size: 1.1rem; margin-bottom: 1.25rem; }
    }

    .btn-retry {
      padding: 0.65rem 1.75rem;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      color: white; border: none; border-radius: var(--ff-radius);
      cursor: pointer; font-weight: 700;
    }

    /* ==========================================
       ORDER INFO
       ========================================== */
    .order-info-card {
      background: white;
      border-radius: var(--ff-radius-lg);
      padding: 1.25rem 1.5rem;
      box-shadow: var(--ff-shadow-sm);
      margin-bottom: 1.25rem;
      border: 1px solid var(--ff-green-100);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-number { font-weight: 700; color: var(--ff-green-900); }

    /* ==========================================
       DELIVERY TIMELINE
       ========================================== */
    .timeline-card {
      background: white;
      border-radius: var(--ff-radius-lg);
      padding: 2rem;
      box-shadow: var(--ff-shadow);
      margin-bottom: 1.25rem;

      h2 {
        color: var(--ff-green-900);
        font-size: 1.15rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
      }
    }

    .delivery-timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
      padding-left: 1.5rem;

      &::before {
        content: '';
        position: absolute;
        left: 6px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--ff-green-100);
      }
    }

    .timeline-step {
      position: relative;
      padding: 0.75rem 0;
    }

    .step-dot {
      position: absolute;
      left: -1.5rem;
      top: 50%;
      transform: translate(-50%, -50%);
      left: -24px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--ff-green-100);
      border: 2px solid white;
      z-index: 1;
    }

    .timeline-step.completed .step-dot {
      background: var(--ff-green-700);
      box-shadow: 0 0 0 3px var(--ff-green-50);
    }

    .timeline-step.active .step-dot {
      background: var(--ff-green-500);
      box-shadow: 0 0 0 3px var(--ff-green-50);

      &.pulse {
        animation: pulse 2s ease-in-out infinite;
      }
    }

    .step-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .step-label {
      font-size: 0.9rem;
      color: var(--ff-text-muted);
    }

    .timeline-step.completed .step-label { color: var(--ff-green-700); font-weight: 600; }
    .timeline-step.active .step-label { color: var(--ff-green-900); font-weight: 700; }

    .step-icon { font-size: 1.25rem; }

    /* ==========================================
       DRIVER CARD
       ========================================== */
    .driver-card {
      background: white;
      border-radius: var(--ff-radius-lg);
      padding: 1.25rem 1.5rem;
      box-shadow: var(--ff-shadow-sm);
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid var(--ff-green-100);
    }

    .driver-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--ff-green-50);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      flex-shrink: 0;
    }

    .driver-info {
      flex: 1;

      h3 { color: var(--ff-text); font-size: 0.85rem; font-weight: 500; margin: 0; }
    }

    .driver-name {
      color: var(--ff-green-900);
      font-weight: 700;
      font-size: 1rem;
      margin: 0.15rem 0 0 0;
    }

    .eta-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--ff-green-50);
      padding: 0.65rem 1rem;
      border-radius: var(--ff-radius);
    }

    .eta-icon { font-size: 1.25rem; }

    .eta-text {
      display: flex;
      flex-direction: column;
    }

    .eta-label { font-size: 0.7rem; color: var(--ff-text-muted); }
    .eta-time { font-size: 1.1rem; font-weight: 800; color: var(--ff-green-900); }

    /* ==========================================
       MAP
       ========================================== */
    .map-placeholder {
      border-radius: var(--ff-radius-lg);
      overflow: hidden;
      margin-bottom: 1.25rem;
      height: 280px;
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 40%, #a5d6a7 100%);
      position: relative;
    }

    .map-inner {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(2px);

      .map-icon { font-size: 3rem; margin-bottom: 0.75rem; }
      p { color: var(--ff-green-900); font-weight: 600; margin: 0; }
      .map-subtitle { color: var(--ff-text-muted); font-size: 0.85rem; margin-top: 0.25rem; }
    }

    /* ==========================================
       LOCATION
       ========================================== */
    .location-card {
      background: white;
      border-radius: var(--ff-radius-lg);
      padding: 1.5rem;
      box-shadow: var(--ff-shadow-sm);
      margin-bottom: 1.25rem;
      border: 1px solid var(--ff-green-100);

      h3 {
        color: var(--ff-green-900);
        margin: 0 0 1rem 0;
        font-size: 1rem;
      }
    }

    .coords {
      display: flex;
      gap: 2rem;
      margin-bottom: 0.75rem;
    }

    .coord {
      display: flex;
      flex-direction: column;
    }

    .coord-label {
      font-size: 0.7rem;
      color: var(--ff-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .coord-value {
      font-size: 1rem;
      font-weight: 700;
      color: var(--ff-green-900);
      font-family: 'Courier New', monospace;
    }

    .update-time {
      font-size: 0.8rem;
      color: var(--ff-text-muted);
      margin: 0;
    }

    /* ==========================================
       CONNECTION
       ========================================== */
    .connected-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--ff-green-700);
      font-weight: 600;
      font-size: 0.9rem;
      background: var(--ff-green-50);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
    }

    .pulse-dot {
      width: 10px;
      height: 10px;
      background: var(--ff-green-500);
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }

    @media (max-width: 600px) {
      .driver-card { flex-wrap: wrap; }
      .eta-badge { width: 100%; justify-content: center; }
    }
  `],
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  trackingService = inject(DeliveryTrackingService);

  t = FR;
  loading = signal(true);
  error = signal('');
  order = signal<Order | null>(null);
  delivery = signal<Delivery | null>(null);
  private orderId = '';

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadData();
  }

  loadData(): void {
    if (!this.orderId) {
      this.error.set('Commande introuvable');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.orderService.getOrder(this.orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        if (order.delivery) {
          this.delivery.set(order.delivery);
          this.trackingService.startTracking(order.delivery.id).catch(() => {});
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.t.common.error);
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  ngOnDestroy(): void {
    const del = this.delivery();
    if (del) {
      this.trackingService.stopTracking(del.id).catch(() => {});
    }
  }
}
