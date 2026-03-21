import { Folder } from '../../data/models/Folder'
import { folderRepository } from '../../data/repositories/FolderRepository'
import { generateId } from '../../../../core/utils'
import { createFolderSchema } from './validators'

export class CreateFolderUseCase {
  async execute(data: {
    name: string
    description?: string
    parentId?: string | null
    level: number
    color?: string
    icon?: string
  }): Promise<Folder> {
    const validatedData = createFolderSchema.parse(data)

    if (validatedData.level > 2) {
      throw new Error('Folder level cannot exceed 2')
    }

    if (validatedData.level === 2 && !validatedData.parentId) {
      throw new Error('Sub folders require a parent folder')
    }

    const now = new Date().toISOString()
    const folder: Folder = {
      id: generateId(),
      parentId: validatedData.parentId ?? null,
      level: validatedData.level,
      name: validatedData.name,
      description: validatedData.description,
      color: validatedData.color,
      icon: validatedData.icon,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    }

    await folderRepository.createFolder(folder)
    return folder
  }
}
