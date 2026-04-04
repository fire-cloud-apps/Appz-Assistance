import { useEffect, useState } from 'react'
import type { FinancialGoal } from '../../domain/entities'
import { FinanceGoalDatasource } from '../../data/datasources/FinanceGoalDatasource'
import { GoalRepository, PortfolioRepository, SIPRepository } from '../../data/repositories'
import {
  ForecastGoalCompletionUseCase,
  GoalForecastResult,
} from '../../domain/usecases/ForecastGoalCompletionUseCase'

const datasource = new FinanceGoalDatasource()
const goalRepository = new GoalRepository(datasource)
const portfolioRepository = new PortfolioRepository(datasource)
const sipRepository = new SIPRepository(datasource)
const forecastUseCase = new ForecastGoalCompletionUseCase(
  goalRepository,
  portfolioRepository,
  sipRepository
)

export function useGoalForecasts(goals: FinancialGoal[], annualReturnRate = 0) {
  const [forecasts, setForecasts] = useState<Record<string, GoalForecastResult>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadForecasts = async () => {
      if (goals.length === 0) {
        setForecasts({})
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const results = await Promise.all(
          goals.map((goal) =>
            forecastUseCase.execute({ goal, annualReturnRate }).then((result) => [goal.id, result] as const)
          )
        )

        if (isMounted) {
          const map: Record<string, GoalForecastResult> = {}
          results.forEach(([id, result]) => {
            map[id] = result
          })
          setForecasts(map)
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadForecasts()

    return () => {
      isMounted = false
    }
  }, [goals, annualReturnRate])

  return { forecasts, isLoading, error }
}
