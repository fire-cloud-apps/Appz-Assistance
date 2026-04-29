/**
 * Route: /tasks/all
 * Ref: routes/index.tsx
 */
import { Box, Button, Stack, Text, Loader, Center, Group, Badge, Paper, ThemeIcon, UnstyledButton, Divider, Tooltip, ActionIcon, Checkbox, TextInput, SegmentedControl, Transition } from '@mantine/core'
import { MiniCalendar } from '@mantine/dates'
import { useTaskStore } from '../hooks/useTaskStore'
import { useParentTasksPaged, useUpdateTask, useSearchTasksPaged, useCompleteTaskWithRecurrence, useParentTasks } from '../hooks/useTaskQueries'
import { TaskDashboardHeader } from '../components/TaskDashboardHeader'
import { TaskEmptyState } from '../components/TaskEmptyState'
import { StatusIcon } from '../../../../core/components/StatusIcon'
import { formatDateTime } from '../../../../core/utils/dateHelper'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Task } from '../../data/models'
import { useState, useEffect, useMemo } from 'react'
import { getTaskManagerItemsPerPage, getPrimaryColor } from '../../../../core/services/userSettingsService'
import dayjs from 'dayjs'
import { useMediaQuery } from '@mantine/hooks'

const ITEMS_PER_PAGE = 5

type StatusMeta = {
  label: string
  color: string
  icon: string
}

type PriorityMeta = {
  label: string
  color: string
}

export function TaskAllTasksScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setSelectedTaskId } = useTaskStore()
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(ITEMS_PER_PAGE)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('')
  const [isPagingDisabled, setIsPagingDisabled] = useState<boolean>(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(() => dayjs().format('YYYY-MM-DD'))
  const [showTaskTransition, setShowTaskTransition] = useState(true)
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [calendarDate, setCalendarDate] = useState<string>(() => dayjs().startOf('month').format('YYYY-MM-DD'))
  
  // Get status filter from query params
  const statusFilter = searchParams.get('status') || 'all'

  // Load user settings for items per page
  useEffect(() => {
    const items = getTaskManagerItemsPerPage()
    setItemsPerPage(items)
  }, [])

  // Use search or parent tasks based on search term
  const searchQuery = useSearchTasksPaged(debouncedSearchTerm, currentPage, itemsPerPage)
  const parentQuery = useParentTasksPaged(currentPage, itemsPerPage)
  const allParentTasksQuery = useParentTasks()

  const { data, isLoading } = debouncedSearchTerm.trim() ? searchQuery : parentQuery
  const allParentTasks = allParentTasksQuery.data ?? []
  const updateTask = useUpdateTask()
  const completeTaskMutation = useCompleteTaskWithRecurrence()
  const [totalTasks, setTotalTasks] = useState<number>(0)

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), [])

  const calendarDaysToShow = useMemo(() => {
    if (isMobile) return 7
    // Always use the days of the month that calendarDate belongs to.
    // calendarDate is always pinned to the 1st of the month (desktop),
    // so daysInMonth() is always correct.
    return dayjs(calendarDate).startOf('month').daysInMonth()
  }, [isMobile, calendarDate])

  const rangeLabel = isMobile
    ? `Week of ${dayjs(calendarDate).format('DD MMM')}`
    : dayjs(calendarDate).startOf('month').format('MMMM YYYY')

  const handleCalendarNext = () => {
    if (isMobile) {
      setCalendarDate((prev) => dayjs(prev).add(7, 'day').format('YYYY-MM-DD'))
    } else {
      setCalendarDate((prev) => dayjs(prev).startOf('month').add(1, 'month').format('YYYY-MM-DD'))
    }
  }

  const handleCalendarPrevious = () => {
    if (isMobile) {
      setCalendarDate((prev) => dayjs(prev).subtract(7, 'day').format('YYYY-MM-DD'))
    } else {
      setCalendarDate((prev) => dayjs(prev).startOf('month').subtract(1, 'month').format('YYYY-MM-DD'))
    }
  }

  useEffect(() => {
    const now = dayjs()
    if (isMobile) {
      const weekday = now.day()
      const monday = weekday === 0 ? now.subtract(6, 'day') : now.subtract(weekday - 1, 'day')
      setCalendarDate(monday.format('YYYY-MM-DD'))
      return
    }

    setCalendarDate(now.startOf('month').format('YYYY-MM-DD'))
  }, [isMobile])

  // Desktop: always span the full calendar month from its 1st to last day.
  // Mobile: span Mon to Sun of the current week.
  const rangeStart = useMemo(
    () => isMobile ? calendarDate : dayjs(calendarDate).startOf('month').format('YYYY-MM-DD'),
    [isMobile, calendarDate]
  )
  const rangeEnd = useMemo(
    () => isMobile
      ? dayjs(calendarDate).add(6, 'day').format('YYYY-MM-DD')
      : dayjs(calendarDate).endOf('month').format('YYYY-MM-DD'),
    [isMobile, calendarDate]
  )

  useEffect(() => {
    if (!selectedCalendarDate) {
      setSelectedCalendarDate(today)
    }
  }, [selectedCalendarDate, today])

  // Debounce search term
  useEffect(() => {
    setIsPagingDisabled(true)
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page on search
      setIsPagingDisabled(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Trigger transition animation when calendar date changes
  useEffect(() => {
    setShowTaskTransition(false)
    const timer = setTimeout(() => setShowTaskTransition(true), 50)
    return () => clearTimeout(timer)
  }, [selectedCalendarDate])

  const handleTaskSelect = (taskId: string) => {
    if (!taskId || taskId.trim() === '') return
    setSelectedTaskId(taskId)
    navigate(`/task/${taskId}`)
  }

  const handleToggleComplete = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // For recurring tasks, use the recurrence-aware completion handler
    if (task.isRecurring) {
      console.log('🔄 Completing recurring task:', { taskId: task.id, title: task.title })
      completeTaskMutation.mutate(task.id)
    } else if (task.status === 'Completed') {
      // If uncompleting a task, use regular update
      await updateTask.mutateAsync({
        ...task,
        status: 'Pending',
      })
    } else {
      // For non-recurring tasks being completed, also use the handler (it handles all cases)
      completeTaskMutation.mutate(task.id)
    }
  }

  const tasks = data?.items ?? []

  // Filter tasks by status if status filter is applied
  const filteredTasks = statusFilter === 'all' 
    ? tasks 
    : tasks.filter((task) => task.status === statusFilter)

  const calendarRangeTasks = useMemo(
    () => allParentTasks.filter((task) => task.dueDate && task.dueDate >= rangeStart && task.dueDate <= rangeEnd),
    [allParentTasks, rangeStart, rangeEnd]
  )

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, number> = {}
    calendarRangeTasks.forEach((task) => {
      if (!task.dueDate) return
      grouped[task.dueDate] = (grouped[task.dueDate] ?? 0) + 1
    })
    return grouped
  }, [calendarRangeTasks])

  const overdueTasksByDate = useMemo(() => {
    const grouped: Record<string, number> = {}
    allParentTasks.forEach((task) => {
      if (!task.dueDate) return
      if (task.dueDate >= today) return
      if (task.status === 'Completed' || task.status === 'Cancelled') return
      grouped[task.dueDate] = (grouped[task.dueDate] ?? 0) + 1
    })
    return grouped
  }, [allParentTasks, today])

  const completedTasksByDate = useMemo(() => {
    const grouped: Record<string, boolean> = {}
    allParentTasks.forEach((task) => {
      if (!task.dueDate) return
      if (task.status !== 'Completed') return
      grouped[task.dueDate] = true
    })
    return grouped
  }, [allParentTasks])

  const accentColor = useMemo(() => getPrimaryColor(), [])

  const calendarBaseTasks = useMemo(() => {
    if (!selectedCalendarDate) return []
    return allParentTasks.filter((task) => task.dueDate === selectedCalendarDate)
  }, [allParentTasks, selectedCalendarDate])

  const calendarStatusFilteredTasks = statusFilter === 'all'
    ? calendarBaseTasks
    : calendarBaseTasks.filter((task) => task.status === statusFilter)

  const calendarFilteredTasks = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase().trim()
    if (!term) return calendarStatusFilteredTasks

    return calendarStatusFilteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term))
    )
  }, [calendarStatusFilteredTasks, debouncedSearchTerm])

  const totalPages = Math.max(1, Math.ceil(totalTasks / ITEMS_PER_PAGE))

  useEffect(() => {
    if (typeof data?.total === 'number') {
      setTotalTasks(data.total)
    }
  }, [data?.total])

  useEffect(() => {
    if (totalTasks > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages, totalTasks])

  const handleNextPage = () => {
    if (!isPagingDisabled) {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }
  }

  const handlePrevPage = () => {
    if (!isPagingDisabled) {
      setCurrentPage((prev) => Math.max(prev - 1, 1))
    }
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

  if ((viewMode === 'list' && isLoading) || (viewMode === 'calendar' && allParentTasksQuery.isLoading)) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  return (
    <Box style={{ position: 'relative', minHeight: '100%' }}>
      <Stack gap="md">
        <TaskDashboardHeader title="All Tasks" onNewTask={() => navigate('/tasks/create')} />

        <SegmentedControl
          value={viewMode}
          onChange={(value) => setViewMode(value as 'list' | 'calendar')}
          data={[
            { label: 'Calendar View', value: 'calendar' },
            { label: 'List View', value: 'list' },
          ]}
          fullWidth
          radius="md"
          size="md"
        />

        {/* Status Filter Indicator */}
        {statusFilter !== 'all' && (
          <Group gap="xs">
            <Badge 
              color={getStatusMeta(statusFilter as any).color} 
              variant="filled"
              size="md"
              leftSection={<StatusIcon icon={getStatusMeta(statusFilter as any).icon} size={14} />}
            >
              {getStatusMeta(statusFilter as any).label}
            </Badge>
            <Button
              variant="subtle"
              size="compact-sm"
              color="gray"
              onClick={() => navigate('/tasks/all')}
              leftSection={<iconify-icon icon="lucide:x" width={14} height={14} />}
            >
              Clear filter
            </Button>
          </Group>
        )}

        <TextInput
          placeholder="Search by title or description..."
          leftSection={<iconify-icon icon="lucide:search" width={16} height={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          size="md"
          radius="md"
          style={{ width: '100%' }}
          mt="sm"
        />

        {viewMode === 'calendar' ? (
          <Stack gap="md">
            <Paper
              withBorder
              radius="md"
              p="md"
            >
              <Stack gap="sm">
                <Group justify="space-between" align="center" wrap="wrap">
                  <Box>
                    <Text fw={700} size="sm">Mini Calendar</Text>
                    <Text size="xs" c="dimmed">{rangeLabel}. Today is selected by default.</Text>
                  </Box>
                  <Badge variant="filled" color="teal" size="md">
                    {calendarRangeTasks.length} due in range
                  </Badge>
                </Group>

                <MiniCalendar
                  value={selectedCalendarDate}
                  onChange={setSelectedCalendarDate}
                  date={rangeStart}
                  numberOfDays={calendarDaysToShow}
                  onNext={handleCalendarNext}
                  onPrevious={handleCalendarPrevious}
                  previousControlProps={{ 'aria-label': 'Previous date range' }}
                  nextControlProps={{ 'aria-label': 'Next date range' }}
                  getDayProps={(date) => {
                    const dateKey = dayjs(date).format('YYYY-MM-DD')
                    const hasOverdueTasks = (overdueTasksByDate[dateKey] ?? 0) > 0
                    const isAllCompleted = completedTasksByDate[dateKey] && (overdueTasksByDate[dateKey] ?? 0) === 0
                    const hasTasks = (tasksByDate[dateKey] ?? 0) > 0

                    if (hasOverdueTasks) {
                      return {
                        style: {
                          borderBottom: '2px solid var(--mantine-color-red-5)',
                        },
                      }
                    }

                    if (isAllCompleted) {
                      return {
                        style: {
                          borderBottom: '2px solid var(--mantine-color-green-5)',
                        },
                      }
                    }

                    if (hasTasks) {
                      return {
                        style: {
                          borderBottom: `2px solid var(--mantine-color-${accentColor}-5)`,
                        },
                      }
                    }

                    return {}
                  }}
                />
                <Group gap="xs" wrap="wrap" mt={4}>
                  <Group gap={4}><Box w={10} h={10} style={{ borderRadius: 3, background: 'var(--mantine-color-red-light)', border: '1px solid var(--mantine-color-red-6)' }} /><Text size="xs" c="dimmed">Overdue</Text></Group>
                  <Group gap={4}><Box w={10} h={10} style={{ borderRadius: 3, background: 'var(--mantine-color-green-light)', border: '1px solid var(--mantine-color-green-6)' }} /><Text size="xs" c="dimmed">Completed</Text></Group>
                  <Group gap={4}><Box w={10} h={10} style={{ borderRadius: 3, background: `var(--mantine-color-${accentColor}-light)`, border: `1px solid var(--mantine-color-${accentColor}-5)` }} /><Text size="xs" c="dimmed">Has tasks</Text></Group>
                </Group>
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="md">
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Text fw={700} size="sm">
                    {selectedCalendarDate
                      ? `Due on ${dayjs(selectedCalendarDate).format('ddd, DD MMM YYYY')}`
                      : 'Due Tasks'}
                  </Text>
                  <Badge variant="light" color="blue" size="sm">
                    {calendarFilteredTasks.length}
                  </Badge>
                </Group>
                <Divider size="sm" />

                {calendarFilteredTasks.length === 0 ? (
                  <Transition
                    mounted={showTaskTransition}
                    transition="fade"
                    duration={300}
                    timingFunction="ease"
                  >
                    {(styles) => (
                      <div style={styles}>
                        <TaskEmptyState
                          title="No tasks due on selected day"
                          description="Try another day in the current week or create a new task with this due date."
                          onCreate={() => navigate('/tasks/create')}
                        />
                      </div>
                    )}
                  </Transition>
                ) : (
                  <Transition
                    mounted={showTaskTransition}
                    transition="fade"
                    duration={400}
                    timingFunction="ease-out"
                  >
                    {(styles) => (
                      <Stack gap="xs" style={styles}>
                        {calendarFilteredTasks.map((task: Task) => {
                      const statusMeta = getStatusMeta(task.status)
                      const priorityMeta = getPriorityMeta(task.priority)
                      const borderLeftColor = task.status === 'Pending' ? 'yellow' : statusMeta.color
                      return (
                        <UnstyledButton
                          key={task.id}
                          onClick={() => handleTaskSelect(task.id)}
                          style={{ width: '100%' }}
                        >
                          <Paper
                            radius="md"
                            p="md"
                            style={{
                              position: 'relative',
                              overflow: 'hidden',
                              border: '1px solid var(--mantine-color-default-border)',
                              borderLeft: `4px solid var(--mantine-color-${borderLeftColor}-filled)`,
                              background: 'var(--mantine-color-default)',
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
                              <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                                <Checkbox
                                  checked={task.status === 'Completed'}
                                  onChange={() => {}}
                                  onClick={(e) => handleToggleComplete(task, e)}
                                  size="md"
                                  color="green"
                                  aria-label="Toggle task completion"
                                />
                                <ThemeIcon variant="light" color={statusMeta.color} radius="xl" size="lg">
                                  <StatusIcon icon={statusMeta.icon} size={18} />
                                </ThemeIcon>
                                <Box style={{ minWidth: 0 }}>
                                  <Text fw={600} size="sm" lineClamp={1}>{task.title}</Text>
                                  {task.description && (
                                    <Text size="xs" c="dimmed" lineClamp={1}>
                                      {task.description}
                                    </Text>
                                  )}
                                </Box>
                              </Group>

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
                              <Text size="xs" c="dimmed">
                                Due: {task.dueDate || 'Not set'}
                              </Text>
                              <Group gap="xs">
                                {task.isRecurring && task.recurrencePattern && (
                                  <Group gap="xs">
                                    <iconify-icon icon="lucide:repeat" width={14} height={14} color="pink" />
                                    <Text size="xs" c="pink">Repeats</Text>
                                  </Group>
                                )}
                                <Text size="xs" c="dimmed">
                                  Updated: {formatDateTime(task.updatedAt)}
                                </Text>
                              </Group>
                            </Group>
                          </Paper>
                        </UnstyledButton>
                      )
                    })}
                      </Stack>
                    )}
                  </Transition>
                )}
              </Stack>
            </Paper>
          </Stack>
        ) : filteredTasks.length === 0 ? (
          searchTerm.trim() ? (
            <TaskEmptyState
              title="No matching tasks found"
              description={`No tasks found matching "${searchTerm}"`}
              onCreate={() => navigate('/tasks/create')}
            />
          ) : (
            <TaskEmptyState 
              title={statusFilter !== 'all' ? `No ${getStatusMeta(statusFilter as any).label} tasks` : 'No tasks'}
              description={statusFilter !== 'all' ? `No tasks found with status "${getStatusMeta(statusFilter as any).label}"` : undefined}
              onCreate={() => navigate('/tasks/create')} 
            />
          )
        ) : (
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text fw={700} size="md">
                {debouncedSearchTerm.trim() ? 'Search Results' : statusFilter !== 'all' ? `${getStatusMeta(statusFilter as any).label} Tasks` : 'All Tasks'}
              </Text>
              <Badge variant="light" color="blue" size="sm">
                {Math.min(currentPage * itemsPerPage, totalTasks)} of {totalTasks}
              </Badge>
            </Group>

            <Divider size="sm" />

            <Stack gap="xs">
              {filteredTasks.map((task: Task) => {
                const statusMeta = getStatusMeta(task.status)
                const priorityMeta = getPriorityMeta(task.priority)
                const borderLeftColor = task.status === 'Pending' ? 'yellow' : statusMeta.color
                return (
                  <UnstyledButton
                    key={task.id}
                    onClick={() => handleTaskSelect(task.id)}
                    style={{ width: '100%' }}
                  >
                    <Paper
                      radius="md"
                      p="md"
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid var(--mantine-color-default-border)',
                        borderLeft: `4px solid var(--mantine-color-${borderLeftColor}-filled)`,
                        background: 'var(--mantine-color-default)',
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
                        <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                          <Checkbox
                            checked={task.status === 'Completed'}
                            onChange={() => {}}
                            onClick={(e) => handleToggleComplete(task, e)}
                            size="md"
                            color="green"
                            aria-label="Toggle task completion"
                          />
                          <ThemeIcon variant="light" color={statusMeta.color} radius="xl" size="lg">
                            <StatusIcon icon={statusMeta.icon} size={18} />
                          </ThemeIcon>
                          <Box style={{ minWidth: 0 }}>
                            <Text fw={600} size="sm" lineClamp={1}>{task.title}</Text>
                            {task.description && (
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                {task.description}
                              </Text>
                            )}
                          </Box>
                        </Group>

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
                        <Text size="xs" c="dimmed">
                          Due: {task.dueDate || 'Not set'}
                        </Text>
                        <Group gap="xs">
                          {task.isRecurring && task.recurrencePattern && (
                            <Group gap="xs">
                              <iconify-icon icon="lucide:repeat" width={14} height={14} color="pink" />
                              <Text size="xs" c="pink">Repeats</Text>
                            </Group>
                          )}
                          <Text size="xs" c="dimmed">
                            Updated: {formatDateTime(task.updatedAt)}
                          </Text>
                        </Group>
                      </Group>
                    </Paper>
                  </UnstyledButton>
                )
              })}
            </Stack>

            <Group justify="space-between" align="center" mt="xs">
              <Button
                onClick={handlePrevPage}
                variant="outline"
                size="md"
                disabled={currentPage === 1 || isLoading}
                leftSection={<StatusIcon icon="lucide:chevron-left" size={16} />}
              >
                Prev
              </Button>
              <Button
                onClick={handleNextPage}
                variant="outline"
                size="md"
                disabled={currentPage === totalPages || isLoading}
                rightSection={<StatusIcon icon="lucide:chevron-right" size={16} />}
              >
                Next
              </Button>
            </Group>
          </Stack>
        )}
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
          <iconify-icon icon="lucide:plus" width={28} height={28} />
        </ActionIcon>
      </Tooltip>
    </Box>
  )
}
