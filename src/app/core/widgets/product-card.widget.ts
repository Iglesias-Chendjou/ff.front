import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreInventory } from '../model';
import { PriceDisplayWidget } from './price-display.widget';

@Component({
  selector: 'ff-product-card',
  standalone: true,
  imports: [CommonModule, PriceDisplayWidget],
  template: `
    <div class="product-card" [class.out-of-stock]="item.availableQuantity <= 0">
      <div class="product-img">
        @if (item.productTemplate?.imageUrl) {
          <img [src]="item.productTemplate!.imageUrl" [alt]="item.productTemplate!.name" />
        } @else {
          <div class="placeholder-img">🥫</div>
        }
        <span class="discount-badge">-{{ item.productTemplate?.discountPercent ?? 50 }}%</span>
      </div>
      <div class="product-info">
        <span class="product-category">{{ item.productTemplate?.category?.name }}</span>
        <h3>{{ item.productTemplate?.name }}</h3>
        <p class="product-store">{{ item.store?.name }}</p>
        <ff-price-display [inventory]="item" />
        <div class="product-stock">
          @if (item.availableQuantity > 0) {
            <span class="stock-ok">{{ item.availableQuantity }} disponible{{ item.availableQuantity > 1 ? 's' : '' }}</span>
          } @else {
            <span class="stock-out">Rupture de stock</span>
          }
        </div>
      </div>
      <button
        class="btn-add"
        [disabled]="item.availableQuantity <= 0"
        (click)="addToCart.emit(item)">
        @if (item.availableQuantity > 0) {
          Ajouter au panier
        } @else {
          Indisponible
        }
      </button>
    </div>
  `,
  styles: [`
    .product-card {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s;
      &:hover { transform: translateY(-4px); }
      &.out-of-stock { opacity: 0.6; }
    }
    .product-img {
      position: relative;
      height: 160px;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      img { width: 100%; height: 100%; object-fit: cover; }
      .placeholder-img { font-size: 3rem; }
    }
    .discount-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: #e53935;
      color: white;
      padding: 0.25rem 0.6rem;
      border-radius: 1rem;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .product-info {
      padding: 1rem;
      flex: 1;
      .product-category {
        font-size: 0.75rem;
        color: #66bb6a;
        text-transform: uppercase;
        font-weight: 600;
      }
      h3 {
        font-size: 1rem;
        color: #333;
        margin: 0.25rem 0;
      }
      .product-store {
        font-size: 0.8rem;
        color: #999;
        margin-bottom: 0.5rem;
      }
    }
    .product-stock {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      .stock-ok { color: #2e7d32; }
      .stock-out { color: #e53935; }
    }
    .btn-add {
      margin: 0 1rem 1rem;
      padding: 0.65rem;
      background: #2e7d32;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      &:hover:not(:disabled) { background: #1b5e20; }
      &:disabled { background: #ccc; cursor: not-allowed; }
    }
  `],
})
export class ProductCardWidget {
  @Input({ required: true }) item!: StoreInventory;
  @Output() addToCart = new EventEmitter<StoreInventory>();
}
