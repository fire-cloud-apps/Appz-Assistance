import type { Investor } from '../../domain/entities'
import type { IInvestorRepository } from '../../domain/interfaces'
import type { InvestorModel } from '../models'
import { FinanceGoalDatasource } from '../datasources/FinanceGoalDatasource'

export class InvestorRepository implements IInvestorRepository {
  constructor(private datasource: FinanceGoalDatasource) {}

  async create(investor: Investor): Promise<string> {
    return this.datasource.addInvestor(this.toModel(investor))
  }

  async update(investor: Investor): Promise<void> {
    await this.datasource.updateInvestor(this.toModel(investor))
  }

  async delete(id: string): Promise<void> {
    await this.datasource.deleteInvestor(id)
  }

  async getById(id: string): Promise<Investor | undefined> {
    const result = await this.datasource.getInvestorById(id)
    return result ? this.toEntity(result) : undefined
  }

  async getAll(): Promise<Investor[]> {
    const items = await this.datasource.getInvestors()
    return items.map((item) => this.toEntity(item))
  }

  private toModel(entity: Investor): InvestorModel {
    return { ...entity }
  }

  private toEntity(model: InvestorModel): Investor {
    return { ...model }
  }
}
