import { Box, Stack, Loader, Center, Text, Button, Group } from '@mantine/core'
import { IconTrash, IconRestore, IconTrashOff } from '@tabler/icons-react'
import { useDeletedNotes, useRestoreNote, usePermanentlyDeleteNote } from '../hooks/useNoteQueries'

export function NotesTrashScreen() {
  const { data: deletedNotes = [], isLoading: notesLoading } = useDeletedNotes()
  const restoreNote = useRestoreNote()
  const permanentlyDeleteNote = usePermanentlyDeleteNote()

  const handleRestoreNote = (noteId: string) => {
    restoreNote.mutate(noteId)
  }

  const handlePermanentlyDeleteNote = (noteId: string) => {
    permanentlyDeleteNote.mutate(noteId)
  }

  if (notesLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <Stack gap="md" pt="sm">
        <Text size="xl" fw={700}>Trash</Text>
        
        {deletedNotes.length === 0 ? (
          <Box p="xl" style={{ textAlign: 'center', background: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}>
            <IconTrash size={48} style={{ opacity: 0.3, marginBottom: 8 }} />
            <Text c="dimmed">Trash is empty</Text>
          </Box>
        ) : (
          <Stack gap="sm">
            {deletedNotes.map(note => (
              <Box 
                key={note.id}
                p="md"
                style={{ 
                  background: 'var(--mantine-color-gray-0)',
                  borderRadius: 'var(--mantine-radius-md)',
                  opacity: 0.7
                }}
              >
                <Group justify="space-between" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    <Text fw={500} td="line-through">{note.title}</Text>
                    <Text size="xs" c="dimmed">
                      Deleted: {new Date(note.updatedAt).toLocaleDateString()}
                    </Text>
                  </Box>
                  <Group gap="xs">
                    <Button 
                      size="xs" 
                      variant="light"
                      leftSection={<IconRestore size={14} />}
                      onClick={() => handleRestoreNote(note.id)}
                    >
                      Restore
                    </Button>
                    <Button 
                      size="xs" 
                      variant="light"
                      color="red"
                      leftSection={<IconTrashOff size={14} />}
                      onClick={() => handlePermanentlyDeleteNote(note.id)}
                    >
                      Delete Forever
                    </Button>
                  </Group>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
