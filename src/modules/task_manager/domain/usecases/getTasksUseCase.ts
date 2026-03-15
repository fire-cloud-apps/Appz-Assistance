import { Task } from '../../../../core/database/models'
import { TaskRepository } from '../../data/repositories'

export class GetTasksUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(): Promise<Task[]> {
    return await this.taskRepository.getTasks()
  }

  async getParentTasks(): Promise<Task[]> {
    return await this.taskRepository.getParentTasks()
  }

  async getChildTasks(parentTaskId: string): Promise<Task[]> {
    return await this.taskRepository.getChildTasks(parentTaskId)
  }

  async getTaskById(taskId: string): Promise<Task | undefined> {
    return await this.taskRepository.getTaskById(taskId)
  }
}
