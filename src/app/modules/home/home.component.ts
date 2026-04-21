import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { AvailableProduct } from '../../core/model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home">

      <!-- ===== 1. CATEGORIES ===== -->
      <section class="container sec">
        <h2 class="sec-title">Vos courses par categorie</h2>
        <div class="cats">
          @for (c of cats; track c.name) {
            <a [routerLink]="['/catalog']" [queryParams]="{cat: c.name}" class="cat">
              <div class="cat-img" [style.background]="c.bg">
                <span>{{ c.icon }}</span>
              </div>
              <span class="cat-name">{{ c.name }}</span>
            </a>
          }
        </div>
      </section>

      <!-- ===== 2. HERO BANNER ===== -->
      <section class="container sec">
        <a routerLink="/catalog" class="hero">
          <div class="hero-bg"></div>
          <div class="hero-content">
            <span class="hero-tag">Offre flash anti-gaspi</span>
            <h2 class="hero-h">Jusqu'a <span>-50%</span> sur vos produits prefers</h2>
            <p class="hero-p">Des produits frais sauves du gaspillage, livres demain matin.</p>
            <span class="hero-cta">Commencer les courses &rarr;</span>
          </div>
          <div class="hero-visual">
            @if (firstImg()) {
              <img [src]="firstImg()" alt="" />
            }
            @if (secondImg()) {
              <img [src]="secondImg()" alt="" class="v2" />
            }
          </div>
        </a>
      </section>

      <!-- ===== 3. THREE PROMO CARDS ===== -->
      <section class="container sec promo3">
        <a routerLink="/surprise-box" class="promo-card c1">
          <div class="promo-ic">🎁</div>
          <div class="promo-body">
            <span class="promo-eyebrow">Nouveau</span>
            <h3>Colis Surprise Anti-Gaspi</h3>
            <p>Des 30&euro;/mois, laissez-vous surprendre</p>
            <span class="promo-link">Je decouvre &rarr;</span>
          </div>
        </a>
        <a routerLink="/subscriptions" class="promo-card c2">
          <div class="promo-ic">🔁</div>
          <div class="promo-body">
            <span class="promo-eyebrow">Economies</span>
            <h3>Abonnez-vous, economisez</h3>
            <p>Plans mensuel, trimestriel, annuel</p>
            <span class="promo-link">Voir les plans &rarr;</span>
          </div>
        </a>
        <a routerLink="/catalog" class="promo-card c3">
          <div class="promo-ic">⏰</div>
          <div class="promo-body">
            <span class="promo-eyebrow">Avant 17h</span>
            <h3>Commandez, on s'occupe du reste</h3>
            <p>Livraison le lendemain matin, zone Bruxelles</p>
            <span class="promo-link">Voir le catalogue &rarr;</span>
          </div>
        </a>
      </section>

      <!-- ===== 4. PROMOTIONS OF THE WEEK ===== -->
      <section class="container sec">
        <div class="weekly">
          <div class="weekly-head">
            <div>
              <h3>Promotions<br/>de la semaine</h3>
              <a routerLink="/catalog" class="all-btn">Toutes les promotions &rarr;</a>
            </div>
            <div class="weekly-ic"><span>%</span></div>
          </div>

          @if (products().length > 0) {
            @for (p of products().slice(0, 4); track p.storeInventoryId) {
              <a routerLink="/catalog" class="w-card">
                <span class="w-badge">-50%</span>
                <div class="w-img">
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" [alt]="p.name" loading="lazy" />
                  } @else {
                    <div class="w-ph">🥫</div>
                  }
                </div>
                <p class="w-store">{{ p.storeName }}</p>
                <p class="w-name">{{ p.name }}</p>
                <div class="w-price">
                  <span class="w-old">{{ p.originalPrice.toFixed(2) }}&euro;</span>
                  <span class="w-new">{{ p.discountedPrice.toFixed(2) }}&euro;</span>
                </div>
              </a>
            }
          } @else {
            @for (i of [1,2,3,4]; track i) {
              <div class="w-card skel"></div>
            }
          }
        </div>
      </section>

      <!-- ===== 5. DELIVERY BENEFITS ===== -->
      <section class="container sec">
        <h2 class="sec-title">Livraison et collecte</h2>
        <p class="sec-sub">Service gratuit cette semaine du 16/04 au 22/04</p>
        <div class="benefits">
          <div class="benefit b1">
            <div class="b-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M3 3h2l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
            </div>
            <div>
              <strong>Livraison a domicile</strong>
              <p>Offerte des 25&euro; d'achat, livree le lendemain matin</p>
            </div>
          </div>
          <div class="benefit b2">
            <div class="b-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <strong>Collecte en magasin</strong>
              <p>Gratuit et sans engagement, retrait quand vous voulez</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== 6. YELLOW STRIP ===== -->
      <section class="container sec">
        <a routerLink="/surprise-box" class="strip">
          <div class="strip-content">
            <h3>2 mois pour tester l'abonnement Colis Surprise</h3>
            <p>Offre valable du 18/04 au 19/04 inclus — Cliquez pour en profiter</p>
          </div>
          <span class="strip-badge">-50%</span>
          <span class="strip-cta">Je profite de l'offre &rarr;</span>
        </a>
      </section>

      <!-- ===== 7. THREE SECONDARY PROMO CARDS ===== -->
      <section class="container sec promo3">
        <a routerLink="/catalog" [queryParams]="{cat: 'Fruits & Legumes'}" class="promo-v2 green">
          <div class="pv2-content">
            <h3>Fruits &amp; Legumes</h3>
            <p>Produits frais et de saison</p>
            <span class="pv2-tag">2+1 offert</span>
          </div>
          <div class="pv2-emoji">🥦</div>
        </a>
        <a routerLink="/catalog" [queryParams]="{cat: 'Produits laitiers'}" class="promo-v2 cream">
          <div class="pv2-content">
            <h3>Cremerie</h3>
            <p>Produits laitiers et fromages</p>
            <span class="pv2-tag">1+1 offert</span>
          </div>
          <div class="pv2-emoji">🧀</div>
        </a>
        <a routerLink="/catalog" [queryParams]="{cat: 'Boulangerie'}" class="promo-v2 dark">
          <div class="pv2-content">
            <h3>Boulangerie</h3>
            <p>Pains, viennoiseries, patisseries</p>
            <span class="pv2-tag light">Jusqu'a -70%</span>
          </div>
          <div class="pv2-emoji">🥖</div>
        </a>
      </section>

      <!-- ===== 8. NEWSLETTER / GUIDE CARDS ===== -->
      <section class="container sec folder">
        <a routerLink="/catalog" class="f-card f1">
          <div class="f-text">
            <h3>Guide de la semaine</h3>
            <p>Les meilleures offres anti-gaspi du moment</p>
            <span class="f-link">Consultez le guide &rarr;</span>
          </div>
          <div class="f-art a1"></div>
        </a>
        <a routerLink="/catalog" class="f-card f2">
          <div class="f-text">
            <h3>A venir la semaine prochaine</h3>
            <p>Decouvrez les offres qui arrivent</p>
            <span class="f-link">En avant-premiere &rarr;</span>
          </div>
          <div class="f-art a2"></div>
        </a>
      </section>

      <!-- ===== 9. BIG GREEN CTA ===== -->
      <section class="container sec">
        <div class="big">
          <div class="big-text">
            <h2>Plus de 150 commercants partenaires</h2>
            <p>A Bruxelles et alentours, il y en a surement un pres de chez vous.</p>
            <a routerLink="/catalog" class="big-link">Decouvrir les magasins &rarr;</a>
          </div>
          <div class="big-art"></div>
        </div>
      </section>

      <!-- ===== 10. SERVICES ===== -->
      <section class="container sec">
        <h2 class="sec-title">Nos services</h2>
        <p class="sec-sub">Plusieurs facons de consommer anti-gaspi</p>
        <div class="services">
          <a routerLink="/catalog" class="svc">
            <div class="svc-ic">🚚</div>
            <h3>Livraison</h3>
            <p>On vous livre chez vous le lendemain matin entre 6h et 11h.</p>
            <span class="svc-link">Decouvrir la livraison &rarr;</span>
          </a>
          <a routerLink="/catalog" class="svc">
            <div class="svc-ic">🧺</div>
            <h3>Collecte</h3>
            <p>Reservez en ligne, retirez en magasin quand vous voulez, gratuitement.</p>
            <span class="svc-link">Decouvrir la collecte &rarr;</span>
          </a>
          <a routerLink="/surprise-box" class="svc">
            <div class="svc-ic">🎁</div>
            <h3>Colis Surprise</h3>
            <p>Une selection surprise de produits anti-gaspi chaque mois.</p>
            <span class="svc-link">Decouvrir le colis &rarr;</span>
          </a>
        </div>
      </section>

      <!-- ===== 11. HELP ===== -->
      <section class="container sec help">
        <div class="help-head">
          <h2 class="sec-title">Besoin d'aide ?</h2>
        </div>
        <div class="help-grid">
          <a href="#" class="h-card">
            <div class="h-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="h-body">
              <strong>FAQ</strong>
              <span>Trouvez rapidement vos reponses</span>
            </div>
            <span class="h-arr">&rsaquo;</span>
          </a>
          <a href="#" class="h-card">
            <div class="h-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div class="h-body">
              <strong>Email</strong>
              <span>Reponse sous 48 heures</span>
            </div>
            <span class="h-arr">&rsaquo;</span>
          </a>
          <a href="#" class="h-card">
            <div class="h-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="h-body">
              <strong>Chat en direct</strong>
              <span>Lundi-vendredi 8h-20h</span>
            </div>
            <span class="h-arr">&rsaquo;</span>
          </a>
          <a href="#" class="h-card">
            <div class="h-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div class="h-body">
              <strong>02 123 45 67</strong>
              <span>7j/7 — 8h-21h</span>
            </div>
            <span class="h-arr">&rsaquo;</span>
          </a>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .home { background: #fff; padding-bottom: 40px; }
    .container { max-width: 1240px; margin: 0 auto; padding: 0 24px; }
    .sec { padding: 24px 0; }
    .sec-title {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 4px;
      letter-spacing: -0.01em;
    }
    .sec-sub {
      font-size: 14px;
      color: #666;
      margin: 0 0 20px;
    }

    /* ===== 1. CATEGORIES ===== */
    .cats {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      margin-top: 16px;
    }
    .cat {
      background: #fff;
      border: 1px solid #eaeaea;
      border-radius: 10px;
      padding: 20px 12px;
      text-align: center;
      text-decoration: none;
      color: #1a1a1a;
      transition: all 0.15s;
      &:hover {
        border-color: #2e7d32;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        transform: translateY(-2px);
      }
    }
    .cat-img {
      width: 84px;
      height: 84px;
      margin: 0 auto 12px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    .cat-name {
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }

    /* ===== 2. HERO ===== */
    .hero {
      display: flex;
      align-items: center;
      background: linear-gradient(110deg, #2e7d32 0%, #1b5e20 100%);
      border-radius: 14px;
      padding: 40px 48px;
      color: #fff;
      min-height: 220px;
      position: relative;
      overflow: hidden;
      text-decoration: none;
      transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 12px 40px rgba(27,94,32,0.25); }
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 85% 50%, rgba(255,255,255,0.08), transparent 60%);
    }
    .hero-content { flex: 1; max-width: 540px; position: relative; z-index: 1; }
    .hero-tag {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(8px);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 6px 12px;
      border-radius: 20px;
      margin-bottom: 16px;
    }
    .hero-h {
      font-size: 34px;
      font-weight: 800;
      margin: 0 0 12px;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .hero-h span {
      color: #ffeb3b;
      background: rgba(255,235,59,0.15);
      padding: 0 6px;
      border-radius: 4px;
    }
    .hero-p {
      font-size: 15px;
      color: rgba(255,255,255,0.85);
      margin: 0 0 20px;
      line-height: 1.5;
    }
    .hero-cta {
      display: inline-block;
      background: #fff;
      color: #1b5e20;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
    }
    .hero-visual {
      position: absolute;
      right: 40px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      gap: 16px;
      z-index: 1;
    }
    .hero-visual img {
      width: 140px;
      height: 140px;
      object-fit: contain;
      background: #fff;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    .hero-visual img.v2 { transform: rotate(6deg) translateY(-10px); }

    /* ===== 3. THREE PROMO ===== */
    .promo3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .promo-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px;
      border-radius: 12px;
      text-decoration: none;
      color: #1a1a1a;
      min-height: 140px;
      transition: all 0.2s;
      border: 1px solid transparent;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      }
    }
    .promo-card.c1 { background: #fce4ec; }
    .promo-card.c2 { background: #e3f2fd; }
    .promo-card.c3 { background: #fff3e0; }
    .promo-ic {
      width: 56px;
      height: 56px;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      flex-shrink: 0;
    }
    .promo-body { flex: 1; }
    .promo-eyebrow {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      color: #c62828;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }
    .promo-card.c2 .promo-eyebrow { color: #1565c0; }
    .promo-card.c3 .promo-eyebrow { color: #ef6c00; }
    .promo-card h3 {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 6px;
      color: #1a1a1a;
      line-height: 1.2;
    }
    .promo-card p {
      font-size: 13px;
      color: #666;
      margin: 0 0 10px;
      line-height: 1.4;
    }
    .promo-link {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 1px;
    }

    /* ===== 4. WEEKLY ===== */
    .weekly {
      display: grid;
      grid-template-columns: 260px repeat(4, 1fr);
      border: 1px solid #eaeaea;
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
    }
    .weekly-head {
      background: #e8f5e9;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .weekly-head h3 {
      font-size: 22px;
      font-weight: 800;
      color: #1a1a1a;
      line-height: 1.15;
      margin: 0 0 20px;
      letter-spacing: -0.02em;
    }
    .all-btn {
      display: inline-block;
      font-size: 13px;
      font-weight: 700;
      color: #1b5e20;
      text-decoration: none;
      margin-top: auto;
    }
    .weekly-ic {
      position: absolute;
      right: 24px;
      bottom: 24px;
      width: 56px;
      height: 56px;
      background: #1b5e20;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
    }
    .w-card {
      padding: 20px 16px;
      border-left: 1px solid #eaeaea;
      text-decoration: none;
      color: #1a1a1a;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: background 0.15s;
      &:hover { background: #fafafa; }
      &.skel { min-height: 220px; background: linear-gradient(90deg, #f5f5f5 0%, #fafafa 50%, #f5f5f5 100%); background-size: 200% 100%; animation: shim 1.5s infinite; }
    }
    @keyframes shim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .w-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #1b5e20;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 7px;
      border-radius: 3px;
      letter-spacing: 0.03em;
    }
    .w-img {
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 12px 0 12px;
    }
    .w-img img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .w-ph { font-size: 44px; color: #ddd; }
    .w-store {
      font-size: 10px;
      font-weight: 700;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 3px;
    }
    .w-name {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 10px;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 36px;
    }
    .w-price {
      margin-top: auto;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .w-old { font-size: 12px; color: #999; text-decoration: line-through; }
    .w-new { font-size: 18px; font-weight: 800; color: #1b5e20; }

    /* ===== 5. BENEFITS ===== */
    .benefits {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .benefit {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: #f9f9f9;
      border: 1px solid #eaeaea;
      border-radius: 12px;
      align-items: flex-start;
    }
    .b-ic {
      width: 48px;
      height: 48px;
      background: #e8f5e9;
      color: #1b5e20;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .benefit strong {
      display: block;
      font-size: 15px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    .benefit p {
      font-size: 13px;
      color: #666;
      margin: 0;
      line-height: 1.5;
    }

    /* ===== 6. YELLOW STRIP ===== */
    .strip {
      display: flex;
      align-items: center;
      gap: 20px;
      background: linear-gradient(100deg, #ffd54f, #ffc107);
      padding: 24px 32px;
      border-radius: 12px;
      text-decoration: none;
      color: #1a1a1a;
      transition: transform 0.2s;
      &:hover { transform: translateY(-2px); }
    }
    .strip-content { flex: 1; }
    .strip-content h3 {
      font-size: 18px;
      font-weight: 800;
      margin: 0 0 4px;
      letter-spacing: -0.01em;
    }
    .strip-content p {
      font-size: 13px;
      color: rgba(0,0,0,0.7);
      margin: 0;
    }
    .strip-badge {
      background: #1b5e20;
      color: #fff;
      font-size: 18px;
      font-weight: 800;
      padding: 12px 16px;
      border-radius: 10px;
      flex-shrink: 0;
    }
    .strip-cta {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 1px;
    }

    /* ===== 7. PROMO V2 ===== */
    .promo-v2 {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      border-radius: 12px;
      text-decoration: none;
      color: #1a1a1a;
      min-height: 150px;
      transition: transform 0.2s;
      &:hover { transform: translateY(-2px); }
    }
    .promo-v2.green { background: #e8f5e9; }
    .promo-v2.cream { background: #fff8e1; }
    .promo-v2.dark { background: #263238; color: #fff; }
    .pv2-content { flex: 1; }
    .promo-v2 h3 {
      font-size: 18px;
      font-weight: 800;
      margin: 0 0 4px;
      letter-spacing: -0.01em;
    }
    .promo-v2 p {
      font-size: 13px;
      color: #666;
      margin: 0 0 12px;
    }
    .promo-v2.dark p { color: rgba(255,255,255,0.7); }
    .pv2-tag {
      display: inline-block;
      background: #c62828;
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 4px;
      letter-spacing: 0.03em;
    }
    .pv2-tag.light { background: #ffeb3b; color: #1a1a1a; }
    .pv2-emoji {
      font-size: 64px;
      line-height: 1;
    }

    /* ===== 8. FOLDER ===== */
    .folder {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .f-card {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 32px;
      border-radius: 12px;
      text-decoration: none;
      color: #1a1a1a;
      min-height: 180px;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s;
      &:hover { transform: translateY(-2px); }
    }
    .f-card.f1 { background: #fce4ec; }
    .f-card.f2 { background: #e1f5fe; }
    .f-text { flex: 1; }
    .f-card h3 {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 8px;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: #1a1a1a;
    }
    .f-card.f2 h3 { color: #01579b; }
    .f-card p {
      font-size: 14px;
      color: #666;
      margin: 0 0 16px;
      line-height: 1.5;
    }
    .f-link {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 1px;
    }
    .f-card.f2 .f-link { color: #01579b; border-color: #01579b; }
    .f-art {
      width: 140px;
      height: 140px;
      border-radius: 12px;
      flex-shrink: 0;
    }
    .f-art.a1 {
      background: linear-gradient(135deg, #f48fb1, #ec407a);
      position: relative;
      &::after { content: '📱'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 60px; }
    }
    .f-art.a2 {
      background: linear-gradient(135deg, #81d4fa, #29b6f6);
      position: relative;
      &::after { content: '🗓️'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 60px; }
    }

    /* ===== 9. BIG CTA ===== */
    .big {
      display: flex;
      align-items: center;
      gap: 40px;
      background: linear-gradient(110deg, #a5d6a7, #66bb6a);
      padding: 48px;
      border-radius: 14px;
      position: relative;
      overflow: hidden;
    }
    .big-text { flex: 1; z-index: 1; }
    .big-text h2 {
      font-size: 30px;
      font-weight: 800;
      color: #fff;
      margin: 0 0 8px;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .big-text p {
      font-size: 15px;
      color: rgba(255,255,255,0.9);
      margin: 0 0 20px;
      line-height: 1.5;
      max-width: 520px;
    }
    .big-link {
      display: inline-block;
      background: #fff;
      color: #1b5e20;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
    }
    .big-art {
      width: 280px;
      height: 140px;
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      position: relative;
      backdrop-filter: blur(8px);
      &::after {
        content: '🏪';
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 72px;
      }
    }

    /* ===== 10. SERVICES ===== */
    .services {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 16px;
    }
    .svc {
      padding: 28px;
      background: #fff;
      border: 1px solid #eaeaea;
      border-radius: 12px;
      text-decoration: none;
      color: #1a1a1a;
      transition: all 0.2s;
      &:hover {
        border-color: #2e7d32;
        box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        transform: translateY(-2px);
      }
    }
    .svc-ic {
      width: 56px;
      height: 56px;
      background: #e8f5e9;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 16px;
    }
    .svc h3 {
      font-size: 20px;
      font-weight: 800;
      color: #1a1a1a;
      margin: 0 0 8px;
      letter-spacing: -0.01em;
    }
    .svc p {
      font-size: 14px;
      color: #666;
      margin: 0 0 16px;
      line-height: 1.5;
    }
    .svc-link {
      font-size: 13px;
      font-weight: 700;
      color: #1b5e20;
    }

    /* ===== 11. HELP ===== */
    .help { background: #f0f7ff; border-radius: 14px; padding: 32px; margin-top: 20px; }
    .help-head { margin-bottom: 20px; }
    .help-head .sec-title { font-size: 24px; }
    .help-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .h-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: #fff;
      border-radius: 10px;
      text-decoration: none;
      color: #1a1a1a;
      transition: box-shadow 0.15s;
      &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    }
    .h-ic {
      width: 44px;
      height: 44px;
      background: #e3f2fd;
      color: #1565c0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .h-body { flex: 1; }
    .h-body strong {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 2px;
    }
    .h-body span {
      font-size: 12px;
      color: #666;
    }
    .h-arr {
      font-size: 22px;
      color: #999;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .cats { grid-template-columns: repeat(4, 1fr); }
      .weekly { grid-template-columns: 1fr 1fr; }
      .weekly-head { grid-column: 1 / -1; }
      .promo3 { grid-template-columns: 1fr 1fr; }
      .services { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .cats { grid-template-columns: repeat(3, 1fr); }
      .hero { flex-direction: column; text-align: center; padding: 32px 24px; }
      .hero-visual { display: none; }
      .hero-h { font-size: 24px; }
      .promo3, .services, .folder, .benefits { grid-template-columns: 1fr; }
      .weekly { grid-template-columns: 1fr; }
      .big { flex-direction: column; text-align: center; padding: 32px 24px; }
      .big-art { width: 100%; }
      .big-text h2 { font-size: 22px; }
      .help-grid { grid-template-columns: 1fr; }
      .strip { flex-direction: column; text-align: center; }
      .f-art { display: none; }
    }
    @media (max-width: 480px) {
      .cats { grid-template-columns: repeat(2, 1fr); }
      .cat-img { width: 64px; height: 64px; font-size: 30px; }
      .sec-title { font-size: 18px; }
    }
  `],
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  private productService = inject(ProductService);

  products = signal<AvailableProduct[]>([]);

  cats = [
    { name: 'Fruits & Legumes', icon: '🥦', bg: '#e8f5e9' },
    { name: 'Boulangerie', icon: '🥖', bg: '#fff8e1' },
    { name: 'Produits laitiers', icon: '🧀', bg: '#fff3e0' },
    { name: 'Viandes & Poissons', icon: '🥩', bg: '#ffebee' },
    { name: 'Epicerie', icon: '🛒', bg: '#f3e5f5' },
    { name: 'Colis Surprise', icon: '🎁', bg: '#e3f2fd' },
  ];

  firstImg(): string | undefined {
    return this.products().find(p => p.imageUrl)?.imageUrl;
  }
  secondImg(): string | undefined {
    const imgs = this.products().filter(p => p.imageUrl);
    return imgs[1]?.imageUrl;
  }

  ngOnInit(): void {
    this.productService.getAvailableProducts('').subscribe({
      next: (p) => this.products.set(p),
      error: () => {},
    });
  }
}
