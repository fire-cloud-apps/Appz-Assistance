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
  Accordion,
  SimpleGrid,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPicker } from '../../../../core/components/IconPicker'
import type { FinancialGoal, Investor, Portfolio, SIP } from '../../domain/entities'
import { FinancialProjectionService } from '../../domain/services'

const goalFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    startDate: z.string().min(1, 'Start date is required'),
    targetDate: z.string().min(1, 'Target date is required'),
    targetAmount: z.number().nonnegative(),
    investorIds: z.array(z.string()).min(1, 'At least one investor is required'),
    portfolioIds: z.array(z.string()).min(1, 'At least one portfolio is required'),
    sipIds: z.array(z.string()),
    expectedGrowthRate: z.number().min(0).max(50),
    icon: z.string().optional(),
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

function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) {
    // 1 Crore = 10,000,000
    const crores = amount / 10000000
    return `₹${crores.toFixed(1)}C`
  } else if (amount >= 100000) {
    // 1 Lakh = 100,000
    const lakhs = amount / 100000
    return `₹${lakhs.toFixed(1)}L`
  } else if (amount >= 1000) {
    // 1 Thousand = 1,000
    const thousands = amount / 1000
    return `₹${thousands.toFixed(1)}K`
  }
  return `₹${amount.toLocaleString()}`
}

function formatAmountInIndianUnits(amount: number): string {
  const safeAmount = Number(amount) || 0

  if (safeAmount >= 10000000) {
    return `${(safeAmount / 10000000).toFixed(2)} crore`
  }

  if (safeAmount >= 100000) {
    return `${(safeAmount / 100000).toFixed(2)} lakh`
  }

  if (safeAmount >= 1000) {
    return `${(safeAmount / 1000).toFixed(2)} thousand`
  }

  return `${safeAmount.toLocaleString()} rupees`
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
      investorIds: initial?.investorIds ?? [],
      portfolioIds: initial?.portfolioIds ?? [],
      sipIds: initial?.sipIds ?? [],
      expectedGrowthRate: initial?.expectedGrowthRate ?? 12,
      icon: initial?.icon ?? '',
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
        investorIds: initial?.investorIds ?? [],
        portfolioIds: initial?.portfolioIds ?? [],
        sipIds: initial?.sipIds ?? [],
        expectedGrowthRate: initial?.expectedGrowthRate ?? 12,
        icon: initial?.icon ?? '',
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

  const targetAmountHelperText = useMemo(() => {
    const amount = Number(targetAmount) || 0
    if (amount <= 0) return undefined
    return `Approx: ${formatAmountInIndianUnits(amount)}`
  }, [targetAmount])

  const isValidDateRange = useMemo(() => {
    if (!startDate || !targetDate) return false
    const start = dayjs(startDate)
    const target = dayjs(targetDate)
    return start.isValid() && target.isValid() && target.isAfter(start)
  }, [startDate, targetDate])

  const canCalculate = useMemo(() => {
    const amount = Number(targetAmount) || 0
    return amount > 0 && isValidDateRange
  }, [targetAmount, isValidDateRange])

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

  const totalCurrentValue = totalPortfolioValue

  const totalMonthlySip = useMemo(() => {
    if (!selectedSipIds || selectedSipIds.length === 0) return 0
    return sips
      .filter(sip => selectedSipIds.includes(sip.id))
      .reduce((sum, sip) => {
        const monthlyAmount = sip.frequency === 'Quarterly' ? sip.amount / 3 : sip.amount
        return sum + monthlyAmount
      }, 0)
  }, [selectedSipIds, sips])

  const projectionService = useMemo(() => new FinancialProjectionService(), [])

  const investmentCalculations = useMemo(() => {
    const amount = Number(targetAmount) || 0

    if (!canCalculate) {
      return null
    }

    const start = dayjs(startDate)
    const target = dayjs(targetDate)

    if (!start.isValid() || !target.isValid()) {
      return null
    }

    if (amount <= 0) {
      return null
    }

    const years = target.diff(start, 'year', true)

    if (years <= 0) {
      return null
    }

    const principal = totalPortfolioValue
    const months = Math.round(years * 12)

    if (months <= 0) {
      return null
    }

    // Calculate REQUIRED MONTHLY INVESTMENT to achieve target
    // This accounts for existing principal growth and calculates additional monthly investment needed

    const monthlyRate = expectedGrowthRate / 100 / 12
    let monthlyInvestment = 0

    // Calculate required monthly investment considering existing principal
    // Formula: We need to find PMT where:
    // Target = Principal * (1+r)^n + PMT * ((1+r)^n - 1) / r
    // Solving for PMT: PMT = (Target - Principal * (1+r)^n) * r / ((1+r)^n - 1)

    if (monthlyRate <= 0) {
      // No growth - simple division of remaining amount
      monthlyInvestment = Math.max((amount - principal) / months, 0)
    } else {
      // Calculate future value of existing principal
      const growthFactor = Math.pow(1 + monthlyRate, months)
      const futureValueOfPrincipal = principal * growthFactor
      
      // Calculate the gap that needs to be filled by monthly investments
      const remainingAmount = Math.max(amount - futureValueOfPrincipal, 0)
      
      // Standard future value of annuity formula solved for PMT
      // FV = PMT * ((1+r)^n - 1) / r
      // PMT = FV * r / ((1+r)^n - 1)
      const annuityFactor = (growthFactor - 1) / monthlyRate
      monthlyInvestment = annuityFactor > 0 ? remainingAmount / annuityFactor : 0
    }

    return {
      rate: expectedGrowthRate,
      monthlyInvestment: Math.round(monthlyInvestment),
    }
  }, [canCalculate, targetAmount, startDate, targetDate, expectedGrowthRate, totalPortfolioValue, isValidDateRange])

  const projectionSummary = useMemo(() => {
    if (!canCalculate) return null
    const principal = totalPortfolioValue
    return projectionService.calculateProjection({
      principal,
      monthlyContribution: totalMonthlySip,
      annualRatePercent: expectedGrowthRate,
      startDate,
      targetDate,
      targetAmount: Number(targetAmount) || 0,
    })
  }, [canCalculate, targetAmount, startDate, targetDate, expectedGrowthRate, totalPortfolioValue, totalMonthlySip, projectionService])

  const scenarioProjections = useMemo(() => {
    if (!canCalculate) return []
    const principal = totalPortfolioValue
    return projectionService.calculateScenarioProjections({
      principal,
      monthlyContribution: totalMonthlySip,
      startDate,
      targetDate,
      targetAmount: Number(targetAmount) || 0,
      ratePercents: GROWTH_RATE_OPTIONS,
    })
  }, [canCalculate, targetAmount, startDate, targetDate, totalPortfolioValue, totalMonthlySip, projectionService])

  const milestoneProjections = useMemo(() => {
    if (!projectionSummary?.yearlyProjections.length) return []
    const years = projectionSummary.yearlyProjections
    if (years.length <= 3) return years
    const midIndex = Math.floor((years.length - 1) / 2)
    return [years[0], years[midIndex], years[years.length - 1]]
  }, [projectionSummary])

  const submitHandler = async (values: GoalFormValues) => {
    const payload: FinancialGoal = {
      id: initial?.id ?? crypto.randomUUID(),
      name: values.name,
      description: values.description,
      startDate: values.startDate,
      targetDate: values.targetDate,
      targetAmount: values.targetAmount,
      currentAmount: totalPortfolioValue,
      investorIds: values.investorIds,
      portfolioIds: values.portfolioIds,
      sipIds: values.sipIds ?? [],
      expectedGrowthRate: values.expectedGrowthRate,
      icon: values.icon,
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title={initial ? 'Edit Goal' : 'Add Goal'} size="xl">
      <form onSubmit={handleSubmit(submitHandler)}>
        <Stack gap="md">
          <Group align="flex-start" gap="md">
            <TextInput
              label="Goal Name"
              placeholder="e.g. Retirement corpus"
              {...register('name')}
              error={errors.name?.message}
              style={{ flex: 3 }}
            />

            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <IconPicker
                  value={field.value || ''}
                  onChange={field.onChange}
                  label="Goal Icon"
                  style={{ flex: 1, minWidth: '250px' }}
                />
              )}
            />
          </Group>
          <Textarea
            label="Description"
            placeholder="Describe the goal"
            {...register('description')}
            error={errors.description?.message}
            minRows={2}
          />

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DateInput
                  label="Start Date"
                  placeholder="Select start date"
                  value={field.value ? dayjs(field.value).toDate() : null}
                  onChange={(date) => field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')}
                  error={errors.startDate?.message}
                  defaultDate={new Date()}
                />
              )}
            />
            <Controller
              control={control}
              name="targetDate"
              render={({ field }) => (
                <DateInput
                  label="Target Date"
                  placeholder="Select target date"
                  value={field.value ? dayjs(field.value).toDate() : null}
                  onChange={(date) => field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')}
                  error={errors.targetDate?.message}
                  minDate={new Date()}
                />
              )}
            />
          </SimpleGrid>

          <Controller
            control={control}
            name="targetAmount"
            render={({ field }) => (
              <NumberInput
                label="Target Amount (₹)"
                min={0}
                value={field.value}
                onChange={(value) => field.onChange(value ?? 0)}
                description={targetAmountHelperText}
                error={errors.targetAmount?.message}
              />
            )}
          />

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

          <Accordion variant="contained" radius="md" defaultValue="investments">
            <Accordion.Item value="investments">
              <Accordion.Control>Investors & Contributions</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
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
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="projection">
              <Accordion.Control>Projection Insights</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  {investmentCalculations && (
                    <Card withBorder radius="md" padding="md">
                      <Group gap="xs" mb="sm">
                        <iconify-icon icon="lucide:calculator" width="20" height="20" />
                        <Text fw={700} size="md">Required Monthly Investment</Text>
                      </Group>
                      <Text size="xs" c="dimmed" mb="md">
                        To achieve target {formatIndianCurrency(Number(targetAmount))}(₹{Number(targetAmount).toLocaleString()}) by {dayjs(targetDate).format('MMM YYYY')} at {investmentCalculations.rate}% p.a.
                      </Text>

                      <Group justify="center" p="md">
                        <Text size="xl" fw={700} c={investmentCalculations.monthlyInvestment === 0 ? 'green.7' : 'blue.7'}>
                          {investmentCalculations.monthlyInvestment === 0 ? (
                            <Group gap="xs">
                              <iconify-icon icon="lucide:check-circle" width="24" height="24" />
                              <Text span>Already Covered</Text>
                            </Group>
                          ) : (
                            `₹${investmentCalculations.monthlyInvestment.toLocaleString()}/month`
                          )}
                        </Text>
                      </Group>
                    </Card>
                  )}

                  {projectionSummary && (
                    <Card withBorder radius="md" padding="md" style={{ backgroundColor: 'var(--mantine-color-yellow-light)' }}>
                      <Group gap="xs" mb="sm">
                        <iconify-icon icon="lucide:sparkles" width="20" height="20" />
                        <Text fw={700} size="md">Smart Projection</Text>
                      </Group>
                      <Text size="sm" mb="sm">
                        At {expectedGrowthRate}% annual growth, with a monthly investment of ₹{Math.round(totalMonthlySip).toLocaleString()} and
                        current amount ₹{Math.round(totalCurrentValue).toLocaleString()}, you will reach ₹
                        {Math.round(projectionSummary.totalFutureValue).toLocaleString()} by {dayjs(targetDate).format('MMM YYYY')}.
                      </Text>
                      {projectionSummary.achievedByTargetDate ? (
                        <Text size="sm" fw={600} c="green.7">
                          Surplus vs target: ₹{Math.abs(Math.round(projectionSummary.surplusOrShortfall ?? 0)).toLocaleString()}
                        </Text>
                      ) : (
                        <Text size="sm" fw={600} c="red.7">
                          Shortfall vs target: ₹{Math.abs(Math.round(projectionSummary.surplusOrShortfall ?? 0)).toLocaleString()}
                        </Text>
                      )}
                      {!projectionSummary.achievedByTargetDate && projectionSummary.estimatedTargetDate && (
                        <Text size="xs" c="dimmed" mt={6}>
                          Expected to reach target by {dayjs(projectionSummary.estimatedTargetDate).format('MMM YYYY')}
                        </Text>
                      )}
                      {!projectionSummary.achievedByTargetDate && projectionSummary.requiredMonthlySip != null && (
                        <Text size="xs" c="dimmed" mt={4}>
                          Suggested monthly SIP to hit target: ₹{Math.round(projectionSummary.requiredMonthlySip).toLocaleString()}
                        </Text>
                      )}

                      {milestoneProjections.length > 0 && (
                        <Stack gap={4} mt="sm">
                          <Text size="xs" c="dimmed">Milestones</Text>
                          {milestoneProjections.map((milestone) => (
                            <Group key={milestone.date} justify="space-between">
                              <Text size="xs">{milestone.yearLabel}</Text>
                              <Text size="xs" fw={600}>
                                ₹{Math.round(milestone.totalFutureValue).toLocaleString()}
                              </Text>
                            </Group>
                          ))}
                        </Stack>
                      )}
                    </Card>
                  )}

                  {scenarioProjections.length > 0 && (
                    <Card withBorder radius="md" padding="md">
                      <Group gap="xs" mb="sm">
                        <iconify-icon icon="lucide:layers" width="20" height="20" />
                        <Text fw={700} size="md">Scenario Comparison</Text>
                      </Group>
                      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="sm">
                        {scenarioProjections.map((scenario) => (
                          <Card
                            key={scenario.ratePercent}
                            withBorder
                            radius="md"
                            padding="sm"
                            style={{
                              backgroundColor:
                                Math.abs(scenario.ratePercent - expectedGrowthRate) < 0.01
                                  ? 'var(--mantine-color-blue-light)'
                                  : 'var(--mantine-color-gray-light)',
                            }}
                          >
                            <Group justify="space-between" mb={6}>
                              <Badge variant="light" color="gray">
                                {scenario.ratePercent}% p.a.
                              </Badge>
                              {Math.abs(scenario.ratePercent - expectedGrowthRate) < 0.01 && (
                                <Text size="xs" c="blue.7" fw={600}>Selected</Text>
                              )}
                            </Group>
                            <Text size="sm" fw={700}>
                              ₹{Math.round(scenario.summary.totalFutureValue).toLocaleString()}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {scenario.summary.achievedByTargetDate ? 'On track' : 'Shortfall'}
                            </Text>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Card>
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

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
