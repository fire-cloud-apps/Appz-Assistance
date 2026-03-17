/**
 * Used by: TaskDashboardScreen, TaskAllTasksScreen, TaskGroupTasksScreen
 * Ref: /tasks/dashboard, /tasks/all, /tasks/groups
 */
import { Flex, Title, Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'

type TaskDashboardHeaderProps = {
  title?: string
  onNewTask: () => void
}

export function TaskDashboardHeader({ title = 'Task Manager', onNewTask }: TaskDashboardHeaderProps) {
  return (
    <Flex justify="space-between" align="center" gap="sm">
      <Title order={2}>{title}</Title>
      <Button
        leftSection={<IconPlus size={18} />}
        onClick={onNewTask}
      >
        New Task
      </Button>
    </Flex>
  )
}
