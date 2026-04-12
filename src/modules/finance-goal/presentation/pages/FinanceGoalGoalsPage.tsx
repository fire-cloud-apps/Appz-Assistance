/**
 * Route: /finance/goals
 */
import { Box, Group, Stack, Text, Title, Badge, Button, Alert, ActionIcon, Tooltip } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useGoalForecasts, useGoals, useInvestor, usePortfolio, useSIP } from '../hooks'
import { GoalModal, GoalsList, ScenarioSettingsModal } from '../../components'
import type { FinancialGoal } from '../../domain/entities'

export function FinanceGoalGoalsPage() {
  const { goals, addGoal, updateGoal, removeGoal, error } = useGoals()
  const { investors } = useInvestor()
  const { sips } = useSIP()
  const { portfolios, loadAllPortfolios } = usePortfolio()
  const { forecasts, error: forecastError } = useGoalForecasts(goals, portfolios)
  const [modalOpened, setModalOpened] = useState(false)
  const [settingsOpened, setSettingsOpened] = useState(false)
  const [selected, setSelected] = useState<FinancialGoal | null>(null)

  useEffect(() => {
    loadAllPortfolios()
  }, [loadAllPortfolios])

  const handleCreate = () => {
    setSelected(null)
    setModalOpened(true)
  }

  const handleEdit = (goal: FinancialGoal) => {
    setSelected(goal)
    setModalOpened(true)
  }

  const handleDelete = async (goal: FinancialGoal) => {
    if (!window.confirm(`Delete goal ${goal.name}?`)) return
    await removeGoal(goal.id)
  }

  const handleSubmit = async (goal: FinancialGoal) => {
    if (selected) {
      await updateGoal(goal)
    } else {
      await addGoal(goal)
    }
  }

  return (
    <Box>
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Financial Goals</Title>
            <Text c="dimmed">Define targets and track progress.</Text>
          </div>
          <Group gap="sm">
            <Tooltip label="Scenario Settings">
              <ActionIcon variant="light" onClick={() => setSettingsOpened(true)}>
                <iconify-icon icon="lucide:settings" width="18" height="18" />
              </ActionIcon>
            </Tooltip>
            <Badge variant="light" color="blue">
              Total: {goals.length}
            </Badge>
            <Button onClick={handleCreate}>Add Goal</Button>
          </Group>
        </Group>

        {(error || forecastError) && (
          <Alert color="red" title="Goals Error">
            {error ?? forecastError}
          </Alert>
        )}

        <GoalsList
          goals={goals}
          investors={investors}
          portfolios={portfolios}
          sips={sips}
          forecasts={forecasts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Stack>

      <GoalModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        investors={investors}
        portfolios={portfolios}
        sips={sips}
        initial={selected}
        onSubmit={handleSubmit}
      />

      <ScenarioSettingsModal
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
      />
    </Box>
  )
}