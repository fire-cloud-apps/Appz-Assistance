import { useState, useEffect, useCallback } from 'react'
import { Box, Stack, Loader, Center, Text, Button, Group, TextInput, Switch, TagsInput, ActionIcon, Tooltip } from '@mantine/core'
import { Icon } from '@iconify/react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useNoteById, useUpdateNote, useCreateNote, useFolderById } from '../hooks/useNoteQueries'
import { Note } from '../../data/models/Note'
import { NoteEditor } from '../components/NoteEditor'
import { useDebouncedAutosave } from '../hooks/useDebouncedAutosave'
import dayjs from 'dayjs'

interface NoteData {
  title: string
  content: string
  contentHtml: string
  tags: string[]
  isPinned: boolean
  isFavorite: boolean
}

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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

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
      setInitialLoadComplete(true)
    } else if (isCreating) {
      setInitialLoadComplete(true)
    }
  }, [existingNote, isCreating])

  const noteData: NoteData = {
    title,
    content,
    contentHtml,
    tags,
    isPinned,
    isFavorite,
  }

  const saveNote = useCallback(async (data: NoteData) => {
    if (!data.title.trim()) return

    try {
      if (isCreating && folderIdParam) {
        const now = new Date().toISOString()
        const newNote: Note = {
          id: crypto.randomUUID(),
          folderId: folderIdParam,
          title: data.title,
          content: data.content,
          contentHtml: data.contentHtml,
          tags: data.tags,
          isPinned: data.isPinned,
          isFavorite: data.isFavorite,
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
        }
        await createNote.mutateAsync(newNote)
        navigate(`/notes/editor/${newNote.id}`)
      } else if (id && existingNote) {
        await updateNote.mutateAsync({
          ...existingNote,
          title: data.title,
          content: data.content,
          contentHtml: data.contentHtml,
          tags: data.tags,
          isPinned: data.isPinned,
          isFavorite: data.isFavorite,
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }, [isCreating, folderIdParam, id, existingNote, navigate, createNote, updateNote])

  const { isSaving, hasChanges, lastSaved, saveNow } = useDebouncedAutosave({
    data: noteData,
    onSave: saveNote,
    delay: 2000,
    enabled: initialLoadComplete && !isCreating,
  })

  const handleManualSave = useCallback(async () => {
    if (!title.trim()) return
    await saveNow()
  }, [title, saveNow])

  const handleContentChange = (text: string, html: string) => {
    setContent(text)
    setContentHtml(html)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length

  if (!isCreating && noteLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  const getStatusText = () => {
    if (isSaving) return 'Saving...'
    if (hasChanges) return 'Typing...'
    if (lastSaved) return `Saved ${dayjs(lastSaved).fromNow()}`
    if (isCreating) return 'New note'
    return 'No changes'
  }

  const getStatusColor = () => {
    if (isSaving) return 'blue'
    if (hasChanges) return 'orange'
    return 'dimmed'
  }

  return (
    <Box style={{ position: 'relative', minHeight: '100vh', maxHeight: '100vh', overflow: 'auto' }}>
      <Stack gap="md" pt="sm" pb="lg">
        <Group justify="space-between" align="center">
          <Group>
            <Button
              variant="subtle"
              leftSection={<Icon icon="tabler:arrow-left" width={16} />}
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
            <Text size="xs" c={getStatusColor()}>
              {getStatusText()}
            </Text>
            <Tooltip label={isSaving ? 'Saving...' : 'Save now'}>
              <ActionIcon
                variant="filled"
                color="blue"
                onClick={handleManualSave}
                disabled={!title.trim() || isSaving || createNote.isPending || updateNote.isPending}
                loading={isSaving}
              >
                {isSaving ? <Icon icon="tabler:check" width={18} /> : <Icon icon="tabler:device-floppy" width={18} />}
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
            onChange={setTags}
            maxTags={10}
            style={{ flex: 1 }}
          />
          <Group gap="xs">
            <Icon icon="tabler:pin" width={16} style={{ opacity: isPinned ? 1 : 0.3 }} />
            <Switch
              label="Pin"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.currentTarget.checked)}
            />
          </Group>
          <Group gap="xs">
            <Icon icon="tabler:star" width={16} style={{ opacity: isFavorite ? 1 : 0.3 }} />
            <Switch
              label="Favorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.currentTarget.checked)}
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