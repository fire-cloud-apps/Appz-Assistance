/**
 * Route: /tasks/groups
 * Ref: routes/index.tsx
 */
import React from 'react'
import { Box, Button, Stack, Text, Loader, Center, Tabs, Group, Badge, Collapse, ThemeIcon, UnstyledButton, Tooltip, ActionIcon, Paper, rem } from '@mantine/core'
import { useTaskStore } from '../hooks/useTaskStore'
import { useParentTasks, useChildTasks } from '../hooks/useTaskQueries'
import { TaskCard } from '../../components/TaskCard'
import { SubtaskModal } from '../../components/SubtaskModal'
import { TaskDashboardHeader } from '../components/TaskDashboardHeader'
import { TaskEmptyState } from '../components/TaskEmptyState'
import { useNavigate } from 'react-router-dom'
import { Task } from '../../data/models'
import { useState, useMemo, useEffect } from 'react'
import { getTaskManagerItemsPerPage } from '../../../../core/services/userSettingsService'

type GroupByOption = 'priority' | 'status'

const ITEMS_PER_PAGE = 5
const INITIAL_DISPLAY_COUNT = 5

export function TaskGroupTasksScreen() {
  const navigate = useNavigate()
  const { expandedTaskIds, toggleExpandedTask, setSelectedTaskId, openSubtaskModal } = useTaskStore()
  const { data: tasks = [], isLoading } = useParentTasks()
  const [selectedParentTask, setSelectedParentTask] = useState<{ id: string; title: string; level: number } | null>(null)
  const [groupBy, setGroupBy] = useState<GroupByOption>('priority')
  const [itemsPerPage, setItemsPerPage] = useState<number>(ITEMS_PER_PAGE)
  const [displayedCount, setDisplayedCount] = useState<number>(INITIAL_DISPLAY_COUNT)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Critical: false,
    High: false,
    Medium: false,
    Low: false,
    Cancelled: false,
    InProgress: false,
    Pending: false,
    Completed: false,
  })

  // Load user settings for items per page
  useEffect(() => {
    const items = getTaskManagerItemsPerPage()
    setItemsPerPage(items)
    setDisplayedCount(items)
  }, [])

  const handleTaskSelect = (taskId: string) => {
    if (!taskId || taskId.trim() === '') return
    setSelectedTaskId(taskId)
    navigate(`/task/${taskId}`)
  }

  const handleAddSubtask = (task: Task) => {
    setSelectedParentTask({ id: task.id, title: task.title, level: task.taskLevel })
    openSubtaskModal()
  }

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + itemsPerPage)
  }

  const resetDisplayedCount = () => {
    setDisplayedCount(itemsPerPage)
  }

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }))
  }

  const groupedTasks = useMemo(() => {
    if (groupBy === 'priority') {
      return {
        Critical: tasks.filter((t: Task) => t.priority === 'Critical' && t.status !== 'Cancelled'),
        High: tasks.filter((t: Task) => t.priority === 'High' && t.status !== 'Cancelled'),
        Medium: tasks.filter((t: Task) => t.priority === 'Medium' && t.status !== 'Cancelled'),
        Low: tasks.filter((t: Task) => t.priority === 'Low' && t.status !== 'Cancelled'),
        Cancelled: tasks.filter((t: Task) => t.status === 'Cancelled'),
      }
    }
    return {
      InProgress: tasks.filter((t: Task) => t.status === 'InProgress'),
      Pending: tasks.filter((t: Task) => t.status === 'Pending'),
      Completed: tasks.filter((t: Task) => t.status === 'Completed'),
      Cancelled: tasks.filter((t: Task) => t.status === 'Cancelled'),
    }
  }, [tasks, groupBy])

  const handleGroupByChange = (value: GroupByOption) => {
    resetDisplayedCount()
    setGroupBy(value)
    if (value === 'priority') {
      setExpandedGroups({
        Critical: false,
        High: false,
        Medium: false,
        Low: false,
        Cancelled: false,
        InProgress: false,
        Pending: false,
        Completed: false,
      })
    } else if (value === 'status') {
      setExpandedGroups({
        Critical: false,
        High: false,
        Medium: false,
        Low: false,
        Cancelled: false,
        InProgress: false,
        Pending: false,
        Completed: false,
      })
    }
  }

  const getGroupColor = (key: string): string => {
    const priorityColors: Record<string, string> = {
      Critical: 'red',
      High: 'orange',
      Medium: 'yellow',
      Low: 'blue',
      Cancelled: 'red',
    }
    const statusColors: Record<string, string> = {
      InProgress: 'orange',
      Pending: 'blue',
      Completed: 'green',
      Cancelled: 'red',
    }
    return groupBy === 'priority' ? priorityColors[key] || 'gray' : statusColors[key] || 'gray'
  }

  const getGroupLabel = (key: string): string => {
    const priorityLabels: Record<string, string> = {
      Critical: 'Critical Priority',
      High: 'High Priority',
      Medium: 'Medium Priority',
      Low: 'Low Priority',
      Cancelled: 'Cancelled',
    }
    const statusLabels: Record<string, string> = {
      InProgress: 'In Progress',
      Pending: 'Pending',
      Completed: 'Completed',
      Cancelled: 'Cancelled',
    }
    return groupBy === 'priority' ? priorityLabels[key] || key : statusLabels[key] || key
  }

  const getGroupIcon = (key: string) => {
    const priorityIcons: Record<string, React.ReactNode> = {
      Critical: <iconify-icon icon="lucide:target" width="18" height="18" />,
      High: <iconify-icon icon="lucide:target" width="18" height="18" />,
      Medium: <iconify-icon icon="lucide:target" width="18" height="18" />,
      Low: <iconify-icon icon="lucide:target" width="18" height="18" />,
      Cancelled: <iconify-icon icon="lucide:circle-check" width="18" height="18" />,
    }
    const statusIcons: Record<string, React.ReactNode> = {
      InProgress: <iconify-icon icon="lucide:clock" width="18" height="18" />,
      Pending: <iconify-icon icon="lucide:clock" width="18" height="18" />,
      Completed: <iconify-icon icon="lucide:circle-check" width="18" height="18" />,
      Cancelled: <iconify-icon icon="lucide:circle-check" width="18" height="18" />,
    }
    return groupBy === 'priority' ? priorityIcons[key] || <iconify-icon icon="lucide:target" width="18" height="18" /> : statusIcons[key] || <iconify-icon icon="lucide:clock" width="18" height="18" />
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
        <TaskDashboardHeader title="Group Tasks" onNewTask={() => navigate('/tasks/create')} />

        {tasks.length === 0 ? (
          <TaskEmptyState onCreate={() => navigate('/tasks/create')} />
        ) : (
          <Stack gap="md" pt="sm">
            <Tabs value={groupBy} onChange={(value) => handleGroupByChange(value as GroupByOption)} variant="pills">
              <Tabs.List grow mb="md">
                <Tabs.Tab value="priority" leftSection={<iconify-icon icon="lucide:target" width="18" height="18" />}>
                  Priority Group
                </Tabs.Tab>
                <Tabs.Tab value="status" leftSection={<iconify-icon icon="lucide:clock" width="18" height="18" />}>
                  Status Group
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            {Object.entries(groupedTasks).map(([key, groupTasks]) =>
              groupTasks.length > 0 && (
                <Stack key={key} gap="xs">
                  <UnstyledButton onClick={() => toggleGroup(key)}>
                    <Paper
                      p="sm"
                      radius="md"
                      bg={`var(--mantine-color-${getGroupColor(key)}-light)`}
                      style={{
                        border: `1px solid var(--mantine-color-${getGroupColor(key)}-light)`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Group gap="md" justify="space-between" wrap="nowrap">
                        <Group gap="md" wrap="nowrap">
                          <ThemeIcon
                            variant="light"
                            color={getGroupColor(key)}
                            size="lg"
                            radius="md"
                          >
                            {getGroupIcon(key)}
                          </ThemeIcon>
                          <Stack gap={2}>
                            <Text fw={700} size="md" c={`var(--mantine-color-${getGroupColor(key)}-filled)`}>
                              {getGroupLabel(key)}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {groupBy === 'priority'
                                ? key === 'Cancelled'
                                  ? 'All cancelled tasks'
                                  : `${key === 'Critical' ? 'Urgent' : key === 'High' ? 'Important' : key === 'Medium' ? 'Normal' : 'Routine'} priority tasks`
                                : key === 'InProgress'
                                  ? 'Tasks currently being worked on'
                                  : key === 'Pending'
                                    ? 'Tasks waiting to be started'
                                    : key === 'Completed'
                                      ? 'Successfully finished tasks'
                                      : 'Tasks that were cancelled'
                              }
                            </Text>
                          </Stack>
                        </Group>
                        <Group gap="sm" wrap="nowrap">
                          <Badge
                            variant="filled"
                            color={getGroupColor(key)}
                            size="lg"
                            style={{ minWidth: rem(50) }}
                          >
                            {Math.min(displayedCount, groupTasks.length)} / {groupTasks.length}
                          </Badge>
                          <ThemeIcon
                            variant="transparent"
                            color={getGroupColor(key)}
                            size="sm"
                          >
                            {expandedGroups[key] ? <iconify-icon icon="lucide:chevron-down" width="20" height="20" /> : <iconify-icon icon="lucide:chevron-right" width="20" height="20" />}
                          </ThemeIcon>
                        </Group>
                      </Group>
                    </Paper>
                  </UnstyledButton>

                  <Collapse in={expandedGroups[key]}>
                    <Stack gap="sm">
                      {groupTasks.slice(0, displayedCount).map((task: Task) => (
                        <TaskCardWithChildCount
                          key={task.id}
                          task={task}
                          expandedTaskIds={expandedTaskIds}
                          toggleExpandedTask={toggleExpandedTask}
                          handleTaskSelect={handleTaskSelect}
                          onAddSubtask={handleAddSubtask}
                        />
                      ))}
                      {displayedCount < groupTasks.length && (
                        <Button
                          onClick={handleLoadMore}
                          variant="outline"
                          size="sm"
                          fullWidth
                        >
                          Load More ({groupTasks.length - displayedCount} remaining)
                        </Button>
                      )}
                    </Stack>
                  </Collapse>
                </Stack>
              )
            )}
          </Stack>
        )}
      </Stack>

      {/* FAB Button for Mobile */}
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
          <iconify-icon icon="lucide:plus" width="28" height="28" />
        </ActionIcon>
      </Tooltip>

      <SubtaskModal
        parentTaskId={selectedParentTask?.id || ''}
        parentTaskTitle={selectedParentTask?.title || ''}
        parentTaskLevel={selectedParentTask?.level || 1}
      />
    </Box>
  )
}

function TaskCardWithChildCount({ 
  task, 
  expandedTaskIds, 
  toggleExpandedTask, 
  handleTaskSelect,
  onAddSubtask
}: { 
  task: Task
  expandedTaskIds: string[]
  toggleExpandedTask: (id: string) => void
  handleTaskSelect: (taskId: string) => void
  onAddSubtask: (task: Task) => void
}) {
  const { data: childTasks = [] } = useChildTasks(task.id)
  
  return (
    <TaskCard
      task={task}
      showExpand
      isExpanded={expandedTaskIds.includes(task.id)}
      onToggle={() => toggleExpandedTask(task.id)}
      onSelect={() => handleTaskSelect(task.id)}
      childTasksCount={childTasks.length}
      onAddSubtask={() => onAddSubtask(task)}
    />
  )
}


