/**
 * Browser Notification Service
 * Handles browser push notifications for task due dates
 */

const NOTIFICATION_PERMISSION_KEY = 'appz_notification_permission'
const NOTIFIED_TASKS_KEY = 'appz_notified_tasks'

export interface NotificationPermission {
  granted: boolean
  timestamp?: string
}

export interface AppNotificationOptions extends NotificationOptions {
  tag?: string
  targetUrl?: string
}

export function requestNotificationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      resolve(false)
      return
    }

    Notification.requestPermission().then((permission) => {
      const granted = permission === 'granted'
      if (granted) {
        localStorage.setItem(
          NOTIFICATION_PERMISSION_KEY,
          JSON.stringify({
            granted: true,
            timestamp: new Date().toISOString(),
          })
        )
      }
      resolve(granted)
    })
  })
}

export function getNotificationPermission(): NotificationPermission {
  try {
    const stored = localStorage.getItem(NOTIFICATION_PERMISSION_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load notification permission:', error)
  }
  return { granted: false }
}

export function hasNotificationPermission(): boolean {
  if (!('Notification' in window)) {
    return false
  }
  return Notification.permission === 'granted'
}

export function showNotification(title: string, options?: AppNotificationOptions) {
  if (!hasNotificationPermission()) {
    console.warn('Notification permission not granted')
    return
  }

  try {
    const { targetUrl, ...notificationOptions } = options || {}

    const notification = new Notification(title, {
      icon: '/appz-logo.png',
      badge: '/appz-logo.png',
      requireInteraction: true,
      ...notificationOptions,
    })

    notification.onclick = (event) => {
      event.preventDefault()
      window.focus()

      const url = targetUrl ?? (notification as any).data?.targetUrl ?? (notification as any).data?.url
      if (url) {
        window.location.href = url
      }
    }

    return notification
  } catch (error) {
    console.error('Failed to show notification:', error)
  }
}

export function getNotifiedTasks(): string[] {
  try {
    const stored = localStorage.getItem(NOTIFIED_TASKS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load notified tasks:', error)
  }
  return []
}

export function addNotifiedTask(taskId: string): void {
  try {
    const notified = getNotifiedTasks()
    if (!notified.includes(taskId)) {
      notified.push(taskId)
      localStorage.setItem(NOTIFIED_TASKS_KEY, JSON.stringify(notified))
    }
  } catch (error) {
    console.error('Failed to save notified task:', error)
  }
}

export function clearNotifiedTasks(): void {
  localStorage.removeItem(NOTIFIED_TASKS_KEY)
}
