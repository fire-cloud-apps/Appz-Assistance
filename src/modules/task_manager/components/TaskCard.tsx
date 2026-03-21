import { Card, Group, Text, Badge, Button, Stack, Box } from '@mantine/core'
import { IconChevronRight, IconChevronDown, IconCalendar, IconList, IconPlus, IconRepeat } from '@tabler/icons-react'
import { Task } from '../../../core/database/models'
import { getRecurrenceLabel } from '../../../core/utils/recurrenceHelper'

interface TaskCardProps {
  task: Task
  isExpanded?: boolean
  onToggle?: () => void
  onSelect?: () => void
  showExpand?: boolean
  childTasksCount?: number
  onAddSubtask?: () => void
}

export function TaskCard({ task, isExpanded, onToggle, onSelect, showExpand = false, childTasksCount = 0, onAddSubtask }: TaskCardProps) {
  const statusColors: Record<string, string> = {
    Pending: 'gray',
    InProgress: 'blue',
    Completed: 'green',
    Cancelled: 'red',
  }

  const priorityColors: Record<string, string> = {
    Low: 'gray',
    Medium: 'yellow',
    High: 'orange',
    Critical: 'red',
  }

  const handleCardClick = () => {
    console.log('TaskCard clicked:', task.id, task.title)
    onSelect?.()
  }

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Toggle clicked:', task.id)
    onToggle?.()
  }

  const handleAddSubtaskClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Add subtask clicked:', task.id)
    onAddSubtask?.()
  }

  const canAddSubtask = task.taskLevel < 3

  return (
    <Card 
      shadow="sm" 
      p="md" 
      withBorder
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
            {showExpand && (
              <Button
                variant="subtle"
                size="compact-sm"
                onClick={handleToggleClick}
              >
                {isExpanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
              </Button>
            )}
            <Text fw={600} style={{ flex: 1 }}>
              {task.title}
            </Text>
          </Group>
          <Group gap="xs">
            <Badge variant="light" color={priorityColors[task.priority] || 'gray'} size="sm">
              {task.priority}
            </Badge>
            <Badge variant="filled" color={statusColors[task.status] || 'gray'} size="sm">
              {task.status}
            </Badge>
          </Group>
        </Group>

        {/* Expanded Details */}
        {isExpanded && (
          <Box mt="xs" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
            <Stack gap="xs">
              {task.description && (
                <Box component="pre" className="task-description" c="dimmed" style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
                  <strong>Description:</strong> {'\n'}{task.description}
                </Box>
              )}
              <Group gap="lg">
                {task.dueDate && (
                  <Group gap="xs">
                    <IconCalendar size={16} />
                    <Text size="sm" c="dimmed">
                      Due: {task.dueDate}
                    </Text>
                  </Group>
                )}
                <Group gap="xs">
                  <IconList size={16} />
                  <Text size="sm" c="dimmed">
                    Level {task.taskLevel}
                  </Text>
                </Group>
                {childTasksCount > 0 && (
                  <Text size="sm" c="blue">
                    {childTasksCount} subtask(s)
                  </Text>
                )}
                {task.isRecurring && task.recurrencePattern && (
                  <Group gap="xs">
                    <IconRepeat size={16} />
                    <Text size="sm" c="pink">
                      {getRecurrenceLabel(task.recurrencePattern)}
                    </Text>
                  </Group>
                )}
              </Group>
              
              {canAddSubtask && (
                <Button
                  size="compact-sm"
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={handleAddSubtaskClick}
                  mt="xs"
                >
                  Add Subtask
                </Button>
              )}
            </Stack>
          </Box>
        )}

        {!isExpanded && (
          <Group gap="xs" justify="space-between">
            {task.dueDate && (
              <Text size="xs" c="dimmed">
                Due: {task.dueDate}
              </Text>
            )}
            <Group gap="xs">
              {task.isRecurring && task.recurrencePattern && (
                <IconRepeat size={14} color="pink" />
              )}
              <Text size="xs" c="dimmed">
                Level {task.taskLevel}
              </Text>
            </Group>
          </Group>
        )}
      </Stack>
    </Card>
  )
}
