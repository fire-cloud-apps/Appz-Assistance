import { ActionIcon, Badge, Card, Group, Progress, Stack, Text, Title, Tooltip } from '@mantine/core'
import dayjs from 'dayjs'
import type { FinancialGoal, Portfolio } from '../../domain/entities'
import type { GoalForecastResult } from '../../domain/usecases/ForecastGoalCompletionUseCase'

interface GoalsListProps {
  goals: FinancialGoal[]
  portfolios: Portfolio[]
  forecasts?: Record<string, GoalForecastResult>
  onEdit?: (goal: FinancialGoal) => void
  onDelete?: (goal: FinancialGoal) => void
}

export function GoalsList({ goals, portfolios, forecasts, onEdit, onDelete }: GoalsListProps) {
  if (goals.length === 0) {
    return (
      <Card withBorder radius="md" padding="lg">
        <Text c="dimmed">No goals created yet.</Text>
      </Card>
    )
  }

  return (
    <Stack gap="md">
      {goals.map((goal) => {
        const current = portfolios
          .filter((portfolio) => goal.portfolioIds.includes(portfolio.id))
          .reduce((sum, portfolio) => sum + portfolio.currentValue, 0)
        const progress = goal.targetAmount > 0 ? (current / goal.targetAmount) * 100 : 0
        const statusColor = current >= goal.targetAmount ? 'green' : 'blue'
        const forecast = forecasts?.[goal.id]
        const forecastText = forecast
          ? forecast.achievedByTargetDate
            ? 'Forecast: On track to hit target date'
            : forecast.estimatedTargetDate
              ? `Forecast: ${dayjs(forecast.estimatedTargetDate).format('DD MMM YYYY')}`
              : 'Forecast: Not enough SIP contributions'
          : 'Forecast: pending'
        return (
          <Card key={goal.id} withBorder radius="md" padding="lg">
            <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={4}>{goal.name}</Title>
                  <Text c="dimmed" size="sm">
                    {goal.description}
                  </Text>
                <Text size="sm" mt="sm">
                  {dayjs(goal.startDate).format('DD MMM YYYY')} →{' '}
                  {dayjs(goal.targetDate).format('DD MMM YYYY')}
                </Text>
                <Text size="sm" c="dimmed" mt={6}>
                  {forecastText}
                </Text>
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
            <Progress mt="md" value={Math.min(progress, 100)} color={statusColor} />
            <Group justify="space-between" mt="sm">
              <Text size="sm" c="dimmed">
                Current: ₹{current.toLocaleString()}
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
