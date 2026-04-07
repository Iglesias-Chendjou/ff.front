# Prompt de developpement — ff.front (Frontend Angular)

## Instructions prealables OBLIGATOIRES

**AVANT de commencer a travailler sur ce projet, tu DOIS :**

1. **Lire le CLAUDE.md** de ce projet (`ff.front/CLAUDE.md`) pour comprendre la stack, la structure, les conventions et les regles metier.

2. **Lire TOUTE l'analyse fonctionnelle** dans le projet `ff.analyse/` :
   - `ff.analyse/01_use_case.puml` — Diagramme de cas d'utilisation (6 acteurs, 40+ use cases)
   - `ff.analyse/02_class_diagram.puml` — Diagramme de classes / modele de donnees (19 entites)
   - `ff.analyse/03_sequence_diagrams.puml` — 5 diagrammes de sequence (commande, cochage magasin, abonnement, colis surprise, fournisseur B2B)
   - `ff.analyse/04_activity_diagrams.puml` — 4 diagrammes d'activite (workflow quotidien, abonnement, colis surprise, fournisseur B2B)

3. **Ne jamais inventer** de fonctionnalite, d'ecran ou de regle metier. Tout est defini dans l'analyse. S'y conformer strictement.

---

## Ta mission

Tu es le developpeur frontend de la **Plateforme Anti-Gaspi Bruxelles**. Tu dois implementer le site web client en **Angular 21** qui consomme l'API `ff.api`.

### Ce que tu dois faire :

1. **Espace Client** (use cases du diagramme `01_use_case.puml` — package "Espace Client") :
   - Inscription / Connexion (JWT)
   - Parcourir le catalogue par categorie/magasin, filtre par zone de livraison
   - Rechercher un produit
   - Panier : ajouter/retirer, validation du stock en temps reel
   - Passer commande : checkout, paiement Stripe (CB/Bancontact, 3D Secure)
   - Suivi livraison temps reel : carte avec position GPS du livreur (SignalR, MAJ 30s)
   - Gerer abonnement recurrent : choix plan (Mensuel/Trimestriel/Semestriel/Annuel), categories preferees, jour de livraison
   - Souscrire a un forfait Colis Surprise : consulter les 3 forfaits (Decouverte 30EUR, Classique 50EUR, Premium 80EUR), souscrire, historique, noter
   - Historique des commandes
   - Notifications (push web FCM + centre de notifications)
   - Evaluer la livraison (1-5 etoiles + commentaire)
   - Gerer profil et adresses

2. **UI/UX** :
   - Design inspire de Too Good To Go (anti-gaspi, vert, frais)
   - Prix original barre + prix -50% bien visible
   - Avertissement visuel quand l'heure approche de 17h (deadline commandes)
   - Carte interactive pour le suivi de livraison
   - Responsive (mobile-first)

3. **Integration API** :
   - Tous les endpoints documentes dans `03_sequence_diagrams.puml`
   - HttpClient avec interceptor JWT
   - Gestion des erreurs (toast notifications)
   - Loading states

4. **Interfaces TypeScript** :
   - Creer les interfaces/types miroir des DTOs de l'API
   - Se baser sur les entites du `02_class_diagram.puml`

### Architecture :
- Standalone components (Angular 21)
- Lazy loading par feature
- Services dans core/, features isolees, shared pour les composants reutilisables
- Reactive Forms pour les formulaires
- Guards pour les routes protegees
