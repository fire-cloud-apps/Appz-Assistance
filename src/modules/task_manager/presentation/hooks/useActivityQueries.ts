import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ActivityRepository } from '../../data/repositories'
import { TaskActivity } from '../../../../core/database/taskActivity'
import { generateId } from '../../../../core/utils'

const activityRepository = new ActivityRepository()

export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (taskId: string) => [...activityKeys.lists(), taskId] as const,
}

export function useActivities(taskId: string) {
  return useQuery<TaskActivity[]>({
    queryKey: activityKeys.list(taskId),
    queryFn: () => activityRepository.getActivities(taskId),
    enabled: !!taskId,
  })
}

export function useAddActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { taskId: string; activity: string; notes?: string }) =>
      activityRepository.addActivity({
        id: generateId(),
        taskId: data.taskId,
        activity: data.activity,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.list(variables.taskId),
      })
    },
  })
}

export function useDeleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, taskId }: { activityId: string; taskId: string }) => {
      void taskId // Keep for query invalidation
      return activityRepository.deleteActivity(activityId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.list(variables.taskId),
      })
    },
  })
}
