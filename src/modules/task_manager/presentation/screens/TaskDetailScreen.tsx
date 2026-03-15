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
  Modal,
  TextInput,
  Textarea,
  Select,
} from '@mantine/core'
import { IconArrowLeft, IconEdit, IconTrash, IconPlus } from '@tabler/icons-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTaskById, useChildTasks, useUpdateTask } from '../hooks'
import { useTaskStore } from '../hooks'
import { ActivityLog } from '../../components/ActivityLog'
import { TaskCard } from '../../components/TaskCard'
import { Task } from '../../../../core/database/models'
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { getToday } from '../../../../core/utils/dateHelper'
import { DeleteConfirmationModal } from '../../components/DeleteConfirmationModal'
import { SubtaskModal } from '../../components/SubtaskModal'

export function TaskDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setSelectedTaskId, openDeleteModal, openSubtaskModal } = useTaskStore()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Redirect to dashboard if ID is empty
  useEffect(() => {
    if (!id || id.trim() === '') {
      navigate('/')
    }
  }, [id, navigate])

  const { data: task, isLoading } = useTaskById(id || '')
  const { data: childTasks = [] } = useChildTasks(id || '')
  const updateTask = useUpdateTask()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      dueDate: '',
    },
  })

  // Update form values when task data loads
  useEffect(() => {
    if (task && isEditModalOpen) {
      reset({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Pending',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate || '',
      })
    }
  }, [task, isEditModalOpen, reset])

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
      setIsEditModalOpen(true)
    }
  }

  const handleUpdate = async (data: any) => {
    if (!task) return

    try {
      await updateTask.mutateAsync({
        id: task.id,
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate || null,
      })
      setIsEditModalOpen(false)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDelete = () => {
    if (!task) return
    openDeleteModal(task.id, task.title)
  }

  const handleClose = () => {
    setSelectedTaskId(null)
    navigate('/')
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
            <IconArrowLeft size={20} />
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
              </Group>
              <Group>
                <ActionIcon variant="light" onClick={handleEdit}>
                  <IconEdit size={18} />
                </ActionIcon>
                <ActionIcon variant="light" color="red" onClick={handleDelete}>
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            </Group>

            {task.description && (
              <>
                <Divider />
                <Box>
                  <Text fw={600} mb="xs">Description</Text>
                  <Text>{task.description}</Text>
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
                  leftSection={<IconPlus size={16} />}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />

      {/* Subtask Modal */}
      <SubtaskModal 
        parentTaskId={task?.id || ''}
        parentTaskTitle={task?.title || ''}
        parentTaskLevel={task?.taskLevel || 1}
      />

      {/* Edit Modal */}
      <Modal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
        size="md"
      >
        <form onSubmit={handleSubmit(handleUpdate)}>
          <Stack>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Title"
                  required
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="Description"
                  minRows={3}
                  {...field}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  data={['Pending', 'InProgress', 'Completed', 'Cancelled']}
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  label="Priority"
                  data={['Low', 'Medium', 'High', 'Critical']}
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Due Date"
                  type="date"
                  min={getToday()}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              )}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Update Task
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  )
}
