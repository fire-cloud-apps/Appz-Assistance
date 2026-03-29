/**
 * Used by: TaskAllTasksScreen, TaskGroupTasksScreen
 * Ref: /tasks/all, /tasks/groups
 */
import { Box, Button, Center, Stack, Text } from '@mantine/core'
import { Icon } from '@iconify/react'

type TaskEmptyStateProps = {
  onCreate: () => void
  title?: string
  description?: string
}

export function TaskEmptyState({ onCreate, title, description }: TaskEmptyStateProps) {
  return (
    <Center py="xl">
      <Stack align="center" gap="xs">
        <Box style={{ fontSize: '4rem' }}>📋</Box>
        <Text c="dimmed" size="lg">{title ?? 'No tasks yet'}</Text>
        <Text c="dimmed" size="sm">{description ?? 'Create your first task to get started'}</Text>
        <Button
          leftSection={<Icon icon="tabler:plus" width={18} />}
          onClick={onCreate}
          variant="outline"
        >
          Create Task
        </Button>
      </Stack>
    </Center>
  )
}
