import type { FinancialGoalModel, InvestorModel, PortfolioModel, SIPModel } from '../models'
import { financeDb } from './FinanceGoalDatabase'

export class FinanceGoalDatasource {
  async addPortfolio(model: PortfolioModel): Promise<string> {
    return financeDb.portfolios.add(model)
  }

  async updatePortfolio(model: PortfolioModel): Promise<void> {
    await financeDb.portfolios.put(model)
  }

  async deletePortfolio(id: string): Promise<void> {
    await financeDb.portfolios.delete(id)
  }

  async getPortfolioById(id: string): Promise<PortfolioModel | undefined> {
    return financeDb.portfolios.get(id)
  }

  async getPortfolios(): Promise<PortfolioModel[]> {
    return financeDb.portfolios.toArray()
  }

  async getPortfoliosByInvestorId(investorId: string): Promise<PortfolioModel[]> {
    return financeDb.portfolios.where('investorId').equals(investorId).toArray()
  }

  async getPortfoliosByIds(ids: string[]): Promise<PortfolioModel[]> {
    if (ids.length === 0) return []
    return financeDb.portfolios.where('id').anyOf(ids).toArray()
  }

  async addSIP(model: SIPModel): Promise<string> {
    return financeDb.sip.add(model)
  }

  async updateSIP(model: SIPModel): Promise<void> {
    await financeDb.sip.put(model)
  }

  async deleteSIP(id: string): Promise<void> {
    await financeDb.sip.delete(id)
  }

  async getSIPById(id: string): Promise<SIPModel | undefined> {
    return financeDb.sip.get(id)
  }

  async getSIPs(): Promise<SIPModel[]> {
    return financeDb.sip.toArray()
  }

  async getSIPsByInvestorId(investorId: string): Promise<SIPModel[]> {
    return financeDb.sip.where('investorId').equals(investorId).toArray()
  }

  async getSIPsByPortfolioId(portfolioId: string): Promise<SIPModel[]> {
    return financeDb.sip.where('portfolioId').equals(portfolioId).toArray()
  }

  async getSIPsByIds(ids: string[]): Promise<SIPModel[]> {
    if (ids.length === 0) return []
    return financeDb.sip.where('id').anyOf(ids).toArray()
  }

  async addGoal(model: FinancialGoalModel): Promise<string> {
    return financeDb.goals.add(model)
  }

  async updateGoal(model: FinancialGoalModel): Promise<void> {
    await financeDb.goals.put(model)
  }

  async deleteGoal(id: string): Promise<void> {
    await financeDb.goals.delete(id)
  }

  async getGoalById(id: string): Promise<FinancialGoalModel | undefined> {
    return financeDb.goals.get(id)
  }

  async getGoals(): Promise<FinancialGoalModel[]> {
    return financeDb.goals.toArray()
  }

  async getGoalsByInvestorId(investorId: string): Promise<FinancialGoalModel[]> {
    return financeDb.goals.where('investorId').equals(investorId).toArray()
  }

  async addInvestor(model: InvestorModel): Promise<string> {
    return financeDb.investors.add(model)
  }

  async updateInvestor(model: InvestorModel): Promise<void> {
    await financeDb.investors.put(model)
  }

  async deleteInvestor(id: string): Promise<void> {
    await financeDb.investors.delete(id)
  }

  async getInvestorById(id: string): Promise<InvestorModel | undefined> {
    return financeDb.investors.get(id)
  }

  async getInvestors(): Promise<InvestorModel[]> {
    return financeDb.investors.toArray()
  }
}
