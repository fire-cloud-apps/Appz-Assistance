import { Modal, Button, Stack, Text, Group } from '@mantine/core'
import { Icon } from '@iconify/react'

interface DeleteConfirmationModalProps {
  opened: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  isLoading?: boolean
}

export function DeleteConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size="sm">
      <Stack gap="md">
        <Text size="sm">{description}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            leftSection={<Icon icon="tabler:trash" width={16} />}
            onClick={onConfirm}
            loading={isLoading}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
