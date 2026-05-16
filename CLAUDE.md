# CLAUDE.md — ff.front (Frontend Angular)

## Projet
Plateforme Anti-Gaspi Bruxelles — Site web client.
Interface web permettant aux clients de parcourir le catalogue, commander, suivre les livraisons, gerer abonnements et colis surprise.

Le catalogue agrège 3 sources d'approvisionnement coexistantes (focus n°1 = invendables magasin) :
1. **Invendables magasin** (`Reason = Unsellable`, focus) — emballage abîmé, alvéole incomplète, surstock, défauts 666
2. **Invendus DLC J+1 magasin** (`Reason = NearExpiry`)
3. **Achat en gros producteurs** (`SourceType = ProducerBulk`)

Le front doit afficher des **badges** par produit en fonction de `Reason`/`UnsellableSubReason` (ex. "Emballage abîmé", "Alvéole incomplète", "DLC demain") et **respecter le `DiscountedPrice` renvoyé par l'API** (peut différer de -50% si `DiscountPercentOverride` est défini côté magasin).

## Stack technique
- **Framework** : Angular 21
- **Langage** : TypeScript
- **UI** : Angular Material ou TailwindCSS
- **State** : NgRx (actions, effects, reducers, selectors)
- **HTTP** : HttpClient avec interceptors (JWT)
- **Paiement** : Stripe.js / Stripe Elements
- **Notifications** : Firebase Cloud Messaging (web push)
- **Temps reel** : SignalR client (@microsoft/signalr) pour suivi livraison
- **Maps** : Leaflet ou Google Maps (suivi GPS livreur)

## Structure attendue
```
ff.front/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── actions/          # NgRx actions
│   │   │   ├── directives/       # Directives globales
│   │   │   ├── effects/          # NgRx effects
│   │   │   ├── guards/           # AuthGuard, RoleGuard
│   │   │   ├── interceptors/     # JwtInterceptor, ErrorInterceptor
│   │   │   ├── model/            # Interfaces TypeScript (miroir DTOs API)
│   │   │   ├── reducers/         # NgRx reducers
│   │   │   ├── selectors/        # NgRx selectors
│   │   │   ├── services/         # AuthService, ApiService, StripeService, NotificationService
│   │   │   └── widgets/          # Composants reutilisables (shared)
│   │   │   core.module.ts
│   │   │   core.routing.module.ts
│   │   ├── i18n/
│   │   │   └── fr.ts             # Traductions francais
│   │   ├── modules/
│   │   │   ├── auth/             # Login, Register, ForgotPassword
│   │   │   ├── catalog/          # Browse, Search, ProductDetail
│   │   │   ├── cart/             # Cart, Checkout
│   │   │   ├── home/             # Page d'accueil
│   │   │   ├── orders/           # OrderHistory, OrderDetail, LiveTracking
│   │   │   ├── subscriptions/    # ManageSubscription, ChoosePlan
│   │   │   ├── surprise-box/     # SurpriseBoxPlans, SurpriseBoxHistory
│   │   │   ├── notifications/    # NotificationCenter
│   │   │   ├── profile/          # UserProfile, Addresses
│   │   │   └── rating/           # Evaluation livraison
│   │   │   home.module.ts
│   │   │   home.routing.module.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   └── app-routing.module.ts
│   ├── assets/
│   └── environments/
```

## Fonctionnalites client (extraites des use cases)
1. **Auth** : inscription / connexion (email + mot de passe)
2. **Catalogue** : parcourir par categorie/magasin, rechercher, filtrer par zone
3. **Panier** : ajouter/retirer produits, valider stock en temps reel
4. **Commande** : passer commande, payer via Stripe (CB/Bancontact), 3D Secure
5. **Suivi livraison** : carte temps reel (SignalR), position GPS du livreur toutes les 30s
6. **Abonnement recurrent** : choisir un plan (Mensuel/Trimestriel/Semestriel/Annuel), categories preferees, jour de livraison
7. **Colis Surprise** : consulter les forfaits (30EUR/50EUR/80EUR), souscrire, historique, noter les colis
8. **Historique** : liste des commandes passees, detail, statuts
9. **Notifications** : push web (FCM), centre de notifications
10. **Evaluation** : noter la livraison (1-5 etoiles + commentaire)
11. **Profil** : gerer adresses, informations personnelles

## Regles metier cote client
- **Deadline 17h** : afficher un avertissement si l'heure approche de 17h
- **Filtrage par zone** : le catalogue est filtre selon la zone de livraison du client
- **Prix affiches** : montrer le prix original barré et le prix discounté **issu de l'API** (`AvailableProductDto.DiscountedPrice`), qui peut varier selon `DiscountPercentOverride` du magasin (ne PAS recalculer -50% côté front)
- **Badges** : afficher un badge par produit selon `Reason` + `UnsellableSubReason` + éventuellement `ReasonNotes` (libellés à traduire dans `i18n/fr.ts`)
- **Suivi temps reel** : WebSocket SignalR pour la position du livreur

## Conventions
- Langue du code : anglais
- Architecture : core/ (singleton services, state NgRx) + modules/ (features) + i18n/
- NgRx pour le state management (actions → effects → reducers → selectors)
- Lazy loading par module
- Reactive forms pour les formulaires
- Nommage : kebab-case pour les fichiers, PascalCase pour les classes
- Chaque feature dans son propre dossier sous modules/
- Widgets reutilisables dans core/widgets/
