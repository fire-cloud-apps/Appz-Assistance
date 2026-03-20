import { TaskRepository } from '../repositories/taskRepository'
import { getArchiveRetentionDays } from '../../../../core/services/userSettingsService'

const CLEANUP_CHECK_INTERVAL = 60 * 60 * 1000 // 1 hour in milliseconds
let cleanupIntervalId: ReturnType<typeof setInterval> | null = null

export const archiveCleanupService = {
  /**
   * Start the archive cleanup background job
   * Runs every hour to check for and delete expired archived tasks
   */
  startCleanupJob: () => {
    if (cleanupIntervalId) {
      console.log('Archive cleanup job already running')
      return
    }

    console.log('Starting archive cleanup job...')
    const taskRepository = new TaskRepository()

    const runCleanup = async () => {
      try {
        const retentionDays = getArchiveRetentionDays()
        const expiredTasks = await taskRepository.getExpiredArchivedTasks(retentionDays)

        if (expiredTasks.length > 0) {
          console.log(`Found ${expiredTasks.length} expired archived task(s) to delete`)
          
          for (const task of expiredTasks) {
            await taskRepository.permanentlyDeleteTask(task.id)
            console.log(`Permanently deleted archived task: ${task.id}`)
          }
        }
      } catch (error) {
        console.error('Error running archive cleanup job:', error)
      }
    }

    // Run cleanup immediately on start
    runCleanup()

    // Set up recurring cleanup
    cleanupIntervalId = setInterval(runCleanup, CLEANUP_CHECK_INTERVAL)
  },

  /**
   * Stop the archive cleanup background job
   */
  stopCleanupJob: () => {
    if (cleanupIntervalId) {
      clearInterval(cleanupIntervalId)
      cleanupIntervalId = null
      console.log('Archive cleanup job stopped')
    }
  },

  /**
   * Check if cleanup job is running
   */
  isRunning: (): boolean => {
    return cleanupIntervalId !== null
  },
}
