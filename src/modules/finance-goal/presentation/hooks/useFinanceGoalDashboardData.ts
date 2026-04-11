import { useEffect, useState } from 'react'
import type { FinancialGoal, Investor, Portfolio, SIP } from '../../domain/entities'
import { FinanceGoalDatasource } from '../../data/datasources/FinanceGoalDatasource'
import { GoalRepository, InvestorRepository, PortfolioRepository, SIPRepository } from '../../data/repositories'
import { CalculateGoalProgressUseCase } from '../../domain/usecases/CalculateGoalProgressUseCase'
import { GetActiveSIPsUseCase } from '../../domain/usecases/GetActiveSIPsUseCase'
import { GetInvestorHoldingsUseCase } from '../../domain/usecases/GetInvestorHoldingsUseCase'
import { GetPortfolioSummaryUseCase } from '../../domain/usecases/GetPortfolioSummaryUseCase'

const datasource = new FinanceGoalDatasource()
const portfolioRepository = new PortfolioRepository(datasource)
const sipRepository = new SIPRepository(datasource)
const goalRepository = new GoalRepository(datasource)
const investorRepository = new InvestorRepository(datasource)

const portfolioSummaryUseCase = new GetPortfolioSummaryUseCase(portfolioRepository)
const activeSipsUseCase = new GetActiveSIPsUseCase(sipRepository)
const investorHoldingsUseCase = new GetInvestorHoldingsUseCase(investorRepository, portfolioRepository)
const goalProgressUseCase = new CalculateGoalProgressUseCase(goalRepository, sipRepository)

interface DashboardInput {
  goals: FinancialGoal[]
  portfolios: Portfolio[]
  sips: SIP[]
  investors: Investor[]
}

export function useFinanceGoalDashboardData({ goals, portfolios, sips, investors }: DashboardInput) {
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalCurrentValue: 0,
    totalCostValue: 0,
    totalAppreciation: 0,
  })
  const [activeSipsCount, setActiveSipsCount] = useState(0)
  const [investorHoldings, setInvestorHoldings] = useState<
    { investorId: string; investorName: string; totalValue: number }[]
  >([])
  const [goalProgress, setGoalProgress] = useState<
    Record<string, { currentValue: number; targetAmount: number; progressPercent: number }>
  >({})

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      const [summary, activeSips, holdings, progressResults] = await Promise.all([
        portfolioSummaryUseCase.execute(),
        activeSipsUseCase.execute(),
        investorHoldingsUseCase.execute(),
        Promise.all(
          goals.map((goal) =>
            goalProgressUseCase.execute({ goal }).then((result) => [goal.id, result] as const)
          )
        ),
      ])

      if (!isMounted) return

      setPortfolioSummary({
        totalCurrentValue: summary.totalCurrentValue,
        totalCostValue: summary.totalCostValue,
        totalAppreciation: summary.totalAppreciation,
      })
      setActiveSipsCount(activeSips.length)
      setInvestorHoldings(holdings)

      const progressMap: Record<string, { currentValue: number; targetAmount: number; progressPercent: number }> = {}
      progressResults.forEach(([goalId, result]) => {
        progressMap[goalId] = {
          currentValue: result.currentValue,
          targetAmount: result.targetAmount,
          progressPercent: result.progressPercent,
        }
      })
      setGoalProgress(progressMap)
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [goals, portfolios, sips, investors])

  return { portfolioSummary, activeSipsCount, investorHoldings, goalProgress }
}
