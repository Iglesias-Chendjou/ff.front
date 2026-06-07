import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PaymentIntent {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  isMock: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  stripePaymentIntentId: string | null;
  amount: number;
  currency: string;
  status: 'Pending' | 'Succeeded' | 'Failed' | 'Refunded' | 'PartialRefund';
  createdAt: string;
  confirmedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api = inject(ApiService);

  createIntent(orderId: string): Observable<PaymentIntent> {
    return this.api.post<PaymentIntent>('/payments/intent', { orderId });
  }

  confirmMock(paymentIntentId: string): Observable<Payment> {
    return this.api.post<Payment>(`/payments/mock-confirm/${paymentIntentId}`, {});
  }

  getByOrder(orderId: string): Observable<Payment> {
    return this.api.get<Payment>(`/payments/by-order/${orderId}`);
  }
}
