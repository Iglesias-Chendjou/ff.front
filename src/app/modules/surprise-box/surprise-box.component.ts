import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FR } from '../../i18n/fr';
import { SurpriseBoxService } from '../../core/services/surprise-box.service';
import { StatusBadgeWidget } from '../../core/widgets/status-badge.widget';
import { LoadingSpinnerWidget } from '../../core/widgets/loading-spinner.widget';
import { SurpriseBoxPlan, SurpriseBoxSubscription } from '../../core/model';

@Component({
  selector: 'app-surprise-box',
  standalone: true,
  imports: [CommonModule, StatusBadgeWidget, LoadingSpinnerWidget, DecimalPipe],
  template: `
    <div class="surprise-box">
      <div class="page-header">
        <h1>
          <span class="page-icon">🎁</span>
          {{ t.surpriseBox.title }}
        </h1>
        <p class="page-subtitle">Laissez-vous surprendre par nos colis anti-gaspi composes par nos soins</p>
      </div>

      @if (loading()) {
        <div class="loading-wrap"><ff-loading /></div>
      } @else if (error()) {
        <div class="error-state">
          <span class="error-icon">😔</span>
          <p>{{ error() }}</p>
          <button class="btn-retry" (click)="loadData()">Reessayer</button>
        </div>
      } @else {
        <!-- Current Subscription -->
        @if (currentSubscription()) {
          <div class="current-sub">
            <div class="current-sub-gradient"></div>
            <div class="current-sub-content">
              <div class="current-sub-header">
                <div class="sub-icon">🎁</div>
                <div>
                  <h2>Votre abonnement Colis Surprise</h2>
                  <div class="sub-name-row">
                    <span class="sub-plan-name">{{ currentSubscription()!.plan?.name ?? 'Colis Surprise' }}</span>
                    <ff-status-badge [status]="currentSubscription()!.status" />
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="delivery-progress">
                <div class="progress-header">
                  <span>Livraisons ce mois</span>
                  <span class="progress-count">
                    {{ currentSubscription()!.deliveriesUsedThisMonth }}
                    / {{ currentSubscription()!.plan?.deliveriesPerMonth ?? '?' }}
                  </span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width]="deliveryProgress() + '%'"></div>
                </div>
              </div>

              <div class="sub-details">
                <div class="detail-item">
                  <span class="detail-label">Periode en cours</span>
                  <span class="detail-value">
                    {{ currentSubscription()!.currentPeriodStart | date:'dd/MM' }}
                    - {{ currentSubscription()!.currentPeriodEnd | date:'dd/MM/yyyy' }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Prochaine facturation</span>
                  <span class="detail-value">{{ currentSubscription()!.nextBillingDate | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>

              <div class="sub-actions">
                <button class="btn-cancel" (click)="cancelSubscription()" [disabled]="actionLoading()">
                  Annuler l'abonnement
                </button>
              </div>

              @if (actionError()) {
                <div class="error-msg">⚠️ {{ actionError() }}</div>
              }
            </div>
          </div>
        }

        <!-- Plans Grid -->
        <div class="plans-grid">
          @for (plan of plans(); track plan.id) {
            <div class="plan-card" [class.featured]="plan.deliveriesPerMonth === 3">
              @if (plan.deliveriesPerMonth === 3) {
                <div class="popular-badge">⭐ Populaire</div>
              }

              <div class="plan-gradient" [class]="'gradient-' + getPlanTier(plan.deliveriesPerMonth)"></div>

              <div class="plan-content">
                <span class="plan-emoji">
                  @if (plan.deliveriesPerMonth <= 1) { 📦 }
                  @else if (plan.deliveriesPerMonth <= 3) { 🎁 }
                  @else { 🏆 }
                </span>
                <h2>{{ plan.name }}</h2>
                @if (plan.description) {
                  <p class="plan-desc">{{ plan.description }}</p>
                }

                <div class="plan-price">
                  <span class="price-amount">{{ plan.monthlyPrice | number:'1.0-0' }}&euro;</span>
                  <span class="price-period">{{ t.surpriseBox.perMonth }}</span>
                </div>

                <div class="plan-meta">
                  <div class="meta-item">
                    <span>📦</span>
                    {{ plan.deliveriesPerMonth }} {{ t.surpriseBox.deliveries }}/mois
                  </div>
                  <div class="meta-item highlight">
                    <span>💰</span>
                    Valeur estimee : ~{{ plan.estimatedBoxValue | number:'1.0-0' }}&euro;
                  </div>
                </div>

                <button
                  class="btn-subscribe"
                  [class.primary]="plan.deliveriesPerMonth === 3"
                  [disabled]="subscribing()"
                  (click)="subscribe(plan.id)">
                  @if (subscribing()) {
                    <span class="spinner"></span>
                  }
                  {{ t.surpriseBox.subscribe }}
                </button>
              </div>
            </div>
          } @empty {
            <div class="empty-plans">
              <span>📦</span>
              <p>Aucun plan disponible pour le moment.</p>
            </div>
          }
        </div>

        @if (subscribeError()) {
          <div class="error-msg center">⚠️ {{ subscribeError() }}</div>
        }
      }
    </div>
  `,
  styles: [`
    .surprise-box {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2.5rem;

      h1 {
        color: var(--ff-green-900);
        font-size: 2rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
    }

    .page-icon { font-size: 1.5rem; }
    .page-subtitle { color: var(--ff-text-muted); font-size: 1rem; }

    /* States */
    .loading-wrap { padding: 4rem; text-align: center; }

    .error-state {
      text-align: center; padding: 4rem;
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
       CURRENT SUBSCRIPTION
       ========================================== */
    .current-sub {
      max-width: 650px;
      margin: 0 auto 3rem;
      background: white;
      border-radius: var(--ff-radius-xl);
      overflow: hidden;
      box-shadow: var(--ff-shadow-lg);
      position: relative;
    }

    .current-sub-gradient {
      height: 6px;
      background: linear-gradient(to right, var(--ff-green-700), var(--ff-green-400), var(--ff-green-700));
    }

    .current-sub-content { padding: 2rem; }

    .current-sub-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;

      h2 { color: var(--ff-text-light); font-size: 0.9rem; font-weight: 500; margin: 0; }
    }

    .sub-icon {
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--ff-green-50); display: flex; align-items: center;
      justify-content: center; font-size: 1.5rem; flex-shrink: 0;
    }

    .sub-name-row {
      display: flex; align-items: center; gap: 0.75rem; margin-top: 0.25rem;
    }

    .sub-plan-name {
      font-size: 1.25rem; font-weight: 800; color: var(--ff-green-700);
    }

    /* Progress */
    .delivery-progress {
      margin-bottom: 1.5rem;
      background: var(--ff-green-50);
      padding: 1rem 1.25rem;
      border-radius: var(--ff-radius);
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
      color: var(--ff-text-light);
    }

    .progress-count { font-weight: 700; color: var(--ff-green-900); }

    .progress-bar {
      height: 8px;
      background: var(--ff-green-100);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(to right, var(--ff-green-700), var(--ff-green-400));
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .sub-details { margin-bottom: 1.5rem; }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--ff-green-50);
    }

    .detail-label { color: var(--ff-text-light); }
    .detail-value { font-weight: 600; color: var(--ff-green-900); }

    .sub-actions { display: flex; gap: 0.75rem; }

    .btn-cancel {
      padding: 0.65rem 1.5rem;
      border: 2px solid var(--ff-red); background: white;
      color: var(--ff-red); border-radius: var(--ff-radius);
      cursor: pointer; font-weight: 600; transition: all 0.2s;

      &:hover:not(:disabled) { background: var(--ff-red-light); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    /* ==========================================
       PLANS GRID
       ========================================== */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      align-items: start;
    }

    .plan-card {
      background: white;
      border-radius: var(--ff-radius-xl);
      overflow: hidden;
      box-shadow: var(--ff-shadow);
      position: relative;
      border: 2px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-6px);
        box-shadow: var(--ff-shadow-lg);
      }

      &.featured {
        border-color: var(--ff-green-700);
        box-shadow: var(--ff-shadow-lg);
        transform: scale(1.03);

        &:hover { transform: scale(1.03) translateY(-6px); }
      }
    }

    .popular-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-500));
      color: white;
      padding: 0.25rem 0.85rem;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 700;
      z-index: 1;
      box-shadow: 0 2px 6px rgba(46, 125, 50, 0.3);
    }

    .plan-gradient {
      height: 100px;

      &.gradient-basic { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); }
      &.gradient-standard { background: linear-gradient(135deg, #66bb6a, #2e7d32); }
      &.gradient-premium { background: linear-gradient(135deg, #1b5e20, #0d3b11); }
    }

    .plan-content {
      padding: 1.75rem;
      text-align: center;
    }

    .plan-emoji {
      font-size: 2.75rem;
      display: block;
      margin: -2.5rem auto 0.75rem;
      width: 64px;
      height: 64px;
      background: white;
      border-radius: 50%;
      line-height: 64px;
      box-shadow: var(--ff-shadow);
    }

    .plan-card h2 { color: var(--ff-green-900); font-size: 1.25rem; margin-bottom: 0.25rem; }
    .plan-desc { color: var(--ff-text-muted); font-size: 0.85rem; margin-bottom: 0.75rem; }

    .plan-price {
      margin-bottom: 1.25rem;
    }

    .price-amount {
      font-size: 2.75rem;
      font-weight: 900;
      color: var(--ff-green-700);
    }

    .price-period { font-size: 0.95rem; color: var(--ff-text-muted); }

    .plan-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      font-size: 0.9rem;
      color: var(--ff-text);

      &.highlight { color: var(--ff-green-700); font-weight: 600; }
    }

    .btn-subscribe {
      width: 100%;
      padding: 0.8rem;
      border: 2px solid var(--ff-green-700);
      background: white;
      color: var(--ff-green-700);
      border-radius: var(--ff-radius);
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;

      &:hover:not(:disabled) { background: var(--ff-green-50); }

      &.primary {
        background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
        color: white; border: none;
        box-shadow: 0 2px 8px rgba(46, 125, 50, 0.25);

        &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(46, 125, 50, 0.35); }
      }

      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }

    .empty-plans {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: var(--ff-text-muted);
      span { font-size: 3rem; display: block; margin-bottom: 0.75rem; }
    }

    .error-msg {
      background: #ffebee; color: #c62828;
      padding: 0.65rem 1rem; border-radius: 0.5rem;
      font-size: 0.85rem; margin-top: 0.75rem;
      &.center { text-align: center; }
    }

    @media (max-width: 600px) {
      .plan-card.featured { transform: none; &:hover { transform: translateY(-6px); } }
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class SurpriseBoxComponent implements OnInit {
  private surpriseBoxService = inject(SurpriseBoxService);

  t = FR;
  loading = signal(true);
  error = signal('');
  plans = signal<SurpriseBoxPlan[]>([]);
  currentSubscription = signal<SurpriseBoxSubscription | null>(null);
  subscribing = signal(false);
  subscribeError = signal('');
  actionLoading = signal(false);
  actionError = signal('');

  deliveryProgress = computed(() => {
    const sub = this.currentSubscription();
    if (!sub || !sub.plan) return 0;
    const total = sub.plan.deliveriesPerMonth || 1;
    return Math.min((sub.deliveriesUsedThisMonth / total) * 100, 100);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    let plansLoaded = false;
    let subLoaded = false;
    const checkDone = () => {
      if (plansLoaded && subLoaded) this.loading.set(false);
    };

    this.surpriseBoxService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans.filter(p => p.isActive));
        plansLoaded = true;
        checkDone();
      },
      error: () => {
        this.error.set(this.t.common.error);
        plansLoaded = true;
        checkDone();
      },
    });

    this.surpriseBoxService.getMySubscription().subscribe({
      next: (sub) => {
        this.currentSubscription.set(sub);
        subLoaded = true;
        checkDone();
      },
      error: () => {
        subLoaded = true;
        checkDone();
      },
    });
  }

  getPlanTier(deliveries: number): string {
    if (deliveries <= 1) return 'basic';
    if (deliveries <= 3) return 'standard';
    return 'premium';
  }

  subscribe(planId: string): void {
    this.subscribing.set(true);
    this.subscribeError.set('');
    const addressId = localStorage.getItem('ff_default_address') ?? '';
    this.surpriseBoxService.subscribe(planId, addressId).subscribe({
      next: () => {
        this.subscribing.set(false);
        this.loadData();
      },
      error: () => {
        this.subscribeError.set(this.t.common.error);
        this.subscribing.set(false);
      },
    });
  }

  cancelSubscription(): void {
    this.actionLoading.set(true);
    this.actionError.set('');
    this.surpriseBoxService.cancel().subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadData();
      },
      error: () => {
        this.actionError.set(this.t.common.error);
        this.actionLoading.set(false);
      },
    });
  }
}
