import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Notification } from '../model';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  readonly all = this.notifications.asReadonly();
  readonly unreadCount = () => this.notifications().filter((n) => !n.isRead).length;

  constructor(private api: ApiService) {}

  load() {
    return this.api.get<Notification[]>('/notifications/mine').pipe(
      tap((data) => this.notifications.set(data)),
    );
  }

  markAsRead(id: string) {
    return this.api.put(`/notifications/${id}/read`).pipe(
      tap(() => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      }),
    );
  }
}
