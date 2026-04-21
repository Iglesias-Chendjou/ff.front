import { UserRole } from './enums';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  commune: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  label?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
