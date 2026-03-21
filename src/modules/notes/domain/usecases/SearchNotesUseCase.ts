import { Note } from '../../data/models/Note'
import { noteRepository } from '../../data/repositories/NoteRepository'

export class SearchNotesUseCase {
  async execute(searchTerm: string): Promise<Note[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return []
    }
    return noteRepository.searchNotes(searchTerm)
  }
}
