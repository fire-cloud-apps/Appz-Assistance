import { useEffect, useMemo } from 'react'
import { useFinanceGoalStore } from '../store/useFinanceGoalStore'
import { sipSchema } from './validators'

export function useSIP() {
  const { sips, isLoading, error, loadAll, addSIP, updateSIP, removeSIP } =
    useFinanceGoalStore()

  const handleAddSIP = async (sip: typeof sips[number]) => {
    sipSchema.parse(sip)
    await addSIP(sip)
  }

  const handleUpdateSIP = async (sip: typeof sips[number]) => {
    sipSchema.parse(sip)
    await updateSIP(sip)
  }

  useEffect(() => {
    if (sips.length === 0) {
      loadAll()
    }
  }, [loadAll, sips.length])

  return useMemo(
    () => ({
      sips,
      isLoading,
      error,
      addSIP: handleAddSIP,
      updateSIP: handleUpdateSIP,
      removeSIP,
    }),
    [sips, isLoading, error, handleAddSIP, handleUpdateSIP, removeSIP]
  )
}
