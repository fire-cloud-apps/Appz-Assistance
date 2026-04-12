export interface ScenarioSettingsModel {
  key: string
  scenarios: ScenarioRate[]
  updatedAt: string
}

export interface ScenarioRate {
  id: string
  label: string
  rate: number
}