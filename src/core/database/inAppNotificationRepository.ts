import { db } from './appDatabase'
import { InAppNotification, NotificationType } from './models'
import { generateId } from '../utils/idGenerator'

export class InAppNotificationRepository {
  /**
   * Create a new in-app notification
   */
  async create(notification: {
    type: NotificationType
    title: string
    message: string
    taskId?: string | null
    taskTitle?: string | null
    taskRoute?: string | null
  }): Promise<string> {
    const newNotification: InAppNotification = {
      id: generateId(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      taskId: notification.taskId ?? null,
      taskTitle: notification.taskTitle ?? null,
      taskRoute: notification.taskRoute ?? null,
      isRead: false,
      createdAt: new Date().toISOString(),
      readAt: null,
    }

    return db.inAppNotifications.add(newNotification)
  }

  /**
   * Get all notifications (latest first)
   */
  async getAll(limit?: number): Promise<InAppNotification[]> {
    const allNotifications = await db.inAppNotifications
      .orderBy('createdAt')
      .reverse()
      .toArray()

    if (limit) {
      return allNotifications.slice(0, limit)
    }

    return allNotifications
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const allNotifications = await db.inAppNotifications.toArray()
    return allNotifications.filter((n) => !n.isRead).length
  }

  /**
   * Get top notifications with unread first
   */
  async getTopNotifications(limit: number = 5): Promise<InAppNotification[]> {
    const allNotifications = await db.inAppNotifications
      .orderBy('createdAt')
      .reverse()
      .toArray()

    // Sort: unread first, then by createdAt
    const sorted = allNotifications.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return sorted.slice(0, limit)
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    const notification = await db.inAppNotifications.get(id)
    if (notification) {
      notification.isRead = true
      notification.readAt = new Date().toISOString()
      await db.inAppNotifications.put(notification)
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const allNotifications = await db.inAppNotifications.toArray()
    const updates = allNotifications
      .filter((n) => !n.isRead)
      .map((n) => ({
        ...n,
        isRead: true,
        readAt: new Date().toISOString(),
      }))

    await db.inAppNotifications.bulkPut(updates)
  }

  /**
   * Delete a single notification
   */
  async delete(id: string): Promise<void> {
    await db.inAppNotifications.delete(id)
  }

  /**
   * Delete all notifications
   */
  async deleteAll(): Promise<void> {
    await db.inAppNotifications.clear()
  }

  /**
   * Delete read notifications only
   */
  async deleteRead(): Promise<void> {
    const allNotifications = await db.inAppNotifications.toArray()
    const readIds = allNotifications.filter((n) => n.isRead).map((n) => n.id)
    await db.inAppNotifications.bulkDelete(readIds)
  }

  /**
   * Get notifications by task ID
   */
  async getByTaskId(taskId: string): Promise<InAppNotification[]> {
    const allNotifications = await db.inAppNotifications.toArray()
    return allNotifications.filter((n) => n.taskId === taskId)
  }
}

export const inAppNotificationRepository = new InAppNotificationRepository()
