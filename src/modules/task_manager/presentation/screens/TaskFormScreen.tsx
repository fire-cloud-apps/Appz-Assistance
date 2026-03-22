import { useEffect, useState } from 'react' // Added
import { useForm } from 'react-hook-form' // Added
import { zodResolver } from '@hookform/resolvers/zod' // Added
import {
  Button,
  TextInput,
  Textarea,
  Select,
  Stack,
  Group,
  Title,
  Container,
  LoadingOverlay,
  Badge,
  Box,
  Text,
} from '@mantine/core' // Added Mantine components
import { DateInput } from '@mantine/dates' // Added DateInput

import {
  createTaskSchema,
} from '../../domain/usecases/validators'
// Removed import { z } from 'zod'
import {
  useCreateTask,
  useUpdateTask,
  useParentTasks,
  useTaskById,
} from '../hooks'
import { getToday } from '../../../../core/utils/dateHelper'
import { useNavigate, useParams } from 'react-router-dom'
import { Task, RecurrencePattern } from '../../data/models'
import { RecurrencePicker } from '../../components/RecurrencePicker'
import { getRecurrenceLabel } from '../../../../core/utils/recurrenceHelper'

// Removed type TaskFormValues = z.infer<typeof createTaskSchema>
// Removed type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>

export function TaskFormScreen() {
  const navigate = useNavigate()
  const { id: taskId } = useParams<{ id: string }>()
  const isEditing = !!taskId

  const { data: taskToEdit, isLoading: isLoadingTask } = useTaskById(taskId || '')
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const { data: parentTasks = [] } = useParentTasks()

  // Recurrence state
  const [recurrencePickerOpened, setRecurrencePickerOpened] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>({ // Use any to bypass strict type checking temporarily
    resolver: zodResolver(createTaskSchema), // Always use createTaskSchema for resolver
    defaultValues: {
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      dueDate: null,
      parentTaskId: null,
      taskLevel: 1,
    },
  })

  useEffect(() => {
    if (isEditing && taskToEdit) {
      reset({
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        status: taskToEdit.status,
        priority: taskToEdit.priority,
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : null,
        parentTaskId: taskToEdit.parentTaskId || null,
        taskLevel: taskToEdit.taskLevel,
      })
      // Load recurrence data
      if (taskToEdit.recurrencePattern) {
        setRecurrencePattern(taskToEdit.recurrencePattern)
        setRecurrenceEndDate(taskToEdit.recurrenceEndDate || null)
      } else {
        setRecurrencePattern(null)
        setRecurrenceEndDate(null)
      }
    } else if (!isEditing) {
      reset({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        dueDate: null,
        parentTaskId: null,
        taskLevel: 1,
      })
      setRecurrencePattern(null)
      setRecurrenceEndDate(null)
    }
  }, [isEditing, taskToEdit, reset])

  const onSubmit = async (data: any) => { // Use any to bypass strict type checking temporarily
    try {
      if (isEditing) {
        await updateTask.mutateAsync({
          id: taskId!,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate,
          parentTaskId: data.parentTaskId,
          taskLevel: data.taskLevel,
          updatedAt: new Date().toISOString(),
          isRecurring: !!recurrencePattern,
          recurrencePattern,
          recurrenceEndDate,
        } as Task) // Cast to Task for updateTask.mutateAsync
      } else {
        await createTask.mutateAsync({
          ...data,
          isRecurring: !!recurrencePattern,
          recurrencePattern,
          recurrenceEndDate,
        })
      }
      navigate(-1) // Go back to the previous screen
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} task:`, error)
    }
  }

  const handleCancel = () => {
    navigate(-1) // Go back to the previous screen
  }

  const handleRecurrenceSave = (pattern: RecurrencePattern | null, endDate: string | null) => {
    setRecurrencePattern(pattern)
    setRecurrenceEndDate(endDate)
    setRecurrencePickerOpened(false)
  }

  const handleClearRecurrence = () => {
    setRecurrencePattern(null)
    setRecurrenceEndDate(null)
  }

  if (isEditing && isLoadingTask) {
    return <LoadingOverlay visible />
  }

  return (
    <Container size="sm" my="md">
      <Title order={2} mb="lg">
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Title"
            placeholder="Enter task title"
            required
            error={errors.title?.message as string}
            {...register('title')}
            autoFocus
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
            value={watch('priority')}
          />

          <Select
            label="Status"
            data={['Pending', 'InProgress', 'Completed', 'Cancelled']}
            defaultValue="Pending"
            onChange={(value) => setValue('status', (value || 'Pending') as any)}
            error={errors.status?.message as string}
            value={watch('status')}
          />

          <DateInput
            label="Due Date"
            placeholder="Select due date"
            minDate={new Date(getToday())}
            valueFormat="YYYY-MM-DD"
            value={watch('dueDate') as string | null}
            onChange={(value) => setValue('dueDate', value || null)}
            error={errors.dueDate?.message as string}
          />

          {/* Recurrence Picker Button */}
          <Box>
            <Group justify="space-between" align="flex-end" mb="xs">
              <Text size="sm" fw={500}>
                Repeat
              </Text>
              {recurrencePattern && (
                <Badge
                  variant="light"
                  color="blue"
                  size="sm"
                  rightSection={
                    <Text
                      component="span"
                      size="xs"
                      c="blue"
                      fw={500}
                      style={{ cursor: 'pointer', marginLeft: 4 }}
                      onClick={handleClearRecurrence}
                    >
                      ✕
                    </Text>
                  }
                >
                  {getRecurrenceLabel(recurrencePattern)}
                </Badge>
              )}
            </Group>
            <Button
              variant={recurrencePattern ? 'outline' : 'light'}
              color={recurrencePattern ? 'gray' : 'blue'}
              onClick={() => setRecurrencePickerOpened(true)}
              fullWidth
              justify="flex-start"
            >
              {recurrencePattern
                ? `Repeats: ${getRecurrenceLabel(recurrencePattern)}${recurrenceEndDate ? ` until ${new Date(recurrenceEndDate).toLocaleDateString()}` : ''}`
                : 'Does not repeat'}
            </Button>
          </Box>

          <Select
            label="Parent Task (optional)"
            placeholder="Select parent task for subtask"
            data={parentTasks.map((t: any) => ({ value: t.id, label: t.title }))}
            clearable
            onChange={(value) => setValue('parentTaskId', value || null)}
            description="Leave empty for parent task"
            value={watch('parentTaskId')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </Group>
        </Stack>
      </form>

      <RecurrencePicker
        opened={recurrencePickerOpened}
        onClose={() => setRecurrencePickerOpened(false)}
        onSave={handleRecurrenceSave}
        initialPattern={recurrencePattern}
        initialEndDate={recurrenceEndDate}
        dueDate={watch('dueDate') as string | null}
      />
    </Container>
  )
}
