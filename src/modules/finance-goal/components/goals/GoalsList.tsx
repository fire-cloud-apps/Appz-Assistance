import { ActionIcon, Badge, Card, Group, Progress, Stack, Text, Title, Tooltip } from '@mantine/core'
import dayjs from 'dayjs'
import type { FinancialGoal, SIP } from '../../domain/entities'
import type { GoalForecastResult } from '../../domain/usecases/ForecastGoalCompletionUseCase'

interface GoalsListProps {
  goals: FinancialGoal[]
  sips?: SIP[]
  forecasts?: Record<string, GoalForecastResult>
  onEdit?: (goal: FinancialGoal) => void
  onDelete?: (goal: FinancialGoal) => void
}

export function GoalsList({ goals, sips = [], forecasts, onEdit, onDelete }: GoalsListProps) {
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
        // Calculate total current value from SIPs
        const current = goal.sipIds
          .filter(sipId => sipId)
          .reduce((sum, sipId) => {
            const sip = sips.find(s => s.id === sipId)
            if (!sip) return sum
            return sum + sip.amount
          }, 0)

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

        // Calculate total monthly SIP investment
        const totalMonthlySip = goal.sipIds
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
                    <Text c="dimmed" size="sm">
                      {goal.description}
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

                <Text size="sm">
                  {dayjs(goal.startDate).format('DD MMM YYYY')} →{' '}
                  {dayjs(goal.targetDate).format('DD MMM YYYY')}
                </Text>
                <Text size="sm" c="dimmed">
                  {forecastText}
                </Text>

                {/* SIP Monthly Investment */}
                {totalMonthlySip > 0 && (
                  <Card
                    withBorder
                    radius="md"
                    padding="xs"
                    style={{
                      backgroundColor: 'var(--mantine-color-blue-light)',
                    }}
                  >
                    <Group gap="xs">
                      <iconify-icon icon="lucide:trending-up" width="16" height="16" />
                      <Text size="sm" fw={600} c="blue.9">
                        Monthly SIP Investment: ₹{Math.round(totalMonthlySip).toLocaleString()}
                      </Text>
                    </Group>
                  </Card>
                )}

                {/* Expected Growth Rate */}
                {goal.expectedGrowthRate > 0 && (
                  <Badge variant="outline" color="teal" size="sm">
                    <Group gap={4} wrap="nowrap">
                      <iconify-icon icon="lucide:percent" width="14" height="14" />
                      <span>Expected Growth: {goal.expectedGrowthRate}% p.a.</span>
                    </Group>
                  </Badge>
                )}
              </Stack>
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
