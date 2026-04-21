import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FR } from '../../i18n/fr';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { LoadingSpinnerWidget } from '../../core/widgets/loading-spinner.widget';
import { AvailableProduct, ProductCategory } from '../../core/model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerWidget, RouterLink],
  template: `
    <div class="page">

      <!-- Breadcrumb -->
      <div class="container breadcrumb">
        <a routerLink="/" class="bc-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </a>
        <span class="bc-sep">&rsaquo;</span>
        <a routerLink="/catalog" class="bc-link">catalogue</a>
        @if (selectedCategory()) {
          <span class="bc-sep">&rsaquo;</span>
          <span class="bc-current">{{ selectedCategory() }}</span>
        }
      </div>

      <!-- Page header -->
      <div class="container page-header">
        <h1 class="page-title">{{ selectedCategory() ?? 'Produits anti-gaspi' }}</h1>
      </div>

      <!-- Subcategory tiles (horizontal scroll) -->
      <div class="container">
        <div class="subcats">
          @for (c of categories(); track c.id) {
            <button class="sub-tile" [class.active]="selectedCategory() === c.name" (click)="selectedCategory.set(c.name === selectedCategory() ? null : c.name)">
              <div class="sub-title">{{ c.name }}</div>
              <div class="sub-img">
                <span class="sub-emoji">{{ catIcon(c.name) }}</span>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Filter bar -->
      <div class="container filter-bar">
        <button class="f-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filtrer
        </button>
        <button class="f-btn" [class.active]="filterPromo()" (click)="filterPromo.set(!filterPromo())">
          <span class="f-ic red">%</span>
          Promotions
        </button>
        <button class="f-btn" [class.active]="filterBio()" (click)="filterBio.set(!filterBio())">
          <span class="f-ic green">Bio</span>
          Bio
        </button>
        <div class="f-sort">
          <select [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
            <option value="name">Trier : nom</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix decroissant</option>
          </select>
        </div>
        <div class="f-count">{{ filteredProducts().length }} produits trouves</div>
      </div>

      <!-- Content -->
      <div class="container main-content">
        @if (loading()) {
          <div class="loading-wrap"><ff-loading /></div>
        } @else if (error()) {
          <div class="error-state">
            <p>{{ t.common.error }}</p>
            <button class="retry" (click)="loadData()">Reessayer</button>
          </div>
        } @else {
          <!-- Product grid -->
          <div class="grid">
            @for (p of firstBatch(); track p.storeInventoryId) {
              <article class="card">
                <button class="heart" aria-label="Ajouter aux favoris">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>

                <div class="card-img">
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" [alt]="p.name" loading="lazy" />
                  } @else {
                    <div class="no-img">🥫</div>
                  }
                </div>

                <div class="nutri">
                  <span>NUTRI-SCORE</span>
                  <div class="nutri-scale">
                    <span class="n-letter active">A</span>
                    <span class="n-letter">B</span>
                    <span class="n-letter">C</span>
                    <span class="n-letter">D</span>
                    <span class="n-letter">E</span>
                  </div>
                </div>

                <h3 class="card-name">{{ p.name }}</h3>

                <div class="card-meta">
                  <span class="weight">{{ p.unit || '1 pc' }}</span>
                  <span class="unit-price">{{ (p.originalPrice * 10).toFixed(2) }}&euro;/kg</span>
                </div>

                <div class="price-row">
                  <div class="price-block">
                    <span class="old-price">{{ p.originalPrice.toFixed(2) }}&euro;</span>
                    <div class="new-price">
                      <span class="eur">&euro;</span>
                      <span class="main">{{ eurosPart(p.discountedPrice) }}</span>
                      <sup>{{ centsPart(p.discountedPrice) }}</sup>
                    </div>
                  </div>
                  <button class="cart-btn" (click)="addToCart(p)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="18" height="18"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  </button>
                </div>
              </article>
            } @empty {
              <div class="empty-grid">Aucun produit disponible dans cette categorie</div>
            }
          </div>

          <!-- Promo banner between rows -->
          @if (firstBatch().length >= 5 && remainingProducts().length > 0) {
            <div class="mid-banner">
              <div class="mb-left">
                <h2>C'est bon, c'est de saison.</h2>
                <p>Decouvrez notre selection de produits frais anti-gaspi.</p>
                <a routerLink="/catalog" class="mb-link">Voir tout &rsaquo;</a>
              </div>
              <div class="mb-products">
                @for (p of remainingProducts().slice(0, 3); track p.storeInventoryId) {
                  <div class="mb-card">
                    <button class="heart small" aria-label="Favoris">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                    <div class="mb-img">
                      @if (p.imageUrl) {
                        <img [src]="p.imageUrl" [alt]="p.name" loading="lazy" />
                      } @else {
                        <div class="no-img">🥫</div>
                      }
                    </div>
                    <p class="mb-name">{{ p.name }}</p>
                    <div class="mb-meta">
                      <span>{{ p.unit || '1 pc' }}</span>
                    </div>
                    <div class="price-row small">
                      <div class="new-price">
                        <span class="eur">&euro;</span>
                        <span class="main">{{ eurosPart(p.discountedPrice) }}</span>
                        <sup>{{ centsPart(p.discountedPrice) }}</sup>
                      </div>
                      <button class="cart-btn small" (click)="addToCart(p)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Second batch of products -->
          @if (secondBatch().length > 0) {
            <div class="grid">
              @for (p of secondBatch(); track p.storeInventoryId) {
                <article class="card">
                  <button class="heart" aria-label="Ajouter aux favoris">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                  <div class="card-img">
                    @if (p.imageUrl) {
                      <img [src]="p.imageUrl" [alt]="p.name" loading="lazy" />
                    } @else {
                      <div class="no-img">🥫</div>
                    }
                  </div>
                  <div class="nutri">
                    <span>NUTRI-SCORE</span>
                    <div class="nutri-scale">
                      <span class="n-letter active">A</span>
                      <span class="n-letter">B</span>
                      <span class="n-letter">C</span>
                      <span class="n-letter">D</span>
                      <span class="n-letter">E</span>
                    </div>
                  </div>
                  <h3 class="card-name">{{ p.name }}</h3>
                  <div class="card-meta">
                    <span class="weight">{{ p.unit || '1 pc' }}</span>
                    <span class="unit-price">{{ (p.originalPrice * 10).toFixed(2) }}&euro;/kg</span>
                  </div>
                  <div class="price-row">
                    <div class="price-block">
                      <span class="old-price">{{ p.originalPrice.toFixed(2) }}&euro;</span>
                      <div class="new-price">
                        <span class="eur">&euro;</span>
                        <span class="main">{{ eurosPart(p.discountedPrice) }}</span>
                        <sup>{{ centsPart(p.discountedPrice) }}</sup>
                      </div>
                    </div>
                    <button class="cart-btn" (click)="addToCart(p)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="18" height="18"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </button>
                  </div>
                </article>
              }
            </div>
          }

          <!-- SEO text section -->
          <div class="seo-section">
            <h2>Decouvrez nos produits anti-gaspi</h2>
            <p>Des produits de qualite chez vos commercants bruxellois, a moitie prix. Luttez contre le gaspillage alimentaire tout en realisant de vraies economies sur vos courses du quotidien. Nos partenaires — Delhaize, Colruyt et bien d'autres — selectionnent chaque jour les produits proches de la DLC mais parfaitement consommables.</p>
            <p>FoodFirst, c'est la plateforme anti-gaspi qui connecte commercants et consommateurs conscients a Bruxelles. Commandez avant 17h, recevez le lendemain matin entre 6h et 11h. Simple, rapide, utile.</p>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    /* ===== LAYOUT ===== */
    .page { background: #f0f7ff; min-height: 100vh; padding-bottom: 40px; }
    .container { max-width: 1280px; margin: 0 auto; padding: 0 20px; }

    /* ===== BREADCRUMB ===== */
    .breadcrumb {
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #666;
    }
    .bc-home {
      width: 28px;
      height: 28px;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      text-decoration: none;
      border: 1px solid #e0e8f0;
    }
    .bc-sep { color: #999; }
    .bc-link { color: #666; text-decoration: none; }
    .bc-link:hover { color: #1b5e20; }
    .bc-current { color: #1a1a1a; font-weight: 600; }

    /* ===== PAGE HEADER ===== */
    .page-header { padding: 24px 20px 32px; }
    .page-title {
      font-family: Georgia, serif;
      font-size: 48px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
      letter-spacing: -0.01em;
    }

    /* ===== SUB CATEGORIES ===== */
    .subcats {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding: 0 0 12px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .sub-tile {
      flex-shrink: 0;
      width: 200px;
      height: 140px;
      background: #fff;
      border: 1px solid transparent;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      position: relative;
      cursor: pointer;
      transition: all 0.15s;
      text-align: left;
      &:hover {
        border-color: #b3e5fc;
        box-shadow: 0 4px 16px rgba(0,0,0,0.05);
      }
      &.active {
        border-color: #2e7d32;
        box-shadow: 0 4px 16px rgba(46,125,50,0.15);
      }
    }
    .sub-title {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1.25;
      max-width: 55%;
    }
    .sub-img {
      position: absolute;
      right: 12px;
      bottom: 12px;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sub-emoji { font-size: 52px; line-height: 1; }

    /* ===== FILTER BAR ===== */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px;
      flex-wrap: wrap;
    }
    .f-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: #fff;
      border: 1px solid #e0e8f0;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      cursor: pointer;
      transition: all 0.15s;
      &:hover { border-color: #1a1a1a; }
      &.active {
        border-color: #c62828;
        color: #c62828;
      }
    }
    .f-ic {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
    }
    .f-ic.red { background: #ffebee; color: #c62828; }
    .f-ic.green { background: #e8f5e9; color: #1b5e20; font-size: 9px; }
    .f-sort {
      margin-left: auto;
    }
    .f-sort select {
      padding: 8px 14px;
      background: #fff;
      border: 1px solid #e0e8f0;
      border-radius: 24px;
      font-size: 13px;
      color: #1a1a1a;
      cursor: pointer;
      font-weight: 600;
      &:focus { outline: none; border-color: #1a1a1a; }
    }
    .f-count {
      font-size: 13px;
      color: #666;
      font-weight: 500;
    }

    /* ===== MAIN CONTENT ===== */
    .main-content { padding: 0 20px; }

    /* ===== PRODUCT GRID ===== */
    .grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 16px 14px 14px;
      position: relative;
      display: flex;
      flex-direction: column;
      transition: box-shadow 0.15s;
      &:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    }

    .heart {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 32px;
      height: 32px;
      border: 1.5px solid #1b5e20;
      border-radius: 50%;
      background: transparent;
      color: #1b5e20;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      transition: all 0.15s;
      &:hover { background: #e8f5e9; }
      &.small { width: 26px; height: 26px; top: 6px; right: 6px; }
    }

    .card-img {
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 16px 0;
    }
    .card-img img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .no-img { font-size: 60px; color: #ddd; }

    .nutri {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 8px;
      font-weight: 800;
      color: #555;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .nutri-scale {
      display: flex;
      gap: 1px;
    }
    .n-letter {
      width: 14px;
      height: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 800;
      color: #fff;
      background: #bbb;
      &:nth-child(1) { background: #1e8e3e; }
      &:nth-child(2) { background: #a4c93a; }
      &:nth-child(3) { background: #ffc107; }
      &:nth-child(4) { background: #ff9800; }
      &:nth-child(5) { background: #e53935; }
      &.active {
        transform: scale(1.3);
        border-radius: 2px;
      }
    }

    .card-name {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 6px;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 34px;
    }

    .card-meta {
      display: flex;
      flex-direction: column;
      font-size: 11px;
      color: #777;
      margin-bottom: 12px;
      line-height: 1.5;
    }
    .weight { font-weight: 500; }
    .unit-price { color: #999; }

    .price-row {
      margin-top: auto;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 8px;
    }
    .price-block {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .old-price {
      font-size: 11px;
      color: #bbb;
      text-decoration: line-through;
    }
    .new-price {
      display: flex;
      align-items: flex-start;
      color: #1a1a1a;
      line-height: 1;
    }
    .eur { font-size: 11px; margin-top: 2px; }
    .main { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
    .new-price sup {
      font-size: 13px;
      font-weight: 800;
      margin-top: 2px;
      margin-left: 1px;
    }

    .cart-btn {
      width: 40px;
      height: 40px;
      background: #c62828;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      flex-shrink: 0;
      &:hover { background: #b71c1c; }
      &.small { width: 32px; height: 32px; }
    }

    .price-row.small .eur { font-size: 10px; }
    .price-row.small .main { font-size: 20px; }
    .price-row.small .new-price sup { font-size: 11px; }

    /* ===== MID BANNER ===== */
    .mid-banner {
      background: #fff;
      border-radius: 12px;
      padding: 32px;
      margin: 8px 0 24px;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 32px;
      align-items: center;
    }
    .mb-left h2 {
      font-family: Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 12px;
      line-height: 1.15;
      letter-spacing: -0.01em;
    }
    .mb-left p {
      font-size: 14px;
      color: #666;
      margin: 0 0 16px;
      line-height: 1.5;
    }
    .mb-link {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a1a;
      text-decoration: none;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 1px;
    }
    .mb-products {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .mb-card {
      background: #fafafa;
      border-radius: 10px;
      padding: 12px;
      position: relative;
    }
    .mb-img {
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .mb-img img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .mb-name {
      font-size: 12px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 4px;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .mb-meta {
      font-size: 10px;
      color: #999;
      margin-bottom: 8px;
    }

    /* ===== STATES ===== */
    .loading-wrap { padding: 80px; text-align: center; }
    .error-state { padding: 80px; text-align: center; color: #666; }
    .retry {
      margin-top: 12px;
      padding: 10px 24px;
      background: #1b5e20;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .empty-grid {
      grid-column: 1 / -1;
      padding: 60px;
      text-align: center;
      color: #999;
      background: #fff;
      border-radius: 12px;
    }

    /* ===== SEO SECTION ===== */
    .seo-section {
      background: transparent;
      padding: 40px 0 20px;
    }
    .seo-section h2 {
      font-family: Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 20px;
      letter-spacing: -0.01em;
    }
    .seo-section p {
      font-size: 14px;
      color: #555;
      line-height: 1.7;
      margin: 0 0 16px;
      max-width: 900px;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1200px) {
      .grid { grid-template-columns: repeat(4, 1fr); }
    }
    @media (max-width: 900px) {
      .grid { grid-template-columns: repeat(3, 1fr); }
      .page-title { font-size: 34px; }
      .mid-banner { grid-template-columns: 1fr; }
      .mb-products { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 600px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
      .page-title { font-size: 26px; }
      .card { padding: 12px 10px; }
      .card-img { height: 110px; }
      .main { font-size: 20px; }
      .new-price sup { font-size: 11px; }
      .cart-btn { width: 32px; height: 32px; }
      .filter-bar { padding: 12px 20px; }
      .f-sort { margin-left: 0; width: 100%; }
      .mb-products { grid-template-columns: 1fr; }
      .sub-tile { width: 160px; height: 110px; }
      .sub-img { width: 60px; height: 60px; }
      .sub-emoji { font-size: 40px; }
    }
  `],
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  t = FR;

  loading = signal(true);
  error = signal('');
  products = signal<AvailableProduct[]>([]);
  categories = signal<ProductCategory[]>([]);
  selectedCategory = signal<string | null>(null);
  sortBy = signal('name');
  filterPromo = signal(false);
  filterBio = signal(false);

  filteredProducts = computed(() => {
    let items = this.products();
    const cat = this.selectedCategory();
    if (cat) items = items.filter(p => p.categoryName === cat);

    if (this.filterBio()) {
      items = items.filter(p => p.name?.toLowerCase().includes('bio'));
    }

    const sort = this.sortBy();
    if (sort === 'price-asc') items = [...items].sort((a, b) => a.discountedPrice - b.discountedPrice);
    else if (sort === 'price-desc') items = [...items].sort((a, b) => b.discountedPrice - a.discountedPrice);
    else items = [...items].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

    return items;
  });

  firstBatch = computed(() => this.filteredProducts().slice(0, 10));
  remainingProducts = computed(() => this.filteredProducts().slice(10));
  secondBatch = computed(() => this.filteredProducts().slice(13));

  catIcon(name: string): string {
    const map: Record<string, string> = {
      'Fruits & Légumes': '🥦',
      'Boulangerie': '🥖',
      'Produits laitiers': '🧀',
      'Viandes & Poissons': '🥩',
      'Épicerie': '🛒',
    };
    return map[name] ?? '📦';
  }

  eurosPart(price: number): string {
    return Math.floor(price).toString();
  }
  centsPart(price: number): string {
    return Math.round((price % 1) * 100).toString().padStart(2, '0');
  }

  ngOnInit(): void {
    this.loadData();
    this.route.queryParams.subscribe(params => {
      if (params['cat']) this.selectedCategory.set(params['cat']);
    });
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');
    this.productService.getCategories().subscribe({
      next: c => this.categories.set(c),
      error: () => {},
    });
    this.productService.getAvailableProducts(localStorage.getItem('ff_zone') ?? '').subscribe({
      next: p => { this.products.set(p); this.loading.set(false); },
      error: () => { this.error.set(this.t.common.error); this.loading.set(false); },
    });
  }

  addToCart(p: AvailableProduct): void {
    this.cartService.addAvailableProduct(p);
  }
}
