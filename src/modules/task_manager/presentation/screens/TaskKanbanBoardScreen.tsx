/**
 * Route: /tasks/kanban
 * Ref: routes/index.tsx
 */
import { Box, Stack, Text, Loader, Center, Group, Badge, ScrollArea, Paper } from '@mantine/core'
import { TaskDashboardHeader } from '../components/TaskDashboardHeader'
import { TaskEmptyState } from '../components/TaskEmptyState'
import { useParentTasks, useUpdateTask } from '../hooks/useTaskQueries'
import { useTaskStore } from '../hooks/useTaskStore'
import { useNavigate } from 'react-router-dom'
import { Task } from '../../data/models'
import { useMemo, useState, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  DragOverlay,
  defaultDropAnimation,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useChildTasks } from '../hooks/useTaskQueries'

type StatusKey = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled'

const STATUS_COLUMNS: { key: StatusKey; label: string; color: string }[] = [
  { key: 'Pending', label: 'Pending', color: 'gray' },
  { key: 'InProgress', label: 'In Progress', color: 'orange' },
  { key: 'Completed', label: 'Completed', color: 'green' },
  { key: 'Cancelled', label: 'Cancelled', color: 'red' },
]

export function TaskKanbanBoardScreen() {
  const navigate = useNavigate()
  const { setSelectedTaskId } = useTaskStore()
  const { data: tasks = [], isLoading } = useParentTasks()
  const updateTask = useUpdateTask()
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const scrollViewportRef = useRef<HTMLDivElement | null>(null)
  const dragMoveRafRef = useRef<number | null>(null)

  const tasksById = useMemo(() => {
    const map = new Map<string, Task>()
    tasks.forEach((task) => {
      map.set(task.id, task)
    })
    return map
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  )

  const handleTaskSelect = (taskId: string) => {
    if (!taskId || taskId.trim() === '') return
    setSelectedTaskId(taskId)
    navigate(`/task/${taskId}`)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string)
  }

  const handleDragMove = (event: DragMoveEvent) => {
    if (!scrollViewportRef.current) return
    const viewport = scrollViewportRef.current
    const rect = viewport.getBoundingClientRect()
    const pointerX = getClientX(event.activatorEvent)
    if (!pointerX) return

    const edgeThreshold = 60
    const maxSpeed = 18
    let delta = 0
    if (pointerX < rect.left + edgeThreshold) {
      const strength = Math.max(0, (rect.left + edgeThreshold - pointerX) / edgeThreshold)
      delta = -Math.ceil(strength * maxSpeed)
    } else if (pointerX > rect.right - edgeThreshold) {
      const strength = Math.max(0, (pointerX - (rect.right - edgeThreshold)) / edgeThreshold)
      delta = Math.ceil(strength * maxSpeed)
    }

    if (delta === 0) return
    if (dragMoveRafRef.current) {
      cancelAnimationFrame(dragMoveRafRef.current)
    }
    dragMoveRafRef.current = requestAnimationFrame(() => {
      viewport.scrollLeft += delta
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTaskId(null)
    if (!over) return
    const taskId = active.id as string
    const targetStatus = over.id as StatusKey
    const task = tasksById.get(taskId)
    if (!task || task.status === targetStatus) return
    await updateTask.mutateAsync({
      ...task,
      status: targetStatus,
    })
  }

  const activeTask = activeTaskId ? tasksById.get(activeTaskId) : null

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
        <TaskDashboardHeader title="Kanban Board" onNewTask={() => navigate('/tasks/create')} />

        {tasks.length === 0 ? (
          <TaskEmptyState onCreate={() => navigate('/tasks/create')} />
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
            <ScrollArea type="always" offsetScrollbars viewportRef={scrollViewportRef}>
              <Group align="flex-start" gap="md" wrap="nowrap">
                {STATUS_COLUMNS.map((column) => {
                  const columnTasks = tasks.filter((task: Task) => task.status === column.key)
                  return (
                    <KanbanColumn
                      key={column.key}
                      status={column.key}
                      label={column.label}
                      color={column.color}
                      tasks={columnTasks}
                      onTaskSelect={handleTaskSelect}
                    />
                  )
                })}
              </Group>
            </ScrollArea>
            <DragOverlay dropAnimation={defaultDropAnimation}>
              {activeTask ? <KanbanTaskCard task={activeTask} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </Stack>
    </Box>
  )
}

function getClientX(event: Event | MouseEvent | TouchEvent | PointerEvent | undefined) {
  if (!event) return null
  if ('touches' in event) {
    const touch = event.touches[0] ?? event.changedTouches[0]
    return touch?.clientX ?? null
  }
  if ('clientX' in event) {
    return event.clientX
  }
  return null
}

function KanbanColumn({
  status,
  label,
  color,
  tasks,
  onTaskSelect,
}: {
  status: StatusKey
  label: string
  color: string
  tasks: Task[]
  onTaskSelect: (taskId: string) => void
}) {
  const { isOver, setNodeRef } = useDroppable({ id: status })

  return (
    <Paper
      ref={setNodeRef}
      withBorder
      radius="md"
      p="sm"
      style={{
        minWidth: 280,
        width: 280,
        background: 'var(--mantine-color-default)',
        borderColor: isOver ? `var(--mantine-color-${color}-filled)` : 'var(--mantine-color-default-border)',
        boxShadow: isOver ? '0 0 0 2px rgba(0, 0, 0, 0.08)' : undefined,
        transition: 'border-color 120ms ease, box-shadow 120ms ease',
      }}
    >
      <Group justify="space-between" align="center" mb="sm">
        <Group gap="xs">
          <Text fw={700} size="sm">{label}</Text>
          <Badge variant="light" color={color} size="sm">
            {tasks.length}
          </Badge>
        </Group>
      </Group>

      <Stack gap="sm">
        {tasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            onSelect={() => onTaskSelect(task.id)}
          />
        ))}
        {tasks.length === 0 && (
          <Text size="xs" c="dimmed">
            No tasks in this column.
          </Text>
        )}
      </Stack>
    </Paper>
  )
}

function DraggableTask({ task, onSelect }: { task: Task; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : 'transform 180ms ease',
  }

  return (
    <Box ref={setNodeRef} style={{ ...style, opacity: isDragging ? 0.6 : 1 }}>
      <KanbanTaskCard
        task={task}
        onSelect={onSelect}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </Box>
  )
}

function KanbanTaskCard({
  task,
  onSelect,
  dragHandleProps,
  isOverlay = false,
}: {
  task: Task
  onSelect?: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  isOverlay?: boolean
}) {
  const { data: childTasks = [] } = useChildTasks(task.id)
  const hasDescription = Boolean(task.description && task.description.trim() !== '')
  const priorityColors: Record<string, string> = {
    Low: 'gray',
    Medium: 'yellow',
    High: 'orange',
    Critical: 'red',
  }
  const statusColors: Record<string, string> = {
    Pending: 'gray',
    InProgress: 'orange',
    Completed: 'green',
    Cancelled: 'red',
  }

  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      onClick={onSelect}
      style={{
        cursor: onSelect ? 'pointer' : 'default',
        background: 'var(--mantine-color-default)',
        boxShadow: isOverlay ? '0 8px 20px rgba(0, 0, 0, 0.15)' : undefined,
      }}
    >
      <Stack gap={6}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={600} size="sm" lineClamp={2} style={{ flex: 1 }}>
            {task.title}
          </Text>
          <Box
            component="button"
            type="button"
            aria-label="Drag task"
            {...dragHandleProps}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 4,
              cursor: 'grab',
              color: 'var(--mantine-color-dimmed)',
              touchAction: 'none',
            }}
          >
            <iconify-icon icon="lucide:grip-vertical" width="16" height="16" />
          </Box>
        </Group>
        {hasDescription && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {task.description}
          </Text>
        )}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Badge variant="light" color={statusColors[task.status] || 'gray'} size="xs">
              {task.status}
            </Badge>
            <Badge variant="outline" color={priorityColors[task.priority] || 'gray'} size="xs">
              {task.priority}
            </Badge>
          </Group>
          {childTasks.length > 0 && (
            <Badge variant="light" color="blue" size="xs">
              {childTasks.length} subtask(s)
            </Badge>
          )}
        </Group>
      </Stack>
    </Paper>
  )
}
