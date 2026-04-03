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
  UnstyledButton,
  Tooltip,
  Select,
} from '@mantine/core'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import appConfig from '../config/appConfig.json'
import {
  getUserSettings,
  setTaskManagerItemsPerPage,
  setNotificationCheckInterval,
  setEnableDueDateNotifications,
  setArchiveRetentionDays,
  setCompletedArchiveDays,
  resetUserSettings,
  getAllModuleVisibility,
  setModuleVisibility,
  ModuleId,
  setPrimaryColor,
  PRIMARY_COLORS,
  PrimaryColor,
} from './userSettingsService'
import {
  requestNotificationPermission,
  hasNotificationPermission,
} from './notificationService'
import {
  exportModuleData,
  downloadExportData,
  importModuleData,
  ExportModule,
} from './dataExportImportService'

interface ModuleToggle {
  id: ModuleId
  label: string
  icon: string
  category: string
}

const moduleToggles: ModuleToggle[] = [
  { id: 'taskManager', label: 'Task Manager', icon: '📋', category: 'Productivity' },
  { id: 'notes', label: 'Notes', icon: '📝', category: 'Productivity' },
  { id: 'knowledge', label: 'Knowledge Base', icon: '📚', category: 'Productivity' },
  { id: 'sip', label: 'SIP Calculator', icon: '🧮', category: 'Tools' },
  { id: 'loan', label: 'Loan Calculator', icon: '🏦', category: 'Tools' },
  { id: 'personalFinance', label: 'Personal Finance', icon: '💰', category: 'Finance' },
  { id: 'financeGoals', label: 'Finance Goals', icon: '🎯', category: 'Finance' },
]

export function SettingsScreen() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const navigate = useNavigate()
  const [clearDataLoading, setClearDataLoading] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState<number>(5)
  const [enableNotifications, setEnableNotifications] = useState<boolean>(false)
  const [checkInterval, setCheckInterval] = useState<number>(1)
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false)
  const [archiveRetentionDays, setArchiveRetentionDaysState] = useState<number>(90)
  const [completedArchiveDays, setCompletedArchiveDaysState] = useState<number>(90)
  const [moduleVisibility, setModuleVisibilityState] = useState<Record<ModuleId, boolean>>({
    taskManager: true,
    notes: true,
    knowledge: false,
    sip: false,
    loan: false,
    personalFinance: false,
    financeGoals: false,
  })
  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>('blue')
  const [exportModule, setExportModule] = useState<ExportModule | null>(null)
  const [importModule, setImportModule] = useState<ExportModule | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importAlert, setImportAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const settings = getUserSettings()
    setItemsPerPage(settings.taskManager.defaultItemsPerPage)
    setEnableNotifications(settings.taskManager.enableDueDateNotifications)
    setCheckInterval(settings.taskManager.notificationCheckInterval)
    setArchiveRetentionDaysState(settings.taskManager.archiveRetentionDays)
    setCompletedArchiveDaysState(settings.taskManager.completedArchiveDays)
    setNotificationPermission(hasNotificationPermission())
    const moduleSettings = getAllModuleVisibility()
    setModuleVisibilityState({
      taskManager: moduleSettings.taskManager.enabled,
      notes: moduleSettings.notes.enabled,
      knowledge: moduleSettings.knowledge.enabled,
      sip: moduleSettings.sip.enabled,
      loan: moduleSettings.loan.enabled,
      personalFinance: moduleSettings.personalFinance.enabled,
      financeGoals: moduleSettings.financeGoals.enabled,
    })
    setPrimaryColorState(settings.appearance.primaryColor)
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

  const handleArchiveRetentionDaysChange = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value
    if (isNaN(numValue) || numValue < 1 || numValue > 365) return
    
    setArchiveRetentionDaysState(numValue)
    setArchiveRetentionDays(numValue)
  }

  const handleCompletedArchiveDaysChange = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value
    if (isNaN(numValue) || numValue < 1 || numValue > 365) return

    setCompletedArchiveDaysState(numValue)
    setCompletedArchiveDays(numValue)
  }

  const handleModuleVisibilityChange = (moduleId: ModuleId, enabled: boolean) => {
    setModuleVisibilityState((prev) => ({ ...prev, [moduleId]: enabled }))
    setModuleVisibility(moduleId, enabled)
  }

  const handlePrimaryColorChange = (color: PrimaryColor) => {
    setPrimaryColorState(color)
    setPrimaryColor(color)
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

  const handleResetDefaults = () => {
    if (!confirm('Reset all settings to defaults?')) return

    resetUserSettings()
    const settings = getUserSettings()
    setItemsPerPage(settings.taskManager.defaultItemsPerPage)
    setEnableNotifications(settings.taskManager.enableDueDateNotifications)
    setCheckInterval(settings.taskManager.notificationCheckInterval)
    setArchiveRetentionDaysState(settings.taskManager.archiveRetentionDays)
    setCompletedArchiveDaysState(settings.taskManager.completedArchiveDays)
    const moduleSettings = getAllModuleVisibility()
    setModuleVisibilityState({
      taskManager: moduleSettings.taskManager.enabled,
      notes: moduleSettings.notes.enabled,
      knowledge: moduleSettings.knowledge.enabled,
      sip: moduleSettings.sip.enabled,
      loan: moduleSettings.loan.enabled,
      personalFinance: moduleSettings.personalFinance.enabled,
      financeGoals: moduleSettings.financeGoals.enabled,
    })
  }

  const handleExport = async () => {
    if (!exportModule) {
      alert('Please select a module to export.')
      return
    }
    
    setExportLoading(true)
    try {
      const data = await exportModuleData(exportModule)
      downloadExportData(data)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importModule) {
      alert('Please select a module to import.')
      return
    }
    
    if (!importFile) {
      alert('Please select a file to import.')
      return
    }
    
    if (!importFile.name.endsWith('.json')) {
      alert('Please select a valid JSON file.')
      return
    }
    
    setImportLoading(true)
    setImportAlert(null)
    try {
      const result = await importModuleData(importFile)
      if (result.success) {
        setImportAlert({ type: 'success', message: result.message })
        setImportFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setImportAlert({ type: 'error', message: result.message })
      }
    } catch (error) {
      console.error('Import failed:', error)
      setImportAlert({ type: 'error', message: 'Import failed. Please try again.' })
    } finally {
      setImportLoading(false)
    }
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

            <Divider />

            <Box>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>Theme Color</Text>
                <Tooltip label="Refresh to apply color">
                  <UnstyledButton
                    onClick={() => window.location.reload()}
                    style={{ padding: 4 }}
                  >
                    <iconify-icon icon="lucide:refresh-cw" width="18" height="18" />
                  </UnstyledButton>
                </Tooltip>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                Choose your preferred accent color
              </Text>
              <Group gap="xs">
                {PRIMARY_COLORS.map((color) => (
                  <Tooltip key={color.value} label={color.label}>
                    <UnstyledButton
                      onClick={() => handlePrimaryColorChange(color.value)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: color.color,
                        border: primaryColor === color.value ? '3px solid var(--mantine-color-black)' : '3px solid transparent',
                        outline: primaryColor === color.value ? '2px solid var(--mantine-color-white)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </Tooltip>
                ))}
              </Group>
              <Text size="xs" c="dimmed" mt="sm">
                Selected: {PRIMARY_COLORS.find((c) => c.value === primaryColor)?.label}
              </Text>
            </Box>
          </Stack>
        </Card>

        {/* Module Visibility Settings */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>Modules</Title>
            <Text size="sm" c="dimmed">
              Enable or disable modules to customize your experience
            </Text>

            <Divider />

            {['Productivity', 'Tools', 'Finance'].map((category) => (
              <Box key={category}>
                <Text size="sm" fw={500} mb="xs">{category}</Text>
                <Stack gap="xs">
                  {moduleToggles
                    .filter((mod) => mod.category === category)
                    .map((mod) => (
                      <Group key={mod.id} justify="space-between" wrap="nowrap">
                        <Group gap="xs">
                          <Text size="sm">{mod.icon}</Text>
                          <Text size="sm">{mod.label}</Text>
                        </Group>
                        <Switch
                          checked={moduleVisibility[mod.id]}
                          onChange={(event) => handleModuleVisibilityChange(mod.id, event.currentTarget.checked)}
                          size="md"
                        />
                      </Group>
                    ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Card>

        {/* Task Manager Settings */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>Task Manager</Title>
            <Text size="sm" c="dimmed">
              Configure how tasks are displayed and managed
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

            <Divider />

            <Group justify="space-between" wrap="nowrap">
              <Box>
                <Text fw={500}>Completed Task Archive Period</Text>
                <Text size="sm" c="dimmed">
                  Days before completed tasks move to archive (1-365)
                </Text>
              </Box>
              <NumberInput
                value={completedArchiveDays}
                onChange={handleCompletedArchiveDaysChange}
                min={1}
                max={365}
                step={1}
                w={100}
                size="sm"
              />
            </Group>

            <Divider />

            <Group justify="space-between" wrap="nowrap">
              <Box>
                <Text fw={500}>Archive Retention Period</Text>
                <Text size="sm" c="dimmed">
                  Days before archived tasks are permanently deleted (1-365)
                </Text>
              </Box>
              <NumberInput
                value={archiveRetentionDays}
                onChange={handleArchiveRetentionDaysChange}
                min={1}
                max={365}
                step={1}
                w={100}
                size="sm"
              />
            </Group>

            {completedArchiveDays > 0 && (
              <Alert
                icon={<iconify-icon icon="lucide:archive" width="16" height="16" />}
                title="Completed Task Auto-Archive"
                color="blue"
                variant="light"
                style={{ fontSize: 'var(--mantine-font-size-xs)' }}
              >
                Completed tasks will be archived after {completedArchiveDays} day{completedArchiveDays > 1 ? 's' : ''}.
              </Alert>
            )}

            {archiveRetentionDays > 0 && (
              <Alert
                icon={<iconify-icon icon="lucide:archive" width="16" height="16" />}
                title="Archive Auto-Deletion"
                color="orange"
                variant="light"
                style={{ fontSize: 'var(--mantine-font-size-xs)' }}
              >
                Archived tasks will be automatically deleted after {archiveRetentionDays} day{archiveRetentionDays > 1 ? 's' : ''}.
              </Alert>
            )}

            <Divider />

            <Group justify="flex-end">
              <Button variant="light" onClick={handleResetDefaults}>
                Reset to Defaults
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Break Timer Settings */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>Break Timer</Title>
            <Text size="sm" c="dimmed">
              Configure your break reminders and intervals
            </Text>

            <Divider />

            <Group justify="flex-end">
              <Button
                variant="light"
                onClick={() => navigate('/settings/break-timer')}
              >
                Open Break Timer Settings
              </Button>
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
                icon={<iconify-icon icon="lucide:bell" width="16" height="16" />}
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
              icon={<iconify-icon icon="lucide:info-circle" width="16" height="16" />}
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
                leftSection={<iconify-icon icon="lucide:trash" width="18" height="18" />}
                onClick={handleClearData}
                loading={clearDataLoading}
              >
                Clear Data
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Export Data */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>Export Data</Title>
            <Text size="sm" c="dimmed">
              Export your data from a specific module as a JSON file
            </Text>

            <Divider />

            <Group justify="space-between" wrap="nowrap">
              <Box style={{ flex: 1 }}>
                <Text size="sm" fw={500} mb="xs">Select Module</Text>
                <Select
                  placeholder="Choose a module"
                  data={[
                    { value: 'tasks', label: 'Task Manager' },
                    { value: 'notes', label: 'Notes' },
                  ]}
                  value={exportModule}
                  onChange={(value) => setExportModule(value as ExportModule | null)}
                  w={200}
                />
              </Box>
              <Button
                variant="light"
                leftSection={<iconify-icon icon="lucide:download" width="18" height="18" />}
                onClick={handleExport}
                loading={exportLoading}
                disabled={!exportModule}
              >
                Export
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Import Data */}
        <Card shadow="sm" p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>Import Data</Title>
            <Text size="sm" c="dimmed">
              Import data from a previously exported JSON file
            </Text>

            <Divider />

            <Group justify="space-between" wrap="nowrap">
              <Box style={{ flex: 1 }}>
                <Text size="sm" fw={500} mb="xs">Select Module</Text>
                <Select
                  placeholder="Choose a module"
                  data={[
                    { value: 'tasks', label: 'Task Manager' },
                    { value: 'notes', label: 'Notes' },
                  ]}
                  value={importModule}
                  onChange={(value) => {
                    setImportModule(value as ExportModule | null)
                    setImportAlert(null)
                  }}
                  w={200}
                />
              </Box>
            </Group>

            <Box>
              <Text size="sm" fw={500} mb="xs">Select File</Text>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setImportFile(file)
                  setImportAlert(null)
                }}
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  border: '1px solid var(--mantine-color-gray-4)',
                  borderRadius: 'var(--mantine-radius-md)',
                  width: '100%',
                }}
              />
              <Text size="xs" c="dimmed" mt="xs">
                Only .json files exported from AppZ are supported
              </Text>
            </Box>

            {importAlert && (
              <Alert
                icon={<iconify-icon icon={importAlert.type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'} width="16" height="16" />}
                title={importAlert.type === 'success' ? 'Success' : 'Error'}
                color={importAlert.type === 'success' ? 'green' : 'red'}
                variant="light"
              >
                {importAlert.message}
              </Alert>
            )}

            <Group justify="flex-end">
              <Button
                variant="light"
                leftSection={<iconify-icon icon="lucide:upload" width="18" height="18" />}
                onClick={handleImport}
                loading={importLoading}
                disabled={!importModule || !importFile}
              >
                Import
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
      </Stack>
    </Box>
  )
}
