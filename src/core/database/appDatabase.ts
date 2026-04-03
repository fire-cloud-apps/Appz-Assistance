import Dexie, { Table } from 'dexie'
import { Task } from '../../modules/task_manager/data/models'
import { InAppNotification } from './models/InAppNotification'
import { TaskActivity } from './taskActivity'
import { BreakSettings } from '../../modules/break_timer/data/models/BreakSettings' // New import

export class AppDatabase extends Dexie {
  tasks!: Table<Task>
  taskActivities!: Table<TaskActivity>
  inAppNotifications!: Table<InAppNotification>
  breakSettings!: Table<BreakSettings> // New table declaration

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

    // Version 5: Add recurrencePattern field for proper storage of recurring tasks
    this.version(5).stores({
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
        recurrenceEndDate,
        recurrencePattern
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

    // Version 6: Add breakSettings table
    this.version(6).stores({
      breakSettings: `
        id,
        createdAt,
        updatedAt
      `
    })

    // Version 7: Add dueTime field to tasks
    this.version(7).stores({
      tasks: `
        id,
        parentTaskId,
        taskLevel,
        status,
        priority,
        dueDate,
        dueTime,
        createdAt,
        updatedAt,
        isDeleted,
        isArchived,
        archivedAt,
        completedAt,
        isRecurring,
        parentRecurrenceId,
        recurrenceInstanceId,
        recurrenceEndDate,
        recurrencePattern
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
      `,
      breakSettings: `
        id,
        createdAt,
        updatedAt
      `
    })
  }
}

export const db = new AppDatabase()