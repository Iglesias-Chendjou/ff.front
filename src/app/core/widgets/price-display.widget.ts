import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreInventory } from '../model';

@Component({
  selector: 'ff-price-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="price-display">
      <span class="price-original">{{ originalPrice | number:'1.2-2' }}&#8364;</span>
      <span class="price-discounted">{{ discountedPrice | number:'1.2-2' }}&#8364;</span>
    </div>
  `,
  styles: [`
    .price-display { display: flex; align-items: center; gap: 0.5rem; }
    .price-original {
      text-decoration: line-through;
      color: #999;
      font-size: 0.85rem;
    }
    .price-discounted {
      color: #2e7d32;
      font-weight: 800;
      font-size: 1.15rem;
    }
  `],
})
export class PriceDisplayWidget {
  @Input({ required: true }) inventory!: StoreInventory;

  get originalPrice(): number {
    const t = this.inventory.productTemplate;
    if (!t) return 0;
    const map: Record<string, number> = { Low: t.priceLowRange, Mid: t.priceMidRange, High: t.priceHighRange };
    return map[this.inventory.selectedRange] ?? t.priceMidRange;
  }

  get discountedPrice(): number {
    const discount = this.inventory.productTemplate?.discountPercent ?? 50;
    return this.originalPrice * (1 - discount / 100);
  }
}
