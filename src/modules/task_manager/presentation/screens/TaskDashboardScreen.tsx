import { Box, Stack, Loader, Center, Tooltip, ActionIcon } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useParentTasks } from '../hooks/useTaskQueries'
import { useTaskStore } from '../hooks/useTaskStore'
import { TaskDashboardHeader } from '../components/TaskDashboardHeader'
import { TaskStatsGrid } from '../components/TaskStatsGrid'
import { CreateTaskModal } from '../../components/CreateTaskModal'

export function TaskDashboardScreen() {
  const { openCreateModal } = useTaskStore()
  const { data: tasks = [], isLoading } = useParentTasks()

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <Stack gap="md" pt="sm">
        <TaskDashboardHeader title="Task Dashboard" onNewTask={openCreateModal} />
        <TaskStatsGrid tasks={tasks} />
      </Stack>

      <Tooltip label="New Task" withArrow position="left">
        <ActionIcon
          onClick={openCreateModal}
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

      <CreateTaskModal />
    </Box>
  )
}

