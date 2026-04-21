import { Routes } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { OrderTrackingComponent } from './order-tracking.component';

export const ORDERS_ROUTES: Routes = [
  { path: '', component: OrdersComponent },
  { path: ':id/track', component: OrderTrackingComponent },
];
