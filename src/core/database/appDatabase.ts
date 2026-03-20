import Dexie, { Table } from 'dexie'
import { Task } from './models'
import { TaskActivity } from './taskActivity'

export class AppDatabase extends Dexie {
  tasks!: Table<Task>
  taskActivities!: Table<TaskActivity>

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
  }
}

export const db = new AppDatabase()
