import { TaskActivity } from '../../../../core/database/taskActivity'
import { generateId } from '../../../../core/utils'
import { taskActivitySchema } from './validators'
import { ActivityRepository } from '../../data/repositories'
import { TaskRepository } from '../../data/repositories'

export class AddActivityUseCase {
  constructor(
    private activityRepository: ActivityRepository,
    private taskRepository: TaskRepository
  ) {}

  async execute(data: {
    taskId: string
    activity: string
    notes?: string
  }): Promise<TaskActivity> {
    // Validate input
    const validatedData = taskActivitySchema.parse(data)

    // Verify task exists
    const task = await this.taskRepository.getTaskById(data.taskId)
    if (!task) {
      throw new Error('Task does not exist')
    }

    // Activity logs allowed only for Level 1 tasks
    if (task.taskLevel !== 1) {
      throw new Error('Activity logs are only allowed for parent tasks (Level 1)')
    }

    const activity: TaskActivity = {
      id: generateId(),
      taskId: validatedData.taskId,
      activity: validatedData.activity,
      notes: validatedData.notes,
      createdAt: new Date().toISOString(),
    }

    await this.activityRepository.addActivity(activity)
    return activity
  }
}
