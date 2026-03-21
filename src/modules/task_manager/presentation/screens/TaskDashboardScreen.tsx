/**
 * Route: /tasks/dashboard
 * Ref: routes/index.tsx
 */
import { Box, Stack, Loader, Center, Tooltip, ActionIcon } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useParentTasks, useUpcomingTasks, useCompleteTaskWithRecurrence } from '../hooks/useTaskQueries'
import { TaskDashboardHeader } from '../components/TaskDashboardHeader'
import { TaskStatsGrid } from '../components/TaskStatsGrid'
import { UpcomingTasksCard } from '../components/UpcomingTasksCard'
import { useNavigate } from 'react-router-dom'

export function TaskDashboardScreen() {
  const navigate = useNavigate()
  const { data: tasks = [], isLoading } = useParentTasks()
  const { data: upcomingTasks = [] } = useUpcomingTasks(5)
  const completeTaskMutation = useCompleteTaskWithRecurrence()

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId)
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
      <Stack gap="md" pt="sm">
        <TaskDashboardHeader title="Task Dashboard" onNewTask={() => navigate('/tasks/create')} />
        <TaskStatsGrid tasks={tasks} />
        <UpcomingTasksCard tasks={upcomingTasks} onCompleteTask={handleCompleteTask} />
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

