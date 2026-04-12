import { create } from 'zustand'
import type { ScenarioRate } from '../../data/models'

interface ScenarioSettingsState {
  scenarios: ScenarioRate[]
  loading: boolean
  loadScenarios: () => Promise<void>
  addScenario: (label: string, rate: number) => Promise<void>
  updateScenario: (id: string, label: string, rate: number) => Promise<void>
  deleteScenario: (id: string) => Promise<void>
}

export const useScenarioSettingsStore = create<ScenarioSettingsState>((set) => ({
  scenarios: [],
  loading: false,

  loadScenarios: async () => {
    set({ loading: true })
    try {
      const { scenarioSettingsRepository } = await import('../../data/repositories/ScenarioSettingsRepository')
      const scenarios = await scenarioSettingsRepository.get()
      set({ scenarios, loading: false })
    } catch (error) {
      console.error('Failed to load scenarios:', error)
      set({ loading: false })
    }
  },

  addScenario: async (label: string, rate: number) => {
    const { scenarioSettingsRepository } = await import('../../data/repositories/ScenarioSettingsRepository')
    const scenarios = await scenarioSettingsRepository.addScenario(label, rate)
    set({ scenarios })
  },

  updateScenario: async (id: string, label: string, rate: number) => {
    const { scenarioSettingsRepository } = await import('../../data/repositories/ScenarioSettingsRepository')
    const scenarios = await scenarioSettingsRepository.updateScenario(id, label, rate)
    set({ scenarios })
  },

  deleteScenario: async (id: string) => {
    const { scenarioSettingsRepository } = await import('../../data/repositories/ScenarioSettingsRepository')
    const scenarios = await scenarioSettingsRepository.deleteScenario(id)
    set({ scenarios })
  },
}))