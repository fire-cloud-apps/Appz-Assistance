/**
 * Task Notifications Hook
 * Monitors tasks and shows notifications when they reach due date and time
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
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
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
          // If task has a due time, only notify if current time >= due time
          if (task.dueTime) {
            if (currentTime >= task.dueTime) {
              const timeLabel = ` at ${task.dueTime}`
              showNotification('Task Due Now!', {
                body: `${task.title} is due${timeLabel}.`,
                tag: `task-${task.id}`,
                targetUrl: `/task/${task.id}`,
              })
              addNotifiedTask(task.id)
            }
          } else {
            // No due time set, notify if task is due today
            showNotification('Task Due Today!', {
              body: `${task.title} is due today.`,
              tag: `task-${task.id}`,
              targetUrl: `/task/${task.id}`,
            })
            addNotifiedTask(task.id)
          }
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
