import { Note } from '../models/Note'
import { notesDb } from '../datasources/notesDatabase'

export class NoteRepository {
  private sortNotes(notes: Note[]): Note[] {
    return [...notes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }

  async createNote(note: Note): Promise<string> {
    return notesDb.notes.add(note)
  }

  async updateNote(note: Note): Promise<void> {
    note.updatedAt = new Date().toISOString()
    await notesDb.notes.put(note)
  }

  async deleteNote(id: string): Promise<void> {
    const note = await notesDb.notes.get(id)
    if (note) {
      note.isDeleted = true
      note.updatedAt = new Date().toISOString()
      await notesDb.notes.put(note)
    }
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    return notesDb.notes.get(id)
  }

  async getNotesByFolder(folderId: string): Promise<Note[]> {
    const allNotes = await notesDb.notes.toArray()
    const filteredNotes = allNotes.filter(n => n.folderId === folderId && !n.isDeleted)
    return this.sortNotes(filteredNotes)
  }

  async getPinnedNotes(): Promise<Note[]> {
    const allNotes = await notesDb.notes.toArray()
    const pinnedNotes = allNotes.filter(n => n.isPinned && !n.isDeleted)
    return this.sortNotes(pinnedNotes)
  }

  async getFavoriteNotes(): Promise<Note[]> {
    const allNotes = await notesDb.notes.toArray()
    const favoriteNotes = allNotes.filter(n => n.isFavorite && !n.isDeleted)
    return this.sortNotes(favoriteNotes)
  }

  async getRecentNotes(limit: number = 10): Promise<Note[]> {
    const allNotes = await notesDb.notes.toArray()
    const activeNotes = allNotes.filter(n => !n.isDeleted)
    const sorted = this.sortNotes(activeNotes)
    return sorted.slice(0, limit)
  }

  async searchNotes(searchTerm: string): Promise<Note[]> {
    const allNotes = await notesDb.notes.toArray()
    const normalizedTerm = searchTerm.toLowerCase().trim()
    return allNotes.filter(note =>
      !note.isDeleted &&
      (
        note.title.toLowerCase().includes(normalizedTerm) ||
        note.content.toLowerCase().includes(normalizedTerm) ||
        note.tags?.some(tag => tag.toLowerCase().includes(normalizedTerm))
      )
    )
  }

  async restoreNote(id: string): Promise<void> {
    const note = await notesDb.notes.get(id)
    if (note) {
      note.isDeleted = false
      note.updatedAt = new Date().toISOString()
      await notesDb.notes.put(note)
    }
  }

  async permanentlyDeleteNote(id: string): Promise<void> {
    await notesDb.notes.delete(id)
  }

  async getDeletedNotes(): Promise<Note[]> {
    const allNotes = await notesDb.notes.toArray()
    return allNotes.filter(n => n.isDeleted)
  }

  async getNotesByFolderIncludingDeleted(folderId: string): Promise<Note[]> {
    const allNotes = await notesDb.notes.toArray()
    return allNotes.filter(n => n.folderId === folderId)
  }

  async getNoteCountByFolder(folderId: string): Promise<number> {
    const allNotes = await notesDb.notes.toArray()
    return allNotes.filter(n => n.folderId === folderId && !n.isDeleted).length
  }
}

export const noteRepository = new NoteRepository()
