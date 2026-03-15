import { TaskRepository } from '../../data/repositories'

export class DeleteTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(taskId: string, softDelete: boolean = true): Promise<void> {
    const task = await this.taskRepository.getTaskById(taskId)
    if (!task) {
      throw new Error('Task does not exist')
    }

    // Also delete child tasks
    const childTasks = await this.taskRepository.getChildTasks(taskId)
    for (const childTask of childTasks) {
      await this.execute(childTask.id, softDelete)
    }

    if (softDelete) {
      await this.taskRepository.softDeleteTask(taskId)
    } else {
      await this.taskRepository.deleteTask(taskId)
    }
  }
}
