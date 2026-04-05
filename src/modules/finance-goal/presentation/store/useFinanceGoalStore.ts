import { create } from 'zustand'
import type { FinancialGoal, Investor, Portfolio, SIP } from '../../domain/entities'
import { FinanceGoalDatasource } from '../../data/datasources/FinanceGoalDatasource'
import {
  GoalRepository,
  InvestorRepository,
  PortfolioRepository,
  SIPRepository,
} from '../../data/repositories'
import { getFinanceGoalsItemsPerPage } from '../../../../core/services/userSettingsService'

interface FinanceGoalState {
  portfolios: Portfolio[]
  sips: SIP[]
  goals: FinancialGoal[]
  investors: Investor[]
  isLoading: boolean
  error: string | null

  portfolioPage: number
  portfolioPageSize: number
  portfolioTotal: number
  portfolioFilters: {
    investorId?: string
    amcName?: string
    schemeSearch?: string
  }

  loadAll: () => Promise<void>
  loadPortfolios: (page?: number, pageSize?: number) => Promise<void>
  loadPortfoliosFiltered: (page: number, pageSize: number, filters: FinanceGoalState['portfolioFilters']) => Promise<void>
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

export const useFinanceGoalStore = create<FinanceGoalState>((set, get) => ({
  portfolios: [],
  sips: [],
  goals: [],
  investors: [],
  isLoading: false,
  error: null,

  portfolioPage: 1,
  portfolioPageSize: getFinanceGoalsItemsPerPage(),
  portfolioTotal: 0,
  portfolioFilters: {},

  loadAll: async () => {
    set({ isLoading: true, error: null })
    try {
      const [sips, goals, investors] = await Promise.all([
        sipRepository.getAll(),
        goalRepository.getAll(),
        investorRepository.getAll(),
      ])
      set({ 
        sips, 
        goals, 
        investors, 
        isLoading: false 
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  loadPortfolios: async (page = 1, pageSize?: number) => {
    set({ isLoading: true, error: null, portfolioFilters: {} })
    try {
      const size = pageSize ?? get().portfolioPageSize
      const result = await portfolioRepository.getPaginated(page, size)
      set({
        portfolios: result.data,
        portfolioPage: result.page,
        portfolioPageSize: result.pageSize,
        portfolioTotal: result.total,
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  loadPortfoliosFiltered: async (page, pageSize, filters) => {
    set({ isLoading: true, error: null, portfolioFilters: filters })
    try {
      const result = await portfolioRepository.getFiltered(page, pageSize, filters)
      set({
        portfolios: result.data,
        portfolioPage: result.page,
        portfolioPageSize: result.pageSize,
        portfolioTotal: result.total,
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addPortfolio: async (portfolio) => {
    set({ isLoading: true, error: null })
    try {
      await portfolioRepository.create(portfolio)
      const result = await portfolioRepository.getPaginated(get().portfolioPage, get().portfolioPageSize)
      set({
        portfolios: result.data,
        portfolioTotal: result.total,
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  updatePortfolio: async (portfolio) => {
    set({ isLoading: true, error: null })
    try {
      await portfolioRepository.update(portfolio)
      const result = await portfolioRepository.getPaginated(get().portfolioPage, get().portfolioPageSize)
      set({
        portfolios: result.data,
        portfolioTotal: result.total,
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  removePortfolio: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await portfolioRepository.delete(id)
      const result = await portfolioRepository.getPaginated(get().portfolioPage, get().portfolioPageSize)
      set({
        portfolios: result.data,
        portfolioTotal: result.total,
        isLoading: false,
      })
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
