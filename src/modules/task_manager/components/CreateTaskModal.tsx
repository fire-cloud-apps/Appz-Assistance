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
import { createTaskSchema } from '../domain/usecases/validators'
import { useTaskStore, useCreateTask, useParentTasks } from '../presentation/hooks'
import { getToday } from '../../../core/utils/dateHelper'

export function CreateTaskModal() {
  const { isCreateModalOpen, closeCreateModal } = useTaskStore()
  const createTask = useCreateTask()
  const { data: parentTasks = [] } = useParentTasks()

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
        parentTaskId: data.parentTaskId || null,
      })
      reset()
      closeCreateModal()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleClose = () => {
    reset()
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
            placeholder="Enter task description"
            minRows={5}
            autosize
            maxRows={10}
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

          <TextInput
            label="Due Date"
            type="date"
            placeholder="Select due date"
            min={getToday()}
            onChange={(e) => setValue('dueDate', e.target.value || null)}
            error={errors.dueDate?.message as string}
          />

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
