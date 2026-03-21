import { Accordion, Text, Box } from '@mantine/core'
import { IconFolder } from '@tabler/icons-react'
import { Folder } from '../../data/models/Folder'
import { Note } from '../../data/models/Note'
import { NoteListItem } from './NoteListItem'

interface FolderTreeProps {
  folders: Folder[]
  notes: Record<string, Note[]>
  onFolderSelect: (folderId: string) => void
  onNoteSelect: (noteId: string) => void
}

export function FolderTree({ folders, notes, onFolderSelect, onNoteSelect }: FolderTreeProps) {
  const rootFolders = folders.filter(f => f.parentId === null)
  const getSubFolders = (parentId: string) => folders.filter(f => f.parentId === parentId)

  const FolderItem = ({ folder }: { folder: Folder }) => {
    const subFolders = getSubFolders(folder.id)
    const folderNotes = notes[folder.id] || []

    return (
      <Accordion.Item key={folder.id} value={folder.id}>
        <Accordion.Control 
          icon={<IconFolder size={18} />}
          onClick={() => onFolderSelect(folder.id)}
        >
          <Text fw={500}>{folder.name}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Box pl="md">
            {subFolders.length > 0 && (
              <Accordion>
                {subFolders.map(subFolder => (
                  <FolderItem key={subFolder.id} folder={subFolder} />
                ))}
              </Accordion>
            )}
            {folderNotes.length > 0 && (
              <Box mt="sm">
                {folderNotes.slice(0, 5).map(note => (
                  <Box key={note.id} mb="xs">
                    <NoteListItem 
                      note={note} 
                      onClick={() => onNoteSelect(note.id)} 
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    )
  }

  if (rootFolders.length === 0) {
    return (
      <Box p="md">
        <Text c="dimmed" ta="center">No folders yet</Text>
      </Box>
    )
  }

  return (
    <Accordion variant="contained">
      {rootFolders.map(folder => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </Accordion>
  )
}
