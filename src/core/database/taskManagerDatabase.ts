import Dexie, { Table } from 'dexie'
import { Task } from '../../modules/task_manager/data/models'
import { TaskActivity } from './taskActivity'

export class TaskManagerDatabase extends Dexie {
  tasks!: Table<Task>
  taskActivities!: Table<TaskActivity>

  constructor() {
    super('task-manager-db')

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
      `
    })

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
        recurrenceEndDate,
        recurrencePattern
      `,
      taskActivities: `
        id,
        taskId,
        createdAt
      `
    })

    this.version(5).stores({
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
      `
    })
  }
}

export const taskManagerDb = new TaskManagerDatabase()