import {
  Modal,
  Button,
  Stack,
  Text,
  Alert,
  Group,
} from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useTaskStore, useDeleteTask } from '../presentation/hooks'
import { useNavigate, useLocation } from 'react-router-dom'

export function DeleteConfirmationModal() {
  const { 
    isDeleteModalOpen, 
    closeDeleteModal, 
    deleteTaskId, 
    deleteTaskTitle 
  } = useTaskStore()
  const deleteTask = useDeleteTask()
  const navigate = useNavigate()
  const location = useLocation()

  const handleDelete = async () => {
    if (!deleteTaskId) return

    try {
      await deleteTask.mutateAsync({ taskId: deleteTaskId })
      closeDeleteModal()
      // Only navigate if we're on the detail page
      if (location.pathname.startsWith('/task/')) {
        navigate('/')
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  return (
    <Modal
      opened={isDeleteModalOpen}
      onClose={closeDeleteModal}
      title="Delete Task"
      size="md"
    >
      <Stack gap="md">
        <Alert
          icon={<IconAlertTriangle size={24} />}
          title="Warning"
          color="red"
          variant="light"
        >
          This action cannot be undone.
        </Alert>

        <Text>
          Are you sure you want to delete the following task?
        </Text>

        <Text fw={600} c="red">
          "{deleteTaskTitle}"
        </Text>

        <Text size="sm" c="dimmed">
          This will also delete all subtasks and activities associated with this task.
        </Text>

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button 
            color="red" 
            onClick={handleDelete}
            loading={deleteTask.isPending}
          >
            Delete Task
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
