import type { RecurrencePattern } from './Recurrence';

export interface Task {
  id: string;
  parentTaskId?: string | null;
  taskLevel: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  dueTime?: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  isArchived: boolean;
  archivedAt?: string | null;
  completedAt?: string | null;
  // Recurrence fields
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern | null;
  recurrenceEndDate?: string | null;
  parentRecurrenceId?: string | null;
  recurrenceInstanceId?: string | null;
  // Sync fields
  sync: boolean;
  userId: string;
}

export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
