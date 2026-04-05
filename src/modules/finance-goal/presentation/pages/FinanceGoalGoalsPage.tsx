/**
 * Route: /finance/goals
 */
import { useEffect } from 'react'
import { Box, Group, Stack, Text, Title, Badge, Button, Alert } from '@mantine/core'
import { useState } from 'react'
import { useGoalForecasts, useGoals, useInvestor, useSIP, usePortfolio } from '../hooks'
import { GoalModal, GoalsList } from '../../components'
import type { FinancialGoal } from '../../domain/entities'
import { useFinanceGoalStore } from '../store/useFinanceGoalStore'

export function FinanceGoalGoalsPage() {
  const { goals, addGoal, updateGoal, removeGoal, error } = useGoals()
  const { loadAllPortfolios } = usePortfolio()
  const store = useFinanceGoalStore()
  const { investors } = useInvestor()
  const { sips } = useSIP()
  const { forecasts, error: forecastError } = useGoalForecasts(goals)
  const [modalOpened, setModalOpened] = useState(false)
  const [selected, setSelected] = useState<FinancialGoal | null>(null)

  useEffect(() => {
    loadAllPortfolios()
  }, [loadAllPortfolios])

  const portfolios = store.portfolios

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
          portfolios={portfolios}
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
    </Box>
  )
}
