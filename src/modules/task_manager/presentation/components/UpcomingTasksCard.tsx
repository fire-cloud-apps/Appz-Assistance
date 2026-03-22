import { Card, Group, Text, Badge, Checkbox, Stack, Box, ThemeIcon, Paper } from '@mantine/core'
import { IconClock } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { Task } from '../../data/models'
import { StatusIcon } from '../../../../core/components/StatusIcon'
import dayjs from 'dayjs'

interface UpcomingTasksCardProps {
  tasks: Task[]
  onCompleteTask: (taskId: string) => void
}

export function UpcomingTasksCard({ tasks, onCompleteTask }: UpcomingTasksCardProps) {
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

  const getDaysUntilDue = (dueDate: string) => {
    const today = dayjs().startOf('day')
    const due = dayjs(dueDate)
    return due.diff(today, 'day')
  }

  const formatDueDate = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate)
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: 'red' }
    if (days === 0) return { text: 'Due today', color: 'orange' }
    if (days === 1) return { text: 'Due tomorrow', color: 'yellow' }
    return { text: `${days} days left`, color: 'blue' }
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon variant="light" color="orange" size="lg" radius="md">
              <StatusIcon icon="lucide:alarm-clock" size={20} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="lg">Upcoming Tasks</Text>
              <Text size="xs" c="dimmed">Tasks reaching due date</Text>
            </Box>
          </Group>
          <Badge variant="light" color="orange" size="lg" radius="md">
            {tasks.length} tasks
          </Badge>
        </Group>

        {tasks.length === 0 ? (
          <Paper p="xl" withBorder style={{ textAlign: 'center', background: 'var(--mantine-color-gray-0)' }}>
            <StatusIcon icon="lucide:calendar-check" size={40} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed" mt="md">No upcoming tasks</Text>
            <Text size="sm" c="dimmed">All caught up!</Text>
          </Paper>
        ) : (
          <Stack gap="sm">
            {tasks.map((task) => {
              const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null
              
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
                      {dueInfo && (
                        <Badge 
                          variant="light" 
                          color={dueInfo.color} 
                          size="sm"
                          leftSection={<IconClock size={12} />}
                        >
                          {dueInfo.text}
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
