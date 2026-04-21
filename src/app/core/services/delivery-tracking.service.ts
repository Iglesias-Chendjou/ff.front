import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface DriverLocation {
  deliveryId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class DeliveryTrackingService {
  private connection: signalR.HubConnection | null = null;
  readonly driverLocation = signal<DriverLocation | null>(null);
  readonly isConnected = signal(false);

  constructor(private auth: AuthService) {}

  async startTracking(deliveryId: string): Promise<void> {
    const token = this.auth.getToken();
    if (!token) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(environment.signalRUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('LocationUpdated', (id: string, lat: number, lng: number) => {
      this.driverLocation.set({
        deliveryId: id,
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString(),
      });
    });

    await this.connection.start();
    this.isConnected.set(true);
    await this.connection.invoke('JoinDeliveryGroup', deliveryId);
  }

  async stopTracking(deliveryId: string): Promise<void> {
    if (!this.connection) return;

    await this.connection.invoke('LeaveDeliveryGroup', deliveryId);
    await this.connection.stop();
    this.connection = null;
    this.isConnected.set(false);
    this.driverLocation.set(null);
  }
}
