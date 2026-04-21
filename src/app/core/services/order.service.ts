import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order, CreateOrderRequest, Delivery } from '../model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private api: ApiService) {}

  createOrder(request: CreateOrderRequest): Observable<{ orderId: string; clientSecret: string }> {
    return this.api.post('/orders', request);
  }

  getMyOrders(): Observable<Order[]> {
    return this.api.get<Order[]>('/orders/mine');
  }

  getOrder(id: string): Observable<Order> {
    return this.api.get<Order>(`/orders/${id}`);
  }

  getDelivery(deliveryId: string): Observable<Delivery> {
    return this.api.get<Delivery>(`/deliveries/${deliveryId}`);
  }

  rateDelivery(deliveryId: string, rating: number, comment: string): Observable<void> {
    return this.api.post(`/deliveries/${deliveryId}/rate`, { rating, comment });
  }

  trackDelivery(deliveryId: string): Observable<Delivery> {
    return this.api.get<Delivery>(`/deliveries/${deliveryId}/track`);
  }
}
