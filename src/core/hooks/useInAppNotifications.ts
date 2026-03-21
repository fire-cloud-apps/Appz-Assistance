import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { InAppNotification } from '../database/models'
import { inAppNotificationRepository } from '../database/inAppNotificationRepository'

export const notificationKeys = {
  all: ['inAppNotifications'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  top: (limit: number) => [...notificationKeys.all, 'top', limit] as const,
  byTask: (taskId: string) => [...notificationKeys.all, 'task', taskId] as const,
}

/**
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => inAppNotificationRepository.getUnreadCount(),
    refetchInterval: 3000, // Refresh every 3 seconds
    staleTime: 1000,
  })
}

/**
 * Hook to get top notifications
 */
export function useTopNotifications(limit: number = 5) {
  return useQuery<InAppNotification[]>({
    queryKey: notificationKeys.top(limit),
    queryFn: () => inAppNotificationRepository.getTopNotifications(limit),
    refetchInterval: 3000, // Refresh every 3 seconds
    staleTime: 1000,
  })
}

/**
 * Hook to get all notifications
 */
export function useAllNotifications() {
  return useQuery<InAppNotification[]>({
    queryKey: notificationKeys.all,
    queryFn: () => inAppNotificationRepository.getAll(),
  })
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => inAppNotificationRepository.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => inAppNotificationRepository.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => inAppNotificationRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook to delete all notifications
 */
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => inAppNotificationRepository.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook to delete read notifications
 */
export function useDeleteReadNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => inAppNotificationRepository.deleteRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook to create a notification
 */
export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notification: {
      type: 'task_created' | 'task_updated' | 'task_completed' | 'task_due' | 'task_overdue'
      title: string
      message: string
      taskId?: string | null
      taskTitle?: string | null
      taskRoute?: string | null
    }) => inAppNotificationRepository.create(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
