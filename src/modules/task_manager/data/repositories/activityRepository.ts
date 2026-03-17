import { TaskActivity } from '../../../../core/database/taskActivity'
import { db } from '../../../../core/database/appDatabase'

export class ActivityRepository {
  async addActivity(activity: TaskActivity): Promise<string> {
    return db.taskActivities.add(activity)
  }

  async getActivities(taskId: string): Promise<TaskActivity[]> {
    return db.taskActivities
      .where('taskId')
      .equals(taskId)
      .sortBy('createdAt')
  }

  async getActivityById(id: string): Promise<TaskActivity | undefined> {
    return db.taskActivities.get(id)
  }

  async deleteActivity(id: string): Promise<void> {
    await db.taskActivities.delete(id)
  }
}
