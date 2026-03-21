import { Folder } from '../../data/models/Folder'
import { folderRepository } from '../../data/repositories/FolderRepository'
import { createFolderSchema } from './validators'

export class UpdateFolderUseCase {
  async execute(data: {
    id: string
    name?: string
    description?: string
    color?: string
    icon?: string
  }): Promise<Folder> {
    const existingFolder = await folderRepository.getFolderById(data.id)
    if (!existingFolder) {
      throw new Error('Folder not found')
    }
    if (existingFolder.isDeleted) {
      throw new Error('Cannot update a deleted folder')
    }

    const validatedData = createFolderSchema.partial().parse(data)

    const updatedFolder: Folder = {
      ...existingFolder,
      name: validatedData.name ?? existingFolder.name,
      description: validatedData.description ?? existingFolder.description,
      color: validatedData.color ?? existingFolder.color,
      icon: validatedData.icon ?? existingFolder.icon,
      updatedAt: new Date().toISOString(),
    }

    await folderRepository.updateFolder(updatedFolder)
    return updatedFolder
  }
}
