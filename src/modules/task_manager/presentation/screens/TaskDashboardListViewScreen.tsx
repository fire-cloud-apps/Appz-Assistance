import { Box, Button, Stack, Text, Loader, Center, Group, Badge, Table } from '@mantine/core'
import { IconRepeat } from '@tabler/icons-react'
import { useTaskStore } from '../hooks/useTaskStore'
import { useParentTasks } from '../hooks/useTaskQueries'
import { TaskDashboardHeader } from '../components/TaskDashboardHeader'
import { TaskStatsGrid } from '../components/TaskStatsGrid'
import { TaskEmptyState } from '../components/TaskEmptyState'
import { useNavigate } from 'react-router-dom'
import { Task } from '../../../../core/database/models'
import { useState } from 'react'

const ITEMS_PER_PAGE = 25 // Added this line

export function TaskDashboardListViewScreen() {
  const navigate = useNavigate()
  const { setSelectedTaskId } = useTaskStore()
  const { data: tasks = [], isLoading } = useParentTasks()
  const [displayedCount, setDisplayedCount] = useState<number>(ITEMS_PER_PAGE)

  const handleTaskSelect = (taskId: string) => {
    if (!taskId || taskId.trim() === '') return
    setSelectedTaskId(taskId)
    navigate(`/task/${taskId}`)
  }

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + ITEMS_PER_PAGE)
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
      <Stack gap="md">
        <TaskDashboardHeader onNewTask={() => navigate('/tasks/create')} />
        <TaskStatsGrid tasks={tasks} />

        {tasks.length === 0 ? (
          <TaskEmptyState onCreate={() => navigate('/tasks/create')} />
        ) : (
          <Stack gap="sm">
            <Group gap="xs">
              <Text fw={700} size="md">All Tasks</Text>
              <Badge variant="light" color="blue" size="sm">
                {Math.min(displayedCount, tasks.length)} of {tasks.length}
              </Badge>
            </Group>

            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Priority</Table.Th>
                  <Table.Th>Due Date</Table.Th>
                  <Table.Th>Repeat</Table.Th>
                  <Table.Th>Updated</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {tasks.slice(0, displayedCount).map((task: Task) => (
                  <Table.Tr
                    key={task.id}
                    onClick={() => handleTaskSelect(task.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Table.Td>{task.title}</Table.Td>
                    <Table.Td>{task.status}</Table.Td>
                    <Table.Td>{task.priority}</Table.Td>
                    <Table.Td>{task.dueDate || '-'}</Table.Td>
                    <Table.Td>
                      {task.isRecurring && task.recurrencePattern ? (
                        <Group gap="xs">
                          <IconRepeat size={16} color="pink" />
                          <Text size="sm" c="pink">Yes</Text>
                        </Group>
                      ) : (
                        <Text size="sm" c="dimmed">No</Text>
                      )}
                    </Table.Td>
                    <Table.Td>{task.updatedAt}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {displayedCount < tasks.length && (
              <Button
                onClick={handleLoadMore}
                variant="outline"
                size="md"
                fullWidth
              >
                Load More ({tasks.length - displayedCount} remaining)
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
