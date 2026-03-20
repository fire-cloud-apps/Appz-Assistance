/**
 * User Settings Service
 * Manages user preferences stored in localStorage
 */

const SETTINGS_KEY = 'appz_user_settings'

export interface UserSettings {
  taskManager: {
    defaultItemsPerPage: number
    notificationCheckInterval: number // in minutes
    enableDueDateNotifications: boolean
    archiveRetentionDays: number // days before auto-deletion
  }
}

const defaultSettings: UserSettings = {
  taskManager: {
    defaultItemsPerPage: 5,
    notificationCheckInterval: 1, // Default: check every 1 minute
    enableDueDateNotifications: false,
    archiveRetentionDays: 90, // Default: 90 days retention
  },
}

export function getUserSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) }
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
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save user settings:', error)
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
