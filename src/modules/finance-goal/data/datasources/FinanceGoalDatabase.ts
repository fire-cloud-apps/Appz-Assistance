import Dexie, { Table } from 'dexie'
import type { FinancialGoalModel, InvestorModel, PortfolioModel, SIPModel } from '../models'

export class FinanceGoalDatabase extends Dexie {
  portfolios!: Table<PortfolioModel>
  sip!: Table<SIPModel>
  goals!: Table<FinancialGoalModel>
  investors!: Table<InvestorModel>

  constructor() {
    super('appzFinanceDb')

    this.version(1).stores({
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
    })
  }
}

export const financeDb = new FinanceGoalDatabase()
