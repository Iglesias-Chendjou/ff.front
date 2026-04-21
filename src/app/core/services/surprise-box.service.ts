import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SurpriseBoxPlan, SurpriseBoxSubscription } from '../model';

@Injectable({ providedIn: 'root' })
export class SurpriseBoxService {
  constructor(private api: ApiService) {}

  getPlans(): Observable<SurpriseBoxPlan[]> {
    return this.api.get<SurpriseBoxPlan[]>('/surprise-box/plans');
  }

  subscribe(planId: string, addressId: string): Observable<{ subscriptionId: string; clientSecret: string }> {
    return this.api.post('/surprise-box/subscribe', { planId, addressId });
  }

  getMySubscription(): Observable<SurpriseBoxSubscription | null> {
    return this.api.get<SurpriseBoxSubscription | null>('/surprise-box/mine');
  }

  cancel(): Observable<void> {
    return this.api.delete('/surprise-box/mine');
  }

  rateSurpriseBox(id: string, rating: number, comment: string): Observable<void> {
    return this.api.post(`/surprise-box/${id}/rate`, { rating, comment });
  }
}
