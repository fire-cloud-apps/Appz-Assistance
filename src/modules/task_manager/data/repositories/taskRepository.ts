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
    task.updatedAt = new Date().toISOString()
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

  async getTaskById(id: string): Promise<Task | undefined> {
    return db.tasks.get(id)
  }

  async getTasks(): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task => !task.isDeleted)
  }

  async getParentTasks(): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task => task.parentTaskId === null && !task.isDeleted)
  }

  async getParentTasksPaged(page: number, pageSize: number): Promise<{ items: Task[]; total: number }> {
    const allTasks = await db.tasks.toArray()
    const parentTasks = allTasks.filter(task => task.parentTaskId === null && !task.isDeleted)
    const sortedTasks = this.sortTasksForAll(parentTasks)
    const total = sortedTasks.length
    const startIndex = Math.max(0, (page - 1) * pageSize)
    const items = sortedTasks.slice(startIndex, startIndex + pageSize)
    return { items, total }
  }

  async getChildTasks(parentTaskId: string): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task => task.parentTaskId === parentTaskId && !task.isDeleted)
  }

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task => task.status === status && !task.isDeleted)
  }

  async completeTask(id: string): Promise<void> {
    const task = await db.tasks.get(id)
    if (task) {
      task.status = 'Completed'
      task.updatedAt = new Date().toISOString()
      await db.tasks.put(task)
    }
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    const allTasks = await db.tasks.toArray()
    return allTasks.filter(task => task.priority === priority && !task.isDeleted)
  }

  async getUpcomingTasks(limit: number = 5): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0]

    const allTasks = await db.tasks.toArray()
    const upcomingTasks = allTasks
      .filter(task => 
        !task.isDeleted && 
        task.status !== 'Completed' && 
        task.status !== 'Cancelled' &&
        task.dueDate && 
        task.dueDate >= today
      )
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    
    return upcomingTasks.slice(0, limit)
  }
}
