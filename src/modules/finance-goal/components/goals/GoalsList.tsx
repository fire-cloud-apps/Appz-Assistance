import { ActionIcon, Badge, Card, Group, Progress, Stack, Text, Title, Tooltip } from '@mantine/core'
import dayjs from 'dayjs'
import type { FinancialGoal, Investor, Portfolio, SIP } from '../../domain/entities'
import type { GoalForecastResult } from '../../domain/usecases/ForecastGoalCompletionUseCase'

interface GoalsListProps {
  goals: FinancialGoal[]
  investors?: Investor[]
  portfolios?: Portfolio[]
  sips?: SIP[]
  forecasts?: Record<string, GoalForecastResult>
  onEdit?: (goal: FinancialGoal) => void
  onDelete?: (goal: FinancialGoal) => void
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
  if (goals.length === 0) {
    return (
      <Card withBorder radius="md" padding="lg">
        <Text c="dimmed">No goals created yet.</Text>
      </Card>
    )
  }

  const getInvestorNames = (ids: string[]) => {
    return (ids ?? []).map(id => investors.find(i => i.id === id)?.name).filter(Boolean).join(', ')
  }

  const getPortfolioValues = (ids: string[]) => {
    return (portfolios ?? []).filter(p => ids.includes(p.id))
  }

  return (
    <Stack gap="md">
      {goals.map((goal) => {
        const linkedPortfolios = getPortfolioValues(goal.portfolioIds ?? [])
        const portfolioValue = linkedPortfolios.reduce((sum, p) => sum + p.currentValue, 0)
        const totalCurrent = (goal.currentAmount ?? 0) + portfolioValue

        const progress = goal.targetAmount > 0 ? (totalCurrent / goal.targetAmount) * 100 : 0
        const statusColor = totalCurrent >= goal.targetAmount ? 'green' : 'blue'

        const forecast = forecasts?.[goal.id]
        const forecastText = forecast
          ? forecast.achievedByTargetDate
            ? 'Forecast: On track to hit target date'
            : forecast.estimatedTargetDate
              ? `Forecast: ${dayjs(forecast.estimatedTargetDate).format('DD MMM YYYY')}`
              : 'Forecast: Not enough contributions'
          : 'Forecast: pending'

        const totalMonthlySip = (goal.sipIds ?? [])
          .filter(sipId => sipId)
          .reduce((sum, sipId) => {
            const sip = sips.find(s => s.id === sipId)
            if (!sip) return sum
            const monthlyAmount = sip.frequency === 'Quarterly' ? sip.amount / 3 : sip.amount
            return sum + monthlyAmount
          }, 0)

        return (
          <Card key={goal.id} withBorder radius="md" padding="lg">
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs" style={{ flex: 1 }}>
                <Group justify="space-between">
                  <div>
                    <Title order={4}>{goal.name}</Title>
                    <Text c="dimmed" size="sm">{goal.description}</Text>
                  </div>
                  <Group gap={6}>
                    <Badge variant="light" color={statusColor}>
                      {Math.min(progress, 100).toFixed(0)}%
                    </Badge>
                    <Tooltip label="Edit">
                      <ActionIcon variant="subtle" onClick={() => onEdit?.(goal)}>
                        <iconify-icon icon="lucide:edit" width="16" height="16" />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon variant="subtle" color="red" onClick={() => onDelete?.(goal)}>
                        <iconify-icon icon="lucide:trash-2" width="16" height="16" />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>

                <Text size="sm">
                  {dayjs(goal.startDate).format('DD MMM YYYY')} →{' '}
                  {dayjs(goal.targetDate).format('DD MMM YYYY')}
                </Text>

                {(goal.investorIds?.length ?? 0) > 0 && (
                  <Group gap="xs">
                    <Badge variant="outline" color="gray" size="sm">
                      <Group gap={4} wrap="nowrap">
                        <iconify-icon icon="lucide:users" width="14" height="14" />
                        <span>{getInvestorNames(goal.investorIds ?? [])}</span>
                      </Group>
                    </Badge>
                    {(goal.portfolioIds?.length ?? 0) > 0 && (
                      <Badge variant="outline" color="blue" size="sm">
                        <Group gap={4} wrap="nowrap">
                          <iconify-icon icon="lucide:briefcase" width="14" height="14" />
                          <span>{linkedPortfolios.length} Portfolio(s)</span>
                        </Group>
                      </Badge>
                    )}
                  </Group>
                )}

                <Text size="sm" c="dimmed">{forecastText}</Text>

                {portfolioValue > 0 && (
                  <Card withBorder radius="md" padding="xs" style={{ backgroundColor: 'var(--mantine-color-green-light)' }}>
                    <Group gap="xs">
                      <iconify-icon icon="lucide:briefcase" width="16" height="16" />
                      <Text size="sm" fw={600} c="green.9">
                        Portfolio Value: ₹{portfolioValue.toLocaleString()}
                      </Text>
                    </Group>
                  </Card>
                )}

                {totalMonthlySip > 0 && (
                  <Card withBorder radius="md" padding="xs" style={{ backgroundColor: 'var(--mantine-color-blue-light)' }}>
                    <Group gap="xs">
                      <iconify-icon icon="lucide:trending-up" width="16" height="16" />
                      <Text size="sm" fw={600} c="blue.9">
                        Monthly SIP: ₹{Math.round(totalMonthlySip).toLocaleString()}
                      </Text>
                    </Group>
                  </Card>
                )}

                {goal.expectedGrowthRate > 0 && (
                  <Badge variant="outline" color="teal" size="sm">
                    <Group gap={4} wrap="nowrap">
                      <iconify-icon icon="lucide:percent" width="14" height="14" />
                      <span>Growth: {goal.expectedGrowthRate}% p.a.</span>
                    </Group>
                  </Badge>
                )}
              </Stack>
            </Group>
            <Progress mt="md" value={Math.min(progress, 100)} color={statusColor} />
            <Group justify="space-between" mt="sm">
              <Text size="sm" c="dimmed">
                Current: ₹{totalCurrent.toLocaleString()}
              </Text>
              <Text size="sm" c="dimmed">
                Target: ₹{goal.targetAmount.toLocaleString()}
              </Text>
            </Group>
          </Card>
        )
      })}
    </Stack>
  )
}