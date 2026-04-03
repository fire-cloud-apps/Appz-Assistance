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
} from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import { createTaskSchema } from '../domain/usecases/validators'
import { useTaskStore, useCreateTask, useParentTasks } from '../presentation/hooks'
import { getToday } from '../../../core/utils/dateHelper'
import { useState } from 'react'

export function CreateTaskModal() {
  const { isCreateModalOpen, closeCreateModal } = useTaskStore()
  const createTask = useCreateTask()
  const { data: parentTasks = [] } = useParentTasks()
  const [dueTime, setDueTime] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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
      parentTaskId: null as string | null,
      taskLevel: 1,
    },
  })

  const parentTaskId = watch('parentTaskId')
  const taskLevel = parentTaskId ? 2 : 1

  const onSubmit = async (data: any) => {
    try {
      await createTask.mutateAsync({
        ...data,
        taskLevel,
        dueDate: data.dueDate || null,
        dueTime,
        parentTaskId: data.parentTaskId || null,
      })
      reset()
      setDueTime(null)
      closeCreateModal()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleClose = () => {
    reset()
    setDueTime(null)
    closeCreateModal()
  }

  return (
    <Modal
      opened={isCreateModalOpen}
      onClose={handleClose}
      title="Create New Task"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Title"
            placeholder="Enter task title"
            required
            error={errors.title?.message as string}
            {...register('title')}
          />

          <Textarea
            label="Description"
            placeholder="Enter task description (supports tabs, multi-line, and formatted text)"
            minRows={8}
            autosize
            maxRows={15}
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
                setValue('description', target.value)
              }
            }}
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

          <Select
            label="Parent Task (optional)"
            placeholder="Select parent task for subtask"
            data={parentTasks.map((t: any) => ({ value: t.id, label: t.title }))}
            clearable
            onChange={(value) => setValue('parentTaskId', value || null)}
            description="Leave empty for parent task"
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create Task
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
