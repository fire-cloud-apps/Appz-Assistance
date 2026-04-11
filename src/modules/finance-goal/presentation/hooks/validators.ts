import { z } from 'zod'

const dateString = z.string().min(1)

export const portfolioSchema = z.object({
  id: z.string().min(1),
  amcName: z.string().min(1),
  scheme: z.string().min(1),
  type: z.string().min(1),
  folio: z.string().min(1),
  investorId: z.string().min(1),
  unitBalance: z.number().nonnegative(),
  navDate: dateString,
  currentValue: z.number().nonnegative(),
  costValue: z.number().nonnegative(),
  appreciation: z.number(),
  weightedAvg: z.number(),
  xirr: z.number(),
})

export const sipSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'SIP name is required'),
  portfolioId: z.string().min(1),
  investorId: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.enum(['Monthly', 'Quarterly']),
  startDate: dateString,
  endDate: dateString.optional(),
  status: z.enum(['Active', 'Inactive']),
})

export const investorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})

export const financialGoalSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    startDate: dateString,
    targetDate: dateString,
    targetAmount: z.number().nonnegative(),
    currentAmount: z.number().nonnegative(),
    investorIds: z.array(z.string().min(1)).min(1, 'At least one investor is required'),
    portfolioIds: z.array(z.string().min(1)).min(1, 'At least one portfolio is required'),
    sipIds: z.array(z.string().min(1)),
    expectedGrowthRate: z.number().min(0).max(50, 'Growth rate must be between 0% and 50%'),
  })
  .refine((data) => data.targetDate > data.startDate, {
    message: 'Target date must be after start date',
    path: ['targetDate'],
  })
