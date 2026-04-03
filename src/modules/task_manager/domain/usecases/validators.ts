import { z } from 'zod'

export const taskStatusSchema = z.enum(['Pending', 'InProgress', 'Completed', 'Cancelled'])

export const taskPrioritySchema = z.enum(['Low', 'Medium', 'High', 'Critical'])

export const recurrenceFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly'])

export const recurrenceWeeklyDaySchema = z.enum(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])

export const recurrencePatternSchema = z.object({
  frequency: recurrenceFrequencySchema,
  interval: z.number().min(1).max(365),
  weeklyDays: z.array(recurrenceWeeklyDaySchema).optional(),
  monthlyDay: z.number().min(1).max(31).optional(),
  count: z.number().min(1).max(1000).optional(),
})

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  status: taskStatusSchema.default('Pending'),
  priority: taskPrioritySchema.default('Medium'),
  dueDate: z
    .string()
    .nullable()
    .optional(),
  dueTime: z
    .string()
    .nullable()
    .optional(),
  parentTaskId: z
    .string()
    .nullable()
    .optional(),
  taskLevel: z
    .number()
    .min(1)
    .max(3, 'Task level cannot exceed 3'),
  // Recurrence fields
  isRecurring: z.boolean().optional(),
  recurrencePattern: recurrencePatternSchema.nullable().optional(),
  recurrenceEndDate: z
    .string()
    .nullable()
    .optional(),
})

export const updateTaskSchema = createTaskSchema.extend({
  id: z.string(),
}).partial()

export const taskActivitySchema = z.object({
  taskId: z.string(),
  activity: z
    .string()
    .min(1, 'Activity is required'),
  notes: z
    .string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional(),
})
