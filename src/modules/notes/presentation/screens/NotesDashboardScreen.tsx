import { Box, Grid, Stack, Loader, Center, Text, Button, Group } from '@mantine/core'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import { useRootFolders, useRecentNotes, useFavoriteNotes, useDeleteFolder, useDeleteNote } from '../hooks/useNoteQueries'
import { FolderCard } from '../components/FolderCard'
import { NoteListItem } from '../components/NoteListItem'
import { CreateFolderModal, CreateNoteModal, DeleteConfirmationModal } from '../components'
import { useNoteStore } from '../hooks/useNoteStore'
import { useState } from 'react'

export function NotesDashboardScreen() {
  const navigate = useNavigate()
  const { data: folders = [], isLoading: foldersLoading } = useRootFolders()
  const { data: recentNotes = [] } = useRecentNotes(5)
  const { data: favoriteNotes = [] } = useFavoriteNotes()
  const deleteFolder = useDeleteFolder()
  const deleteNote = useDeleteNote()

  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null)
  const [deleteNoteTitle, setDeleteNoteTitle] = useState<string | null>(null)
  const [isDeleteNoteModalOpen, setIsDeleteNoteModalOpen] = useState(false)
  
  const {
    isCreateFolderModalOpen,
    isCreateNoteModalOpen,
    isDeleteFolderModalOpen,
    openCreateFolderModal,
    closeCreateFolderModal,
    closeCreateNoteModal,
    deleteFolderId,
    deleteFolderName,
    openDeleteFolderModal,
    closeDeleteFolderModal,
    selectedFolderId,
    setSelectedFolder,
  } = useNoteStore()

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolder(folderId)
    navigate(`/notes/folder/${folderId}`)
  }

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

  const handleCreateNote = (folderId?: string) => {
    navigate(`/notes/create?folderId=${folderId || ''}`)
  }

  const handleDeleteFolder = () => {
    if (deleteFolderId) {
      deleteFolder.mutate(deleteFolderId)
      closeDeleteFolderModal()
    }
  }

  if (foldersLoading) {
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
          <Text size="xl" fw={700}>Notes</Text>
          <Button
            leftSection={<Icon icon="tabler:plus" width={16} />}
            onClick={() => openCreateFolderModal()}
          >
            New Folder
          </Button>
        </Group>

        <Text size="lg" fw={600}>Folders</Text>
        {folders.length === 0 ? (
          <Box p="xl" style={{ textAlign: 'center', background: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}>
            <Icon icon="tabler:folder" width={48} style={{ opacity: 0.3, marginBottom: 8 }} />
            <Text c="dimmed">No folders yet</Text>
            <Button 
              variant="light" 
              mt="md"
              onClick={() => openCreateFolderModal()}
            >
              Create your first folder
            </Button>
          </Box>
        ) : (
          <Grid>
            {folders.map(folder => (
              <Grid.Col key={folder.id} span={{ base: 12, sm: 6, md: 4 }}>
                <FolderCard
                  folder={folder}
                  onSelect={() => handleFolderSelect(folder.id)}
                  onEdit={() => navigate(`/notes/folder/${folder.id}`)}
                  onDelete={() => openDeleteFolderModal(folder.id, folder.name)}
                  onAddNote={() => handleCreateNote(folder.id)}
                  onAddSubfolder={() => navigate(`/notes/folder/${folder.id}`)}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {favoriteNotes.length > 0 && (
          <>
            <Text size="lg" fw={600} mt="lg">Favorites</Text>
            <Stack gap="sm">
              {favoriteNotes.slice(0, 5).map(note => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  onClick={() => handleNoteSelect(note.id)}
                  onEdit={() => handleNoteEdit(note.id)}
                  onDelete={() => handleNoteDelete(note.id, note.title)}
                />
              ))}
            </Stack>
          </>
        )}

        {recentNotes.length > 0 && (
          <>
            <Text size="lg" fw={600} mt="lg">Recent</Text>
            <Stack gap="sm">
              {recentNotes.slice(0, 5).map(note => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  onClick={() => handleNoteSelect(note.id)}
                  onEdit={() => handleNoteEdit(note.id)}
                  onDelete={() => handleNoteDelete(note.id, note.title)}
                />
              ))}
            </Stack>
          </>
        )}
      </Stack>

      <CreateFolderModal
        opened={isCreateFolderModalOpen}
        onClose={closeCreateFolderModal}
        level={1}
      />

      <CreateNoteModal
        opened={isCreateNoteModalOpen}
        onClose={closeCreateNoteModal}
        folderId={selectedFolderId || ''}
      />

      <DeleteConfirmationModal
        opened={isDeleteFolderModalOpen}
        onClose={closeDeleteFolderModal}
        onConfirm={handleDeleteFolder}
        title="Delete Folder"
        description={`Are you sure you want to delete "${deleteFolderName}"? All notes in this folder will also be moved to trash.`}
      />

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
