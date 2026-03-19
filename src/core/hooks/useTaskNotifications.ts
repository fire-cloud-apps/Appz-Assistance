/**
 * Task Notifications Hook
 * Monitors tasks and shows notifications when they reach due date
 */
import { useEffect, useRef } from 'react'
import { useTasks } from '../../modules/task_manager/presentation/hooks/useTaskQueries'
import {
  getEnableDueDateNotifications,
  getNotificationCheckInterval,
} from '../../core/services/userSettingsService'
import {
  showNotification,
  getNotifiedTasks,
  addNotifiedTask,
  hasNotificationPermission,
} from '../../core/services/notificationService'

export function useTaskNotifications() {
  const { data: tasks = [] } = useTasks()
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    // Check if notifications are enabled
    const enableNotifications = getEnableDueDateNotifications()
    if (!enableNotifications || !hasNotificationPermission()) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    // Get check interval in minutes and convert to milliseconds
    const checkIntervalMinutes = getNotificationCheckInterval()
    const checkIntervalMs = checkIntervalMinutes * 60 * 1000

    // Check for due tasks
    const checkDueTasks = () => {
      const today = new Date().toISOString().split('T')[0]
      const notifiedTasks = getNotifiedTasks()

      tasks.forEach((task) => {
        // Skip if already notified, completed, or cancelled
        if (
          notifiedTasks.includes(task.id) ||
          task.status === 'Completed' ||
          task.status === 'Cancelled' ||
          !task.dueDate
        ) {
          return
        }

        // Check if task due date is today
        const taskDueDate = task.dueDate.split('T')[0]
        if (taskDueDate === today) {
          // Show notification
          showNotification('Task Due Today!', {
            body: `${task.title} is due today.`,
            tag: `task-${task.id}`,
            requireInteraction: false,
          })

          // Mark as notified
          addNotifiedTask(task.id)
        }
      })
    }

    // Run immediately on mount
    checkDueTasks()

    // Set up interval for periodic checks
    intervalRef.current = setInterval(checkDueTasks, checkIntervalMs)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [tasks])
}
