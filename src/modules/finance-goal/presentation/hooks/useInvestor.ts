import { useEffect, useMemo } from 'react'
import { useFinanceGoalStore } from '../store/useFinanceGoalStore'
import { investorSchema } from './validators'

export function useInvestor() {
  const {
    investors,
    isLoading,
    error,
    loadAll,
    addInvestor,
    updateInvestor,
    removeInvestor,
  } = useFinanceGoalStore()

  const handleAddInvestor = async (investor: typeof investors[number]) => {
    investorSchema.parse(investor)
    await addInvestor(investor)
  }

  const handleUpdateInvestor = async (investor: typeof investors[number]) => {
    investorSchema.parse(investor)
    await updateInvestor(investor)
  }

  useEffect(() => {
    if (investors.length === 0) {
      loadAll()
    }
  }, [loadAll, investors.length])

  return useMemo(
    () => ({
      investors,
      isLoading,
      error,
      addInvestor: handleAddInvestor,
      updateInvestor: handleUpdateInvestor,
      removeInvestor,
    }),
    [investors, isLoading, error, handleAddInvestor, handleUpdateInvestor, removeInvestor]
  )
}
