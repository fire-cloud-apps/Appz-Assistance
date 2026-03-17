/**
 * Route: /tasks/all
 * Ref: routes/index.tsx
 */
import { Box, Button, Stack, Text, Loader, Center, Group, Badge, Paper, ThemeIcon, UnstyledButton, Divider, Tooltip, ActionIcon, Checkbox } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useTaskStore } from '../hooks/useTaskStore'
import { useParentTasks, useUpdateTask } from '../hooks/useTaskQueries'
import { TaskDashboardHeader } from '../components/TaskDashboardHeader'
import { TaskEmptyState } from '../components/TaskEmptyState'
import { StatusIcon } from '../../../../core/components/StatusIcon'
import { useNavigate } from 'react-router-dom'
import { Task } from '../../../../core/database/models'
import { useState } from 'react'

const ITEMS_PER_PAGE = 5

type StatusMeta = {
  label: string
  color: string
  icon: string
}

type PriorityMeta = {
  label: string
  color: string
}

export function TaskAllTasksScreen() {
  const navigate = useNavigate()
  const { setSelectedTaskId } = useTaskStore()
  const { data: tasks = [], isLoading } = useParentTasks()
  const updateTask = useUpdateTask()
  const [currentPage, setCurrentPage] = useState<number>(1)

  const handleTaskSelect = (taskId: string) => {
    if (!taskId || taskId.trim() === '') return
    setSelectedTaskId(taskId)
    navigate(`/task/${taskId}`)
  }

  const handleToggleComplete = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed'
    await updateTask.mutateAsync({
      ...task, // Pass the full task object
      status: newStatus,
    })
  }

  const totalPages = Math.max(1, Math.ceil(tasks.length / ITEMS_PER_PAGE))

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const getStatusMeta = (status: Task['status']): StatusMeta => {
    switch (status) {
      case 'Completed':
        return { label: 'Completed', color: 'green', icon: 'lucide:check-circle' }
      case 'InProgress':
        return { label: 'In Progress', color: 'orange', icon: 'lucide:loader-circle' }
      case 'Cancelled':
        return { label: 'Cancelled', color: 'red', icon: 'lucide:x-circle' }
      default:
        return { label: 'Pending', color: 'gray', icon: 'lucide:clock' }
    }
  }

  const getPriorityMeta = (priority: Task['priority']): PriorityMeta => {
    switch (priority) {
      case 'Critical':
        return { label: 'Critical', color: 'red' }
      case 'High':
        return { label: 'High', color: 'orange' }
      case 'Medium':
        return { label: 'Medium', color: 'yellow' }
      default:
        return { label: 'Low', color: 'blue' }
    }
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <Stack gap="md">
        <TaskDashboardHeader title="All Tasks" onNewTask={() => navigate('/tasks/create')} />

        {tasks.length === 0 ? (
          <TaskEmptyState onCreate={() => navigate('/tasks/create')} />
        ) : (
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text fw={700} size="md">All Tasks</Text>
              <Badge variant="light" color="blue" size="sm">
                {Math.min(currentPage * ITEMS_PER_PAGE, tasks.length)} of {tasks.length}
              </Badge>
            </Group>

            <Divider size="sm" />

            <Stack gap="xs">
              {tasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((task: Task) => {
                const statusMeta = getStatusMeta(task.status)
                const priorityMeta = getPriorityMeta(task.priority)
                const borderLeftColor = task.status === 'Pending' ? 'yellow' : statusMeta.color
                return (
                  <UnstyledButton
                    key={task.id}
                    onClick={() => handleTaskSelect(task.id)}
                    style={{ width: '100%' }}
                  >
                    <Paper
                      radius="md"
                      p="md"
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid var(--mantine-color-default-border)',
                        borderLeft: `4px solid var(--mantine-color-${borderLeftColor}-filled)`,
                        background: 'var(--mantine-color-default)',
                      }}
                    >
                      <Box
                        aria-hidden
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 0,
                          height: 0,
                          borderTop: `18px solid var(--mantine-color-${priorityMeta.color}-filled)`,
                          borderLeft: '18px solid transparent',
                        }}
                      />
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                          <Checkbox
                            checked={task.status === 'Completed'}
                            onChange={() => {}}
                            onClick={(e) => handleToggleComplete(task, e)}
                            size="md"
                            color="green"
                            aria-label="Toggle task completion"
                          />
                          <ThemeIcon variant="light" color={statusMeta.color} radius="xl" size="lg">
                            <StatusIcon icon={statusMeta.icon} size={18} />
                          </ThemeIcon>
                          <Box style={{ minWidth: 0 }}>
                            <Text fw={600} size="sm" lineClamp={1}>{task.title}</Text>
                            {task.description && (
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                {task.description}
                              </Text>
                            )}
                          </Box>
                        </Group>

                        <Group gap="xs" align="center" wrap="nowrap">
                          <Badge variant="light" color={statusMeta.color} size="sm">
                            {statusMeta.label}
                          </Badge>
                          <Badge variant="outline" color={priorityMeta.color} size="sm">
                            {priorityMeta.label}
                          </Badge>
                        </Group>
                      </Group>

                      <Divider my="xs" />

                      <Group justify="space-between" align="center" wrap="nowrap">
                        <Text size="xs" c="dimmed">
                          Due: {task.dueDate || 'Not set'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Updated: {task.updatedAt}
                        </Text>
                      </Group>
                    </Paper>
                  </UnstyledButton>
                )
              })}
            </Stack>

            <Group justify="space-between" align="center" mt="xs">
              <Button
                onClick={handlePrevPage}
                variant="outline"
                size="md"
                disabled={currentPage === 1}
                leftSection={<StatusIcon icon="lucide:chevron-left" size={16} />}
              >
                Prev
              </Button>
              <Button
                onClick={handleNextPage}
                variant="outline"
                size="md"
                disabled={currentPage === totalPages}
                rightSection={<StatusIcon icon="lucide:chevron-right" size={16} />}
              >
                Next
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>

      <Tooltip label="New Task" withArrow position="left">
        <ActionIcon
          onClick={() => navigate('/tasks/create')}
          hiddenFrom="sm"
          size="xl"
          variant="filled"
          color="blue"
          aria-label="New Task"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <IconPlus size={28} />
        </ActionIcon>
      </Tooltip>
    </Box>
  )
}
