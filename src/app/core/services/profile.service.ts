import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, Address } from '../model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private api: ApiService) {}

  getProfile(): Observable<User> {
    return this.api.get<User>('/users/me');
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.api.put<User>('/users/me', data);
  }

  getAddresses(): Observable<Address[]> {
    return this.api.get<Address[]>('/users/me/addresses');
  }

  addAddress(address: Omit<Address, 'id' | 'userId'>): Observable<Address> {
    return this.api.post<Address>('/users/me/addresses', address);
  }

  updateAddress(id: string, address: Partial<Address>): Observable<Address> {
    return this.api.put<Address>(`/users/me/addresses/${id}`, address);
  }

  deleteAddress(id: string): Observable<void> {
    return this.api.delete(`/users/me/addresses/${id}`);
  }

  setDefaultAddress(id: string): Observable<void> {
    return this.api.put(`/users/me/addresses/${id}/default`);
  }
}
