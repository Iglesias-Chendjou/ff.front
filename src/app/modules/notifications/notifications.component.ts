import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FR } from '../../i18n/fr';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingSpinnerWidget } from '../../core/widgets/loading-spinner.widget';
import { Notification, NotificationType } from '../../core/model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerWidget],
  template: `
    <div class="notifications">
      <div class="page-header">
        <div class="header-left">
          <h1>
            <span class="page-icon">🔔</span>
            {{ t.nav.notifications }}
          </h1>
          @if (unreadCount() > 0) {
            <span class="unread-count">{{ unreadCount() }} non lue{{ unreadCount() > 1 ? 's' : '' }}</span>
          }
        </div>
        @if (notificationService.all().length > 0 && unreadCount() > 0) {
          <button class="btn-mark-all" (click)="markAllAsRead()">
            ✓ Tout marquer comme lu
          </button>
        }
      </div>

      @if (loading()) {
        <div class="loading-wrap"><ff-loading /></div>
      } @else if (error()) {
        <div class="error-state">
          <span class="error-icon">😔</span>
          <p>{{ error() }}</p>
          <button class="btn-retry" (click)="loadNotifications()">Reessayer</button>
        </div>
      } @else if (notificationService.all().length === 0) {
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <span>🔔</span>
          </div>
          <h3>Aucune notification</h3>
          <p>Vous recevrez ici vos alertes de commandes, livraisons et promotions.</p>
        </div>
      } @else {
        <div class="notifications-list">
          @for (notif of notificationService.all(); track notif.id; let i = $index) {
            <div
              class="notification-card"
              [class.unread]="!notif.isRead"
              [style.animation-delay]="i * 40 + 'ms'"
              (click)="markAsRead(notif)">
              <div class="notif-icon" [class]="getTypeClass(notif.type)">
                <span>{{ getIcon(notif.type) }}</span>
              </div>
              <div class="notif-content">
                <div class="notif-title-row">
                  <h3>{{ notif.title }}</h3>
                  @if (!notif.isRead) {
                    <span class="unread-dot"></span>
                  }
                </div>
                <p class="notif-body">{{ notif.body }}</p>
                <span class="notif-time">{{ notif.sentAt | date:'dd/MM/yyyy a HH:mm' }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      h1 {
        color: var(--ff-green-900);
        font-size: 2rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
      }
    }

    .page-icon { font-size: 1.5rem; }

    .unread-count {
      background: var(--ff-green-50);
      color: var(--ff-green-700);
      padding: 0.25rem 0.75rem;
      border-radius: 2rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .btn-mark-all {
      background: var(--ff-green-50);
      color: var(--ff-green-700);
      border: 1.5px solid var(--ff-green-100);
      padding: 0.5rem 1rem;
      border-radius: var(--ff-radius);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s;

      &:hover {
        background: var(--ff-green-100);
        border-color: var(--ff-green-400);
      }
    }

    /* States */
    .loading-wrap { padding: 4rem; text-align: center; }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: var(--ff-radius-lg);
      box-shadow: var(--ff-shadow);
    }

    .empty-icon-wrap {
      width: 100px; height: 100px; border-radius: 50%;
      background: var(--ff-green-50); display: inline-flex;
      align-items: center; justify-content: center; font-size: 3rem;
      margin-bottom: 1.5rem;
    }

    .empty-state h3 { color: var(--ff-green-900); margin-bottom: 0.5rem; }
    .empty-state p { color: var(--ff-text-muted); max-width: 400px; margin: 0 auto; }

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
       NOTIFICATION LIST
       ========================================== */
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .notification-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: white;
      border-radius: var(--ff-radius-lg);
      box-shadow: var(--ff-shadow-sm);
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      animation: slideUp 0.3s ease both;

      &:hover {
        box-shadow: var(--ff-shadow);
        border-color: var(--ff-green-100);
        transform: translateX(4px);
      }

      &.unread {
        background: linear-gradient(135deg, var(--ff-green-50), white);
        border-left: 3px solid var(--ff-green-400);
      }
    }

    .notif-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--ff-radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;

      &.type-order { background: var(--ff-blue-light); }
      &.type-delivery { background: var(--ff-orange-light); }
      &.type-promo { background: #fff3e0; }
      &.type-subscription { background: #f3e5f5; }
      &.type-surprise { background: #fce4ec; }
      &.type-default { background: var(--ff-green-50); }
    }

    .notif-content { flex: 1; min-width: 0; }

    .notif-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      h3 {
        color: var(--ff-green-900);
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
      }
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--ff-green-500);
      flex-shrink: 0;
      animation: pulse 2s ease-in-out infinite;
    }

    .notif-body {
      color: var(--ff-text-light);
      margin: 0.25rem 0;
      font-size: 0.88rem;
      line-height: 1.5;
    }

    .notif-time {
      color: var(--ff-text-muted);
      font-size: 0.78rem;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    @media (max-width: 600px) {
      .page-header { flex-direction: column; gap: 1rem; }
    }
  `],
})
export class NotificationsComponent implements OnInit {
  notificationService = inject(NotificationService);

  t = FR;
  loading = signal(true);
  error = signal('');

  private iconMap: Record<string, string> = {
    [NotificationType.ProductAvailable]: '🛒',
    [NotificationType.OrderUpdate]: '📦',
    [NotificationType.DeliveryUpdate]: '🚚',
    [NotificationType.Promotion]: '🎉',
    [NotificationType.SubscriptionReminder]: '📅',
    [NotificationType.SurpriseBox]: '🎁',
    [NotificationType.BulkPurchaseUpdate]: '📊',
  };

  private typeClassMap: Record<string, string> = {
    [NotificationType.ProductAvailable]: 'type-default',
    [NotificationType.OrderUpdate]: 'type-order',
    [NotificationType.DeliveryUpdate]: 'type-delivery',
    [NotificationType.Promotion]: 'type-promo',
    [NotificationType.SubscriptionReminder]: 'type-subscription',
    [NotificationType.SurpriseBox]: 'type-surprise',
    [NotificationType.BulkPurchaseUpdate]: 'type-default',
  };

  unreadCount = computed(() =>
    this.notificationService.all().filter(n => !n.isRead).length
  );

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.error.set('');
    this.notificationService.load().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.error.set(this.t.common.error);
        this.loading.set(false);
      },
    });
  }

  getIcon(type: NotificationType): string {
    return this.iconMap[type] ?? '🔔';
  }

  getTypeClass(type: NotificationType): string {
    return this.typeClassMap[type] ?? 'type-default';
  }

  markAsRead(notif: Notification): void {
    if (notif.isRead) return;
    this.notificationService.markAsRead(notif.id).subscribe();
  }

  markAllAsRead(): void {
    const unread = this.notificationService.all().filter(n => !n.isRead);
    for (const notif of unread) {
      this.notificationService.markAsRead(notif.id).subscribe();
    }
  }
}
