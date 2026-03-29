import { Box, Stack, Loader, Center, Text, TextInput } from '@mantine/core'
import { Icon } from '@iconify/react'
import { useSearchParams } from 'react-router-dom'
import { useSearchNotes } from '../hooks/useNoteQueries'
import { NoteListItem } from '../components/NoteListItem'
import { useNavigate } from 'react-router-dom'

export function NotesSearchScreen() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const navigate = useNavigate()
  
  const { data: results = [], isLoading } = useSearchNotes(query)

  const handleNoteSelect = (noteId: string) => {
    navigate(`/notes/editor/${noteId}`)
  }

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <Stack gap="md" pt="sm">
        <Text size="xl" fw={700}>Search</Text>
        
        <TextInput
          placeholder="Search notes..."
          leftSection={<Icon icon="tabler:search" width={16} />}
          defaultValue={query}
          onChange={(e) => {
            if (e.target.value) {
              navigate(`/notes/search?q=${encodeURIComponent(e.target.value)}`, { replace: true })
            }
          }}
        />

        {query && (
          <Text c="dimmed">
            {isLoading 
              ? 'Searching...' 
              : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
            }
          </Text>
        )}

        {isLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : results.length === 0 && query ? (
          <Box p="xl" style={{ textAlign: 'center', background: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}>
            <Text c="dimmed">No notes found</Text>
          </Box>
        ) : (
          <Stack gap="sm">
            {results.map(note => (
              <NoteListItem
                key={note.id}
                note={note}
                onClick={() => handleNoteSelect(note.id)}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
