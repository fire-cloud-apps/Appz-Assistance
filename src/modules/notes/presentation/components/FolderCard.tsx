import { Card, Group, Text, Stack, ActionIcon, Menu } from '@mantine/core'
import { Icon } from '@iconify/react'
import { Folder } from '../../data/models/Folder'
import { useNoteCountByFolder } from '../hooks/useNoteQueries'

interface FolderCardProps {
  folder: Folder
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onAddNote?: () => void
  onAddSubfolder?: () => void
}

export function FolderCard({ 
  folder, 
  onSelect, 
  onEdit, 
  onDelete, 
  onAddNote,
  onAddSubfolder 
}: FolderCardProps) {
  const { data: noteCount = 0 } = useNoteCountByFolder(folder.id)
  const canAddSubfolder = folder.level === 1

  return (
    <Card 
      shadow="sm" 
      p="lg" 
      withBorder
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      <Group justify="space-between">
        <Group>
          <ActionIcon variant="light" size="lg" color={folder.color || 'blue'}>
            <Icon icon="tabler:folder" width={20} />
          </ActionIcon>
          <Stack gap={0}>
            <Text fw={600}>{folder.name}</Text>
            <Text size="xs" c="dimmed">{noteCount} notes</Text>
          </Stack>
        </Group>
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon icon="tabler:dots-vertical" width={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<Icon icon="tabler:plus" width={16} />}
              onClick={(e) => {
                e.stopPropagation()
                onAddNote?.()
              }}
            >
              New Note
            </Menu.Item>
            {canAddSubfolder && (
              <Menu.Item
                leftSection={<Icon icon="tabler:folder" width={16} />}
                onClick={(e) => {
                  e.stopPropagation()
                  onAddSubfolder?.()
                }}
              >
                New Subfolder
              </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item
              leftSection={<Icon icon="tabler:edit" width={16} />}
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.()
              }}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<Icon icon="tabler:trash" width={16} />}
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.()
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      {folder.description && (
        <Text size="sm" c="dimmed" mt="sm" lineClamp={2}>
          {folder.description}
        </Text>
      )}
    </Card>
  )
}
