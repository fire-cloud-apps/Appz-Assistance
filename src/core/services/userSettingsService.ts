/**
 * User Settings Service
 * Manages user preferences stored in localStorage
 */

const SETTINGS_KEY = 'appz_user_settings'

export type PrimaryColor = 
  | 'dark' | 'gray' | 'red' | 'pink' | 'grape' | 'violet' 
  | 'indigo' | 'blue' | 'cyan' | 'teal' | 'green' | 'lime' 
  | 'yellow' | 'orange'

export const PRIMARY_COLORS: { value: PrimaryColor; label: string; color: string }[] = [
  { value: 'dark', label: 'Dark', color: '#2e2e2e' },
  { value: 'gray', label: 'Gray', color: '#868e96' },
  { value: 'red', label: 'Red', color: '#fa5252' },
  { value: 'pink', label: 'Pink', color: '#e64980' },
  { value: 'grape', label: 'Grape', color: '#be4bdb' },
  { value: 'violet', label: 'Violet', color: '#7950f2' },
  { value: 'indigo', label: 'Indigo', color: '#4c6ef5' },
  { value: 'blue', label: 'Blue', color: '#228be6' },
  { value: 'cyan', label: 'Cyan', color: '#15aabf' },
  { value: 'teal', label: 'Teal', color: '#12b886' },
  { value: 'green', label: 'Green', color: '#40c057' },
  { value: 'lime', label: 'Lime', color: '#82c91e' },
  { value: 'yellow', label: 'Yellow', color: '#fab005' },
  { value: 'orange', label: 'Orange', color: '#fd7e14' },
]

export interface ModuleVisibility {
  enabled: boolean
}

export interface UserSettings {
  taskManager: {
    defaultItemsPerPage: number
    notificationCheckInterval: number // in minutes
    enableDueDateNotifications: boolean
    archiveRetentionDays: number // days before auto-deletion
    completedArchiveDays: number // days before completed tasks are archived
  }
  modules: {
    taskManager: ModuleVisibility
    notes: ModuleVisibility
    knowledge: ModuleVisibility
    sip: ModuleVisibility
    loan: ModuleVisibility
    personalFinance: ModuleVisibility
    financeGoals: ModuleVisibility
  }
  appearance: {
    primaryColor: PrimaryColor
  }
}

const defaultSettings: UserSettings = {
  taskManager: {
    defaultItemsPerPage: 5,
    notificationCheckInterval: 1, // Default: check every 1 minute
    enableDueDateNotifications: false,
    archiveRetentionDays: 90, // Default: 90 days retention
    completedArchiveDays: 90, // Default: 90 days before archive
  },
  modules: {
    taskManager: { enabled: true },
    notes: { enabled: true },
    knowledge: { enabled: false }, // Coming soon
    sip: { enabled: false }, // Coming soon
    loan: { enabled: false }, // Coming soon
    personalFinance: { enabled: true },
    financeGoals: { enabled: true },
  },
  appearance: {
    primaryColor: 'blue',
  },
}

export function getUserSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<UserSettings>
      return {
        ...defaultSettings,
        ...parsed,
        taskManager: {
          ...defaultSettings.taskManager,
          ...parsed.taskManager,
        },
        modules: {
          ...defaultSettings.modules,
          ...parsed.modules,
        },
        appearance: {
          ...defaultSettings.appearance,
          ...parsed.appearance,
        },
      }
    }
  } catch (error) {
    console.error('Failed to load user settings:', error)
  }
  return defaultSettings
}

export function setUserSettings(settings: Partial<UserSettings>): void {
  try {
    const current = getUserSettings()
    const updated: UserSettings = {
      taskManager: {
        ...current.taskManager,
        ...settings.taskManager,
      },
      modules: {
        ...current.modules,
        ...settings.modules,
      },
      appearance: {
        ...current.appearance,
        ...settings.appearance,
      },
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save user settings:', error)
  }
}

export function resetUserSettings(): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings))
  } catch (error) {
    console.error('Failed to reset user settings:', error)
  }
}

export function getTaskManagerItemsPerPage(): number {
  return getUserSettings().taskManager.defaultItemsPerPage
}

export function setTaskManagerItemsPerPage(value: number): void {
  const current = getUserSettings()
  current.taskManager.defaultItemsPerPage = value
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(current))
}

export function getNotificationCheckInterval(): number {
  return getUserSettings().taskManager.notificationCheckInterval
}

export function setNotificationCheckInterval(value: number): void {
  const current = getUserSettings()
  current.taskManager.notificationCheckInterval = value
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(current))
}

export function getEnableDueDateNotifications(): boolean {
  return getUserSettings().taskManager.enableDueDateNotifications
}

export function setEnableDueDateNotifications(value: boolean): void {
  const current = getUserSettings()
  current.taskManager.enableDueDateNotifications = value
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(current))
}

export function getArchiveRetentionDays(): number {
  return getUserSettings().taskManager.archiveRetentionDays
}

export function setArchiveRetentionDays(value: number): void {
  const current = getUserSettings()
  current.taskManager.archiveRetentionDays = value
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(current))
}

export function getCompletedArchiveDays(): number {
  return getUserSettings().taskManager.completedArchiveDays
}

export function setCompletedArchiveDays(value: number): void {
  const current = getUserSettings()
  current.taskManager.completedArchiveDays = value
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(current))
}

export type ModuleId = 'taskManager' | 'notes' | 'knowledge' | 'sip' | 'loan' | 'personalFinance' | 'financeGoals'

export function getModuleVisibility(moduleId: ModuleId): boolean {
  return getUserSettings().modules[moduleId].enabled
}

export function setModuleVisibility(moduleId: ModuleId, enabled: boolean): void {
  const current = getUserSettings()
  current.modules[moduleId].enabled = enabled
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(current))
}

export function getAllModuleVisibility(): UserSettings['modules'] {
  return getUserSettings().modules
}

export function setAllModuleVisibility(modules: UserSettings['modules']): void {
  const current = getUserSettings()
  current.modules = modules
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(current))
}

export function getPrimaryColor(): PrimaryColor {
  return getUserSettings().appearance.primaryColor
}

export function setPrimaryColor(color: PrimaryColor): void {
  const current = getUserSettings()
  current.appearance.primaryColor = color
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(current))
}
