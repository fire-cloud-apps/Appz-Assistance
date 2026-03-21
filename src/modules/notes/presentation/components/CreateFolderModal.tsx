import { useEffect, useState } from 'react'
import { Modal, TextInput, Textarea, Button, Stack, Group, ColorInput } from '@mantine/core'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Folder } from '../../data/models/Folder'
import { useFolderById, useCreateFolder, useUpdateFolder } from '../hooks/useNoteQueries'

const folderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100, 'Max 100 characters'),
  description: z.string().max(500, 'Max 500 characters').optional(),
})

type FolderFormData = z.infer<typeof folderSchema>

interface CreateFolderModalProps {
  opened: boolean
  onClose: () => void
  parentId?: string | null
  level?: number
  folderId?: string | null
}

export function CreateFolderModal({ 
  opened, 
  onClose, 
  parentId = null, 
  level = 1,
  folderId = null
}: CreateFolderModalProps) {
  const isEditing = !!folderId
  const { data: existingFolder } = useFolderById(folderId || '')
  const createFolder = useCreateFolder()
  const updateFolder = useUpdateFolder()
  const [color, setColor] = useState<string | undefined>(undefined)

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  })

  useEffect(() => {
    if (isEditing && existingFolder) {
      setValue('name', existingFolder.name)
      setValue('description', existingFolder.description || '')
      setColor(existingFolder.color)
    } else {
      reset()
      setColor(undefined)
    }
  }, [isEditing, existingFolder, opened, reset, setValue])

  const onSubmit = async (data: FolderFormData) => {
    try {
      if (isEditing && existingFolder) {
        await updateFolder.mutateAsync({
          ...existingFolder,
          name: data.name,
          description: data.description,
          color,
        })
      } else {
        const now = new Date().toISOString()
        const newFolder: Folder = {
          id: crypto.randomUUID(),
          parentId,
          level,
          name: data.name,
          description: data.description,
          color,
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
        }
        await createFolder.mutateAsync(newFolder)
      }
      reset()
      setColor(undefined)
      onClose()
    } catch (error) {
      console.error('Failed to save folder:', error)
    }
  }

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={isEditing ? 'Edit Folder' : 'Create Folder'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Folder Name"
            placeholder="Enter folder name"
            {...register('name')}
            error={errors.name?.message}
          />
          <Textarea
            label="Description"
            placeholder="Enter description (optional)"
            {...register('description')}
            error={errors.description?.message}
            rows={3}
          />
          <ColorInput
            label="Color"
            placeholder="Select color"
            value={color}
            onChange={setColor}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createFolder.isPending || updateFolder.isPending}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
