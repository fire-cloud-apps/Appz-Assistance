import type { SIP } from '../../domain/entities'
import type { ISIPRepository } from '../../domain/interfaces'
import type { SIPModel } from '../models'
import { FinanceGoalDatasource } from '../datasources/FinanceGoalDatasource'

export class SIPRepository implements ISIPRepository {
  constructor(private datasource: FinanceGoalDatasource) {}

  async create(sip: SIP): Promise<string> {
    return this.datasource.addSIP(this.toModel(sip))
  }

  async update(sip: SIP): Promise<void> {
    await this.datasource.updateSIP(this.toModel(sip))
  }

  async delete(id: string): Promise<void> {
    await this.datasource.deleteSIP(id)
  }

  async getById(id: string): Promise<SIP | undefined> {
    const result = await this.datasource.getSIPById(id)
    return result ? this.toEntity(result) : undefined
  }

  async getAll(): Promise<SIP[]> {
    const items = await this.datasource.getSIPs()
    return items.map((item) => this.toEntity(item))
  }

  async getByInvestorId(investorId: string): Promise<SIP[]> {
    const items = await this.datasource.getSIPsByInvestorId(investorId)
    return items.map((item) => this.toEntity(item))
  }

  async getByPortfolioId(portfolioId: string): Promise<SIP[]> {
    const items = await this.datasource.getSIPsByPortfolioId(portfolioId)
    return items.map((item) => this.toEntity(item))
  }

  async getByIds(ids: string[]): Promise<SIP[]> {
    const items = await this.datasource.getSIPsByIds(ids)
    return items.map((item) => this.toEntity(item))
  }

  private toModel(entity: SIP): SIPModel {
    return { ...entity }
  }

  private toEntity(model: SIPModel): SIP {
    return { ...model }
  }
}
