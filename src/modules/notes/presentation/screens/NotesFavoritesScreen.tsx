import { Box, Stack, Loader, Center, Text } from '@mantine/core'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import { useFavoriteNotes, useDeleteNote } from '../hooks/useNoteQueries'
import { NoteListItem } from '../components/NoteListItem'
import { DeleteConfirmationModal } from '../components'
import { useState } from 'react'

export function NotesFavoritesScreen() {
  const navigate = useNavigate()
  const { data: favoriteNotes = [], isLoading } = useFavoriteNotes()
  const deleteNote = useDeleteNote()

  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null)
  const [deleteNoteTitle, setDeleteNoteTitle] = useState<string | null>(null)
  const [isDeleteNoteModalOpen, setIsDeleteNoteModalOpen] = useState(false)

  const handleNoteSelect = (noteId: string) => {
    navigate(`/notes/editor/${noteId}`)
  }

  const handleNoteEdit = (noteId: string) => {
    navigate(`/notes/editor/${noteId}`)
  }

  const handleNoteDelete = (noteId: string, noteTitle: string) => {
    setDeleteNoteId(noteId)
    setDeleteNoteTitle(noteTitle)
    setIsDeleteNoteModalOpen(true)
  }

  const confirmDeleteNote = () => {
    if (deleteNoteId) {
      deleteNote.mutate(deleteNoteId, {
        onSuccess: () => {
          setIsDeleteNoteModalOpen(false)
          setDeleteNoteId(null)
          setDeleteNoteTitle(null)
        }
      })
    }
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <Stack gap="md" pt="sm">
        <Text size="xl" fw={700}>Favorites</Text>
        
        {favoriteNotes.length === 0 ? (
          <Box p="xl" style={{ textAlign: 'center', background: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}>
            <Icon icon="tabler:star" width={48} style={{ opacity: 0.3, marginBottom: 8 }} />
            <Text c="dimmed">No favorite notes yet</Text>
          </Box>
        ) : (
          <Stack gap="sm">
            {favoriteNotes.map(note => (
              <NoteListItem
                key={note.id}
                note={note}
                onClick={() => handleNoteSelect(note.id)}
                onEdit={() => handleNoteEdit(note.id)}
                onDelete={() => handleNoteDelete(note.id, note.title)}
              />
            ))}
          </Stack>
        )}
      </Stack>

      <DeleteConfirmationModal
        opened={isDeleteNoteModalOpen}
        onClose={() => setIsDeleteNoteModalOpen(false)}
        onConfirm={confirmDeleteNote}
        title="Delete Note"
        description={`Are you sure you want to delete "${deleteNoteTitle}"?`}
      />
    </Box>
  )
}
