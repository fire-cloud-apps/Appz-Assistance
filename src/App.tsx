import { RouterProvider } from 'react-router-dom'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { theme } from './core/theme'
import { router } from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function App() {
  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Notifications 
            position="top-right"
            autoClose={4000}
            limit={5}
            zIndex={1000}
          />
          <RouterProvider router={router} />
        </MantineProvider>
      </QueryClientProvider>
    </>
  )
}

export default App
