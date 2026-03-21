import { Box, Stack, Loader, Center, Text, Button, Group, Breadcrumbs, Anchor } from '@mantine/core'
import { IconPlus, IconArrowLeft } from '@tabler/icons-react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useFolderById, useSubFolders, useNotesByFolder, useDeleteFolder, useDeleteNote, useRootFolders } from '../hooks/useNoteQueries'
import { FolderCard } from '../components/FolderCard'
import { NoteListItem } from '../components/NoteListItem'
import { CreateFolderModal, CreateNoteModal, DeleteConfirmationModal } from '../components'
import { useNoteStore } from '../hooks/useNoteStore'
import { useState } from 'react'

export function NotesFolderViewScreen() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  const { data: folder, isLoading: folderLoading } = useFolderById(id || '')
  const { data: subFolders = [], isLoading: subFoldersLoading } = useSubFolders(id || '')
  const { data: notes = [], isLoading: notesLoading } = useNotesByFolder(id || '')
  const { data: rootFolders = [] } = useRootFolders()
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
    openCreateNoteModal,
    closeCreateNoteModal,
    deleteFolderId,
    deleteFolderName,
    openDeleteFolderModal,
    closeDeleteFolderModal,
  } = useNoteStore()

  const isLoading = folderLoading || subFoldersLoading || notesLoading

  const handleFolderSelect = (folderId: string) => {
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

  const handleDeleteFolder = () => {
    if (deleteFolderId) {
      deleteFolder.mutate(deleteFolderId, {
        onSuccess: () => {
          closeDeleteFolderModal()
          navigate('/notes')
        }
      })
    }
  }

  const parentFolder = folder?.parentId 
    ? rootFolders.find(f => f.id === folder.parentId)
    : null

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  if (!folder) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Text size="xl">Folder not found</Text>
          <Button onClick={() => navigate('/notes')}>Go to Dashboard</Button>
        </Stack>
      </Center>
    )
  }

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <Stack gap="md" pt="sm">
        <Group>
          <Button 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(parentFolder ? `/notes/folder/${parentFolder.id}` : '/notes')}
          >
            Back
          </Button>
        </Group>

        <Breadcrumbs>
          <Anchor component={Link} to="/notes">Notes</Anchor>
          {parentFolder && (
            <Anchor component={Link} to={`/notes/folder/${parentFolder.id}`}>
              {parentFolder.name}
            </Anchor>
          )}
          <Text>{folder.name}</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="center">
          <Text size="xl" fw={700}>{folder.name}</Text>
          <Group>
            <Button 
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() => openCreateNoteModal()}
            >
              New Note
            </Button>
            {folder.level === 1 && (
              <Button 
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={() => openCreateFolderModal()}
              >
                New Subfolder
              </Button>
            )}
          </Group>
        </Group>

        {folder.description && (
          <Text c="dimmed">{folder.description}</Text>
        )}

        {subFolders.length > 0 && (
          <>
            <Text size="lg" fw={600} mt="md">Subfolders</Text>
            <Stack gap="sm">
              {subFolders.map(subFolder => (
                <FolderCard
                  key={subFolder.id}
                  folder={subFolder}
                  onSelect={() => handleFolderSelect(subFolder.id)}
                  onDelete={() => openDeleteFolderModal(subFolder.id, subFolder.name)}
                />
              ))}
            </Stack>
          </>
        )}

        <Text size="lg" fw={600} mt="md">Notes ({notes.length})</Text>
        {notes.length === 0 ? (
          <Box p="xl" style={{ textAlign: 'center', background: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}>
            <Text c="dimmed">No notes in this folder</Text>
            <Button 
              variant="light" 
              mt="md"
              onClick={() => openCreateNoteModal()}
            >
              Create your first note
            </Button>
          </Box>
        ) : (
          <Stack gap="sm">
            {notes.map(note => (
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

      <CreateFolderModal
        opened={isCreateFolderModalOpen}
        onClose={closeCreateFolderModal}
        parentId={id || null}
        level={(folder?.level || 0) + 1}
      />

      <CreateNoteModal
        opened={isCreateNoteModalOpen}
        onClose={closeCreateNoteModal}
        folderId={id || ''}
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
