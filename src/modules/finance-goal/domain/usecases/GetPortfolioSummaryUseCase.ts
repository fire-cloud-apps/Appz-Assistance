import type { Portfolio } from '../entities'
import type { IPortfolioRepository } from '../interfaces'

export interface PortfolioSummary {
  totalCurrentValue: number
  totalCostValue: number
  totalAppreciation: number
  weightedAvgCost: number
  weightedAvgXirr: number
  totalHoldings: number
}

export class GetPortfolioSummaryUseCase {
  constructor(private portfolioRepository: IPortfolioRepository) {}

  async execute(input?: { investorId?: string }): Promise<PortfolioSummary> {
    const portfolios = await this.getPortfolios(input?.investorId)
    if (portfolios.length === 0) {
      return {
        totalCurrentValue: 0,
        totalCostValue: 0,
        totalAppreciation: 0,
        weightedAvgCost: 0,
        weightedAvgXirr: 0,
        totalHoldings: 0,
      }
    }

    const totalCurrentValue = portfolios.reduce((sum, item) => sum + item.currentValue, 0)
    const totalCostValue = portfolios.reduce((sum, item) => sum + item.costValue, 0)
    const totalAppreciation = portfolios.reduce((sum, item) => sum + item.appreciation, 0)
    const weightedAvgCost = this.calculateWeightedAverage(portfolios, 'weightedAvg', totalCostValue)
    const weightedAvgXirr = this.calculateWeightedAverage(portfolios, 'xirr', totalCostValue)

    return {
      totalCurrentValue,
      totalCostValue,
      totalAppreciation,
      weightedAvgCost,
      weightedAvgXirr,
      totalHoldings: portfolios.length,
    }
  }

  private async getPortfolios(investorId?: string): Promise<Portfolio[]> {
    if (investorId) {
      return this.portfolioRepository.getByInvestorId(investorId)
    }
    return this.portfolioRepository.getAll()
  }

  private calculateWeightedAverage(
    portfolios: Portfolio[],
    field: 'weightedAvg' | 'xirr',
    totalCostValue: number
  ): number {
    if (totalCostValue <= 0) {
      return 0
    }
    const weightedSum = portfolios.reduce((sum, item) => sum + item[field] * item.costValue, 0)
    return weightedSum / totalCostValue
  }
}
