import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useMemo, useState } from 'react'
import { authConfig } from './authConfig'

export interface AuthUserProfile {
  id: string
  name: string
  email?: string
  image?: string
  roles: string[]
}

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = window.atob(padded)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

const normalizeRoles = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return [value]
  return []
}

export function useAuthUser() {
  const { user, isAuthenticated, getIdTokenClaims, getAccessTokenSilently } = useAuth0()
  const [roles, setRoles] = useState<string[]>([])

  useEffect(() => {
    let isActive = true

    const loadRoles = async () => {
      if (!isAuthenticated) {
        if (isActive) setRoles([])
        return
      }

      try {
        const claims = await getIdTokenClaims()
        const claimValue = claims?.[authConfig.roleClaim]
        const userClaimValue =
          (user as Record<string, unknown> | undefined)?.[authConfig.roleClaim] ??
          (user as Record<string, unknown> | undefined)?.roles

        const normalized = normalizeRoles(claimValue)
        const fallbackRoles = normalizeRoles(userClaimValue)

        if (normalized.length > 0) {
          if (isActive) setRoles(normalized)
          return
        }

        if (fallbackRoles.length > 0) {
          if (isActive) setRoles(fallbackRoles)
          return
        }

        if (!authConfig.audience) {
          if (isActive) setRoles([])
          return
        }

        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: authConfig.audience,
            scope: authConfig.scope,
          },
        })
        const accessClaims = accessToken ? decodeJwtPayload(accessToken) : null
        const accessRoleValue = accessClaims?.[authConfig.roleClaim]
        const accessRoles = normalizeRoles(accessRoleValue)

        if (isActive) setRoles(accessRoles)
      } catch {
        if (isActive) setRoles([])
      }
    }

    loadRoles()

    return () => {
      isActive = false
    }
  }, [getAccessTokenSilently, getIdTokenClaims, isAuthenticated, user])

  const profile = useMemo<AuthUserProfile | null>(() => {
    if (!user) return null

    return {
      id: user.sub ?? 'unknown',
      name: user.name ?? user.nickname ?? 'User',
      email: user.email,
      image: user.picture,
      roles,
    }
  }, [roles, user])

  return {
    profile,
    roles,
  }
}
