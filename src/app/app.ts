import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { FR } from './i18n/fr';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- TOP BAR (like Delhaize top row) -->
    <header class="header">
      <div class="header-inner">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-icon">🥕</span>
          <span class="logo-text">FoodFirst</span>
        </a>

        <!-- Search bar (center) -->
        <div class="header-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#888" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Cherchez des produits" />
        </div>

        <!-- Right icons -->
        <div class="header-actions">
          @if (auth.isAuthenticated()) {
            <a routerLink="/notifications" class="header-icon-btn" title="Notifications">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </a>
            <a routerLink="/profile" class="header-icon-btn" title="Mon compte">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span class="icon-label">{{ auth.user()?.firstName }}</span>
            </a>
            <a routerLink="/cart" class="header-cart-btn" title="Panier">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              @if (cart.itemCount() > 0) {
                <span class="cart-count">{{ cart.itemCount() }}</span>
              }
            </a>
          } @else {
            <a routerLink="/auth/login" class="header-login-btn">Se connecter</a>
          }
        </div>

        <!-- Mobile hamburger -->
        <button class="hamburger" (click)="mobileOpen.set(!mobileOpen())">
          <span [class.open]="mobileOpen()"></span>
          <span [class.open]="mobileOpen()"></span>
          <span [class.open]="mobileOpen()"></span>
        </button>
      </div>
    </header>

    <!-- NAV BAR (second row like Delhaize) -->
    <nav class="nav-bar" [class.mobile-show]="mobileOpen()">
      <div class="nav-inner">
        <a routerLink="/catalog" routerLinkActive="active" (click)="mobileOpen.set(false)">Catalogue</a>
        <a routerLink="/surprise-box" routerLinkActive="active" (click)="mobileOpen.set(false)">Colis Surprise</a>
        <a routerLink="/subscriptions" routerLinkActive="active" (click)="mobileOpen.set(false)">Abonnements</a>
        @if (auth.isAuthenticated()) {
          <a routerLink="/orders" routerLinkActive="active" (click)="mobileOpen.set(false)">Mes commandes</a>
        }
        <div class="nav-spacer"></div>
        <div class="nav-right">
          <span class="delivery-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 18H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10l4 4v7a1 1 0 0 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M14 6h4l3 3v5a1 1 0 0 1-1 1h-1"/></svg>
            Livraison
          </span>
        </div>
      </div>
    </nav>

    <!-- Deadline warning -->
    @if (showDeadlineWarning()) {
      <div class="deadline">⏰ {{ t.common.deadline }}</div>
    }

    <!-- Mobile overlay -->
    @if (mobileOpen()) {
      <div class="overlay" (click)="mobileOpen.set(false)"></div>
    }

    <main><router-outlet /></main>

    <!-- FOOTER (Delhaize style) -->
    <footer class="footer">
      <!-- Newsletter -->
      <div class="newsletter">
        <div class="newsletter-inner">
          <div class="newsletter-text">
            <h3>Inscrivez-vous a la newsletter FoodFirst</h3>
            <p>Recevez chaque semaine les meilleures offres anti-gaspi</p>
          </div>
          <div class="newsletter-form">
            <input type="email" placeholder="E-mail" />
            <button>Inscription</button>
          </div>
        </div>
      </div>

      <!-- Links -->
      <div class="footer-links">
        <div class="footer-links-inner">
          <div class="footer-col">
            <h4>Faire ses courses</h4>
            <ul>
              <li><a routerLink="/catalog">Catalogue</a></li>
              <li><a routerLink="/surprise-box">Colis Surprise</a></li>
              <li><a routerLink="/subscriptions">Abonnements</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Information</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Moyens de paiement</a></li>
              <li><a href="#">Zones de livraison</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>A propos de FoodFirst</h4>
            <ul>
              <li><a href="#">Notre mission</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Devenir partenaire</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Fournisseurs</h4>
            <ul>
              <li><a href="#">Devenir fournisseur</a></li>
              <li><a href="#">Espace fournisseur B2B</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <span>&copy; 2026 FoodFirst. Tous droits reserves.</span>
          <div class="footer-legal">
            <a href="#">Cookies</a>
            <a href="#">Vie privee</a>
            <a href="#">Conditions generales</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* ===== HEADER (top bar) ===== */
    .header {
      background: #fff;
      border-bottom: 1px solid #e8e8e8;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 20px;
      height: 60px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    /* Logo */
    .logo {
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-icon { font-size: 28px; }
    .logo-text { font-size: 22px; font-weight: 900; color: #1b5e20; }

    /* Search */
    .header-search {
      flex: 1;
      max-width: 500px;
      position: relative;
      display: flex;
      align-items: center;
    }
    .header-search svg {
      position: absolute;
      left: 12px;
    }
    .header-search input {
      width: 100%;
      padding: 9px 14px 9px 36px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .header-search input:focus { outline: none; border-color: #2e7d32; }

    /* Actions */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .header-icon-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      color: #333;
      text-decoration: none;
      border-radius: 6px;
      font-size: 13px;
      transition: background 0.15s;
    }
    .header-icon-btn:hover { background: #f5f5f5; }
    .icon-label { font-size: 13px; color: #555; }

    .header-cart-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      background: #2e7d32;
      color: #fff;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.15s;
    }
    .header-cart-btn:hover { background: #1b5e20; }
    .header-cart-btn svg { stroke: #fff; }
    .cart-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #e53935;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-login-btn {
      padding: 8px 18px;
      background: #2e7d32;
      color: #fff;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.15s;
    }
    .header-login-btn:hover { background: #1b5e20; }

    /* Hamburger */
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
    }
    .hamburger span {
      width: 22px;
      height: 2px;
      background: #333;
      transition: all 0.2s;
    }
    .hamburger span.open:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
    .hamburger span.open:nth-child(2) { opacity: 0; }
    .hamburger span.open:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }

    /* ===== NAV BAR (second row) ===== */
    .nav-bar {
      background: #fff;
      border-bottom: 1px solid #e8e8e8;
    }
    .nav-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      height: 44px;
      gap: 0;
    }
    .nav-inner a {
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 500;
      color: #555;
      text-decoration: none;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .nav-inner a:hover { color: #1b5e20; }
    .nav-inner a.active {
      color: #1b5e20;
      border-bottom-color: #2e7d32;
      font-weight: 600;
    }
    .nav-spacer { flex: 1; }
    .nav-right { display: flex; align-items: center; gap: 12px; }
    .delivery-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: #2e7d32;
      font-weight: 600;
      background: #e8f5e9;
      padding: 4px 10px;
      border-radius: 4px;
    }

    /* ===== DEADLINE ===== */
    .deadline {
      background: #fff3e0;
      color: #e65100;
      text-align: center;
      padding: 6px;
      font-size: 13px;
      font-weight: 600;
    }

    /* ===== OVERLAY ===== */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 90;
    }

    /* ===== MAIN ===== */
    main { min-height: calc(100vh - 104px - 200px); }

    /* ===== FOOTER ===== */
    .newsletter {
      background: #f5f5f5;
      padding: 32px 20px;
      border-top: 1px solid #e8e8e8;
    }
    .newsletter-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 40px;
      flex-wrap: wrap;
    }
    .newsletter-text h3 { font-size: 18px; color: #333; margin: 0 0 4px; }
    .newsletter-text p { font-size: 13px; color: #777; margin: 0; }
    .newsletter-form {
      display: flex;
      gap: 0;
    }
    .newsletter-form input {
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-right: none;
      border-radius: 6px 0 0 6px;
      font-size: 14px;
      width: 260px;
      box-sizing: border-box;
    }
    .newsletter-form input:focus { outline: none; border-color: #2e7d32; }
    .newsletter-form button {
      padding: 10px 22px;
      background: #c62828;
      color: #fff;
      border: none;
      border-radius: 0 6px 6px 0;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .newsletter-form button:hover { background: #b71c1c; }

    .footer-links {
      padding: 40px 20px;
    }
    .footer-links-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 32px;
    }
    .footer-col h4 {
      font-size: 14px;
      font-weight: 700;
      color: #333;
      margin: 0 0 12px;
    }
    .footer-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .footer-col li {
      margin-bottom: 8px;
    }
    .footer-col a {
      font-size: 13px;
      color: #666;
      text-decoration: none;
    }
    .footer-col a:hover { color: #1b5e20; text-decoration: underline; }

    .footer-bottom {
      border-top: 1px solid #e8e8e8;
      padding: 16px 20px;
    }
    .footer-bottom-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #999;
      flex-wrap: wrap;
      gap: 10px;
    }
    .footer-legal {
      display: flex;
      gap: 16px;
    }
    .footer-legal a {
      color: #999;
      text-decoration: none;
    }
    .footer-legal a:hover { color: #333; }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .header-search { display: none; }
      .header-actions { gap: 2px; }
      .icon-label { display: none; }
      .hamburger { display: flex; }
      .nav-bar {
        display: none;
        &.mobile-show {
          display: block;
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          z-index: 95;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      }
      .nav-inner {
        flex-direction: column;
        height: auto;
        padding: 8px 20px;
      }
      .nav-inner a { padding: 10px 0; width: 100%; border-bottom: 1px solid #f0f0f0; }
      .nav-spacer { display: none; }
      .nav-right { width: 100%; padding: 8px 0; }
      .footer-links-inner { grid-template-columns: repeat(2, 1fr); }
      .newsletter-inner { flex-direction: column; text-align: center; }
      .newsletter-form input { width: 200px; }
    }
  `],
})
export class App {
  t = FR;
  mobileOpen = signal(false);

  constructor(
    public auth: AuthService,
    public cart: CartService,
  ) {}

  showDeadlineWarning(): boolean {
    const h = new Date().getHours();
    return h >= 16 && h < 17;
  }
}
