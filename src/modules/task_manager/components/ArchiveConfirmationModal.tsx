import {
  Modal,
  Button,
  Stack,
  Text,
  Alert,
  Group,
} from '@mantine/core'
import { IconArchive } from '@tabler/icons-react'
import { useTaskStore } from '../presentation/hooks'
import { useNavigate } from 'react-router-dom'
import { TaskRepository } from '../data/repositories/taskRepository'
import { useState } from 'react'

export function ArchiveConfirmationModal() {
  const {
    isArchiveModalOpen,
    closeArchiveModal,
    archiveTaskId,
    archiveTaskTitle,
  } = useTaskStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleArchive = async () => {
    if (!archiveTaskId) return

    try {
      setIsLoading(true)
      const taskRepository = new TaskRepository()
      await taskRepository.archiveTask(archiveTaskId)
      closeArchiveModal()
      // Go back to the previous page (like browser back button)
      navigate(-1)
    } catch (error) {
      console.error('Failed to archive task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      opened={isArchiveModalOpen}
      onClose={closeArchiveModal}
      title="Archive Task"
      size="md"
    >
      <Stack gap="md">
        <Alert
          icon={<IconArchive size={24} />}
          title="Archive Task"
          color="blue"
          variant="light"
        >
          This task will be moved to the archive and can be restored later.
        </Alert>

        <Text>
          Are you sure you want to archive the following task?
        </Text>

        <Text fw={600} c="blue">
          "{archiveTaskTitle}"
        </Text>

        <Text size="sm" c="dimmed">
          Archived tasks will be automatically deleted after the retention period set in Settings.
        </Text>

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={closeArchiveModal}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleArchive}
            loading={isLoading}
          >
            Archive Task
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
