import { UnstyledButton, Paper, Group, Stack, Text, Badge, ActionIcon, Menu } from '@mantine/core'
import { IconPin, IconStar, IconDotsVertical, IconTrash, IconEdit } from '@tabler/icons-react'
import { Note } from '../../data/models/Note'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface NoteListItemProps {
  note: Note
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export function NoteListItem({ note, onClick, onEdit, onDelete }: NoteListItemProps) {
  const previewContent = stripHtml(note.content || '').slice(0, 150)

  return (
    <UnstyledButton onClick={onClick} style={{ width: '100%' }}>
      <Paper 
        p="md" 
        radius="md"
        withBorder
        style={{ 
          borderColor: note.color ? `var(--mantine-color-${note.color}-4)` : undefined,
          transition: 'all 0.2s ease'
        }}
      >
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Stack gap={4} style={{ flex: 1, overflow: 'hidden' }}>
            <Group gap="xs" wrap="nowrap">
              {note.isPinned && <IconPin size={14} color="var(--mantine-color-orange-6)" />}
              {note.isFavorite && <IconStar size={14} color="var(--mantine-color-yellow-6)" fill="var(--mantine-color-yellow-6)" />}
              <Text fw={500} lineClamp={1}>{note.title}</Text>
            </Group>
            {previewContent && (
              <Text size="xs" c="dimmed" lineClamp={2}>
                {previewContent}
              </Text>
            )}
            <Group gap="xs">
              {note.tags?.slice(0, 3).map((tag, index) => (
                <Badge key={index} size="xs" variant="light">{tag}</Badge>
              ))}
              {note.tags && note.tags.length > 3 && (
                <Text size="xs" c="dimmed">+{note.tags.length - 3}</Text>
              )}
            </Group>
          </Stack>
          <Group gap="xs" align="flex-start">
            <Text size="xs" c="dimmed">
              {dayjs(note.updatedAt).fromNow()}
            </Text>
            <Menu shadow="md" width={160} position="bottom-end">
              <Menu.Target>
                <ActionIcon 
                  variant="subtle" 
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item 
                  leftSection={<IconEdit size={14} />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.()
                  }}
                >
                  Edit
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  color="red"
                  leftSection={<IconTrash size={14} />}
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
        </Group>
      </Paper>
    </UnstyledButton>
  )
}
