import Dexie, { Table } from 'dexie'
import { Folder } from '../models/Folder'
import { Note } from '../models/Note'

export class NotesDatabase extends Dexie {
  folders!: Table<Folder>
  notes!: Table<Note>

  constructor() {
    super('notesDB')

    this.version(1).stores({
      folders: `
        id,
        parentId,
        level,
        name,
        createdAt,
        updatedAt,
        isDeleted
      `,
      notes: `
        id,
        folderId,
        title,
        isPinned,
        isFavorite,
        createdAt,
        updatedAt,
        lastViewedAt,
        isDeleted
      `
    })
  }
}

export const notesDb = new NotesDatabase()
