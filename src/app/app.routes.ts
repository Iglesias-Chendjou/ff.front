import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/home/home.routes').then(m => m.HOME_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'catalog',
    loadChildren: () => import('./modules/catalog/catalog.routes').then(m => m.CATALOG_ROUTES),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/cart/cart.routes').then(m => m.CART_ROUTES),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/orders/orders.routes').then(m => m.ORDERS_ROUTES),
  },
  {
    path: 'subscriptions',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/subscriptions/subscriptions.routes').then(m => m.SUBSCRIPTIONS_ROUTES),
  },
  {
    path: 'surprise-box',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/surprise-box/surprise-box.routes').then(m => m.SURPRISE_BOX_ROUTES),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/profile/profile.routes').then(m => m.PROFILE_ROUTES),
  },
  {
    path: 'rating/:deliveryId',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/rating/rating.routes').then(m => m.RATING_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
