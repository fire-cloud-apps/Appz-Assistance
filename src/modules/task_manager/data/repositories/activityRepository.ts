import { TaskActivity } from '../../../../core/database/taskActivity'
import { taskManagerDb } from '../../../../core/database/taskManagerDatabase'

export class ActivityRepository {
  async addActivity(activity: TaskActivity): Promise<string> {
    return taskManagerDb.taskActivities.add(activity)
  }

  async getActivities(taskId: string): Promise<TaskActivity[]> {
    return taskManagerDb.taskActivities
      .where('taskId')
      .equals(taskId)
      .sortBy('createdAt')
  }

  async getActivityById(id: string): Promise<TaskActivity | undefined> {
    return taskManagerDb.taskActivities.get(id)
  }

  async deleteActivity(id: string): Promise<void> {
    await taskManagerDb.taskActivities.delete(id)
  }
}
