import { TaskActivity } from '../../../../core/database/taskActivity'
import { ActivityRepository } from '../../data/repositories'

export class GetActivitiesUseCase {
  constructor(private activityRepository: ActivityRepository) {}

  async execute(taskId: string): Promise<TaskActivity[]> {
    return await this.activityRepository.getActivities(taskId)
  }
}
