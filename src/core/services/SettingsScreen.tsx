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
  NumberInput,
  Switch,
} from '@mantine/core'
import { IconInfoCircle, IconTrash, IconBell } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import appConfig from '../config/appConfig.json'
import {
  getUserSettings,
  setTaskManagerItemsPerPage,
  setNotificationCheckInterval,
  setEnableDueDateNotifications,
} from './userSettingsService'
import {
  requestNotificationPermission,
  hasNotificationPermission,
} from './notificationService'

export function SettingsScreen() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const [clearDataLoading, setClearDataLoading] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState<number>(5)
  const [enableNotifications, setEnableNotifications] = useState<boolean>(false)
  const [checkInterval, setCheckInterval] = useState<number>(1)
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false)

  useEffect(() => {
    const settings = getUserSettings()
    setItemsPerPage(settings.taskManager.defaultItemsPerPage)
    setEnableNotifications(settings.taskManager.enableDueDateNotifications)
    setCheckInterval(settings.taskManager.notificationCheckInterval)
    setNotificationPermission(hasNotificationPermission())
  }, [])

  const handleItemsPerPageChange = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value
    if (isNaN(numValue) || numValue < 1 || numValue > 50) return
    
    setItemsPerPage(numValue)
    setTaskManagerItemsPerPage(numValue)
  }

  const handleEnableNotificationsChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked
    if (checked) {
      const granted = await requestNotificationPermission()
      if (granted) {
        setEnableNotifications(true)
        setEnableDueDateNotifications(true)
        setNotificationPermission(true)
      }
    } else {
      setEnableNotifications(false)
      setEnableDueDateNotifications(false)
    }
  }

  const handleCheckIntervalChange = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value
    if (isNaN(numValue) || numValue < 1 || numValue > 60) return
    
    setCheckInterval(numValue)
    setNotificationCheckInterval(numValue)
  }

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

        {/* Task Manager Settings */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>Task Manager</Title>
            <Text size="sm" c="dimmed">
              Configure how tasks are displayed
            </Text>

            <Divider />

            <Group justify="space-between" wrap="nowrap">
              <Box>
                <Text fw={500}>Default Items Per Page</Text>
                <Text size="sm" c="dimmed">
                  Number of tasks to show per page (1-50)
                </Text>
              </Box>
              <NumberInput
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                min={1}
                max={50}
                step={1}
                w={100}
                size="sm"
              />
            </Group>
          </Stack>
        </Card>

        {/* Due Date Notifications */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>Due Date Notifications</Title>
            <Text size="sm" c="dimmed">
              Get notified when tasks reach their due date
            </Text>

            <Divider />

            <Group justify="space-between" wrap="nowrap">
              <Box>
                <Text fw={500}>Enable Notifications</Text>
                <Text size="sm" c="dimmed">
                  Receive browser notifications for due tasks
                </Text>
              </Box>
              <Switch
                checked={enableNotifications}
                onChange={handleEnableNotificationsChange}
                size="md"
                disabled={!notificationPermission && enableNotifications}
              />
            </Group>

            <Group justify="space-between" wrap="nowrap">
              <Box>
                <Text fw={500}>Check Interval</Text>
                <Text size="sm" c="dimmed">
                  How often to check for due tasks (1-60 minutes)
                </Text>
              </Box>
              <NumberInput
                value={checkInterval}
                onChange={handleCheckIntervalChange}
                min={1}
                max={60}
                step={1}
                w={100}
                size="sm"
                disabled={!enableNotifications}
              />
            </Group>

            {enableNotifications && (
              <Alert
                icon={<IconBell size={16} />}
                title="Notifications Active"
                color="green"
                variant="light"
                style={{ fontSize: 'var(--mantine-font-size-xs)' }}
              >
                You will receive notifications every {checkInterval} minute
                {checkInterval > 1 ? 's' : ''} when tasks reach their due date.
              </Alert>
            )}
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
              <Text size="sm" c="dimmed">{appConfig.version.current}</Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm">Build</Text>
              <Text size="sm" c="dimmed">{appConfig.version.buildDate}</Text>
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
