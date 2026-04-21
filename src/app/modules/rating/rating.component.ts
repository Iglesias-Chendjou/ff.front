import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FR } from '../../i18n/fr';
import { OrderService } from '../../core/services/order.service';
import { StarRatingWidget } from '../../core/widgets/star-rating.widget';
import { LoadingSpinnerWidget } from '../../core/widgets/loading-spinner.widget';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingWidget, LoadingSpinnerWidget],
  template: `
    <div class="rating-page">
      <div class="rating-card">
        @if (submitted()) {
          <!-- Success State -->
          <div class="success-state">
            <div class="success-icon">✅</div>
            <h2>Merci pour votre avis !</h2>
            <p>Votre evaluation nous aide a ameliorer notre service.</p>
            <button class="btn-back" (click)="goBack()">Retour aux commandes</button>
          </div>
        } @else {
          <!-- Header -->
          <div class="rating-header">
            <div class="order-icon-wrap">
              <span>📦</span>
            </div>
            <div class="order-info">
              <h1>{{ t.rating.title }}</h1>
              <p class="order-id">Livraison #{{ deliveryId }}</p>
              <p class="order-question">Comment s'est passee votre livraison ?</p>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Stars -->
          <div class="stars-section">
            <ff-star-rating [value]="selectedRating()" (select)="selectedRating.set($event)" />
            @if (selectedRating() > 0) {
              <div class="rating-label" [class]="'rating-' + selectedRating()">
                {{ getRatingLabel(selectedRating()) }}
              </div>
            } @else {
              <p class="rating-hint">Appuyez sur une etoile pour evaluer</p>
            }
          </div>

          <!-- Comment -->
          <div class="comment-section">
            <label>{{ t.rating.comment }}</label>
            <div class="textarea-wrap">
              <textarea
                rows="4"
                placeholder="Partagez votre experience..."
                class="comment-input"
                [(ngModel)]="comment"
                [maxlength]="maxChars">
              </textarea>
              <span class="char-count" [class.near-limit]="comment.length > maxChars * 0.8">
                {{ comment.length }} / {{ maxChars }}
              </span>
            </div>
          </div>

          @if (error()) {
            <div class="error-msg">
              <span>⚠️</span>
              <span>{{ error() }}</span>
            </div>
          }

          @if (submitting()) {
            <div class="submit-loading">
              <ff-loading />
            </div>
          } @else {
            <button
              class="btn-submit"
              [disabled]="selectedRating() === 0"
              (click)="submit()">
              {{ t.rating.submit }}
            </button>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .rating-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
    }

    .rating-card {
      width: 100%;
      max-width: 520px;
      background: white;
      border-radius: var(--ff-radius-xl);
      padding: 2.5rem;
      box-shadow: var(--ff-shadow-lg);
      animation: scaleIn 0.4s ease;
    }

    /* ==========================================
       HEADER
       ========================================== */
    .rating-header {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
    }

    .order-icon-wrap {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--ff-green-50);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      flex-shrink: 0;
    }

    .order-info {
      h1 {
        color: var(--ff-green-900);
        font-size: 1.5rem;
        font-weight: 800;
        margin: 0;
      }
    }

    .order-id {
      color: var(--ff-text-muted);
      font-size: 0.85rem;
      margin: 0.15rem 0 0.5rem 0;
    }

    .order-question {
      color: var(--ff-text-light);
      font-size: 0.95rem;
      margin: 0;
    }

    .divider {
      height: 1px;
      background: var(--ff-green-50);
      margin: 1.75rem 0;
    }

    /* ==========================================
       STARS
       ========================================== */
    .stars-section {
      text-align: center;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .rating-label {
      font-weight: 700;
      font-size: 1rem;
      padding: 0.3rem 1rem;
      border-radius: 2rem;
      animation: scaleIn 0.2s ease;

      &.rating-1 { background: #ffebee; color: #c62828; }
      &.rating-2 { background: #fff3e0; color: #e65100; }
      &.rating-3 { background: #fff8e1; color: #f9a825; }
      &.rating-4 { background: #e8f5e9; color: #2e7d32; }
      &.rating-5 { background: var(--ff-green-50); color: var(--ff-green-900); }
    }

    .rating-hint {
      color: var(--ff-text-muted);
      font-size: 0.85rem;
      margin: 0;
    }

    /* ==========================================
       COMMENT
       ========================================== */
    .comment-section {
      margin-bottom: 1.5rem;

      label {
        display: block;
        color: var(--ff-green-700);
        font-weight: 600;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }
    }

    .textarea-wrap { position: relative; }

    .comment-input {
      width: 100%;
      padding: 0.85rem 1rem;
      border: 2px solid var(--ff-border);
      border-radius: var(--ff-radius);
      font-size: 0.95rem;
      resize: vertical;
      box-sizing: border-box;
      font-family: inherit;
      transition: all 0.2s;
      min-height: 100px;

      &:focus {
        border-color: var(--ff-green-400);
        outline: none;
        box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.15);
      }

      &::placeholder { color: var(--ff-text-muted); }
    }

    .char-count {
      position: absolute;
      bottom: 0.65rem;
      right: 0.85rem;
      font-size: 0.75rem;
      color: var(--ff-text-muted);

      &.near-limit { color: var(--ff-orange); }
    }

    /* ==========================================
       SUBMIT
       ========================================== */
    .error-msg {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #ffebee;
      color: #c62828;
      padding: 0.65rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }

    .submit-loading {
      padding: 1rem;
      text-align: center;
    }

    .btn-submit {
      width: 100%;
      padding: 0.9rem;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      color: white;
      border: none;
      border-radius: var(--ff-radius);
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(46, 125, 50, 0.25);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(46, 125, 50, 0.35);
      }

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
      }
    }

    /* ==========================================
       SUCCESS
       ========================================== */
    .success-state {
      text-align: center;
      padding: 1.5rem 0;
      animation: scaleIn 0.4s ease;
    }

    .success-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1.25rem;
      animation: bounceIn 0.5s ease;
    }

    .success-state h2 {
      color: var(--ff-green-900);
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .success-state p {
      color: var(--ff-text-muted);
      margin-bottom: 2rem;
    }

    .btn-back {
      padding: 0.75rem 2rem;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      color: white;
      border: none;
      border-radius: var(--ff-radius);
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;

      &:hover { transform: translateY(-1px); }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes bounceIn {
      0% { transform: scale(0); }
      60% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
  `],
})
export class RatingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  t = FR;
  deliveryId = '';
  selectedRating = signal(0);
  comment = '';
  maxChars = 500;
  submitting = signal(false);
  submitted = signal(false);
  error = signal('');

  private ratingLabels: Record<number, string> = {
    1: 'Tres mauvais',
    2: 'Mauvais',
    3: 'Correct',
    4: 'Bien',
    5: 'Excellent !',
  };

  ngOnInit(): void {
    this.deliveryId = this.route.snapshot.paramMap.get('deliveryId') ?? '';
  }

  getRatingLabel(value: number): string {
    return this.ratingLabels[value] ?? '';
  }

  submit(): void {
    if (this.selectedRating() === 0) return;

    this.submitting.set(true);
    this.error.set('');

    this.orderService.rateDelivery(this.deliveryId, this.selectedRating(), this.comment).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.error.set(this.t.common.error);
        this.submitting.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
