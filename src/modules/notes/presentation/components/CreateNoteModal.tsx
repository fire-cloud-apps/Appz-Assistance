import { useEffect, useState } from 'react'
import { Modal, TextInput, Textarea, TagsInput, Button, Stack, Group, Switch, ColorInput } from '@mantine/core'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Note } from '../../data/models/Note'
import { useCreateNote, useUpdateNote } from '../hooks/useNoteQueries'

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
  content: z.string().max(50000, 'Max 50000 characters').optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  isPinned: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
})

type NoteFormData = z.infer<typeof noteSchema>

interface CreateNoteModalProps {
  opened: boolean
  onClose: () => void
  folderId: string
  noteId?: string | null
}

export function CreateNoteModal({ 
  opened, 
  onClose, 
  folderId,
  noteId = null 
}: CreateNoteModalProps) {
  const isEditing = !!noteId
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const [color, setColor] = useState<string | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
      isPinned: false,
      isFavorite: false,
    }
  })

  useEffect(() => {
    if (opened) {
      reset()
      setColor(undefined)
      setTags([])
    }
  }, [opened, reset])

  const onSubmit = async (data: NoteFormData) => {
    try {
      if (isEditing) {
        await updateNote.mutateAsync({
          id: noteId,
          folderId,
          title: data.title,
          content: data.content || '',
          tags,
          color,
          isPinned: data.isPinned || false,
          isFavorite: data.isFavorite || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false,
        } as Note)
      } else {
        const now = new Date().toISOString()
        const newNote: Note = {
          id: crypto.randomUUID(),
          folderId,
          title: data.title,
          content: data.content || '',
          tags,
          color,
          isPinned: data.isPinned || false,
          isFavorite: data.isFavorite || false,
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
        }
        await createNote.mutateAsync(newNote)
      }
      reset()
      setColor(undefined)
      setTags([])
      onClose()
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={isEditing ? 'Edit Note' : 'Create Note'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Enter note title"
            {...register('title')}
            error={errors.title?.message}
          />
          <Textarea
            label="Content"
            placeholder="Enter note content (optional)"
            {...register('content')}
            error={errors.content?.message}
            rows={5}
          />
          <TagsInput
            label="Tags"
            placeholder="Add tags (press Enter)"
            value={tags}
            onChange={setTags}
            maxTags={10}
          />
          <ColorInput
            label="Color"
            placeholder="Select color (optional)"
            value={color}
            onChange={setColor}
          />
          <Group grow>
            <Switch
              label="Pin to top"
              {...register('isPinned')}
              onChange={(e) => setValue('isPinned', e.currentTarget.checked)}
            />
            <Switch
              label="Favorite"
              {...register('isFavorite')}
              onChange={(e) => setValue('isFavorite', e.currentTarget.checked)}
            />
          </Group>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createNote.isPending || updateNote.isPending}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
