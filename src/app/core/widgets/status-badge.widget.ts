import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ff-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="badgeClass">{{ label }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-green { background: #e8f5e9; color: #2e7d32; }
    .badge-orange { background: #fff3e0; color: #e65100; }
    .badge-blue { background: #e3f2fd; color: #1565c0; }
    .badge-red { background: #ffebee; color: #c62828; }
    .badge-gray { background: #f5f5f5; color: #666; }
  `],
})
export class StatusBadgeWidget {
  @Input({ required: true }) status!: string;

  private readonly STATUS_MAP: Record<string, { label: string; class: string }> = {
    Pending: { label: 'En attente', class: 'badge-orange' },
    Paid: { label: 'Payee', class: 'badge-blue' },
    Preparing: { label: 'En preparation', class: 'badge-orange' },
    ReadyForCollection: { label: 'Prete', class: 'badge-blue' },
    InDelivery: { label: 'En livraison', class: 'badge-blue' },
    Delivered: { label: 'Livree', class: 'badge-green' },
    Cancelled: { label: 'Annulee', class: 'badge-red' },
    Refunded: { label: 'Remboursee', class: 'badge-gray' },
    Active: { label: 'Actif', class: 'badge-green' },
    Paused: { label: 'Pause', class: 'badge-orange' },
    PastDue: { label: 'Impaye', class: 'badge-red' },
    Failed: { label: 'Echouee', class: 'badge-red' },
  };

  get label(): string {
    return this.STATUS_MAP[this.status]?.label ?? this.status;
  }

  get badgeClass(): string {
    return this.STATUS_MAP[this.status]?.class ?? 'badge-gray';
  }
}
