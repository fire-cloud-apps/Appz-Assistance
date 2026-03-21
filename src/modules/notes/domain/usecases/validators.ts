import { z } from 'zod'

export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(100, 'Folder name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  parentId: z
    .string()
    .nullable()
    .optional(),
  level: z
    .number()
    .min(1)
    .max(2, 'Folder level cannot exceed 2'),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export const updateFolderSchema = createFolderSchema.extend({
  id: z.string(),
}).partial()

export const createNoteSchema = z.object({
  folderId: z.string().min(1, 'Folder is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .max(50000, 'Content must be less than 50000 characters')
    .optional()
    .default(''),
  contentHtml: z.string().optional(),
  tags: z
    .array(
      z.string().max(30, 'Tag must be less than 30 characters')
    )
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  color: z.string().optional(),
  isPinned: z.boolean().optional().default(false),
  isFavorite: z.boolean().optional().default(false),
})

export const updateNoteSchema = createNoteSchema.extend({
  id: z.string(),
}).partial()
