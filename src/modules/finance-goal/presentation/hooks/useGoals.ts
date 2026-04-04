import { useEffect, useMemo } from 'react'
import { useFinanceGoalStore } from '../store/useFinanceGoalStore'
import { financialGoalSchema } from './validators'

export function useGoals() {
  const { goals, isLoading, error, loadAll, addGoal, updateGoal, removeGoal } =
    useFinanceGoalStore()

  const handleAddGoal = async (goal: typeof goals[number]) => {
    financialGoalSchema.parse(goal)
    await addGoal(goal)
  }

  const handleUpdateGoal = async (goal: typeof goals[number]) => {
    financialGoalSchema.parse(goal)
    await updateGoal(goal)
  }

  useEffect(() => {
    if (goals.length === 0) {
      loadAll()
    }
  }, [loadAll, goals.length])

  return useMemo(
    () => ({
      goals,
      isLoading,
      error,
      addGoal: handleAddGoal,
      updateGoal: handleUpdateGoal,
      removeGoal,
    }),
    [goals, isLoading, error, handleAddGoal, handleUpdateGoal, removeGoal]
  )
}
