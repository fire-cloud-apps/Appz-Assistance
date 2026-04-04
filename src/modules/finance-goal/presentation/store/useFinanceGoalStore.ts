import { create } from 'zustand'
import type { FinancialGoal, Investor, Portfolio, SIP } from '../../domain/entities'
import { FinanceGoalDatasource } from '../../data/datasources/FinanceGoalDatasource'
import {
  GoalRepository,
  InvestorRepository,
  PortfolioRepository,
  SIPRepository,
} from '../../data/repositories'

interface FinanceGoalState {
  portfolios: Portfolio[]
  sips: SIP[]
  goals: FinancialGoal[]
  investors: Investor[]
  isLoading: boolean
  error: string | null

  loadAll: () => Promise<void>
  addPortfolio: (portfolio: Portfolio) => Promise<void>
  updatePortfolio: (portfolio: Portfolio) => Promise<void>
  removePortfolio: (id: string) => Promise<void>
  addSIP: (sip: SIP) => Promise<void>
  updateSIP: (sip: SIP) => Promise<void>
  removeSIP: (id: string) => Promise<void>
  addGoal: (goal: FinancialGoal) => Promise<void>
  updateGoal: (goal: FinancialGoal) => Promise<void>
  removeGoal: (id: string) => Promise<void>
  addInvestor: (investor: Investor) => Promise<void>
  updateInvestor: (investor: Investor) => Promise<void>
  removeInvestor: (id: string) => Promise<void>
  clearError: () => void
}

const datasource = new FinanceGoalDatasource()
const portfolioRepository = new PortfolioRepository(datasource)
const sipRepository = new SIPRepository(datasource)
const goalRepository = new GoalRepository(datasource)
const investorRepository = new InvestorRepository(datasource)

export const useFinanceGoalStore = create<FinanceGoalState>((set) => ({
  portfolios: [],
  sips: [],
  goals: [],
  investors: [],
  isLoading: false,
  error: null,

  loadAll: async () => {
    set({ isLoading: true, error: null })
    try {
      const [portfolios, sips, goals, investors] = await Promise.all([
        portfolioRepository.getAll(),
        sipRepository.getAll(),
        goalRepository.getAll(),
        investorRepository.getAll(),
      ])
      set({ portfolios, sips, goals, investors, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addPortfolio: async (portfolio) => {
    set({ isLoading: true, error: null })
    try {
      await portfolioRepository.create(portfolio)
      const portfolios = await portfolioRepository.getAll()
      set({ portfolios, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  updatePortfolio: async (portfolio) => {
    set({ isLoading: true, error: null })
    try {
      await portfolioRepository.update(portfolio)
      const portfolios = await portfolioRepository.getAll()
      set({ portfolios, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  removePortfolio: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await portfolioRepository.delete(id)
      const portfolios = await portfolioRepository.getAll()
      set({ portfolios, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addSIP: async (sip) => {
    set({ isLoading: true, error: null })
    try {
      await sipRepository.create(sip)
      const sips = await sipRepository.getAll()
      set({ sips, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  updateSIP: async (sip) => {
    set({ isLoading: true, error: null })
    try {
      await sipRepository.update(sip)
      const sips = await sipRepository.getAll()
      set({ sips, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  removeSIP: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await sipRepository.delete(id)
      const sips = await sipRepository.getAll()
      set({ sips, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addGoal: async (goal) => {
    set({ isLoading: true, error: null })
    try {
      await goalRepository.create(goal)
      const goals = await goalRepository.getAll()
      set({ goals, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  updateGoal: async (goal) => {
    set({ isLoading: true, error: null })
    try {
      await goalRepository.update(goal)
      const goals = await goalRepository.getAll()
      set({ goals, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  removeGoal: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await goalRepository.delete(id)
      const goals = await goalRepository.getAll()
      set({ goals, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addInvestor: async (investor) => {
    set({ isLoading: true, error: null })
    try {
      await investorRepository.create(investor)
      const investors = await investorRepository.getAll()
      set({ investors, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  updateInvestor: async (investor) => {
    set({ isLoading: true, error: null })
    try {
      await investorRepository.update(investor)
      const investors = await investorRepository.getAll()
      set({ investors, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  removeInvestor: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await investorRepository.delete(id)
      const investors = await investorRepository.getAll()
      set({ investors, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
