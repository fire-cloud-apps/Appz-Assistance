import { Box, Button, Center, Stack, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'

type TaskEmptyStateProps = {
  onCreate: () => void
}

export function TaskEmptyState({ onCreate }: TaskEmptyStateProps) {
  return (
    <Center py="xl">
      <Stack align="center" gap="xs">
        <Box style={{ fontSize: '4rem' }}>📋</Box>
        <Text c="dimmed" size="lg">No tasks yet</Text>
        <Text c="dimmed" size="sm">Create your first task to get started</Text>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={onCreate}
          variant="outline"
        >
          Create Task
        </Button>
      </Stack>
    </Center>
  )
}
