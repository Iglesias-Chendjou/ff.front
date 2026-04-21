import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FR } from '../../i18n/fr';
import { SubscriptionService } from '../../core/services/subscription.service';
import { StatusBadgeWidget } from '../../core/widgets/status-badge.widget';
import { LoadingSpinnerWidget } from '../../core/widgets/loading-spinner.widget';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '../../core/model';

interface PlanOption {
  plan: SubscriptionPlan;
  label: string;
  price: number;
  featured: boolean;
  features: string[];
  icon: string;
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, StatusBadgeWidget, LoadingSpinnerWidget, DecimalPipe],
  template: `
    <div class="subscriptions">
      <div class="page-header">
        <h1>
          <span class="page-icon">📅</span>
          {{ t.subscription.title }}
        </h1>
        <p class="page-subtitle">Choisissez le plan qui vous convient et economisez chaque mois</p>
      </div>

      @if (loading()) {
        <div class="loading-wrap"><ff-loading /></div>
      } @else if (error()) {
        <div class="error-state">
          <span class="error-icon">😔</span>
          <p>{{ error() }}</p>
          <button class="btn-retry" (click)="loadSubscription()">Reessayer</button>
        </div>
      } @else {
        <!-- Current Plan -->
        @if (currentSubscription()) {
          <div class="current-plan">
            <div class="current-plan-header">
              <div class="current-plan-icon">📋</div>
              <div>
                <h2>Votre abonnement actuel</h2>
                <p class="current-plan-type">{{ getPlanLabel(currentSubscription()!.planType) }}</p>
              </div>
              <ff-status-badge [status]="currentSubscription()!.status" />
            </div>

            <div class="current-plan-details">
              <div class="detail-item">
                <span class="detail-label">Prix mensuel</span>
                <span class="detail-value">{{ currentSubscription()!.monthlyPrice | number:'1.2-2' }}&euro;/mois</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Prochaine facturation</span>
                <span class="detail-value">{{ currentSubscription()!.nextBillingDate | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>

            <div class="current-plan-actions">
              @if (currentSubscription()!.status === SubscriptionStatus.Active) {
                <button class="btn-pause" (click)="pauseSubscription()" [disabled]="actionLoading()">
                  ⏸️ Mettre en pause
                </button>
                <button class="btn-cancel" (click)="cancelSubscription()" [disabled]="actionLoading()">
                  Annuler
                </button>
              }
              @if (currentSubscription()!.status === SubscriptionStatus.Paused) {
                <button class="btn-resume" (click)="resumeSubscription()" [disabled]="actionLoading()">
                  ▶️ Reprendre
                </button>
                <button class="btn-cancel" (click)="cancelSubscription()" [disabled]="actionLoading()">
                  Annuler
                </button>
              }
            </div>

            @if (actionError()) {
              <div class="error-msg">⚠️ {{ actionError() }}</div>
            }
          </div>
        } @else {
          <p class="choose-plan-text">{{ t.subscription.choosePlan }}</p>

          <!-- Plans Grid -->
          <div class="plans-grid">
            @for (plan of plans; track plan.plan) {
              <div class="plan-card" [class.featured]="plan.featured">
                @if (plan.featured) {
                  <div class="popular-badge">⭐ Populaire</div>
                }
                <div class="plan-icon">{{ plan.icon }}</div>
                <h2>{{ plan.label }}</h2>
                <div class="plan-price">
                  <span class="price-amount">{{ plan.price }}&euro;</span>
                  <span class="price-period">/mois</span>
                </div>

                <ul class="plan-features">
                  @for (feature of plan.features; track feature) {
                    <li>
                      <span class="check">✓</span>
                      {{ feature }}
                    </li>
                  }
                </ul>

                <button
                  class="btn-subscribe"
                  [class.btn-primary]="plan.featured"
                  [class.btn-outline]="!plan.featured"
                  [disabled]="subscribing()"
                  (click)="subscribe(plan.plan)">
                  @if (subscribing()) {
                    <span class="spinner"></span>
                  }
                  Souscrire
                </button>
              </div>
            }
          </div>

          @if (subscribeError()) {
            <div class="error-msg center">⚠️ {{ subscribeError() }}</div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .subscriptions {
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
    .choose-plan-text { text-align: center; color: var(--ff-text-light); margin-bottom: 2rem; font-size: 1.05rem; }

    /* ==========================================
       STATES
       ========================================== */
    .loading-wrap { padding: 4rem; text-align: center; }

    .error-state {
      text-align: center; padding: 4rem 2rem;
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
       CURRENT PLAN
       ========================================== */
    .current-plan {
      max-width: 650px;
      margin: 0 auto 2.5rem;
      background: white;
      border-radius: var(--ff-radius-xl);
      padding: 2rem;
      box-shadow: var(--ff-shadow);
      border: 2px solid var(--ff-green-400);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 4px;
        background: linear-gradient(to right, var(--ff-green-700), var(--ff-green-400));
      }
    }

    .current-plan-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;

      h2 { color: var(--ff-green-900); font-size: 1.1rem; margin: 0; font-weight: 600; }
    }

    .current-plan-icon {
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--ff-green-50); display: flex; align-items: center;
      justify-content: center; font-size: 1.5rem; flex-shrink: 0;
    }

    .current-plan-type {
      color: var(--ff-green-700); font-size: 1.25rem; font-weight: 800; margin: 0.15rem 0 0 0;
    }

    .current-plan-details { margin-bottom: 1.5rem; }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.65rem 0;
      border-bottom: 1px solid var(--ff-green-50);
    }

    .detail-label { color: var(--ff-text-light); }
    .detail-value { font-weight: 600; color: var(--ff-green-900); }

    .current-plan-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-pause, .btn-resume {
      padding: 0.65rem 1.5rem;
      border: 2px solid var(--ff-green-700);
      background: white; color: var(--ff-green-700);
      border-radius: var(--ff-radius); cursor: pointer;
      font-weight: 600; transition: all 0.2s;

      &:hover:not(:disabled) { background: var(--ff-green-50); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .btn-resume {
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      color: white; border: none;
      &:hover:not(:disabled) { transform: translateY(-1px); }
    }

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
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .plan-card {
      background: white;
      border-radius: var(--ff-radius-xl);
      padding: 2rem 1.5rem;
      text-align: center;
      box-shadow: var(--ff-shadow);
      position: relative;
      border: 2px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--ff-shadow-lg);
      }

      &.featured {
        border-color: var(--ff-green-700);
        box-shadow: var(--ff-shadow-lg);
        transform: scale(1.04);
        background: linear-gradient(180deg, white 0%, var(--ff-green-50) 100%);

        &:hover { transform: scale(1.04) translateY(-4px); }
      }
    }

    .popular-badge {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-500));
      color: white;
      padding: 0.3rem 1.25rem;
      border-radius: 2rem;
      font-size: 0.8rem;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
    }

    .plan-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }

    .plan-card h2 {
      color: var(--ff-green-900);
      font-size: 1.15rem;
      margin-bottom: 0.75rem;
    }

    .plan-price {
      margin-bottom: 1.5rem;
    }

    .price-amount {
      font-size: 2.5rem;
      font-weight: 900;
      color: var(--ff-green-700);
    }

    .price-period {
      font-size: 0.95rem;
      color: var(--ff-text-muted);
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin: 0 0 1.75rem 0;
      text-align: left;

      li {
        padding: 0.4rem 0;
        color: var(--ff-text);
        font-size: 0.85rem;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }

    .check {
      color: var(--ff-green-400);
      font-weight: 700;
      flex-shrink: 0;
    }

    .btn-subscribe {
      width: 100%;
      padding: 0.75rem;
      border-radius: var(--ff-radius);
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;

      &.btn-primary {
        background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
        color: white; border: none;
        box-shadow: 0 2px 8px rgba(46, 125, 50, 0.25);

        &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(46, 125, 50, 0.35); }
      }

      &.btn-outline {
        background: white; color: var(--ff-green-700);
        border: 2px solid var(--ff-green-700);

        &:hover:not(:disabled) { background: var(--ff-green-50); }
      }

      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }

    .btn-outline .spinner {
      border-color: rgba(46,125,50,0.3); border-top-color: var(--ff-green-700);
    }

    /* ==========================================
       ERROR
       ========================================== */
    .error-msg {
      background: #ffebee;
      color: #c62828;
      padding: 0.65rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      margin-top: 0.75rem;

      &.center { text-align: center; }
    }

    /* ==========================================
       RESPONSIVE
       ========================================== */
    @media (max-width: 900px) {
      .plans-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 600px) {
      .plans-grid { grid-template-columns: 1fr; max-width: 360px; margin: 0 auto 2rem; }
      .plan-card.featured { transform: none; &:hover { transform: translateY(-4px); } }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class SubscriptionsComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);

  t = FR;
  SubscriptionStatus = SubscriptionStatus;
  loading = signal(true);
  error = signal('');
  actionLoading = signal(false);
  actionError = signal('');
  subscribing = signal(false);
  subscribeError = signal('');
  currentSubscription = signal<Subscription | null>(null);

  plans: PlanOption[] = [
    {
      plan: SubscriptionPlan.Monthly, label: 'Mensuel', price: 30, featured: false, icon: '📦',
      features: ['1 livraison/mois', 'Produits anti-gaspi varies', 'Annulation flexible'],
    },
    {
      plan: SubscriptionPlan.Quarterly, label: 'Trimestriel', price: 25, featured: true, icon: '🎁',
      features: ['1 livraison/mois', 'Produits anti-gaspi varies', '-15% sur le prix mensuel', 'Livraison prioritaire'],
    },
    {
      plan: SubscriptionPlan.SemiAnnual, label: 'Semestriel', price: 22, featured: false, icon: '🏆',
      features: ['1 livraison/mois', 'Produits anti-gaspi varies', '-25% sur le prix mensuel', 'Livraison prioritaire'],
    },
    {
      plan: SubscriptionPlan.Annual, label: 'Annuel', price: 20, featured: false, icon: '💎',
      features: ['1 livraison/mois', 'Produits anti-gaspi varies', '-30% sur le prix mensuel', 'Livraison prioritaire', 'Acces exclusif'],
    },
  ];

  ngOnInit(): void {
    this.loadSubscription();
  }

  loadSubscription(): void {
    this.loading.set(true);
    this.error.set('');
    this.subscriptionService.getMySubscription().subscribe({
      next: (sub) => {
        this.currentSubscription.set(sub);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.t.common.error);
        this.loading.set(false);
      },
    });
  }

  getPlanLabel(plan: SubscriptionPlan): string {
    const map: Record<string, string> = {
      [SubscriptionPlan.Monthly]: 'Mensuel',
      [SubscriptionPlan.Quarterly]: 'Trimestriel',
      [SubscriptionPlan.SemiAnnual]: 'Semestriel',
      [SubscriptionPlan.Annual]: 'Annuel',
    };
    return map[plan] ?? plan;
  }

  subscribe(plan: SubscriptionPlan): void {
    this.subscribing.set(true);
    this.subscribeError.set('');
    const addressId = localStorage.getItem('ff_default_address') ?? '';
    this.subscriptionService.subscribe({
      plan,
      preferredDay: 'Wednesday',
      categories: [],
      addressId,
    }).subscribe({
      next: () => {
        this.subscribing.set(false);
        this.loadSubscription();
      },
      error: () => {
        this.subscribeError.set(this.t.common.error);
        this.subscribing.set(false);
      },
    });
  }

  pauseSubscription(): void {
    this.actionLoading.set(true);
    this.actionError.set('');
    this.subscriptionService.pause().subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadSubscription();
      },
      error: () => {
        this.actionError.set(this.t.common.error);
        this.actionLoading.set(false);
      },
    });
  }

  resumeSubscription(): void {
    this.actionLoading.set(true);
    this.actionError.set('');
    this.subscriptionService.resume().subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadSubscription();
      },
      error: () => {
        this.actionError.set(this.t.common.error);
        this.actionLoading.set(false);
      },
    });
  }

  cancelSubscription(): void {
    this.actionLoading.set(true);
    this.actionError.set('');
    this.subscriptionService.cancel().subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadSubscription();
      },
      error: () => {
        this.actionError.set(this.t.common.error);
        this.actionLoading.set(false);
      },
    });
  }
}
