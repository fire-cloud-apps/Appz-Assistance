import { Task, TaskStatus } from '../../../../core/database/models'
import { db } from '../../../../core/database/appDatabase'

export class TaskRepository {
  private sortTasksForAll(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      // Completed tasks always go to the end
      if (a.status === 'Completed' && b.status !== 'Completed') return 1
      if (a.status !== 'Completed' && b.status === 'Completed') return -1
      // If both are completed, maintain original order
      if (a.status === 'Completed' && b.status === 'Completed') return 0
      // If both have no due date, maintain original order
      if (!a.dueDate && !b.dueDate) return 0
      // If a has no due date, put it at the end
      if (!a.dueDate) return 1
      // If b has no due date, put it at the end
      if (!b.dueDate) return -1
      // Sort by due date (earliest first)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  }

  async createTask(task: Task): Promise<string> {
    return db.tasks.add(task)
  }

  async updateTask(task: Task): Promise<void> {
    const existing = await db.tasks.get(task.id)
    const isCompleting = task.status === 'Completed'
    const wasCompleted = existing?.status === 'Completed'

    task.updatedAt = new Date().toISOString()

    if (isCompleting && (!task.completedAt || !wasCompleted)) {
      task.completedAt = new Date().toISOString()
    }

    if (!isCompleting && wasCompleted) {
      task.completedAt = null
    }

    await db.tasks.put(task)
  }

  async deleteTask(id: string): Promise<void> {
    await db.tasks.delete(id)
  }

  async softDeleteTask(id: string): Promise<void> {
    const task = await db.tasks.get(id)
    if (task) {
      task.isDeleted = true
      task.updatedAt = new Date().toISOString()
      await db.tasks.put(task)
    }
  }

  async archiveTask(id: string): Promise<void> {
    const task = await db.tasks.get(id)
    if (task) {
      task.isArchived = true
      task.archivedAt = new Date().toISOString()
      task.updatedAt = new Date().toISOString()
      await db.tasks.put(task)
    }
  }

  async unarchiveTask(id: string): Promise<void> {
    const task = await db.tasks.get(id)
    if (task) {
      task.isArchived = false
      task.archivedAt = null
      task.updatedAt = new Date().toISOString()
      await db.tasks.put(task)
    }
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return db.tasks.get(id)
  }

  async getTasks(): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task => !task.isDeleted && !task.isArchived)
  }

  async getParentTasks(): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task => task.parentTaskId === null && !task.isDeleted && !task.isArchived)
  }

  async getParentTasksPaged(page: number, pageSize: number): Promise<{ items: Task[]; total: number }> {
    const allTasks = await db.tasks.toArray()
    const parentTasks = allTasks.filter(task => task.parentTaskId === null && !task.isDeleted && !task.isArchived)
    const sortedTasks = this.sortTasksForAll(parentTasks)
    const total = sortedTasks.length
    const startIndex = Math.max(0, (page - 1) * pageSize)
    const items = sortedTasks.slice(startIndex, startIndex + pageSize)
    return { items, total }
  }

  async getChildTasks(parentTaskId: string): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task => task.parentTaskId === parentTaskId && !task.isDeleted && !task.isArchived)
  }

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task => task.status === status && !task.isDeleted && !task.isArchived)
  }

  async completeTask(id: string): Promise<void> {
    const task = await db.tasks.get(id)
    if (task) {
      task.status = 'Completed'
      task.completedAt = new Date().toISOString()
      task.updatedAt = new Date().toISOString()
      await db.tasks.put(task)
    }
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task => task.priority === priority && !task.isDeleted && !task.isArchived)
  }

  async getUpcomingTasks(limit: number = 5): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0]

    const allTasks = await db.tasks.toArray()
    const upcomingTasks = allTasks
      .filter(task =>
        !task.isDeleted &&
        !task.isArchived &&
        task.status !== 'Completed' &&
        task.status !== 'Cancelled' &&
        task.dueDate &&
        task.dueDate >= today
      )
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))

    return upcomingTasks.slice(0, limit)
  }

  async searchTasks(searchTerm: string): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    const normalizedTerm = searchTerm.toLowerCase().trim()

    if (!normalizedTerm) {
      return []
    }

    return allTasks.filter(task =>
      !task.isDeleted &&
      !task.isArchived &&
      (
        task.title.toLowerCase().includes(normalizedTerm) ||
        (task.description && task.description.toLowerCase().includes(normalizedTerm))
      )
    )
  }

  async searchTasksPaged(searchTerm: string, page: number, pageSize: number): Promise<{ items: Task[]; total: number }> {
    const allTasks = await db.tasks.toArray()
    const normalizedTerm = searchTerm.toLowerCase().trim()

    if (!normalizedTerm) {
      return { items: [], total: 0 }
    }

    const filteredTasks = allTasks.filter(task =>
      !task.isDeleted &&
      !task.isArchived &&
      (
        task.title.toLowerCase().includes(normalizedTerm) ||
        (task.description && task.description.toLowerCase().includes(normalizedTerm))
      )
    )

    const sortedTasks = this.sortTasksForAll(filteredTasks)
    const total = sortedTasks.length
    const startIndex = Math.max(0, (page - 1) * pageSize)
    const items = sortedTasks.slice(startIndex, startIndex + pageSize)

    return { items, total }
  }

  async getArchivedTasksPaged(page: number, pageSize: number): Promise<{ items: Task[]; total: number }> {
    const allTasks = await db.tasks.toArray()
    const archivedTasks = allTasks.filter(task => task.isArchived && !task.isDeleted)
    const sortedTasks = archivedTasks.sort((a, b) => 
      new Date(b.archivedAt || '').getTime() - new Date(a.archivedAt || '').getTime()
    )
    const total = sortedTasks.length
    const startIndex = Math.max(0, (page - 1) * pageSize)
    const items = sortedTasks.slice(startIndex, startIndex + pageSize)
    return { items, total }
  }

  async getExpiredArchivedTasks(retentionDays: number): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    const now = new Date()
    
    return allTasks.filter(task => {
      if (!task.isArchived || !task.archivedAt) return false
      const archivedDate = new Date(task.archivedAt)
      const daysDiff = Math.floor((now.getTime() - archivedDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= retentionDays
    })
  }

  async getCompletedTasksForArchive(retentionDays: number): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    const now = new Date()

    return allTasks.filter(task => {
      if (task.isDeleted || task.isArchived) return false
      if (task.status !== 'Completed') return false

      const completedDate = task.completedAt
        ? new Date(task.completedAt)
        : new Date(task.updatedAt || task.createdAt)

      const daysDiff = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= retentionDays
    })
  }

  async permanentlyDeleteTask(id: string): Promise<void> {
    await db.tasks.delete(id)
  }

  // Recurrence-related methods

  async getRecurringTasks(): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task =>
      task.isRecurring &&
      !task.isDeleted &&
      !task.isArchived &&
      !task.parentRecurrenceId
    )
  }

  async getRecurrenceInstances(parentRecurrenceId: string): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task =>
      task.parentRecurrenceId === parentRecurrenceId &&
      !task.isDeleted &&
      !task.isArchived
    )
  }

  async createRecurrenceInstance(task: Task): Promise<string> {
    return db.tasks.add(task)
  }

  async updateRecurrencePattern(taskId: string, pattern: any): Promise<void> {
    const task = await db.tasks.get(taskId)
    if (task) {
      task.recurrencePattern = pattern
      task.isRecurring = true
      task.updatedAt = new Date().toISOString()
      await db.tasks.put(task)
    }
  }

  async removeRecurrence(taskId: string): Promise<void> {
    const task = await db.tasks.get(taskId)
    if (task) {
      task.isRecurring = false
      task.recurrencePattern = null
      task.recurrenceEndDate = null
      task.updatedAt = new Date().toISOString()
      await db.tasks.put(task)
    }
  }
}
