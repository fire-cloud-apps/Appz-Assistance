export interface Task {
  id: string
  parentTaskId?: string | null
  taskLevel: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  isArchived: boolean
  archivedAt?: string | null
  completedAt?: string | null
  // Recurrence fields
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern | null
  recurrenceEndDate?: string | null
  parentRecurrenceId?: string | null
  recurrenceInstanceId?: string | null
}

export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled'

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical'

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type RecurrenceWeeklyDay = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

export interface RecurrencePattern {
  frequency: RecurrenceFrequency
  interval: number // e.g., every 2 weeks, every 3 months
  weeklyDays?: RecurrenceWeeklyDay[] // For weekly recurrence, which days
  monthlyDay?: number // For monthly recurrence, which day of month (1-31)
  count?: number // Number of occurrences (optional, if not set, recurs until end date)
}

// In-App Notification Model
export type NotificationType = 'task_created' | 'task_updated' | 'task_completed' | 'task_due' | 'task_overdue'

export interface InAppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  taskId?: string | null
  taskTitle?: string | null
  taskRoute?: string | null
  isRead: boolean
  createdAt: string
  readAt?: string | null
}
