import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Subscription, SubscriptionPlan } from '../model';

export interface CreateSubscriptionRequest {
  plan: SubscriptionPlan;
  preferredDay: string;
  categories: string[];
  addressId: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  constructor(private api: ApiService) {}

  getMySubscription(): Observable<Subscription | null> {
    return this.api.get<Subscription | null>('/subscriptions/mine');
  }

  subscribe(request: CreateSubscriptionRequest): Observable<{ subscriptionId: string; clientSecret: string }> {
    return this.api.post('/subscriptions', request);
  }

  cancel(): Observable<void> {
    return this.api.delete('/subscriptions/mine');
  }

  pause(): Observable<void> {
    return this.api.put('/subscriptions/mine/pause');
  }

  resume(): Observable<void> {
    return this.api.put('/subscriptions/mine/resume');
  }
}
