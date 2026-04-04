import type { SIP } from '../entities'

export interface ISIPRepository {
  create(sip: SIP): Promise<string>
  update(sip: SIP): Promise<void>
  delete(id: string): Promise<void>
  getById(id: string): Promise<SIP | undefined>
  getAll(): Promise<SIP[]>
  getByInvestorId(investorId: string): Promise<SIP[]>
  getByPortfolioId(portfolioId: string): Promise<SIP[]>
  getByIds(ids: string[]): Promise<SIP[]>
}
