import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Task, RecurrencePattern } from '../../../../core/database/models'
import { TaskRepository } from '../../data/repositories'
import { generateId } from '../../../../core/utils/idGenerator'
import {
  calculateNextOccurrence,
  formatDateToISO,
} from '../../../../core/utils/recurrenceHelper'

const taskRepository = new TaskRepository()

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: { status?: string; priority?: string }) =>
    [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  children: (parentTaskId: string) =>
    [...taskKeys.all, 'children', parentTaskId] as const,
  recurring: () => [...taskKeys.all, 'recurring'] as const,
  instances: (parentRecurrenceId: string) =>
    [...taskKeys.all, 'instances', parentRecurrenceId] as const,
}

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: taskKeys.lists(),
    queryFn: () => taskRepository.getTasks(),
  })
}

export function useParentTasks() {
  return useQuery<Task[]>({
    queryKey: [...taskKeys.all, 'parents'],
    queryFn: () => taskRepository.getParentTasks(),
  })
}

export function useParentTasksPaged(page: number, pageSize: number) {
  return useQuery<{ items: Task[]; total: number }>({
    queryKey: [...taskKeys.all, 'parents', 'paged', page, pageSize],
    queryFn: () => taskRepository.getParentTasksPaged(page, pageSize),
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  })
}

export function useTaskById(taskId: string) {
  return useQuery<Task | undefined>({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => taskRepository.getTaskById(taskId),
    enabled: !!taskId,
  })
}

export function useChildTasks(parentTaskId: string) {
  return useQuery<Task[]>({
    queryKey: taskKeys.children(parentTaskId),
    queryFn: () => taskRepository.getChildTasks(parentTaskId),
    enabled: !!parentTaskId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      title: string
      description?: string
      status?: string
      priority?: string
      dueDate?: string | null
      parentTaskId?: string | null
      taskLevel: number
    }) => taskRepository.createTask({
      id: generateId(),
      parentTaskId: data.parentTaskId ?? null,
      taskLevel: data.taskLevel,
      title: data.title,
      description: data.description,
      status: (data.status as any) ?? 'Pending',
      priority: (data.priority as any) ?? 'Medium',
      dueDate: data.dueDate ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      isArchived: false,
      archivedAt: null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Task) => taskRepository.updateTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, softDelete }: { taskId: string; softDelete?: boolean }) =>
      softDelete !== false
        ? taskRepository.softDeleteTask(taskId)
        : taskRepository.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => taskRepository.completeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useUpcomingTasks(limit: number = 5) {
  return useQuery<Task[]>({
    queryKey: [...taskKeys.all, 'upcoming', limit],
    queryFn: () => taskRepository.getUpcomingTasks(limit),
  })
}

export function useSearchTasksPaged(searchTerm: string, page: number, pageSize: number) {
  return useQuery<{ items: Task[]; total: number }>({
    queryKey: [...taskKeys.all, 'search', searchTerm, page, pageSize],
    queryFn: () => taskRepository.searchTasksPaged(searchTerm, page, pageSize),
    placeholderData: (prev) => prev,
    staleTime: 10_000,
    enabled: searchTerm.trim().length > 0,
  })
}

// Recurrence hooks

export function useRecurringTasks() {
  return useQuery<Task[]>({
    queryKey: taskKeys.recurring(),
    queryFn: () => taskRepository.getRecurringTasks(),
  })
}

export function useRecurrenceInstances(parentRecurrenceId: string) {
  return useQuery<Task[]>({
    queryKey: taskKeys.instances(parentRecurrenceId),
    queryFn: () => taskRepository.getRecurrenceInstances(parentRecurrenceId),
    enabled: !!parentRecurrenceId,
  })
}

export function useUpdateRecurrencePattern() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, pattern }: { taskId: string; pattern: RecurrencePattern }) =>
      taskRepository.updateRecurrencePattern(taskId, pattern),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useRemoveRecurrence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => taskRepository.removeRecurrence(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useCompleteTaskWithRecurrence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      const task = await taskRepository.getTaskById(taskId)
      if (!task) throw new Error('Task not found')

      // Complete the current task
      await taskRepository.completeTask(taskId)

      // If it's a recurring task, create the next occurrence
      if (task.isRecurring && task.recurrencePattern && task.dueDate) {
        const nextDueDate = calculateNextOccurrence(
          new Date(task.dueDate),
          task.recurrencePattern,
          task.recurrenceEndDate
        )

        if (nextDueDate) {
          const nextTask: Task = {
            ...task,
            id: generateId(),
            status: 'Pending',
            dueDate: formatDateToISO(nextDueDate),
            parentRecurrenceId: task.id,
            recurrenceInstanceId: task.recurrenceInstanceId || task.id,
            isRecurring: false, // Instance is not recurring, only the parent
            recurrencePattern: null,
            recurrenceEndDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          await taskRepository.createRecurrenceInstance(nextTask)
        }
      }

      return taskId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}
