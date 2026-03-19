import { useState } from 'react'
import {
  Box,
  Text,
  Textarea,
  TextInput,
  Button,
  Stack,
  Timeline,
  Group,
  Card,
  Title,
  ActionIcon,
} from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { formatDateTime } from '../../../core/utils/dateHelper'
import { useActivities, useAddActivity, useDeleteActivity } from '../presentation/hooks'
import { TaskActivity } from '../../../core/database/taskActivity'

interface ActivityLogProps {
  taskId: string
}

export function ActivityLog({ taskId }: ActivityLogProps) {
  const [newActivity, setNewActivity] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const { data: activities = [] } = useActivities(taskId)
  const addActivity = useAddActivity()
  const deleteActivity = useDeleteActivity()

  const handleAddActivity = async () => {
    if (!newActivity.trim()) return

    try {
      await addActivity.mutateAsync({
        taskId,
        activity: newActivity.trim(),
        notes: newNotes.trim() || undefined,
      })
      setNewActivity('')
      setNewNotes('')
    } catch (error) {
      console.error('Failed to add activity:', error)
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity.mutateAsync({ activityId, taskId })
    } catch (error) {
      console.error('Failed to delete activity:', error)
    }
  }

  return (
    <Card shadow="sm" p="md" withBorder>
      <Stack gap="md">
        <Title order={4}>Activity Log</Title>

        <Stack gap="xs">
          <TextInput
            placeholder="What did you do?"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            variant="filled"
            label="Activity"
          />
          <Textarea
            placeholder="Additional notes (optional)"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            minRows={4}
            autosize
            maxRows={8}
            variant="filled"
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault()
                const target = e.target as HTMLTextAreaElement
                const start = target.selectionStart
                const end = target.selectionEnd
                const value = target.value
                target.value = value.substring(0, start) + '\t' + value.substring(end)
                target.selectionStart = target.selectionEnd = start + 1
                setNewNotes(target.value)
              }
            }}
            label="Notes"
          />
          <Button onClick={handleAddActivity} loading={addActivity.isPending}>
            Add Activity
          </Button>
        </Stack>

        <Box mt="md">
          {activities.length === 0 ? (
            <Text c="dimmed" size="sm">No activities yet</Text>
          ) : (
            <Timeline
              active={activities.length}
              bulletSize={24}
              lineWidth={2}
            >
              {activities.map((activity: TaskActivity) => (
                <Timeline.Item
                  key={activity.id}
                  bullet={
                    <Group justify="center" align="center" style={{ height: '100%' }}>
                      <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mantine-color-blue-filled)' }} />
                    </Group>
                  }
                  title={
                    <Group justify="space-between">
                      <Text fw={600}>{activity.activity}</Text>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => handleDeleteActivity(activity.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  }
                >
                  {activity.notes && (
                    <Box component="pre" className="task-description" c="dimmed" mt="xs" style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
                      {activity.notes}
                    </Box>
                  )}
                  <Text size="xs" c="dimmed" mt="xs">
                    {formatDateTime(activity.createdAt)}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </Box>
      </Stack>
    </Card>
  )
}
