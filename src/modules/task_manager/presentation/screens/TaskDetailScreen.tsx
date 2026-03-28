/**
 * Route: /task/:id
 * Ref: routes/index.tsx
 */
import {
  Box,
  Text,
  Badge,
  Button,
  Stack,
  Group,
  Card,
  Title,
  Divider,
  ActionIcon,
  Alert,
} from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useTaskById, useChildTasks } from '../hooks' // Removed useUpdateTask
import { useTaskStore } from '../hooks'
import { ActivityLog } from '../../components/ActivityLog'
import { TaskCard } from '../../components/TaskCard'
import { Task } from '../../data/models'
import { useEffect } from 'react' // Removed useState
import { ArchiveConfirmationModal } from '../../components/ArchiveConfirmationModal'
import { SubtaskModal } from '../../components/SubtaskModal'
import { getRecurrenceLabel } from '../../../../core/utils/recurrenceHelper'

export function TaskDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setSelectedTaskId, openArchiveModal, openSubtaskModal } = useTaskStore()

  // Redirect to dashboard if ID is empty
  useEffect(() => {
    if (!id || id.trim() === '') {
      navigate('/')
    }
  }, [id, navigate])

  const { data: task, isLoading } = useTaskById(id || '')
  const { data: childTasks = [] } = useChildTasks(id || '')
  // Removed const updateTask = useUpdateTask()

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

  const handleEdit = () => {
    if (task) {
      navigate(`/tasks/edit/${task.id}`)
    }
  }

  const handleArchive = () => {
    if (!task) return
    openArchiveModal(task.id, task.title)
  }

  const handleClose = () => {
    setSelectedTaskId(null)
    navigate(-1) // Go back to the previous page
  }

  if (isLoading) {
    return <Box p="lg">Loading...</Box>
  }

  if (!task) {
    return (
      <Alert color="red" title="Task Not Found">
        The requested task could not be found.
      </Alert>
    )
  }

  return (
    <Box p="lg">
      <Stack gap="md">
        {/* Header */}
        <Group>
          <ActionIcon variant="subtle" onClick={handleClose}>
            <iconify-icon icon="lucide:arrow-left" width={20} height={20} />
          </ActionIcon>
          <Title order={2}>{task.title || 'Untitled Task'}</Title>
        </Group>

        {/* Task Info Card */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={3} hiddenFrom="sm">{task.title || 'Untitled Task'}</Title>
            <Group justify="space-between">
              <Group>
                <Badge
                  variant="filled"
                  color={statusColors[task.status] || 'gray'}
                  size="lg"
                >
                  {task.status}
                </Badge>
                <Badge
                  variant="light"
                  color={priorityColors[task.priority] || 'gray'}
                  size="lg"
                >
                  {task.priority}
                </Badge>
                {task.isArchived && (
                  <Badge
                    variant="filled"
                    color="orange"
                    size="lg"
                    leftSection={<iconify-icon icon="lucide:archive" width={14} height={14} />}
                  >
                    Archived
                  </Badge>
                )}
              </Group>
              <Group>
                <ActionIcon variant="light" onClick={handleEdit}>
                  <iconify-icon icon="lucide:edit" width={18} height={18} />
                </ActionIcon>
                {!task.isArchived && (
                  <ActionIcon variant="light" color="orange" onClick={handleArchive}>
                    <iconify-icon icon="lucide:archive" width={18} height={18} />
                  </ActionIcon>
                )}
              </Group>
            </Group>

            {task.description && (
              <>
                <Divider />
                <Box>
                  <Text fw={600} mb="xs">Description</Text>
                  <Box component="pre" className="task-description">
                    {task.description}
                  </Box>
                </Box>
              </>
            )}

            <Divider />
            <Group justify="space-between">
              <Box>
                <Text size="sm" c="dimmed">Created</Text>
                <Text size="sm">{new Date(task.createdAt).toLocaleDateString()}</Text>
              </Box>
              {task.dueDate && (
                <Box>
                  <Text size="sm" c="dimmed">Due Date</Text>
                  <Text size="sm">{task.dueDate}</Text>
                </Box>
              )}
              <Box>
                <Text size="sm" c="dimmed">Level</Text>
                <Text size="sm">Level {task.taskLevel}</Text>
              </Box>
              {task.isRecurring && task.recurrencePattern && (
                <Box>
                  <Group gap="xs">
                    <iconify-icon icon="lucide:repeat" width={16} height={16} color="pink" />
                    <Text size="sm" c="pink">
                      {getRecurrenceLabel(task.recurrencePattern)}
                    </Text>
                  </Group>
                  {task.recurrenceEndDate && (
                    <Text size="xs" c="dimmed" mt={4}>
                      Until: {new Date(task.recurrenceEndDate).toLocaleDateString()}
                    </Text>
                  )}
                </Box>
              )}
            </Group>
          </Stack>
        </Card>

        {/* Subtasks */}
        {task.taskLevel < 3 && (
          <Card shadow="sm" p="lg" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={4}>Subtasks ({childTasks.length})</Title>
                <Button
                  size="compact-sm"
                  variant="light"
                  leftSection={<iconify-icon icon="lucide:plus" width={16} height={16} />}
                  onClick={() => openSubtaskModal()}
                >
                  Add Subtask
                </Button>
              </Group>
              {childTasks.length > 0 ? (
                <Stack gap="xs">
                  {childTasks.map((childTask: Task) => (
                    <TaskCard
                      key={childTask.id}
                      task={childTask}
                      onSelect={() => {
                        if (!childTask.id || childTask.id.trim() === '') {
                          return
                        }
                        setSelectedTaskId(childTask.id)
                        navigate(`/task/${childTask.id}`)
                      }}
                    />
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed" size="sm">No subtasks yet. Click "Add Subtask" to create one.</Text>
              )}
            </Stack>
          </Card>
        )}

        {/* Activity Log - Only for Level 1 tasks */}
        {task.taskLevel === 1 && <ActivityLog taskId={task.id} />}

        <Button
          variant="outline"
          onClick={() => navigate('/tasks/all')}
          hiddenFrom="sm"
          fullWidth
        >
          Back to All Tasks
        </Button>
      </Stack>

      {/* Archive Confirmation Modal */}
      <ArchiveConfirmationModal />

      {/* Subtask Modal */}
      <SubtaskModal 
        parentTaskId={task?.id || ''}
        parentTaskTitle={task?.title || ''}
        parentTaskLevel={task?.taskLevel || 1}
      />
    </Box>
  )
}
