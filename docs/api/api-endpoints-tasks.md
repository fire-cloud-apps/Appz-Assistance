# Task Manager Module API Endpoints

This document outlines the API endpoints for the Task Manager module, based on the `Task` and `RecurrencePattern` models.

## Task Endpoints

### Task Model

```typescript
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
}

export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
```

### Endpoints

-   **GET /api/tasks**: Get all tasks.
    -   Response: `Task[]`
-   **GET /api/tasks/{id}**: Get a specific task by ID.
    -   Parameters: `id` (string) - The ID of the task.
    -   Response: `Task`
-   **POST /api/tasks**: Create a new task.
    -   Request Body: `Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'isArchived' | 'archivedAt' | 'completedAt'>`
    -   Response: `Task`
-   **PUT /api/tasks/{id}**: Update an existing task.
    -   Parameters: `id` (string) - The ID of the task to update.
    -   Request Body: `Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>`
    -   Response: `Task`
-   **DELETE /api/tasks/{id}**: Delete a task (soft delete).
    -   Parameters: `id` (string) - The ID of the task to delete.
    -   Response: `{ message: string }`
-   **POST /api/tasks/{id}/complete**: Mark a task as completed.
    -   Parameters: `id` (string) - The ID of the task to complete.
    -   Response: `Task`
-   **POST /api/tasks/{id}/archive**: Archive a task.
    -   Parameters: `id` (string) - The ID of the task to archive.
    -   Response: `Task`
-   **POST /api/tasks/{id}/unarchive**: Unarchive a task.
    -   Parameters: `id` (string) - The ID of the task to unarchive.
    -   Response: `Task`

## Recurrence Pattern Model

```typescript
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type RecurrenceWeeklyDay =
  | 'sun'
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat';

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 weeks, every 3 months
  weeklyDays?: RecurrenceWeeklyDay[]; // For weekly recurrence, which days
  monthlyDay?: number; // For monthly recurrence, which day of month (1-31)
  count?: number; // Number of occurrences (optional, if not set, recurs until end date)
}
