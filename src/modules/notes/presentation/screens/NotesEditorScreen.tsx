import { useState, useEffect, useCallback } from 'react'
import { Box, Stack, Loader, Center, Text, Button, Group, TextInput, Switch, TagsInput, ActionIcon, Tooltip } from '@mantine/core'
import { IconArrowLeft, IconDeviceFloppy, IconPin, IconStar } from '@tabler/icons-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useNoteById, useUpdateNote, useCreateNote, useFolderById } from '../hooks/useNoteQueries'
import { Note } from '../../data/models/Note'
import { NoteEditor } from '../components/NoteEditor'
import dayjs from 'dayjs'

export function NotesEditorScreen() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const folderIdParam = searchParams.get('folderId')
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [contentHtml, setContentHtml] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isPinned, setIsPinned] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const isCreating = !id
  const { data: existingNote, isLoading: noteLoading } = useNoteById(id || '')
  const { data: folder } = useFolderById(existingNote?.folderId || folderIdParam || '')
  const updateNote = useUpdateNote()
  const createNote = useCreateNote()

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title)
      setContent(existingNote.content)
      setContentHtml(existingNote.contentHtml || existingNote.content || '')
      setTags(existingNote.tags || [])
      setIsPinned(existingNote.isPinned)
      setIsFavorite(existingNote.isFavorite)
      setLastSaved(new Date(existingNote.updatedAt))
    }
  }, [existingNote])

  const handleSave = useCallback(async () => {
    if (!title.trim()) return

    try {
      if (isCreating && folderIdParam) {
        const now = new Date().toISOString()
        const newNote: Note = {
          id: crypto.randomUUID(),
          folderId: folderIdParam,
          title,
          content,
          contentHtml,
          tags,
          isPinned,
          isFavorite,
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
        }
        await createNote.mutateAsync(newNote)
        navigate(`/notes/editor/${newNote.id}`)
      } else if (id) {
        await updateNote.mutateAsync({
          ...existingNote!,
          title,
          content,
          contentHtml,
          tags,
          isPinned,
          isFavorite,
          updatedAt: new Date().toISOString(),
        })
      }
      setIsDirty(false)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }, [title, content, contentHtml, tags, isPinned, isFavorite, isCreating, folderIdParam, id, existingNote, navigate, createNote, updateNote])

  const handleContentChange = (text: string, html: string) => {
    setContent(text)
    setContentHtml(html)
    setIsDirty(true)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setIsDirty(true)
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length

  if (!isCreating && noteLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <Stack gap="md" pt="sm">
        <Group justify="space-between" align="center">
          <Group>
            <Button 
              variant="subtle" 
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            {folder && (
              <Text size="sm" c="dimmed">
                {folder.name}
              </Text>
            )}
          </Group>
          <Group>
            <Text size="xs" c={isDirty ? 'orange' : 'dimmed'}>
              {isDirty ? 'Unsaved changes' : lastSaved ? `Saved ${dayjs(lastSaved).fromNow()}` : 'No changes'}
            </Text>
            <Tooltip label="Save">
              <ActionIcon 
                variant="filled" 
                color="blue"
                onClick={handleSave}
                disabled={!title.trim() || createNote.isPending || updateNote.isPending}
              >
                <IconDeviceFloppy size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <TextInput
          placeholder="Note title"
          value={title}
          onChange={handleTitleChange}
          size="xl"
          variant="unstyled"
          styles={{
            input: { fontWeight: 600, fontSize: '1.5rem' }
          }}
        />

        <Group gap="md" align="center">
          <TagsInput
            placeholder="Add tags"
            value={tags}
            onChange={(value) => {
              setTags(value)
              setIsDirty(true)
            }}
            maxTags={10}
            style={{ flex: 1 }}
          />
          <Group gap="xs">
            <IconPin size={16} style={{ opacity: isPinned ? 1 : 0.3 }} />
            <Switch
              label="Pin"
              checked={isPinned}
              onChange={(e) => {
                setIsPinned(e.currentTarget.checked)
                setIsDirty(true)
              }}
            />
          </Group>
          <Group gap="xs">
            <IconStar size={16} style={{ opacity: isFavorite ? 1 : 0.3 }} />
            <Switch
              label="Favorite"
              checked={isFavorite}
              onChange={(e) => {
                setIsFavorite(e.currentTarget.checked)
                setIsDirty(true)
              }}
            />
          </Group>
        </Group>

        <Box>
          <NoteEditor
            content={contentHtml || content}
            onChange={handleContentChange}
            placeholder="Start writing your note..."
          />
        </Box>

        <Group justify="space-between">
          <Text size="xs" c="dimmed">{wordCount} words</Text>
        </Group>
      </Stack>
    </Box>
  )
}
