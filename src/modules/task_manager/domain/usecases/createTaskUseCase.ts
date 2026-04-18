import { Task, TaskStatus, TaskPriority } from '../../data/models'
import { generateId } from '../../../../core/utils'
import { createTaskSchema } from './validators'
import { TaskRepository } from '../../data/repositories'

export class CreateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(data: {
    title: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    dueDate?: string | null
    parentTaskId?: string | null
    taskLevel: number
  }): Promise<Task> {
    // Validate input
    const validatedData = createTaskSchema.parse(data)

    // Validate task level hierarchy
    if (validatedData.taskLevel > 3) {
      throw new Error('Task level cannot exceed 3')
    }

    // Validate parent task exists if not level 1
    if (validatedData.taskLevel > 1 && validatedData.parentTaskId) {
      const parentTask = await this.taskRepository.getTaskById(validatedData.parentTaskId)
      if (!parentTask) {
        throw new Error('Parent task does not exist')
      }
      if (parentTask.taskLevel !== validatedData.taskLevel - 1) {
        throw new Error('Invalid parent task level')
      }
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

    const now = new Date().toISOString()
    const task: Task = {
      id: generateId(),
      parentTaskId: validatedData.parentTaskId ?? null,
      taskLevel: validatedData.taskLevel,
      title: validatedData.title,
      description: validatedData.description,
      status: validatedData.status ?? 'Pending',
      priority: validatedData.priority ?? 'Medium',
      dueDate: validatedData.dueDate ?? null,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      isArchived: false,
      archivedAt: null,
    }

    await this.taskRepository.createTask(task)
    return task
  }
}
