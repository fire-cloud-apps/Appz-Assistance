import { financeDb } from '../datasources/FinanceGoalDatabase'
import type { ScenarioSettingsModel, ScenarioRate } from '../models'

const SETTINGS_KEY = 'scenarioRates'

const DEFAULT_SCENARIOS: ScenarioRate[] = [
  { id: '1', label: 'Conservative', rate: 12 },
  { id: '2', label: 'Moderate', rate: 15 },
  { id: '3', label: 'Aggressive', rate: 18 },
]

export class ScenarioSettingsRepository {
  async get(): Promise<ScenarioRate[]> {
    const settings = await financeDb.settings.get(SETTINGS_KEY)
    if (!settings) {
      await this.save(DEFAULT_SCENARIOS)
      return DEFAULT_SCENARIOS
    }
    return settings.scenarios
  }

  async save(scenarios: ScenarioRate[]): Promise<void> {
    const settings: ScenarioSettingsModel = {
      key: SETTINGS_KEY,
      scenarios,
      updatedAt: new Date().toISOString(),
    }
    await financeDb.settings.put(settings)
  }

  async addScenario(label: string, rate: number): Promise<ScenarioRate[]> {
    const scenarios = await this.get()
    const newScenario: ScenarioRate = {
      id: crypto.randomUUID(),
      label,
      rate,
    }
    scenarios.push(newScenario)
    await this.save(scenarios)
    return scenarios
  }

  async updateScenario(id: string, label: string, rate: number): Promise<ScenarioRate[]> {
    const scenarios = await this.get()
    const index = scenarios.findIndex(s => s.id === id)
    if (index >= 0) {
      scenarios[index] = { ...scenarios[index], label, rate }
      await this.save(scenarios)
    }
    return scenarios
  }

  async deleteScenario(id: string): Promise<ScenarioRate[]> {
    const scenarios = await this.get()
    const filtered = scenarios.filter(s => s.id !== id)
    await this.save(filtered)
    return filtered
  }
}

export const scenarioSettingsRepository = new ScenarioSettingsRepository()