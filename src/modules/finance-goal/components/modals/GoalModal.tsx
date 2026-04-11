import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import {
  Modal,
  TextInput,
  Textarea,
  NumberInput,
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
import type { FinancialGoal, Investor, Portfolio, SIP } from '../../domain/entities'

const goalFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    startDate: z.string().min(1, 'Start date is required'),
    targetDate: z.string().min(1, 'Target date is required'),
    targetAmount: z.number().nonnegative(),
    currentAmount: z.number().nonnegative(),
    investorIds: z.array(z.string()).min(1, 'At least one investor is required'),
    portfolioIds: z.array(z.string()).min(1, 'At least one portfolio is required'),
    sipIds: z.array(z.string()),
    expectedGrowthRate: z.number().min(0).max(50),
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
  portfolios: Portfolio[]
  sips: SIP[]
  initial?: FinancialGoal | null
  onSubmit: (goal: FinancialGoal) => Promise<void>
}

const GROWTH_RATE_OPTIONS = [10, 12, 15, 18, 20]

function calculateMonthlyInvestment(targetAmount: number, years: number, annualRate: number): number {
  if (years <= 0 || annualRate <= 0) return targetAmount / 12

  const monthlyRate = annualRate / 100 / 12
  const months = years * 12

  const factor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
  return targetAmount / factor
}

export function GoalModal({
  opened,
  onClose,
  investors,
  portfolios,
  sips,
  initial,
  onSubmit,
}: GoalModalProps) {
  const investorOptions = investors.map((inv) => ({
    value: inv.id,
    label: inv.name,
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
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      startDate: initial?.startDate ?? '',
      targetDate: initial?.targetDate ?? '',
      targetAmount: initial?.targetAmount ?? 0,
      currentAmount: initial?.currentAmount ?? 0,
      investorIds: initial?.investorIds ?? [],
      portfolioIds: initial?.portfolioIds ?? [],
      sipIds: initial?.sipIds ?? [],
      expectedGrowthRate: initial?.expectedGrowthRate ?? 12,
    },
  })

  useEffect(() => {
    if (opened) {
      reset({
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        startDate: initial?.startDate ?? '',
        targetDate: initial?.targetDate ?? '',
        targetAmount: initial?.targetAmount ?? 0,
        currentAmount: initial?.currentAmount ?? 0,
        investorIds: initial?.investorIds ?? [],
        portfolioIds: initial?.portfolioIds ?? [],
        sipIds: initial?.sipIds ?? [],
        expectedGrowthRate: initial?.expectedGrowthRate ?? 12,
      })
    }
  }, [opened, initial, reset])

  const selectedInvestorIds = watch('investorIds')
  const selectedPortfolioIds = watch('portfolioIds')
  const targetAmount = watch('targetAmount')
  const startDate = watch('startDate')
  const targetDate = watch('targetDate')
  const expectedGrowthRate = watch('expectedGrowthRate')
  const selectedSipIds = watch('sipIds')

  const portfolioOptions = useMemo(() => {
    if (!selectedInvestorIds || selectedInvestorIds.length === 0) return []
    return portfolios
      .filter(p => selectedInvestorIds.includes(p.investorId))
      .map(p => ({
        value: p.id,
        label: `${p.scheme} (${p.amcName})`,
      }))
  }, [portfolios, selectedInvestorIds])

  const sipOptions = useMemo(() => {
    if (!selectedInvestorIds || selectedInvestorIds.length === 0) return []
    return sips
      .filter(s => selectedInvestorIds.includes(s.investorId))
      .map(s => ({
        value: s.id,
        label: `${s.name} • ₹${s.amount.toLocaleString()} (${s.status})`,
      }))
  }, [sips, selectedInvestorIds])

  const totalPortfolioValue = useMemo(() => {
    if (!selectedPortfolioIds || selectedPortfolioIds.length === 0) return 0
    return portfolios
      .filter(p => selectedPortfolioIds.includes(p.id))
      .reduce((sum, p) => sum + p.currentValue, 0)
  }, [selectedPortfolioIds, portfolios])

  const totalMonthlySip = useMemo(() => {
    if (!selectedSipIds || selectedSipIds.length === 0) return 0
    return sips
      .filter(sip => selectedSipIds.includes(sip.id))
      .reduce((sum, sip) => {
        const monthlyAmount = sip.frequency === 'Quarterly' ? sip.amount / 3 : sip.amount
        return sum + monthlyAmount
      }, 0)
  }, [selectedSipIds, sips])

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
      name: values.name,
      description: values.description,
      startDate: values.startDate,
      targetDate: values.targetDate,
      targetAmount: values.targetAmount,
      currentAmount: values.currentAmount,
      investorIds: values.investorIds,
      portfolioIds: values.portfolioIds,
      sipIds: values.sipIds ?? [],
      expectedGrowthRate: values.expectedGrowthRate,
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title={initial ? 'Edit Goal' : 'Add Goal'} size="xl">
      <form onSubmit={handleSubmit(submitHandler)}>
        <Stack gap="md">
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

          <Group grow>
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
            <Controller
              control={control}
              name="currentAmount"
              render={({ field }) => (
                <NumberInput
                  label="Current Amount Collected (₹)"
                  min={0}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                  error={errors.currentAmount?.message}
                />
              )}
            />
          </Group>

          <Controller
            control={control}
            name="investorIds"
            render={({ field }) => (
              <MultiSelect
                label="Investors"
                placeholder="Select one or more investors"
                data={investorOptions}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value)
                  setValue('portfolioIds', [])
                  setValue('sipIds', [])
                }}
                error={errors.investorIds?.message}
                searchable
              />
            )}
          />

          <Controller
            control={control}
            name="portfolioIds"
            render={({ field }) => (
              <MultiSelect
                label="Portfolios (Mandatory)"
                placeholder={selectedInvestorIds?.length ? "Select one or more portfolios" : "Select investor(s) first"}
                data={portfolioOptions}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value)
                  setValue('sipIds', [])
                }}
                error={errors.portfolioIds?.message}
                searchable
                disabled={!selectedInvestorIds?.length}
              />
            )}
          />

          {totalPortfolioValue > 0 && (
            <Card withBorder radius="md" padding="sm" style={{ backgroundColor: 'var(--mantine-color-green-light)' }}>
              <Group justify="space-between">
                <Group gap="xs">
                  <iconify-icon icon="lucide:briefcase" width="18" height="18" />
                  <Text fw={600} size="sm">Total Portfolio Value:</Text>
                </Group>
                <Text fw={700} size="md" c="green.8">₹{totalPortfolioValue.toLocaleString()}</Text>
              </Group>
            </Card>
          )}

          <Controller
            control={control}
            name="sipIds"
            render={({ field }) => (
              <MultiSelect
                label="SIPs (Optional)"
                placeholder={selectedPortfolioIds?.length ? "Select SIPs (optional)" : "Select portfolio(s) first"}
                data={sipOptions}
                value={field.value}
                onChange={field.onChange}
                searchable
                disabled={!selectedPortfolioIds?.length}
              />
            )}
          />

          {totalMonthlySip > 0 && (
            <Card withBorder radius="md" padding="sm" style={{ backgroundColor: 'var(--mantine-color-blue-light)' }}>
              <Group justify="space-between">
                <Group gap="xs">
                  <iconify-icon icon="lucide:trending-up" width="18" height="18" />
                  <Text fw={600} size="sm" c="blue.9">Total Monthly SIP:</Text>
                </Group>
                <Text fw={700} size="md" c="blue.9">₹{Math.round(totalMonthlySip).toLocaleString()}</Text>
              </Group>
              <Text size="xs" c="dimmed" mt={4}>
                From {selectedSipIds?.length || 0} SIP(s)
              </Text>
            </Card>
          )}

          <Box>
            <Text fw={600} size="sm" mb={6}>Expected Annual Growth Rate</Text>
            <Controller
              control={control}
              name="expectedGrowthRate"
              render={({ field }) => (
                <SegmentedControl
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  data={GROWTH_RATE_OPTIONS.map(rate => ({ label: `${rate}%`, value: String(rate) }))}
                  fullWidth
                />
              )}
            />
          </Box>

          {investmentCalculations.length > 0 && (
            <Card withBorder radius="md" padding="md">
              <Group gap="xs" mb="sm">
                <iconify-icon icon="lucide:calculator" width="20" height="20" />
                <Text fw={700} size="md">Required Monthly Investment</Text>
              </Group>
              <Text size="xs" c="dimmed" mb="md">
                To achieve target ₹{targetAmount.toLocaleString()} by {dayjs(targetDate).format('MMM YYYY')}
              </Text>

              <Stack gap="xs">
                {investmentCalculations.map((calc) => (
                  <Group
                    key={calc.rate}
                    justify="space-between"
                    p="xs"
                    style={{
                      borderRadius: rem(8),
                      backgroundColor: calc.isSelected ? 'var(--mantine-color-blue-light)' : 'var(--mantine-color-gray-light)',
                    }}
                  >
                    <Group gap="xs">
                      <Badge color={calc.isSelected ? 'blue' : 'gray'} variant={calc.isSelected ? 'filled' : 'light'}>
                        {calc.rate}% p.a.
                      </Badge>
                      {calc.isSelected && <Text size="xs" c="blue.6" fw={600}>(Selected)</Text>}
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

          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>
              {initial ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}