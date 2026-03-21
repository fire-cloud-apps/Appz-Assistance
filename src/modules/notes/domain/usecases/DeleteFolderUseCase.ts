import { folderRepository } from '../../data/repositories/FolderRepository'
import { noteRepository } from '../../data/repositories/NoteRepository'

export class DeleteFolderUseCase {
  async execute(id: string): Promise<void> {
    const folder = await folderRepository.getFolderById(id)
    if (!folder) {
      throw new Error('Folder not found')
    }
    if (folder.isDeleted) {
      throw new Error('Folder is already deleted')
    }

    await folderRepository.deleteFolder(id)

    const subFolders = await folderRepository.getSubFolders(id)
    for (const subFolder of subFolders) {
      await folderRepository.deleteFolder(subFolder.id)
    }

    const notes = await noteRepository.getNotesByFolderIncludingDeleted(id)
    for (const note of notes) {
      if (!note.isDeleted) {
        await noteRepository.deleteNote(note.id)
      }
    }
  }
}
