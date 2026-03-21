import { Folder } from '../models/Folder'
import { notesDb } from '../datasources/notesDatabase'

export class FolderRepository {
  async createFolder(folder: Folder): Promise<string> {
    return notesDb.folders.add(folder)
  }

  async updateFolder(folder: Folder): Promise<void> {
    folder.updatedAt = new Date().toISOString()
    await notesDb.folders.put(folder)
  }

  async deleteFolder(id: string): Promise<void> {
    const folder = await notesDb.folders.get(id)
    if (folder) {
      folder.isDeleted = true
      folder.updatedAt = new Date().toISOString()
      await notesDb.folders.put(folder)
    }
  }

  async getFolderById(id: string): Promise<Folder | undefined> {
    return notesDb.folders.get(id)
  }

  async getRootFolders(): Promise<Folder[]> {
    const allFolders = await notesDb.folders.toArray()
    return allFolders.filter(f => f.parentId === null && !f.isDeleted)
  }

  async getSubFolders(parentId: string): Promise<Folder[]> {
    const allFolders = await notesDb.folders.toArray()
    return allFolders.filter(f => f.parentId === parentId && !f.isDeleted)
  }

  async getAllFolders(): Promise<Folder[]> {
    return notesDb.folders.toArray()
  }

  async restoreFolder(id: string): Promise<void> {
    const folder = await notesDb.folders.get(id)
    if (folder) {
      folder.isDeleted = false
      folder.updatedAt = new Date().toISOString()
      await notesDb.folders.put(folder)
    }
  }

  async permanentlyDeleteFolder(id: string): Promise<void> {
    await notesDb.folders.delete(id)
  }
}

export const folderRepository = new FolderRepository()
