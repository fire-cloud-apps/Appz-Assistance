import { Note } from '../../data/models/Note'
import { noteRepository } from '../../data/repositories/NoteRepository'
import { createNoteSchema } from './validators'

export class UpdateNoteUseCase {
  async execute(data: {
    id: string
    folderId?: string
    title?: string
    content?: string
    contentHtml?: string
    tags?: string[]
    color?: string
    isPinned?: boolean
    isFavorite?: boolean
  }): Promise<Note> {
    const existingNote = await noteRepository.getNoteById(data.id)
    if (!existingNote) {
      throw new Error('Note not found')
    }
    if (existingNote.isDeleted) {
      throw new Error('Cannot update a deleted note')
    }

    const validatedData = createNoteSchema.partial().parse(data)

    const updatedNote: Note = {
      ...existingNote,
      folderId: validatedData.folderId ?? existingNote.folderId,
      title: validatedData.title ?? existingNote.title,
      content: validatedData.content ?? existingNote.content,
      contentHtml: validatedData.contentHtml ?? existingNote.contentHtml,
      tags: validatedData.tags ?? existingNote.tags,
      color: validatedData.color ?? existingNote.color,
      isPinned: validatedData.isPinned ?? existingNote.isPinned,
      isFavorite: validatedData.isFavorite ?? existingNote.isFavorite,
      updatedAt: new Date().toISOString(),
    }

    await noteRepository.updateNote(updatedNote)
    return updatedNote
  }
}
