import { useCallback, useEffect, useMemo } from 'react'
import { useFinanceGoalStore } from '../store/useFinanceGoalStore'
import { portfolioSchema } from './validators'

export interface PortfolioFilters {
  investorId?: string
  amcName?: string
  schemeSearch?: string
}

export function usePortfolio() {
  const {
    portfolios,
    isLoading,
    error,
    loadPortfolios,
    loadPortfoliosAll,
    loadPortfoliosFiltered,
    addPortfolio,
    updatePortfolio,
    removePortfolio,
    portfolioPage,
    portfolioPageSize,
    portfolioTotal,
    portfolioFilters,
  } = useFinanceGoalStore()

  const handleAddPortfolio = useCallback(async (portfolio: typeof portfolios[number]) => {
    portfolioSchema.parse(portfolio)
    await addPortfolio(portfolio)
  }, [addPortfolio])

  const handleUpdatePortfolio = useCallback(async (portfolio: typeof portfolios[number]) => {
    portfolioSchema.parse(portfolio)
    await updatePortfolio(portfolio)
  }, [updatePortfolio])

  useEffect(() => {
    const store = useFinanceGoalStore.getState()
    if (store.portfolios.length === 0) {
      loadPortfolios(1)
    }
  }, [loadPortfolios])

  const loadAllPortfolios = useCallback(async () => {
    // Load all portfolios without pagination limit
    await loadPortfoliosAll()
  }, [loadPortfoliosAll])

  const changePage = useCallback((page: number) => {
    if (Object.keys(portfolioFilters).length > 0) {
      loadPortfoliosFiltered(page, portfolioPageSize, portfolioFilters)
    } else {
      loadPortfolios(page)
    }
  }, [loadPortfolios, loadPortfoliosFiltered, portfolioFilters, portfolioPageSize])

  const changePageSize = useCallback((pageSize: number) => {
    if (Object.keys(portfolioFilters).length > 0) {
      loadPortfoliosFiltered(1, pageSize, portfolioFilters)
    } else {
      loadPortfolios(1, pageSize)
    }
  }, [loadPortfolios, loadPortfoliosFiltered, portfolioFilters])

  const reload = useCallback(() => {
    loadPortfolios(1)
  }, [loadPortfolios])

  const applyFilters = useCallback((filters: PortfolioFilters) => {
    loadPortfoliosFiltered(1, portfolioPageSize, filters)
  }, [loadPortfoliosFiltered, portfolioPageSize])

  const clearFilters = useCallback(() => {
    loadPortfolios(1)
  }, [loadPortfolios])

  return useMemo(
    () => ({
      portfolios,
      isLoading,
      error,
      addPortfolio: handleAddPortfolio,
      updatePortfolio: handleUpdatePortfolio,
      removePortfolio,
      page: portfolioPage,
      pageSize: portfolioPageSize,
      total: portfolioTotal,
      totalPages: Math.ceil(portfolioTotal / portfolioPageSize),
      changePage,
      changePageSize,
      reload,
      applyFilters,
      clearFilters,
      filters: portfolioFilters,
      loadAllPortfolios,
      loadPortfoliosAll,
    }),
    [
      portfolios,
      isLoading,
      error,
      handleAddPortfolio,
      handleUpdatePortfolio,
      removePortfolio,
      portfolioPage,
      portfolioPageSize,
      portfolioTotal,
      changePage,
      changePageSize,
      reload,
      applyFilters,
      clearFilters,
      portfolioFilters,
      loadAllPortfolios,
      loadPortfoliosAll,
    ]
  )
}