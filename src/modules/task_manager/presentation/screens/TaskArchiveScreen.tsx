/**
 * Route: /tasks/archive
 * Archive Tasks Screen - View and manage archived tasks
 * Archived tasks can be restored or will auto-delete based on retention settings
 */

import { Box, Button, Stack, Text, Loader, Center, Group, Badge, Paper, Divider, Tooltip, ActionIcon } from '@mantine/core'
import { IconArrowLeft, IconTrash, IconArchive } from '@tabler/icons-react'
import { useTaskStore } from '../hooks/useTaskStore'
import { useNavigate } from 'react-router-dom'
import { Task } from '../../../../core/database/models'
import { useState, useEffect } from 'react'
import { getTaskManagerItemsPerPage, getArchiveRetentionDays } from '../../../../core/services/userSettingsService'
import { TaskRepository } from '../../data/repositories/taskRepository'
import { TaskDashboardHeader } from '../components/TaskDashboardHeader'
import { TaskEmptyState } from '../components/TaskEmptyState'
import { formatDateTime } from '../../../../core/utils/dateHelper'

type StatusMeta = {
  label: string
  color: string
  icon: string
}

type PriorityMeta = {
  label: string
  color: string
}

export function TaskArchiveScreen() {
  const navigate = useNavigate()
  const { setSelectedTaskId } = useTaskStore()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(5)
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([])
  const [totalArchived, setTotalArchived] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [retentionDays, setRetentionDays] = useState<number>(90)

  const taskRepository = new TaskRepository()

  // Load settings and archived tasks
  useEffect(() => {
    const items = getTaskManagerItemsPerPage()
    setItemsPerPage(items)
    setRetentionDays(getArchiveRetentionDays())
    loadArchivedTasks(1, items)
  }, [])

  const loadArchivedTasks = async (page: number, pageSize: number) => {
    try {
      setIsLoading(true)
      const result = await taskRepository.getArchivedTasksPaged(page, pageSize)
      setArchivedTasks(result.items)
      setTotalArchived(result.total)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to load archived tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskSelect = (taskId: string) => {
    if (!taskId || taskId.trim() === '') return
    setSelectedTaskId(taskId)
    navigate(`/task/${taskId}`)
  }

  const handleRestore = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await taskRepository.unarchiveTask(taskId)
      await loadArchivedTasks(currentPage, itemsPerPage)
    } catch (error) {
      console.error('Failed to restore task:', error)
    }
  }

  const handlePermanentDelete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Permanently delete this archived task? This cannot be undone.')) {
      return
    }
    try {
      await taskRepository.permanentlyDeleteTask(taskId)
      await loadArchivedTasks(currentPage, itemsPerPage)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const calculateDaysRemaining = (archivedAt?: string | null): number => {
    if (!archivedAt) return retentionDays
    const archivedDate = new Date(archivedAt)
    const now = new Date()
    const daysPassed = Math.floor((now.getTime() - archivedDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, retentionDays - daysPassed)
    return daysRemaining
  }

  const getStatusMeta = (status: Task['status']): StatusMeta => {
    switch (status) {
      case 'Completed':
        return { label: 'Completed', color: 'green', icon: 'lucide:check-circle' }
      case 'InProgress':
        return { label: 'In Progress', color: 'orange', icon: 'lucide:loader-circle' }
      case 'Cancelled':
        return { label: 'Cancelled', color: 'red', icon: 'lucide:x-circle' }
      default:
        return { label: 'Pending', color: 'gray', icon: 'lucide:clock' }
    }
  }

  const getPriorityMeta = (priority: Task['priority']): PriorityMeta => {
    switch (priority) {
      case 'Critical':
        return { label: 'Critical', color: 'red' }
      case 'High':
        return { label: 'High', color: 'orange' }
      case 'Medium':
        return { label: 'Medium', color: 'yellow' }
      default:
        return { label: 'Low', color: 'blue' }
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalArchived / itemsPerPage))

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      loadArchivedTasks(currentPage + 1, itemsPerPage)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      loadArchivedTasks(currentPage - 1, itemsPerPage)
    }
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  const handleNewTask = () => {
    navigate('/tasks/create')
  }

  const handleEmptyStateCreate = () => {
    navigate('/tasks/create')
  }

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <Stack gap="md">
        <TaskDashboardHeader title="Archive Tasks" onNewTask={handleNewTask} />

        {archivedTasks.length === 0 ? (
          <TaskEmptyState 
            title="No archived tasks" 
            description="Tasks you archive will appear here and can be restored within the retention period."
            onCreate={handleEmptyStateCreate}
          />
        ) : (
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text fw={700} size="md">
                Archived Tasks
              </Text>
              <Badge variant="light" color="blue" size="sm">
                {Math.min(currentPage * itemsPerPage, totalArchived)} of {totalArchived}
              </Badge>
            </Group>

            <Divider size="sm" />

            <Stack gap="xs">
              {archivedTasks.map((task: Task) => {
                const statusMeta = getStatusMeta(task.status)
                const priorityMeta = getPriorityMeta(task.priority)
                const borderLeftColor = task.status === 'Pending' ? 'yellow' : statusMeta.color
                const daysRemaining = calculateDaysRemaining(task.archivedAt)
                const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0

                return (
                  <Paper
                    key={task.id}
                    radius="md"
                    p="md"
                    onClick={() => handleTaskSelect(task.id)}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      border: '1px solid var(--mantine-color-default-border)',
                      borderLeft: `4px solid var(--mantine-color-${borderLeftColor}-filled)`,
                      background: 'var(--mantine-color-default)',
                      cursor: 'pointer',
                    }}
                  >
                      <Box
                        aria-hidden
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 0,
                          height: 0,
                          borderTop: `18px solid var(--mantine-color-${priorityMeta.color}-filled)`,
                          borderLeft: '18px solid transparent',
                        }}
                      />

                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Box style={{ minWidth: 0, flex: 1 }}>
                          <Group gap="xs" mb="xs">
                            <Text fw={600} size="sm" lineClamp={1}>{task.title}</Text>
                            <Badge variant="filled" color="orange" size="sm" leftSection={<IconArchive size={12} />}>
                              Archived
                            </Badge>
                          </Group>
                          {task.description && (
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {task.description}
                            </Text>
                          )}
                          <Text size="xs" c="dimmed" mt="xs">
                            Archived: {formatDateTime(task.archivedAt || '')}
                          </Text>
                        </Box>

                        <Group gap="xs" align="center" wrap="nowrap">
                          <Badge variant="light" color={statusMeta.color} size="sm">
                            {statusMeta.label}
                          </Badge>
                          <Badge variant="outline" color={priorityMeta.color} size="sm">
                            {priorityMeta.label}
                          </Badge>
                        </Group>
                      </Group>

                      <Divider my="xs" />

                      <Group justify="space-between" align="center" wrap="nowrap">
                        <Box>
                          <Text size="xs" fw={500} c={isExpiringSoon ? 'orange' : 'dimmed'}>
                            {daysRemaining === 0
                              ? 'Expiring today'
                              : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
                          </Text>
                        </Box>

                        <Group gap="xs">
                          <Tooltip label="Restore task">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              onClick={(e) => handleRestore(task.id, e)}
                              size="sm"
                            >
                              <IconArrowLeft size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Permanently delete">
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={(e) => handlePermanentDelete(task.id, e)}
                              size="sm"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>
                    </Paper>
                  )
              })}
            </Stack>

            {/* Pagination */}
            {totalPages > 1 && (
              <Group justify="center" gap="xs" mt="lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Text size="sm">
                  Page {currentPage} of {totalPages}
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </Group>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
