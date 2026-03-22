import { Button, Card, Center, Group, Stack, Text, Title } from '@mantine/core'
import { IconLogin } from '@tabler/icons-react'
import appConfig from '../config/appConfig.json'
import { isAuthConfigured } from './authConfig'

interface AuthScreenProps {
  onLogin: () => void
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  return (
    <Center h="100vh" p="xl">
      <Card shadow="sm" radius="lg" withBorder p="xl" w={{ base: '100%', sm: 420 }}>
        <Stack gap="md" align="center">
          <Title order={2}>{appConfig.app.name}</Title>
          <Text size="sm" c="dimmed" ta="center">
            {appConfig.app.tagline}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Sign in to continue to your personalized workspace.
          </Text>
          <Group grow w="100%">
            <Button
              leftSection={<IconLogin size={18} />}
              onClick={onLogin}
              disabled={!isAuthConfigured}
            >
              Log In
            </Button>
          </Group>
          {!isAuthConfigured && (
            <Text size="xs" c="red" ta="center">
              Auth0 Client ID is missing. Set VITE_AUTH0_CLIENT_ID to enable login.
            </Text>
          )}
        </Stack>
      </Card>
    </Center>
  )
}
