import { Box, Button, Stack, Text, Loader, Center, Tabs, Group, Badge, Collapse, ThemeIcon, UnstyledButton } from '@mantine/core'
import { IconListCheck, IconClockHour4, IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { useTaskStore } from '../hooks/useTaskStore'
import { useParentTasks, useChildTasks } from '../hooks/useTaskQueries'
import { TaskCard } from '../../components/TaskCard'
import { CreateTaskModal } from '../../components/CreateTaskModal'
import { SubtaskModal } from '../../components/SubtaskModal'
import { TaskDashboardHeader } from '../components/TaskDashboardHeader'
import { TaskEmptyState } from '../components/TaskEmptyState'
import { useNavigate } from 'react-router-dom'
import { Task } from '../../../../core/database/models'
import { useState, useMemo } from 'react'

type GroupByOption = 'priority' | 'status'

const ITEMS_PER_PAGE = 25

export function TaskGroupTasksScreen() {
  const navigate = useNavigate()
  const { openCreateModal, expandedTaskIds, toggleExpandedTask, setSelectedTaskId, openSubtaskModal } = useTaskStore()
  const { data: tasks = [], isLoading } = useParentTasks()
  const [selectedParentTask, setSelectedParentTask] = useState<{ id: string; title: string; level: number } | null>(null)
  const [groupBy, setGroupBy] = useState<GroupByOption>('priority')
  const [displayedCount, setDisplayedCount] = useState<number>(ITEMS_PER_PAGE)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Critical: true,
    High: true,
    Medium: true,
    Low: true,
    InProgress: true,
    Pending: true,
    Completed: true,
    Cancelled: true,
  })

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
    setDisplayedCount((prev) => prev + ITEMS_PER_PAGE)
  }

  const resetDisplayedCount = () => {
    setDisplayedCount(ITEMS_PER_PAGE)
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
        Critical: tasks.filter((t: Task) => t.priority === 'Critical'),
        High: tasks.filter((t: Task) => t.priority === 'High'),
        Medium: tasks.filter((t: Task) => t.priority === 'Medium'),
        Low: tasks.filter((t: Task) => t.priority === 'Low'),
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
        Critical: true,
        High: true,
        Medium: true,
        Low: true,
        InProgress: false,
        Pending: false,
        Completed: false,
        Cancelled: false,
      })
    } else if (value === 'status') {
      setExpandedGroups({
        Critical: false,
        High: false,
        Medium: false,
        Low: false,
        InProgress: true,
        Pending: true,
        Completed: true,
        Cancelled: true,
      })
    }
  }

  const getGroupColor = (key: string): string => {
    const priorityColors: Record<string, string> = {
      Critical: 'red',
      High: 'orange',
      Medium: 'yellow',
      Low: 'blue',
    }
    const statusColors: Record<string, string> = {
      InProgress: 'orange',
      Pending: 'gray',
      Completed: 'green',
      Cancelled: 'dimmed',
    }
    return groupBy === 'priority' ? priorityColors[key] || 'gray' : statusColors[key] || 'gray'
  }

  const getGroupLabel = (key: string): string => {
    const priorityLabels: Record<string, string> = {
      Critical: '🔴 Critical',
      High: '🟠 High',
      Medium: '🟡 Medium',
      Low: '🔵 Low',
    }
    const statusLabels: Record<string, string> = {
      InProgress: '🔄 In Progress',
      Pending: '⏳ Pending',
      Completed: '✅ Completed',
      Cancelled: '❌ Cancelled',
    }
    return groupBy === 'priority' ? priorityLabels[key] || key : statusLabels[key] || key
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
        <TaskDashboardHeader title="Group Tasks" onNewTask={openCreateModal} />

        {tasks.length === 0 ? (
          <TaskEmptyState onCreate={openCreateModal} />
        ) : (
          <Stack gap="md" pt="sm">
            <Tabs value={groupBy} onChange={(value) => handleGroupByChange(value as GroupByOption)} variant="outline">
              <Tabs.List grow>
                <Tabs.Tab value="priority" leftSection={<IconListCheck size={16} />}>
                  Priority Group
                </Tabs.Tab>
                <Tabs.Tab value="status" leftSection={<IconClockHour4 size={16} />}>
                  Status Group
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            {Object.entries(groupedTasks).map(([key, groupTasks]) =>
              groupTasks.length > 0 && (
                <Stack key={key} gap="xs">
                  <UnstyledButton onClick={() => toggleGroup(key)}>
                    <Group gap="xs" justify="space-between" p="xs" style={{ borderRadius: 'var(--mantine-radius-md)' }} bg={`var(--mantine-color-${getGroupColor(key)}-light)`}>
                      <Group gap="xs">
                        <ThemeIcon
                          variant="light"
                          color={getGroupColor(key)}
                          size="sm"
                          radius="xl"
                        >
                          {expandedGroups[key] ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                        </ThemeIcon>
                        <Text fw={700} size="md">{getGroupLabel(key)}</Text>
                      </Group>
                      <Badge variant="light" color={getGroupColor(key)} size="sm">
                        {Math.min(displayedCount, groupTasks.length)} of {groupTasks.length}
                      </Badge>
                    </Group>
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

      <CreateTaskModal />
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


