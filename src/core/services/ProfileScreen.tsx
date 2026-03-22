import { Avatar, Badge, Card, Group, Stack, Text, Title } from '@mantine/core'
import { useAuthUser } from '../auth/useAuthUser'
import { useAuth0 } from '@auth0/auth0-react'

export function ProfileScreen() {
  const { isLoading } = useAuth0()
  const { profile } = useAuthUser()

  if (isLoading) {
    return (
      <Stack align="center" mt="xl">
        <Text size="sm" c="dimmed">Loading profile...</Text>
      </Stack>
    )
  }

  if (!profile) {
    return (
      <Stack align="center" mt="xl">
        <Text size="sm" c="dimmed">No profile data available.</Text>
      </Stack>
    )
  }

  return (
    <Stack gap="lg" maw={720} mx="auto">
      <Title order={3}>Profile</Title>
      <Card withBorder radius="md" p="lg">
        <Group align="flex-start" gap="lg">
          <Avatar src={profile.image} size={96} radius="xl" name={profile.name} />
          <Stack gap={6} style={{ flex: 1 }}>
            <Text fw={700} size="lg">
              {profile.name}
            </Text>
            <Text size="sm" c="dimmed">
              {profile.email ?? 'No email available'}
            </Text>
            <Text size="sm" c="dimmed">
              ID: {profile.id}
            </Text>
            <Group gap={6} mt="xs">
              {profile.roles.length > 0 ? (
                profile.roles.map((role) => (
                  <Badge key={role} variant="light" color="blue">
                    {role}
                  </Badge>
                ))
              ) : (
                <Badge variant="light" color="gray">No role assigned</Badge>
              )}
            </Group>
          </Stack>
        </Group>
      </Card>
    </Stack>
  )
}
