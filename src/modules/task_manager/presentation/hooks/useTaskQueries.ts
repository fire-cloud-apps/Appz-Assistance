import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { Task, RecurrencePattern } from '../../data/models'
import { TaskRepository } from '../../data/repositories'
import { generateId } from '../../../../core/utils/idGenerator'
import {
  calculateNextOccurrence,
  formatDateToISO,
} from '../../../../core/utils/recurrenceHelper'
import { inAppNotificationRepository } from '../../../../core/database/inAppNotificationRepository'

const taskRepository = new TaskRepository()

// Helper function to create iconify-icon elements
const createIconifyIcon = (iconName: string) => {
  return React.createElement('iconify-icon', { icon: iconName, width: 18, height: 18 })
}

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
      isRecurring?: boolean
      recurrencePattern?: RecurrencePattern | null
      recurrenceEndDate?: string | null
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
      completedAt: null,
      isRecurring: data.isRecurring ?? false,
      recurrencePattern: data.recurrencePattern ?? null,
      recurrenceEndDate: data.recurrenceEndDate ?? null,
    }),
    onSuccess: (taskId, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: ['inAppNotifications'] })
      
      // Show toast notification
      notifications.show({
        title: 'Task Created',
        message: variables.title,
        color: 'green',
        icon: createIconifyIcon('lucide:plus'),
      })

      // Create in-app notification
      inAppNotificationRepository.create({
        type: 'task_created',
        title: 'Task Created',
        message: variables.title,
        taskId: taskId,
        taskTitle: variables.title,
        taskRoute: `/task/${taskId}`,
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Failed to Create Task',
        message: error.message,
        color: 'red',
        icon: createIconifyIcon('lucide:alert-circle'),
      })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Task) => taskRepository.updateTask(data),
    onSuccess: (__, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: ['inAppNotifications'] })

      // Determine notification type based on status
      let notificationType: 'task_completed' | 'task_updated' = 'task_updated'
      let toastTitle = 'Task Updated'
      
      if (variables.status === 'Completed') {
        notificationType = 'task_completed'
        toastTitle = 'Task Completed'
      }

      // Show different notification based on status change
      if (variables.status === 'Completed') {
        notifications.show({
          title: 'Task Completed',
          message: variables.title,
          color: 'green',
          icon: createIconifyIcon('lucide:check'),
        })
      } else if (variables.status === 'InProgress') {
        notifications.show({
          title: 'Task In Progress',
          message: variables.title,
          color: 'blue',
          icon: createIconifyIcon('lucide:loader'),
        })
      } else if (variables.status === 'Cancelled') {
        notifications.show({
          title: 'Task Cancelled',
          message: variables.title,
          color: 'red',
          icon: createIconifyIcon('lucide:x'),
        })
      } else {
        notifications.show({
          title: 'Task Updated',
          message: variables.title,
          color: 'blue',
          icon: createIconifyIcon('lucide:edit'),
        })
      }

      // Create in-app notification
      inAppNotificationRepository.create({
        type: notificationType,
        title: toastTitle,
        message: variables.title,
        taskId: variables.id,
        taskTitle: variables.title,
        taskRoute: `/task/${variables.id}`,
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Failed to Update Task',
        message: error.message,
        color: 'red',
        icon: createIconifyIcon('lucide:alert-circle'),
      })
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
    mutationFn: async (taskId: string) => {
      const task = await taskRepository.getTaskById(taskId)
      if (!task) throw new Error('Task not found')
      
      // Determine if this is a parent recurring task or an instance
      const isParentRecurring = task.isRecurring && !task.parentRecurrenceId
      const isRecurrenceInstance = !!task.parentRecurrenceId

      // For parent recurring tasks, keep them open (don't mark as Completed)
      // For instances and non-recurring tasks, mark as completed normally
      if (!isParentRecurring) {
        await taskRepository.completeTask(taskId)
      } else if (isParentRecurring) {
        // Update parent recurring task without marking complete
        task.updatedAt = new Date().toISOString()
        await taskRepository.updateTask(task)
      }

      // Generate next instance if this is a recurrence instance
      if (isRecurrenceInstance && task.parentRecurrenceId) {
        const parentTask = await taskRepository.getTaskById(task.parentRecurrenceId)
        if (parentTask && parentTask.isRecurring && parentTask.recurrencePattern) {
          // Use task's dueDate if available, otherwise use today
          const baseDate = task.dueDate ? new Date(task.dueDate) : new Date()
          
          const nextDueDate = calculateNextOccurrence(
            baseDate,
            parentTask.recurrencePattern,
            parentTask.recurrenceEndDate
          )

          if (nextDueDate) {
            const nextTask: Task = {
              ...task,
              id: generateId(),
              status: 'Pending',
              dueDate: formatDateToISO(nextDueDate),
              parentRecurrenceId: task.parentRecurrenceId,
              recurrenceInstanceId: task.recurrenceInstanceId,
              isRecurring: false,
              recurrencePattern: null,
              recurrenceEndDate: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            }
            await taskRepository.createRecurrenceInstance(nextTask)
          }
        }
      }

      return { taskId, task }
    },
    onSuccess: async ({ task }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      notifications.show({
        title: 'Task Completed',
        message: task?.title || 'Task completed successfully',
        color: 'green',
        icon: createIconifyIcon('lucide:check'),
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Failed to Complete Task',
        message: error.message,
        color: 'red',
        icon: createIconifyIcon('lucide:alert-circle'),
      })
    },
  })
}

export function useUpcomingTasks(limit: number = 5) {
  return useQuery<Task[]>({
    queryKey: [...taskKeys.all, 'upcoming', limit],
    queryFn: () => taskRepository.getUpcomingTasks(limit),
  })
}

export function useOverdueTasks(limit: number = 5) {
  return useQuery<Task[]>({
    queryKey: [...taskKeys.all, 'overdue', limit],
    queryFn: () => taskRepository.getOverdueTasks(limit),
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

      // Determine if this is a parent recurring task or an instance
      const isParentRecurring = task.isRecurring && !task.parentRecurrenceId
      const isRecurrenceInstance = !!task.parentRecurrenceId

      if (isParentRecurring) {
        // For parent recurring tasks, DON'T mark as completed
        // Parent should remain in Pending/InProgress state to keep generating instances
        // Just mark createdAt to track when parent was last interacted with
        const parentTask = await taskRepository.getTaskById(taskId)
        if (parentTask) {
          parentTask.updatedAt = new Date().toISOString()
          await taskRepository.updateTask(parentTask)
        }
      } else if (isRecurrenceInstance) {
        // For recurrence instances, mark only the instance as completed
        await taskRepository.completeTask(taskId)
      } else {
        // For non-recurring tasks, mark normally as completed
        await taskRepository.completeTask(taskId)
      }

      // If this is part of a recurring series, create the next occurrence
      if (isRecurrenceInstance && task.parentRecurrenceId) {
        // Get parent task to check recurrence pattern
        const parentTask = await taskRepository.getTaskById(task.parentRecurrenceId)
        if (parentTask && parentTask.isRecurring && parentTask.recurrencePattern) {
          // Use task's dueDate if available, otherwise use today
          const baseDate = task.dueDate ? new Date(task.dueDate) : new Date()
          
          const nextDueDate = calculateNextOccurrence(
            baseDate,
            parentTask.recurrencePattern,
            parentTask.recurrenceEndDate
          )

          if (nextDueDate) {
            const nextTask: Task = {
              ...task,
              id: generateId(),
              status: 'Pending',
              dueDate: formatDateToISO(nextDueDate),
              parentRecurrenceId: task.parentRecurrenceId,
              recurrenceInstanceId: task.recurrenceInstanceId,
              isRecurring: false, // Instance is not recurring, only the parent
              recurrencePattern: null,
              recurrenceEndDate: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            }
            await taskRepository.createRecurrenceInstance(nextTask)
          }
        }
      } else if (isParentRecurring && task.recurrencePattern) {
        // If completing a parent recurring task directly (first instance scenario)
        // Use task's dueDate if available, otherwise use today
        const baseDate = task.dueDate ? new Date(task.dueDate) : new Date()
        
        const nextDueDate = calculateNextOccurrence(
          baseDate,
          task.recurrencePattern,
          task.recurrenceEndDate
        )

        if (nextDueDate) {
          // Create new recurring task (not an instance, but a new recurring parent)
          const nextTask: Task = {
            ...task,
            id: generateId(),
            status: 'Pending',
            dueDate: formatDateToISO(nextDueDate),
            isRecurring: true,  // Keep repeat enabled for new task
            recurrencePattern: task.recurrencePattern,  // Copy recurrence pattern
            recurrenceEndDate: task.recurrenceEndDate,  // Copy recurrence end date
            parentRecurrenceId: undefined,  // This is a new parent, not an instance
            recurrenceInstanceId: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: null,
          }
          await taskRepository.createRecurrenceInstance(nextTask)
        }
        
        // Mark the original parent task as Completed
        await taskRepository.completeTask(taskId)
      }

      return { taskId, task }
    },
    onSuccess: ({ task }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: ['inAppNotifications'] })
      
      // Show toast notification
      notifications.show({
        title: 'Task Completed',
        message: task.title,
        color: 'green',
        icon: createIconifyIcon('lucide:check'),
      })

      // Create in-app notification
      inAppNotificationRepository.create({
        type: 'task_completed',
        title: 'Task Completed',
        message: task.title,
        taskId: task.id,
        taskTitle: task.title,
        taskRoute: `/task/${task.id}`,
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Failed to Complete Task',
        message: error.message,
        color: 'red',
        icon: createIconifyIcon('lucide:alert-circle'),
      })
    },
  })
}
