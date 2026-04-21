import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FR } from '../../i18n/fr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <!-- Left: Branding -->
      <div class="auth-branding">
        <div class="branding-content">
          <div class="branding-icon">🥕</div>
          <h1>FoodFirst</h1>
          <p class="branding-tagline">{{ t.app.tagline }}</p>
          <p class="branding-desc">Rejoignez des milliers de bruxellois qui sauvent des repas et font des economies chaque jour.</p>
          <div class="branding-features">
            <div class="branding-feature">
              <span>🛒</span>
              <span>Produits a -50%</span>
            </div>
            <div class="branding-feature">
              <span>🚚</span>
              <span>Livraison rapide</span>
            </div>
            <div class="branding-feature">
              <span>🌍</span>
              <span>Impact positif</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="auth-form-side">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo-mobile">
              <span>🥕</span>
              <span>FoodFirst</span>
            </div>
            <h2>{{ t.auth.login }}</h2>
            <p>Connectez-vous a votre compte</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>{{ t.auth.email }}</label>
              <div class="input-wrap">
                <span class="input-icon">📧</span>
                <input type="email" formControlName="email" placeholder="email@exemple.be" />
              </div>
            </div>

            <div class="form-group">
              <label>{{ t.auth.password }}</label>
              <div class="input-wrap">
                <span class="input-icon">🔒</span>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Votre mot de passe" />
                <button type="button" class="toggle-password" (click)="showPassword.set(!showPassword())">
                  {{ showPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            @if (error) {
              <div class="error-msg">
                <span class="error-icon">⚠️</span>
                <span>{{ error }}</span>
              </div>
            }

            <button type="submit" class="btn-submit" [disabled]="form.invalid || loading">
              @if (loading) {
                <span class="spinner"></span>
                <span>{{ t.common.loading }}</span>
              } @else {
                <span>{{ t.auth.login }}</span>
              }
            </button>
          </form>

          <div class="auth-footer">
            <a href="#" class="forgot-link">{{ t.auth.forgotPassword }}</a>
            <p class="auth-link">
              {{ t.auth.noAccount }}
              <a routerLink="/auth/register">{{ t.auth.register }}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
    }

    /* ==========================================
       LEFT BRANDING PANEL
       ========================================== */
    .auth-branding {
      flex: 1;
      background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -30%;
        right: -20%;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(102, 187, 106, 0.2), transparent 70%);
        border-radius: 50%;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -20%;
        left: -10%;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.05), transparent 70%);
        border-radius: 50%;
      }
    }

    .branding-content {
      position: relative;
      color: white;
      max-width: 400px;
    }

    .branding-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }

    .branding-content h1 {
      font-size: 2.5rem;
      font-weight: 900;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .branding-tagline {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.1rem;
      font-weight: 500;
      margin-bottom: 1.25rem;
    }

    .branding-desc {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.95rem;
      line-height: 1.7;
      margin-bottom: 2rem;
    }

    .branding-features {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .branding-feature {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.65rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      font-weight: 500;
      backdrop-filter: blur(4px);
    }

    /* ==========================================
       RIGHT FORM PANEL
       ========================================== */
    .auth-form-side {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #fafafa;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: white;
      border-radius: 1.5rem;
      padding: 2.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
    }

    .auth-logo-mobile {
      display: none;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--ff-green-900);
    }

    .auth-header {
      margin-bottom: 2rem;

      h2 {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--ff-green-900);
        margin-bottom: 0.35rem;
      }

      p {
        color: var(--ff-text-muted);
        font-size: 0.9rem;
      }
    }

    .form-group {
      margin-bottom: 1.25rem;

      label {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--ff-text);
        margin-bottom: 0.4rem;
      }
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;

      .input-icon {
        position: absolute;
        left: 0.85rem;
        font-size: 1rem;
        pointer-events: none;
        z-index: 1;
      }

      input {
        width: 100%;
        padding: 0.8rem 1rem 0.8rem 2.75rem;
        border: 2px solid var(--ff-border);
        border-radius: 0.75rem;
        font-size: 0.95rem;
        transition: all 0.2s;
        box-sizing: border-box;
        background: white;

        &:focus {
          outline: none;
          border-color: var(--ff-green-400);
          box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.15);
        }

        &::placeholder { color: var(--ff-text-muted); }
      }
    }

    .toggle-password {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.25rem;
      z-index: 1;
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #ffebee;
      color: #c62828;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      animation: slideDown 0.3s ease;
    }

    .error-icon { font-size: 1rem; }

    .btn-submit {
      width: 100%;
      padding: 0.9rem;
      background: linear-gradient(135deg, var(--ff-green-700), var(--ff-green-900));
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 2px 8px rgba(46, 125, 50, 0.25);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(46, 125, 50, 0.35);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2.5px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
    }

    .forgot-link {
      display: inline-block;
      color: var(--ff-text-muted);
      font-size: 0.85rem;
      text-decoration: none;
      margin-bottom: 0.75rem;
      transition: color 0.2s;

      &:hover { color: var(--ff-green-700); }
    }

    .auth-link {
      color: var(--ff-text-light);
      font-size: 0.9rem;

      a {
        color: var(--ff-green-700);
        font-weight: 700;
        text-decoration: none;
        transition: color 0.2s;

        &:hover { color: var(--ff-green-900); }
      }
    }

    /* ==========================================
       RESPONSIVE
       ========================================== */
    @media (max-width: 900px) {
      .auth-branding { display: none; }

      .auth-logo-mobile { display: flex; }

      .auth-form-side {
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);
        padding: 1.5rem;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class LoginComponent {
  t = FR;
  form: FormGroup;
  loading = false;
  error = '';
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.error = 'Email ou mot de passe incorrect';
        this.loading = false;
      },
    });
  }
}
