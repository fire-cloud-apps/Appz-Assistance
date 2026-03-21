export interface Folder {
  id: string
  parentId: string | null
  level: number
  name: string
  description?: string
  color?: string
  icon?: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}
