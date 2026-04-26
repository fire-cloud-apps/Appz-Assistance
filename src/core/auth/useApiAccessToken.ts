import { useAuth0 } from '@auth0/auth0-react'
import { authConfig } from './authConfig'

const buildApiAuthorizationParams = () => {
  const params: { audience: string; scope?: string } = {
    audience: authConfig.audience,
  }

  if (authConfig.apiScope.trim()) {
    params.scope = authConfig.apiScope
  }

  return params
}

export class ApiAccessTokenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiAccessTokenError'
  }
}

export function useApiAccessToken() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  const getApiAccessToken = async () => {
    if (!isAuthenticated) {
      throw new ApiAccessTokenError('The user must be authenticated before requesting an API access token.')
    }

    if (!authConfig.audience.trim()) {
      throw new ApiAccessTokenError('VITE_AUTH0_AUDIENCE is not configured for Web API access tokens.')
    }

    return getAccessTokenSilently({
      authorizationParams: buildApiAuthorizationParams(),
    })
  }

  return {
    getApiAccessToken,
    hasApiAudience: Boolean(authConfig.audience.trim()),
  }
}
