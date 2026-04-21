import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ff-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stars">
      @for (star of [1,2,3,4,5]; track star) {
        <span
          class="star"
          [class.filled]="star <= value"
          [class.readonly]="readonly"
          (click)="!readonly && select.emit(star)">
          {{ star <= value ? '★' : '☆' }}
        </span>
      }
    </div>
  `,
  styles: [`
    .stars { display: flex; gap: 0.25rem; }
    .star {
      font-size: 1.75rem;
      color: #ffc107;
      cursor: pointer;
      transition: transform 0.1s;
      &:hover:not(.readonly) { transform: scale(1.2); }
      &.readonly { cursor: default; }
    }
  `],
})
export class StarRatingWidget {
  @Input() value = 0;
  @Input() readonly = false;
  @Output() select = new EventEmitter<number>();
}
