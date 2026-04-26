import Dexie, { Table } from 'dexie'
import { Folder } from '../models/Folder'
import { Note } from '../models/Note'

export class NotesDatabase extends Dexie {
  folders!: Table<Folder>
  notes!: Table<Note>

  constructor() {
    super('notes-db')

    this.version(2).stores({
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
        isDeleted,
        sync,
        userId
      `
    }).upgrade(tx => {
      return tx.table('notes').toCollection().modify(note => {
        if (note.sync === undefined) note.sync = false
        if (note.userId === undefined) note.userId = ''
      })
    })
  }
}

export const notesDb = new NotesDatabase()
