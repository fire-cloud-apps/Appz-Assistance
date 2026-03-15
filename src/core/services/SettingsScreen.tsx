import {
  Box,
  Card,
  Stack,
  Title,
  Text,
  Group,
  Divider,
  Button,
  Alert,
  useMantineColorScheme,
} from '@mantine/core'
import { IconInfoCircle, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'

export function SettingsScreen() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const [clearDataLoading, setClearDataLoading] = useState(false)

  const handleClearData = () => {
    if (!confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      return
    }

    setClearDataLoading(true)
    indexedDB.deleteDatabase('appzDB')
    setTimeout(() => {
      setClearDataLoading(false)
      alert('All local data has been cleared. The app will reload.')
      window.location.reload()
    }, 1000)
  }

  return (
    <Box>
      <Title order={2} mb="lg">Settings</Title>

      <Stack gap="md">
        {/* Appearance Settings */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>Appearance</Title>
            <Text size="sm" c="dimmed">
              Customize how AppZ looks on your device
            </Text>

            <Divider />

            <Group justify="space-between" wrap="nowrap">
              <Box>
                <Text fw={500}>Color Scheme</Text>
                <Text size="sm" c="dimmed">
                  Choose between light and dark theme
                </Text>
              </Box>
              <Button
                variant={colorScheme === 'dark' ? 'filled' : 'outline'}
                onClick={() => setColorScheme('dark')}
                size="compact-sm"
              >
                Dark
              </Button>
              <Button
                variant={colorScheme === 'light' ? 'filled' : 'outline'}
                onClick={() => setColorScheme('light')}
                size="compact-sm"
              >
                Light
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Data Management */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>Data Management</Title>
            <Text size="sm" c="dimmed">
              Manage your local data storage
            </Text>

            <Divider />

            <Alert
              icon={<IconInfoCircle />}
              title="Local Storage"
              color="blue"
              variant="light"
            >
              All your data is stored locally in your browser using IndexedDB.
              Clearing data will remove all tasks and activities permanently.
            </Alert>

            <Group justify="space-between" wrap="nowrap">
              <Box>
                <Text fw={500}>Clear All Data</Text>
                <Text size="sm" c="dimmed">
                  Delete all tasks, activities, and settings
                </Text>
              </Box>
              <Button
                color="red"
                variant="light"
                leftSection={<IconTrash size={18} />}
                onClick={handleClearData}
                loading={clearDataLoading}
              >
                Clear Data
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* About */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>About AppZ</Title>

            <Divider />

            <Group justify="space-between">
              <Text size="sm">Version</Text>
              <Text size="sm" c="dimmed">1.0.0</Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm">Build</Text>
              <Text size="sm" c="dimmed">2026.03.14</Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm">Storage</Text>
              <Text size="sm" c="dimmed">IndexedDB (Local)</Text>
            </Group>
          </Stack>
        </Card>

        {/* Coming Soon Modules */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>Upcoming Modules</Title>
            <Text size="sm" c="dimmed">
              These modules are planned for future releases
            </Text>

            <Divider />

            <Stack gap="xs">
              <Group gap="xs">
                <Text size="sm">📝</Text>
                <Text size="sm">Notes - Personal note-taking</Text>
              </Group>
              <Group gap="xs">
                <Text size="sm">📅</Text>
                <Text size="sm">Calendar - Schedule and events</Text>
              </Group>
              <Group gap="xs">
                <Text size="sm">📚</Text>
                <Text size="sm">Knowledge Base - Personal wiki</Text>
              </Group>
              <Group gap="xs">
                <Text size="sm">💰</Text>
                <Text size="sm">Personal Finance - Track expenses</Text>
              </Group>
              <Group gap="xs">
                <Text size="sm">🤖</Text>
                <Text size="sm">AI Assistant - Smart task suggestions</Text>
              </Group>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Box>
  )
}
