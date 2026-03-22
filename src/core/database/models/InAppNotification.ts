// In-App Notification Model
export type NotificationType =
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_due'
  | 'task_overdue';

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string | null;
  taskTitle?: string | null;
  taskRoute?: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}
