import Dexie, { Table } from 'dexie'
import { Task } from '../../modules/task_manager/data/models'
import { InAppNotification } from './models/InAppNotification'
import { TaskActivity } from './taskActivity'

export class AppDatabase extends Dexie {
  tasks!: Table<Task>
  taskActivities!: Table<TaskActivity>
  inAppNotifications!: Table<InAppNotification>

  constructor() {
    super('appzDB')

    this.version(1).stores({
      tasks: `
        id,
        parentTaskId,
        taskLevel,
        status,
        priority,
        dueDate,
        createdAt,
        updatedAt,
        isDeleted,
        isArchived,
        archivedAt
      `,
      taskActivities: `
        id,
        taskId,
        createdAt
      `
    })

    // Version 2: Add recurrence fields
    this.version(2).stores({
      tasks: `
        id,
        parentTaskId,
        taskLevel,
        status,
        priority,
        dueDate,
        createdAt,
        updatedAt,
        isDeleted,
        isArchived,
        archivedAt,
        isRecurring,
        parentRecurrenceId,
        recurrenceInstanceId,
        recurrenceEndDate
      `,
      taskActivities: `
        id,
        taskId,
        createdAt
      `
    })

    // Version 3: Add in-app notifications table
    this.version(3).stores({
      tasks: `
        id,
        parentTaskId,
        taskLevel,
        status,
        priority,
        dueDate,
        createdAt,
        updatedAt,
        isDeleted,
        isArchived,
        archivedAt,
        completedAt,
        isRecurring,
        parentRecurrenceId,
        recurrenceInstanceId,
        recurrenceEndDate
      `,
      taskActivities: `
        id,
        taskId,
        createdAt
      `,
      inAppNotifications: `
        id,
        type,
        taskId,
        isRead,
        createdAt
      `
    })

    // Version 4: Add completedAt field for completed task retention
    this.version(4).stores({
      tasks: `
        id,
        parentTaskId,
        taskLevel,
        status,
        priority,
        dueDate,
        createdAt,
        updatedAt,
        isDeleted,
        isArchived,
        archivedAt,
        completedAt,
        isRecurring,
        parentRecurrenceId,
        recurrenceInstanceId,
        recurrenceEndDate
      `,
      taskActivities: `
        id,
        taskId,
        createdAt
      `,
      inAppNotifications: `
        id,
        type,
        taskId,
        isRead,
        createdAt
      `
    })
  }
}

export const db = new AppDatabase()
