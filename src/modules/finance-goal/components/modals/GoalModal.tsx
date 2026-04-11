import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import {
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Stack,
  Card,
  Text,
  Badge,
  SegmentedControl,
  Box,
  Divider,
  rem,
} from '@mantine/core'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FinancialGoal, Investor, SIP } from '../../domain/entities'

const goalFormSchema = z
  .object({
    investorId: z.string().min(1, 'Investor is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    startDate: z.string().min(1, 'Start date is required'),
    targetDate: z.string().min(1, 'Target date is required'),
    targetAmount: z.number().positive('Target amount must be greater than 0'),
    expectedGrowthRate: z.number().min(1).max(50, 'Growth rate must be between 1% and 50%'),
    sipIds: z.array(z.string()).min(1, 'At least one SIP is required'),
  })
  .refine((data) => data.targetDate > data.startDate, {
    message: 'Target date must be after start date',
    path: ['targetDate'],
  })

type GoalFormValues = z.infer<typeof goalFormSchema>

interface GoalModalProps {
  opened: boolean
  onClose: () => void
  investors: Investor[]
  sips: SIP[]
  initial?: FinancialGoal | null
  onSubmit: (goal: FinancialGoal) => Promise<void>
}

// Growth rate options
const GROWTH_RATE_OPTIONS = [10, 12, 15, 18, 20]

function calculateMonthlyInvestment(targetAmount: number, years: number, annualRate: number): number {
  if (years <= 0 || annualRate <= 0) return targetAmount / 12

  const monthlyRate = annualRate / 100 / 12
  const months = years * 12

  // Future Value of SIP formula: FV = P * [((1 + r)^n - 1) / r] * (1 + r)
  // Solving for P: P = FV / [((1 + r)^n - 1) / r * (1 + r)]
  const factor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
  return targetAmount / factor
}

export function GoalModal({
  opened,
  onClose,
  investors,
  sips,
  initial,
  onSubmit,
}: GoalModalProps) {
  const investorOptions = investors.map((investor) => ({
    value: investor.id,
    label: investor.name,
  }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      investorId: initial?.investorId ?? '',
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      startDate: initial?.startDate ?? '',
      targetDate: initial?.targetDate ?? '',
      targetAmount: initial?.targetAmount ?? 0,
      expectedGrowthRate: initial?.expectedGrowthRate ?? 12,
      sipIds: initial?.sipIds ?? [],
    },
  })

  useEffect(() => {
    if (opened) {
      reset({
        investorId: initial?.investorId ?? '',
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        startDate: initial?.startDate ?? '',
        targetDate: initial?.targetDate ?? '',
        targetAmount: initial?.targetAmount ?? 0,
        expectedGrowthRate: initial?.expectedGrowthRate ?? 12,
        sipIds: initial?.sipIds ?? [],
      })
    }
  }, [opened, initial, reset])

  const selectedInvestorId = watch('investorId')
  const targetAmount = watch('targetAmount')
  const startDate = watch('startDate')
  const targetDate = watch('targetDate')
  const expectedGrowthRate = watch('expectedGrowthRate')
  const selectedSipIds = watch('sipIds')

  // Filter SIPs by investor only
  const sipOptions = useMemo(() => {
    return sips
      .filter((sip) => !selectedInvestorId || sip.investorId === selectedInvestorId)
      .map((sip) => ({
        value: sip.id,
        label: `${sip.name} • ₹${sip.amount.toLocaleString()}`,
      }))
  }, [sips, selectedInvestorId])

  // Calculate total monthly SIP investment
  const totalMonthlySip = useMemo(() => {
    if (!selectedSipIds || selectedSipIds.length === 0) return 0
    return sips
      .filter(sip => selectedSipIds.includes(sip.id))
      .reduce((sum, sip) => {
        // Convert quarterly to monthly
        const monthlyAmount = sip.frequency === 'Quarterly' ? sip.amount / 3 : sip.amount
        return sum + monthlyAmount
      }, 0)
  }, [selectedSipIds, sips])

  // Calculate required monthly investment for different growth rates
  const investmentCalculations = useMemo(() => {
    if (!targetAmount || targetAmount <= 0 || !startDate || !targetDate) return []

    const start = dayjs(startDate)
    const target = dayjs(targetDate)
    const years = target.diff(start, 'year', true)

    if (years <= 0) return []

    return GROWTH_RATE_OPTIONS.map(rate => ({
      rate,
      monthlyInvestment: Math.round(calculateMonthlyInvestment(targetAmount, years, rate)),
      isSelected: Math.abs(rate - expectedGrowthRate) < 0.01,
    }))
  }, [targetAmount, startDate, targetDate, expectedGrowthRate])

  const submitHandler = async (values: GoalFormValues) => {
    const payload: FinancialGoal = {
      id: initial?.id ?? crypto.randomUUID(),
      investorId: values.investorId,
      name: values.name,
      description: values.description,
      startDate: values.startDate,
      targetDate: values.targetDate,
      targetAmount: values.targetAmount,
      expectedGrowthRate: values.expectedGrowthRate,
      sipIds: values.sipIds ?? [],
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title={initial ? 'Edit Goal' : 'Add Goal'} size="xl">
      <form onSubmit={handleSubmit(submitHandler)}>
        <Stack gap="md">
          {/* Investor Selection */}
          <Controller
            control={control}
            name="investorId"
            render={({ field }) => (
              <Select
                label="Investor"
                placeholder="Select investor"
                data={investorOptions}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value)
                  // Reset SIPs when investor changes
                  setValue('sipIds', [])
                }}
                error={errors.investorId?.message}
              />
            )}
          />

          {/* Goal Basic Info */}
          <TextInput
            label="Goal Name"
            placeholder="e.g. Retirement corpus"
            {...register('name')}
            error={errors.name?.message}
          />
          <Textarea
            label="Description"
            placeholder="Describe the goal"
            {...register('description')}
            error={errors.description?.message}
            minRows={2}
          />

          {/* Dates */}
          <Group grow>
            <TextInput
              label="Start Date"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <TextInput
              label="Target Date"
              type="date"
              {...register('targetDate')}
              error={errors.targetDate?.message}
            />
          </Group>

          {/* Target Amount */}
          <Controller
            control={control}
            name="targetAmount"
            render={({ field }) => (
              <NumberInput
                label="Target Amount (₹)"
                min={0}
                value={field.value}
                onChange={(value) => field.onChange(value ?? 0)}
                error={errors.targetAmount?.message}
              />
            )}
          />

          {/* SIP Selection (filtered by Investor) */}
          <Controller
            control={control}
            name="sipIds"
            render={({ field }) => (
              <MultiSelect
                label="SIPs"
                placeholder={selectedInvestorId ? "Select one or more SIPs" : "Select investor first"}
                data={sipOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.sipIds?.message}
                searchable
                disabled={!selectedInvestorId}
              />
            )}
          />

          {/* Total Monthly SIP Investment Display */}
          {totalMonthlySip > 0 && (
            <Card
              withBorder
              radius="md"
              padding="md"
              style={{
                backgroundColor: 'var(--mantine-color-blue-light)',
              }}
            >
              <Group justify="space-between">
                <Group gap="xs">
                  <iconify-icon icon="lucide:trending-up" width="20" height="20" />
                  <Text fw={600} size="sm" c="blue.9">Total Monthly SIP Investment:</Text>
                </Group>
                <Text fw={700} size="lg" c="blue.9">
                  ₹{totalMonthlySip.toLocaleString()}
                </Text>
              </Group>
              <Text size="xs" c="dimmed" mt={4}>
                From {selectedSipIds?.length || 0} SIP(s) selected
              </Text>
            </Card>
          )}

          {/* Expected Growth Rate Selection */}
          <Box>
            <Text fw={600} size="sm" mb={6}>
              Expected Annual Growth Rate
            </Text>
            <Controller
              control={control}
              name="expectedGrowthRate"
              render={({ field }) => (
                <SegmentedControl
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  data={GROWTH_RATE_OPTIONS.map(rate => ({
                    label: `${rate}%`,
                    value: String(rate),
                  }))}
                  fullWidth
                />
              )}
            />
          </Box>

          {/* Monthly Investment Calculator */}
          {investmentCalculations.length > 0 && (
            <Card withBorder radius="md" padding="md">
              <Group gap="xs" mb="sm">
                <iconify-icon icon="lucide:calculator" width="20" height="20" />
                <Text fw={700} size="md">Required Monthly Investment</Text>
              </Group>
              <Text size="xs" c="dimmed" mb="md">
                To achieve target of ₹{targetAmount.toLocaleString()} by {dayjs(targetDate).format('MMM YYYY')}
              </Text>

              <Stack gap="xs">
                {investmentCalculations.map((calc) => (
                  <Group
                    key={calc.rate}
                    justify="space-between"
                    p="xs"
                    style={{
                      borderRadius: rem(8),
                      backgroundColor: calc.isSelected
                        ? 'var(--mantine-color-blue-light)'
                        : 'var(--mantine-color-gray-light)',
                    }}
                  >
                    <Group gap="xs">
                      <Badge
                        color={calc.isSelected ? 'blue' : 'gray'}
                        variant={calc.isSelected ? 'filled' : 'light'}
                      >
                        {calc.rate}% p.a.
                      </Badge>
                      {calc.isSelected && (
                        <Text size="xs" c="blue.6" fw={600}>
                          (Selected)
                        </Text>
                      )}
                    </Group>
                    <Text fw={calc.isSelected ? 700 : 500} size="sm">
                      ₹{calc.monthlyInvestment.toLocaleString()}/month
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          )}

          <Divider />

          {/* Action Buttons */}
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {initial ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
