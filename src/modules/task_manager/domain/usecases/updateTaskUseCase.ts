import { Task, TaskStatus, TaskPriority } from '../../data/models'
import { updateTaskSchema } from './validators'
import { TaskRepository } from '../../data/repositories'

export class UpdateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(
    taskId: string,
    data: {
      title?: string
      description?: string
      status?: TaskStatus
      priority?: TaskPriority
      dueDate?: string | null
    }
  ): Promise<Task> {
    // Validate input
    const validatedData = updateTaskSchema.parse(data)

    // Get existing task
    const existingTask = await this.taskRepository.getTaskById(taskId)
    if (!existingTask) {
      throw new Error('Task does not exist')
    }

    // Validate due date is not in the past
    if (validatedData.dueDate) {
      const dayjs = require('dayjs')
      const today = dayjs().startOf('day')
      const dueDate = dayjs(validatedData.dueDate, 'YYYY-MM-DD')
      if (!dueDate.isValid()) {
        throw new Error('Invalid due date format')
      }
      if (dueDate.isBefore(today)) {
        throw new Error('Due date cannot be in the past')
      }
    }

    const updatedTask: Task = {
      ...existingTask,
      title: validatedData.title ?? existingTask.title,
      description: validatedData.description ?? existingTask.description,
      status: validatedData.status ?? existingTask.status,
      priority: validatedData.priority ?? existingTask.priority,
      dueDate: validatedData.dueDate ?? existingTask.dueDate,
      updatedAt: new Date().toISOString(),
    }

    await this.taskRepository.updateTask(updatedTask)
    return updatedTask
  }
}
