import Dexie, { Table } from 'dexie'
import type { FinancialGoalModel, InvestorModel, PortfolioModel, SIPModel, ScenarioSettingsModel } from '../models'

export class FinanceGoalDatabase extends Dexie {
  portfolios!: Table<PortfolioModel>
  sip!: Table<SIPModel>
  goals!: Table<FinancialGoalModel>
  investors!: Table<InvestorModel>
  settings!: Table<ScenarioSettingsModel>

  constructor() {
    super('finance-db')

    this.version(2).stores({
      portfolios: `
        id,
        investorId
      `,
      sip: `
        id,
        portfolioId,
        investorId,
        status
      `,
      goals: `
        id,
        investorId
      `,
      investors: `
        id
      `,
      settings: `
        key
      `,
    })
  }
}

export const financeDb = new FinanceGoalDatabase()
