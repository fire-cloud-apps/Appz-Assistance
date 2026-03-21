export interface Note {
  id: string
  folderId: string
  title: string
  content: string
  contentHtml?: string
  tags?: string[]
  color?: string
  isPinned: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  lastViewedAt?: string
  isDeleted: boolean
}
