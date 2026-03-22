import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'appz_sync_enabled'

const readInitialValue = () => {
  if (typeof window === 'undefined') return false
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === null) return false
  return stored === 'true'
}

export function useSyncSetting() {
  const [syncEnabled, setSyncEnabled] = useState<boolean>(readInitialValue)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, String(syncEnabled))
  }, [syncEnabled])

  const toggleSync = useCallback(() => {
    setSyncEnabled((prev) => !prev)
  }, [])

  return {
    syncEnabled,
    setSyncEnabled,
    toggleSync,
  }
}
