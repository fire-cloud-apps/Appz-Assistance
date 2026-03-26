import { useState, useEffect, useRef, useCallback } from 'react'

interface UseDebouncedAutosaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  delay?: number
  enabled?: boolean
}

interface UseDebouncedAutosaveReturn {
  isSaving: boolean
  isDirty: boolean
  lastSaved: Date | null
  saveNow: () => Promise<void>
  hasChanges: boolean
}

export function useDebouncedAutosave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseDebouncedAutosaveOptions<T>): UseDebouncedAutosaveReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSaveRef = useRef(onSave)
  const dataRef = useRef(data)
  const lastSavedDataRef = useRef<string>('')

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    if (!enabled) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const currentDataStr = JSON.stringify(data)
    const isNewData = currentDataStr !== lastSavedDataRef.current

    if (isNewData) {
      setHasChanges(true)
      
      timeoutRef.current = setTimeout(async () => {
        setIsSaving(true)
        try {
          await onSaveRef.current(dataRef.current)
          lastSavedDataRef.current = JSON.stringify(dataRef.current)
          setLastSaved(new Date())
          setHasChanges(false)
        } catch (error) {
          console.error('Autosave failed:', error)
        } finally {
          setIsSaving(false)
        }
      }, delay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (hasChanges) {
        onSaveRef.current(dataRef.current).catch(console.error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveNow = useCallback(async () => {
    if (!hasChanges || isSaving) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setIsSaving(true)
    try {
      await onSaveRef.current(dataRef.current)
      lastSavedDataRef.current = JSON.stringify(dataRef.current)
      setLastSaved(new Date())
      setHasChanges(false)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [hasChanges, isSaving])

  return {
    isSaving,
    isDirty: hasChanges && !isSaving,
    lastSaved,
    saveNow,
    hasChanges,
  }
}