import dayjs from 'dayjs'
import type { FinancialGoal, Portfolio } from '../entities'
import type { IGoalRepository, ISIPRepository } from '../interfaces'
import { FinancialProjectionService } from '../services'

export interface GoalForecastResult {
  goalId: string
  currentPortfolioValue: number
  currentAmount: number
  futureValueLumpSum: number
  futureSipValue: number
  totalFutureValue: number
  targetAmount: number
  surplusOrShortfall: number
  achievedByTargetDate: boolean
  estimatedMonthsToTarget: number | null
  estimatedTargetDate: string | null
}

export class ForecastGoalCompletionUseCase {
  constructor(
    private goalRepository: IGoalRepository,
    private sipRepository: ISIPRepository
  ) {}

  private projectionService = new FinancialProjectionService()

  async execute(input: {
    goalId?: string
    goal?: FinancialGoal
    portfolios?: Portfolio[]
    annualReturnRate?: number
    asOfDate?: string
  }): Promise<GoalForecastResult> {
    const goal = await this.resolveGoal(input)
    const asOf = input.asOfDate ? dayjs(input.asOfDate) : dayjs()
    const annualReturnRate = input.annualReturnRate ?? goal.expectedGrowthRate ?? 0
    const portfolios = input.portfolios ?? []

    const currentPortfolioValue = goal.portfolioIds
      .filter(id => portfolios.some(p => p.id === id))
      .reduce((sum, id) => {
        const portfolio = portfolios.find(p => p.id === id)
        return sum + (portfolio?.currentValue ?? 0)
      }, 0)

    const currentAmount = goal.currentAmount ?? 0
    const totalCurrentValue = currentPortfolioValue + currentAmount

    const sips = goal.sipIds.length ? await this.sipRepository.getByIds(goal.sipIds) : []
    const { futureSipValue, monthlyContribution } = this.projectionService.calculateSipFutureValue(
      sips,
      goal.targetDate,
      asOf,
      annualReturnRate
    )

    const projection = this.projectionService.calculateProjection({
      principal: totalCurrentValue,
      monthlyContribution,
      annualRatePercent: annualReturnRate,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      targetAmount: goal.targetAmount,
      asOfDate: asOf.toISOString(),
    })

    const totalFutureValue = projection.futureValueLumpSum + futureSipValue
    const achievedByTargetDate = totalFutureValue >= goal.targetAmount
    const surplusOrShortfall = totalFutureValue - goal.targetAmount

    return {
      goalId: goal.id,
      currentPortfolioValue,
      currentAmount,
      futureValueLumpSum: projection.futureValueLumpSum,
      futureSipValue,
      totalFutureValue,
      targetAmount: goal.targetAmount,
      surplusOrShortfall,
      achievedByTargetDate,
      estimatedMonthsToTarget: projection.estimatedMonthsToTarget ?? null,
      estimatedTargetDate: projection.estimatedTargetDate ?? null,
    }
  }

  private async resolveGoal(input: { goalId?: string; goal?: FinancialGoal }): Promise<FinancialGoal> {
    if (input.goal) {
      return input.goal
    }
    if (!input.goalId) {
      throw new Error('Goal identifier is required.')
    }
    const goal = await this.goalRepository.getById(input.goalId)
    if (!goal) {
      throw new Error('Goal not found.')
    }
    return goal
  }

}
