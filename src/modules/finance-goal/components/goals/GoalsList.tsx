import { ActionIcon, Badge, Card, Group, Progress, SimpleGrid, Stack, Text, Title, Tooltip, Collapse, Button } from '@mantine/core'
import { useMemo, useState, useEffect } from 'react'
import dayjs from 'dayjs'
import type { FinancialGoal, Investor, Portfolio, SIP } from '../../domain/entities'
import type { GoalForecastResult } from '../../domain/usecases/ForecastGoalCompletionUseCase'
import { FinancialProjectionService } from '../../domain/services'
import { Sparkline } from './Sparkline'
import { useScenarioSettingsStore } from '../../presentation/hooks/useScenarioSettings'
import { exportProjectionCsv } from '../../data/services/exportProjectionCsv'

interface GoalsListProps {
  goals: FinancialGoal[]
  investors?: Investor[]
  portfolios?: Portfolio[]
  sips?: SIP[]
  forecasts?: Record<string, GoalForecastResult>
  onEdit?: (goal: FinancialGoal) => void
  onDelete?: (goal: FinancialGoal) => void
}

type GoalHealth = 'healthy' | 'warning' | 'danger'

function getGoalHealth(forecast: GoalForecastResult | undefined, projectionSummary: { totalFutureValue: number }, targetAmount: number): GoalHealth {
  if (!forecast || !projectionSummary) return 'warning'

  const projectedValue = forecast.totalFutureValue
  const progressPercent = (projectedValue / targetAmount) * 100

  if (progressPercent >= 100) return 'healthy'
  if (progressPercent >= 70) return 'warning'
  return 'danger'
}

const healthGradient: Record<GoalHealth, { start: string; end: string }> = {
  healthy: { start: '#22c55e', end: '#86efac' },
  warning: { start: '#f59e0b', end: '#fde68a' },
  danger: { start: '#ef4444', end: '#fca5a5' },
}

interface GoalCardProps {
  goal: FinancialGoal
  investors: Investor[]
  portfolios: Portfolio[]
  sips: SIP[]
  forecast?: GoalForecastResult
  projectionService: FinancialProjectionService
  scenarioRates: number[]
  scenarios: Array<{ rate: number; label: string }>
  onEdit?: (goal: FinancialGoal) => void
  onDelete?: (goal: FinancialGoal) => void
}

function GoalCard({
  goal,
  investors,
  portfolios,
  sips,
  forecast,
  projectionService,
  scenarioRates,
  scenarios,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const linkedPortfolios = (goal.portfolioIds ?? []).map(id => portfolios.find(p => p.id === id)).filter((p): p is Portfolio => p !== undefined)
  const portfolioValue = linkedPortfolios.reduce((sum, p) => sum + p.currentValue, 0)
  const totalCurrent = (goal.currentAmount ?? 0) + portfolioValue

  const progress = goal.targetAmount > 0 ? (totalCurrent / goal.targetAmount) * 100 : 0
  const statusColor = totalCurrent >= goal.targetAmount ? 'green' : 'blue'

  const projectionSummary = projectionService.calculateProjection({
    principal: totalCurrent,
    monthlyContribution: 0,
    annualRatePercent: goal.expectedGrowthRate ?? 0,
    startDate: goal.startDate,
    targetDate: goal.targetDate,
    targetAmount: goal.targetAmount,
  })

  const scenarioProjections = projectionService.calculateScenarioProjections({
    principal: totalCurrent,
    monthlyContribution: 0,
    startDate: goal.startDate,
    targetDate: goal.targetDate,
    targetAmount: goal.targetAmount,
    ratePercents: scenarioRates,
  })

  const health = getGoalHealth(forecast, projectionSummary, goal.targetAmount)
  const gradientColors = healthGradient[health]

  const projectionStatus = forecast
    ? forecast.achievedByTargetDate
      ? `Achievable by ${dayjs(goal.targetDate).format('MMM YYYY')}`
      : forecast.estimatedTargetDate
        ? `Est. ${dayjs(forecast.estimatedTargetDate).format('MMM YYYY')}`
        : 'Insufficient data'
    : 'Pending'

  const surplusOrShortfall = forecast?.surplusOrShortfall ?? 0
  const statusLabel = forecast
    ? forecast.achievedByTargetDate
      ? 'On Track'
      : 'Shortfall'
    : 'Pending'
  const statusVariant = forecast
    ? forecast.achievedByTargetDate
      ? 'green'
      : 'red'
    : 'gray'

  const getInvestorNames = (ids: string[]) => {
    return (ids ?? []).map(id => investors.find(i => i.id === id)?.name).filter(Boolean).join(', ')
  }

  const handleExport = (goal: FinancialGoal, projection: ReturnType<FinancialProjectionService['calculateProjection']>) => {
    exportProjectionCsv({
      goalName: goal.name,
      yearlyProjections: projection.yearlyProjections,
    })
  }

  const totalMonthlySip = (goal.sipIds ?? [])
    .filter(sipId => sipId)
    .reduce((sum, sipId) => {
      const sip = sips.find(s => s.id === sipId)
      if (!sip) return sum
      const monthlyAmount = sip.frequency === 'Quarterly' ? sip.amount / 3 : sip.amount
      return sum + monthlyAmount
    }, 0)

  return (
    <Card
      key={goal.id}
      withBorder
      radius="md"
      padding={0}
      style={{
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: `linear-gradient(180deg, ${gradientColors.start}, ${gradientColors.end})`,
        }}
      />

      <div style={{ padding: '16px', paddingLeft: 22 }}>
        <Group justify="space-between" mb="sm">
          <Stack gap={2}>
            <Title order={5} lineClamp={1}>{goal.name}</Title>
            <Text c="dimmed" size="xs" lineClamp={1}>{goal.description || 'No description'}</Text>
          </Stack>
          <Group gap={4}>
            <Tooltip label="Edit">
              <ActionIcon variant="subtle" size="sm" onClick={() => onEdit?.(goal)}>
                <iconify-icon icon="lucide:edit" width="14" height="14" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete">
              <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onDelete?.(goal)}>
                <iconify-icon icon="lucide:trash-2" width="14" height="14" />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <div style={{ marginBottom: 12, width: '100%' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: '1 1 180px', minWidth: 150 }}>
              <Sparkline
                data={projectionSummary.yearlyProjections}
                width={240}
                height={56}
                goalId={goal.id}
                startYear={goal.startDate}
                endYear={goal.targetDate}
              />
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 70,
              paddingLeft: 8,
              borderLeft: '1px solid var(--mantine-color-gray-3)',
            }}>
              <Text size="xs" c="dimmed" mb={2}>Current</Text>
              <Text size="sm" fw={600}>₹{totalCurrent.toLocaleString()}</Text>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 80,
              paddingLeft: 8,
              borderLeft: '1px solid var(--mantine-color-gray-3)',
            }}>
              <Text size="xs" c="dimmed" mb={2}>Target</Text>
              <Text size="sm" fw={600}>₹{goal.targetAmount.toLocaleString()}</Text>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 90,
              paddingLeft: 8,
              borderLeft: '1px solid var(--mantine-color-gray-3)',
            }}>
              <Text size="xs" c="dimmed" mb={2}>Forecast</Text>
              <Text size="sm" fw={700} c={forecast?.achievedByTargetDate ? 'green.7' : 'orange.7'}>
                ₹{Math.round(forecast?.totalFutureValue ?? projectionSummary.totalFutureValue).toLocaleString()}
              </Text>
            </div>
          </div>
        </div>

        <Group justify="space-between" mb="xs">
          <Badge variant="light" color={statusColor} size="sm">
            {Math.min(progress, 100).toFixed(0)}%
          </Badge>
          <Group gap="xs">
            <Badge variant="light" color={statusVariant} size="xs">{statusLabel}</Badge>
            <Text size="xs" c="dimmed">{projectionStatus}</Text>
          </Group>
        </Group>

        <Progress mt="xs" value={Math.min(progress, 100)} color={statusColor} size="sm" radius="xl" />

        <Group mt="xs" gap="xs">
          {(goal.investorIds?.length ?? 0) > 0 && (
            <Badge variant="outline" color="gray" size="xs">
              <iconify-icon icon="lucide:users" width="10" height="10" style={{ marginRight: 4 }} />
              {getInvestorNames(goal.investorIds ?? [])}
            </Badge>
          )}
          {goal.expectedGrowthRate > 0 && (
            <Badge variant="outline" color="teal" size="xs">
              {goal.expectedGrowthRate}%
            </Badge>
          )}
        </Group>

        <Button
          variant="subtle"
          size="xs"
          fullWidth
          mt="xs"
          onClick={() => setIsExpanded(!isExpanded)}
          rightSection={
            <iconify-icon
              icon="lucide:chevron-down"
              width="14"
              height="14"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          }
        >
          {isExpanded ? 'Show Less' : 'Show Details'}
        </Button>

        <Collapse in={isExpanded}>
          <Stack gap="xs" mt="sm" style={{ borderTop: '1px solid var(--mantine-color-gray-3)', paddingTop: 12 }}>
            {forecast && (
              <Stack gap={4}>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Projected Value</Text>
                  <Text size="xs" fw={600}>₹{Math.round(forecast.totalFutureValue).toLocaleString()}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {surplusOrShortfall >= 0 ? 'Surplus' : 'Shortfall'}
                  </Text>
                  <Text size="xs" fw={600} c={surplusOrShortfall >= 0 ? 'green.7' : 'red.7'}>
                    ₹{Math.abs(Math.round(surplusOrShortfall)).toLocaleString()}
                  </Text>
                </Group>
                {forecast.estimatedTargetDate && !forecast.achievedByTargetDate && (
                  <Text size="xs" c="dimmed">
                    Expected: {dayjs(forecast.estimatedTargetDate).format('DD MMM YYYY')}
                  </Text>
                )}
              </Stack>
            )}

            {projectionSummary.yearlyProjections.length > 0 && (
              <Button
                size="xs"
                variant="light"
                leftSection={<iconify-icon icon="lucide:download" width="12" height="12" />}
                onClick={() => handleExport(goal, projectionSummary)}
              >
                Export CSV
              </Button>
            )}

            {scenarioProjections.length > 0 && (
              <div>
                <Text size="xs" c="dimmed" mb={4}>Scenarios</Text>
                <Group gap={4}>
                  {scenarioProjections.map((scenario) => {
                    const scenarioLabel = scenarios.find(s => s.rate === scenario.ratePercent)?.label ?? `${scenario.ratePercent}%`
                    return (
                      <Badge
                        key={scenario.ratePercent}
                        variant="light"
                        size="xs"
                        color={
                          Math.abs(scenario.ratePercent - goal.expectedGrowthRate) < 0.01
                            ? 'blue'
                            : 'gray'
                        }
                      >
                        {scenarioLabel}: ₹{Math.round(scenario.summary.totalFutureValue / 100000).toFixed(1)}L
                      </Badge>
                    )
                  })}
                </Group>
              </div>
            )}

            {portfolioValue > 0 && (
              <Group gap="xs">
                <iconify-icon icon="lucide:briefcase" width="12" height="12" color="green" />
                <Text size="xs">Portfolio: ₹{portfolioValue.toLocaleString()}</Text>
              </Group>
            )}

            {totalMonthlySip > 0 && (
              <Group gap="xs">
                <iconify-icon icon="lucide:trending-up" width="12" height="12" color="blue" />
                <Text size="xs">SIP: ₹{Math.round(totalMonthlySip).toLocaleString()}/mo</Text>
              </Group>
            )}
          </Stack>
        </Collapse>
      </div>
    </Card>
  )
}

export function GoalsList({
  goals,
  investors = [],
  portfolios = [],
  sips = [],
  forecasts,
  onEdit,
  onDelete,
}: GoalsListProps) {
  const projectionService = useMemo(() => new FinancialProjectionService(), [])
  const { scenarios, loadScenarios } = useScenarioSettingsStore()

  useEffect(() => {
    loadScenarios()
  }, [loadScenarios])

  const scenarioRates = useMemo(() => {
    if (scenarios.length > 0) {
      return scenarios.map(s => s.rate)
    }
    return [12, 15, 18]
  }, [scenarios])

  if (goals.length === 0) {
    return (
      <Card withBorder radius="lg" padding="xl" style={{ textAlign: 'center' }}>
        <iconify-icon icon="lucide:target" width="48" height="48" style={{ color: 'var(--mantine-color-gray-5)', marginBottom: 16 }} />
        <Text c="dimmed" size="lg">No goals created yet</Text>
        <Text c="dimmed" size="sm">Create your first financial goal to get started</Text>
      </Card>
    )
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          investors={investors}
          portfolios={portfolios}
          sips={sips}
          forecast={forecasts?.[goal.id]}
          projectionService={projectionService}
          scenarioRates={scenarioRates}
          scenarios={scenarios}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </SimpleGrid>
  )
}