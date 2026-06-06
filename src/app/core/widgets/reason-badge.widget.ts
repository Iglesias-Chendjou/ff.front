import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingReason, UnsellableSubReason } from '../model/product.model';
import { FR } from '../../i18n/fr';

@Component({
  selector: 'ff-reason-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (label) {
      <span class="reason-badge" [class.dlc]="reason === 'NearExpiry'" [title]="reasonNotes || ''">
        {{ label }}
      </span>
    }
  `,
  styles: [`
    .reason-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      color: #fff;
      background: #2e7d32;
      line-height: 1.2;
      letter-spacing: 0.02em;
    }
    .reason-badge.dlc {
      background: #ff9800;
    }
  `],
})
export class ReasonBadgeWidget {
  @Input() reason?: ListingReason;
  @Input() unsellableSubReason?: UnsellableSubReason;
  @Input() reasonNotes?: string;

  get label(): string | null {
    if (this.reason === 'Unsellable') {
      switch (this.unsellableSubReason) {
        case 'DamagedPackaging': return FR.reasons.damagedPackaging;
        case 'IncompletePack': return FR.reasons.incompletePack;
        case 'Overstock': return FR.reasons.overstock;
        case 'PackagingDefect666': return FR.reasons.packagingDefect666;
        default: return FR.reasons.unsellable;
      }
    }
    if (this.reason === 'NearExpiry') return FR.reasons.nearExpiry;
    return null;
  }
}
