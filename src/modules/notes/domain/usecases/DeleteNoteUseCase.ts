import { noteRepository } from '../../data/repositories/NoteRepository'

export class DeleteNoteUseCase {
  async execute(id: string): Promise<void> {
    const note = await noteRepository.getNoteById(id)
    if (!note) {
      throw new Error('Note not found')
    }
    if (note.isDeleted) {
      throw new Error('Note is already deleted')
    }

    await noteRepository.deleteNote(id)
  }
}
