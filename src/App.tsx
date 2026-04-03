import { RouterProvider } from 'react-router-dom'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Auth0Provider } from '@auth0/auth0-react'
import { createAppTheme } from './core/theme/appTheme'
import { router } from './routes'
import { authConfig } from './core/auth/authConfig'
import { getPrimaryColor, PrimaryColor } from './core/services/userSettingsService'
import { useState, useEffect } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function App() {
  const [primaryColor, setPrimaryColor] = useState<PrimaryColor>('blue')

  useEffect(() => {
    setPrimaryColor(getPrimaryColor())
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      setPrimaryColor(getPrimaryColor())
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const authorizationParams = {
    redirect_uri: authConfig.redirectUri,
    scope: authConfig.scope,
    ...(authConfig.audience ? { audience: authConfig.audience } : {}),
  }

  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <QueryClientProvider client={queryClient}>
        <Auth0Provider
          domain={authConfig.domain}
          clientId={authConfig.clientId}
          authorizationParams={authorizationParams}
          cacheLocation="localstorage"
          useRefreshTokens
        >
          <MantineProvider theme={createAppTheme(primaryColor)} defaultColorScheme="auto">
            <Notifications
              position="top-right"
              autoClose={4000}
              limit={5}
              zIndex={1000}
            />
            <RouterProvider router={router} />
          </MantineProvider>
        </Auth0Provider>
      </QueryClientProvider>
    </>
  )
}

export default App
