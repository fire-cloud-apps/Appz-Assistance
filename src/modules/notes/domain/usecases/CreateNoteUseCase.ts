import { Note } from '../../data/models/Note'
import { noteRepository } from '../../data/repositories/NoteRepository'
import { folderRepository } from '../../data/repositories/FolderRepository'
import { generateId } from '../../../../core/utils'
import { createNoteSchema } from './validators'

export class CreateNoteUseCase {
  async execute(data: {
    folderId: string
    title: string
    content?: string
    contentHtml?: string
    tags?: string[]
    color?: string
    isPinned?: boolean
    isFavorite?: boolean
    sync?: boolean
    userId?: string
  }): Promise<Note> {
    const validatedData = createNoteSchema.parse(data)

    const folder = await folderRepository.getFolderById(validatedData.folderId)
    if (!folder) {
      throw new Error('Folder not found')
    }
    if (folder.isDeleted) {
      throw new Error('Cannot create note in deleted folder')
    }

    const now = new Date().toISOString()
    const note: Note = {
      id: generateId(),
      folderId: validatedData.folderId,
      title: validatedData.title,
      content: validatedData.content,
      contentHtml: validatedData.contentHtml,
      tags: validatedData.tags,
      color: validatedData.color,
      isPinned: validatedData.isPinned ?? false,
      isFavorite: validatedData.isFavorite ?? false,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      sync: validatedData.sync ?? false,
      userId: validatedData.userId ?? '',
    }

    await noteRepository.createNote(note)
    return note
  }
}
