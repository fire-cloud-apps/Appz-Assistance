import Dexie, { Table } from 'dexie'
import { InAppNotification } from './models/InAppNotification'
import { BreakSettings } from '../../modules/break_timer/data/models/BreakSettings'

export class AppDatabase extends Dexie {
  inAppNotifications!: Table<InAppNotification>
  breakSettings!: Table<BreakSettings>

  constructor() {
    super('appz-db')

    // Version 1: Initial schema (for any legacy data migrations)
    this.version(1).stores({})

    // Version 2: Add in-app notifications table
    this.version(2).stores({
      inAppNotifications: `
        id,
        type,
        taskId,
        isRead,
        createdAt
      `
    })

    // Version 3: Add breakSettings table
    this.version(3).stores({
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

    // Version 4: Reserved for future schema changes
  }
}

export const db = new AppDatabase()