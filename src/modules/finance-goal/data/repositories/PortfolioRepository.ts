import type { Portfolio } from '../../domain/entities'
import type { IPortfolioRepository } from '../../domain/interfaces'
import type { PortfolioModel } from '../models'
import { FinanceGoalDatasource } from '../datasources/FinanceGoalDatasource'

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export class PortfolioRepository implements IPortfolioRepository {
  constructor(private datasource: FinanceGoalDatasource) {}

  async create(portfolio: Portfolio): Promise<string> {
    return this.datasource.addPortfolio(this.toModel(portfolio))
  }

  async update(portfolio: Portfolio): Promise<void> {
    await this.datasource.updatePortfolio(this.toModel(portfolio))
  }

  async delete(id: string): Promise<void> {
    await this.datasource.deletePortfolio(id)
  }

  async getById(id: string): Promise<Portfolio | undefined> {
    const result = await this.datasource.getPortfolioById(id)
    return result ? this.toEntity(result) : undefined
  }

  async getAll(): Promise<Portfolio[]> {
    const items = await this.datasource.getPortfolios()
    return items.map((item) => this.toEntity(item))
  }

  async getByInvestorId(investorId: string): Promise<Portfolio[]> {
    const items = await this.datasource.getPortfoliosByInvestorId(investorId)
    return items.map((item) => this.toEntity(item))
  }

  async getByIds(ids: string[]): Promise<Portfolio[]> {
    const items = await this.datasource.getPortfoliosByIds(ids)
    return items.map((item) => this.toEntity(item))
  }

  async getPaginated(page: number, pageSize: number): Promise<PaginatedResult<Portfolio>> {
    const { data, total } = await this.datasource.getPortfoliosPaginated(page, pageSize)
    return {
      data: data.map((item) => this.toEntity(item)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async getFiltered(
    page: number, 
    pageSize: number, 
    filters: {
      investorId?: string
      amcName?: string
      schemeSearch?: string
    }
  ): Promise<PaginatedResult<Portfolio>> {
    const { data, total } = await this.datasource.getPortfoliosFiltered(page, pageSize, filters)
    return {
      data: data.map((item) => this.toEntity(item)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  private toModel(entity: Portfolio): PortfolioModel {
    return { ...entity }
  }

  private toEntity(model: PortfolioModel): Portfolio {
    return { ...model }
  }
}
