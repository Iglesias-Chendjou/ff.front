import { Component } from '@angular/core';

@Component({
  selector: 'ff-loading',
  standalone: true,
  template: `
    <div class="loading">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>
  `,
  styles: [`
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
      p { color: #999; font-size: 0.9rem; }
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e8f5e9;
      border-top-color: #2e7d32;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class LoadingSpinnerWidget {}
