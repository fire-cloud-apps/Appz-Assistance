import { useMemo } from 'react'
import { createApiClient } from '../services/apiClient'
import { useApiAccessToken } from '../auth/useApiAccessToken'

export function useApiClient() {
  const { getApiAccessToken, hasApiAudience } = useApiAccessToken()
  const apiClient = useMemo(() => createApiClient(getApiAccessToken), [getApiAccessToken])

  return {
    apiClient,
    hasApiAudience,
  }
}
