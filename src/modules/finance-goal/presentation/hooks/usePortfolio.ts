import { useEffect, useMemo } from 'react'
import { useFinanceGoalStore } from '../store/useFinanceGoalStore'
import { portfolioSchema } from './validators'

export function usePortfolio() {
  const {
    portfolios,
    isLoading,
    error,
    loadAll,
    addPortfolio,
    updatePortfolio,
    removePortfolio,
  } = useFinanceGoalStore()

  const handleAddPortfolio = async (portfolio: typeof portfolios[number]) => {
    portfolioSchema.parse(portfolio)
    await addPortfolio(portfolio)
  }

  const handleUpdatePortfolio = async (portfolio: typeof portfolios[number]) => {
    portfolioSchema.parse(portfolio)
    await updatePortfolio(portfolio)
  }

  useEffect(() => {
    if (portfolios.length === 0) {
      loadAll()
    }
  }, [loadAll, portfolios.length])

  return useMemo(
    () => ({
      portfolios,
      isLoading,
      error,
      addPortfolio: handleAddPortfolio,
      updatePortfolio: handleUpdatePortfolio,
      removePortfolio,
    }),
    [portfolios, isLoading, error, handleAddPortfolio, handleUpdatePortfolio, removePortfolio]
  )
}
