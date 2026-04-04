import type { Portfolio } from '../entities'

export interface IPortfolioRepository {
  create(portfolio: Portfolio): Promise<string>
  update(portfolio: Portfolio): Promise<void>
  delete(id: string): Promise<void>
  getById(id: string): Promise<Portfolio | undefined>
  getAll(): Promise<Portfolio[]>
  getByInvestorId(investorId: string): Promise<Portfolio[]>
  getByIds(ids: string[]): Promise<Portfolio[]>
}
