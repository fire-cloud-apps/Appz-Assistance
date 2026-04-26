import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  Select,
  Stack,
  Group,
  Text,
} from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import { createTaskSchema } from '../domain/usecases/validators'
import { useTaskStore, useCreateTask } from '../presentation/hooks'
import { getToday } from '../../../core/utils/dateHelper'
import { useState } from 'react'
import { useAuthUser } from '../../../core/auth/useAuthUser'

interface SubtaskModalProps {
  parentTaskId: string
  parentTaskTitle: string
  parentTaskLevel: number
}

export function SubtaskModal({ parentTaskId, parentTaskTitle, parentTaskLevel }: SubtaskModalProps) {
  const { isSubtaskModalOpen, closeSubtaskModal } = useTaskStore()
  const createTask = useCreateTask()
  const [dueTime, setDueTime] = useState<string | null>(null)
  const { profile } = useAuthUser()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      dueDate: null as string | null,
      dueTime: null as string | null,
      parentTaskId: parentTaskId,
      taskLevel: parentTaskLevel + 1,
    },
  })

  const taskLevel = parentTaskLevel + 1

  const onSubmit = async (data: any) => {
    try {
      await createTask.mutateAsync({
        ...data,
        taskLevel,
        dueDate: data.dueDate || null,
        dueTime,
        parentTaskId: parentTaskId,
        sync: false,
        userId: profile?.id ?? '',
      })
      reset()
      setDueTime(null)
      closeSubtaskModal()
    } catch (error) {
      console.error('Failed to create subtask:', error)
    }
  }

  const handleClose = () => {
    reset()
    setDueTime(null)
    closeSubtaskModal()
  }

  return (
    <Modal
      opened={isSubtaskModalOpen}
      onClose={handleClose}
      title={`Add Subtask to "${parentTaskTitle}"`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Text size="sm" c="dimmed">
            Parent Task: <strong>{parentTaskTitle}</strong> (Level {parentTaskLevel})
          </Text>
          <Text size="xs" c="blue">
            This will be a Level {taskLevel} task
          </Text>

          <TextInput
            label="Title"
            placeholder="Enter subtask title"
            required
            error={errors.title?.message as string}
            {...register('title')}
          />

          <Textarea
            label="Description"
            placeholder="Enter subtask description"
            minRows={3}
            error={errors.description?.message as string}
            {...register('description')}
          />

          <Select
            label="Priority"
            data={['Low', 'Medium', 'High', 'Critical']}
            defaultValue="Medium"
            onChange={(value) => setValue('priority', (value || 'Medium') as any)}
            error={errors.priority?.message as string}
          />

          <Select
            label="Status"
            data={['Pending', 'InProgress', 'Completed', 'Cancelled']}
            defaultValue="Pending"
            onChange={(value) => setValue('status', (value || 'Pending') as any)}
            error={errors.status?.message as string}
          />

          <Group grow>
            <TextInput
              label="Due Date"
              type="date"
              placeholder="Select due date"
              min={getToday()}
              onChange={(e) => setValue('dueDate', e.target.value || null)}
              error={errors.dueDate?.message as string}
            />
            <TimeInput
              label="Due Time"
              placeholder="Select due time"
              value={dueTime || ''}
              onChange={(e) => {
                const value = e.currentTarget.value
                setDueTime(value || null)
              }}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create Subtask
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
