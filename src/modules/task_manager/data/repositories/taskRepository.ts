import { Task, TaskStatus } from '../../../../core/database/models'
import { db } from '../../../../core/database/appDatabase'

export class TaskRepository {
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
}
