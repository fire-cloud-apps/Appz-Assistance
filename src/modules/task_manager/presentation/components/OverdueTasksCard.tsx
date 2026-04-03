import { Card, Group, Text, Badge, Checkbox, Stack, Box, ThemeIcon, Paper } from '@mantine/core'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import { Task } from '../../data/models'
import { StatusIcon } from '../../../../core/components/StatusIcon'
import dayjs from 'dayjs'

interface OverdueTasksCardProps {
  tasks: Task[]
  onCompleteTask: (taskId: string) => void
}

export function OverdueTasksCard({ tasks, onCompleteTask }: OverdueTasksCardProps) {
  const navigate = useNavigate()

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Low: 'gray',
      Medium: 'yellow',
      High: 'orange',
      Critical: 'red',
    }
    return colors[priority] || 'gray'
  }

  const getDaysOverdue = (dueDate: string, dueTime?: string | null) => {
    const today = dayjs().startOf('day')
    const due = dayjs(dueDate)
    const days = today.diff(due, 'day')
    
    // If same day and has due time, check if time has passed
    if (days === 0 && dueTime) {
      const now = dayjs().format('HH:mm')
      if (now >= dueTime) {
        return { days: 0, isPastDueTime: true }
      }
      return { days: 0, isPastDueTime: false }
    }
    
    return { days, isPastDueTime: days > 0 }
  }

  const formatOverdue = (dueDate: string, dueTime?: string | null) => {
    const { days, isPastDueTime } = getDaysOverdue(dueDate, dueTime)
    
    if (days === 0 && !isPastDueTime) {
      return { text: `Due today at ${dueTime}`, color: 'orange' }
    }
    if (days === 0 && isPastDueTime) {
      return { text: `Overdue at ${dueTime}`, color: 'red' }
    }
    if (days === 1) return { text: `1 day overdue${dueTime ? ` (was at ${dueTime})` : ''}`, color: 'red' }
    return { text: `${days} days overdue${dueTime ? ` (was at ${dueTime})` : ''}`, color: 'red' }
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon variant="light" color="red" size="lg" radius="md">
              <StatusIcon icon="lucide:alert-octagon" size={20} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="lg">Overdue Tasks</Text>
              <Text size="xs" c="dimmed">Tasks past due date</Text>
            </Box>
          </Group>
          <Badge variant="light" color="red" size="lg" radius="md">
            {tasks.length} tasks
          </Badge>
        </Group>

        {tasks.length === 0 ? (
          <Paper p="xl" withBorder style={{ textAlign: 'center' }} bg="var(--mantine-color-body)">
            <StatusIcon icon="lucide:check-circle" size={40} color="var(--mantine-color-green-5)" />
            <Text c="dimmed" mt="md">No overdue tasks</Text>
            <Text size="sm" c="dimmed">All tasks are on track!</Text>
          </Paper>
        ) : (
          <Stack gap="sm">
            {tasks.map((task) => {
              const overdueInfo = task.dueDate ? formatOverdue(task.dueDate, task.dueTime) : null

              return (
                <Paper
                  key={task.id}
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    transition: 'all 0.2s ease',
                    borderLeft: `4px solid var(--mantine-color-${getPriorityColor(task.priority)}-5)`,
                  }}
                >
                  <Group justify="space-between" wrap="nowrap" gap="sm">
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                      <Checkbox
                        checked={task.status === 'Completed'}
                        onChange={() => onCompleteTask(task.id)}
                        size="md"
                        color="green"
                        aria-label={`Mark ${task.title} as complete`}
                      />
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          fw={500}
                          size="sm"
                          lineClamp={1}
                          style={{
                            textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                            color: task.status === 'Completed' ? 'dimmed' : 'inherit',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/task/${task.id}`)
                          }}
                        >
                          {task.title}
                        </Text>
                        {task.description && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {task.description}
                          </Text>
                        )}
                      </Box>
                    </Group>

                    <Group gap="xs" wrap="nowrap">
                      {overdueInfo && (
                        <Badge
                          variant="light"
                          color={overdueInfo.color}
                          size="sm"
                          leftSection={<Icon icon="tabler:alert-triangle" width={12} />}
                        >
                          {overdueInfo.text}
                        </Badge>
                      )}
                      <Badge
                        variant="light"
                        color={getPriorityColor(task.priority)}
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                    </Group>
                  </Group>
                </Paper>
              )
            })}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}
