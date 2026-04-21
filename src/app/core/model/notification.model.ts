import { NotificationType } from './enums';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  data?: string;
  sentAt: string;
}
