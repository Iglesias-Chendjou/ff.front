import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AvailableProduct, ProductCategory, Zone } from '../model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}

  getAvailableProducts(zoneId: string): Observable<AvailableProduct[]> {
    const params: Record<string, string> = {};
    if (zoneId) params['zone'] = zoneId;
    return this.api.get<AvailableProduct[]>('/products/available', params);
  }

  searchProducts(query: string, zoneId: string): Observable<AvailableProduct[]> {
    const params: Record<string, string> = { q: query };
    if (zoneId) params['zone'] = zoneId;
    return this.api.get<AvailableProduct[]>('/products/search', params);
  }

  getCategories(): Observable<ProductCategory[]> {
    return this.api.get<ProductCategory[]>('/products/categories');
  }

  getZones(): Observable<Zone[]> {
    return this.api.get<Zone[]>('/products/zones');
  }
}
