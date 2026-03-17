import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TaskRepository } from '../../data/repositories'
import { Task } from '../../../../core/database/models'
import { generateId } from '../../../../core/utils/idGenerator'

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
