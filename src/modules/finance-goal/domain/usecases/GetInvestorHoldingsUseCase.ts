import type { IInvestorRepository, IPortfolioRepository } from '../interfaces'

export interface InvestorHoldingSummary {
  investorId: string
  investorName: string
  totalValue: number
}

export class GetInvestorHoldingsUseCase {
  constructor(
    private investorRepository: IInvestorRepository,
    private portfolioRepository: IPortfolioRepository
  ) {}

  async execute(): Promise<InvestorHoldingSummary[]> {
    const [investors, portfolios] = await Promise.all([
      this.investorRepository.getAll(),
      this.portfolioRepository.getAll(),
    ])

    const totals = portfolios.reduce<Record<string, number>>((acc, portfolio) => {
      acc[portfolio.investorId] = (acc[portfolio.investorId] ?? 0) + portfolio.currentValue
      return acc
    }, {})

    return investors.map((investor) => ({
      investorId: investor.id,
      investorName: investor.name,
      totalValue: totals[investor.id] ?? 0,
    }))
  }
}
