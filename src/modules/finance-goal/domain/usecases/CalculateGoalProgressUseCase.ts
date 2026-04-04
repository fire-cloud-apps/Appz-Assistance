import type { FinancialGoal } from '../entities'
import type { IGoalRepository, IPortfolioRepository } from '../interfaces'

export interface GoalProgressResult {
  goalId: string
  currentValue: number
  targetAmount: number
  progressPercent: number
  isAchieved: boolean
}

export class CalculateGoalProgressUseCase {
  constructor(
    private goalRepository: IGoalRepository,
    private portfolioRepository: IPortfolioRepository
  ) {}

  async execute(input: { goalId?: string; goal?: FinancialGoal }): Promise<GoalProgressResult> {
    const goal = await this.resolveGoal(input)
    const portfolios = goal.portfolioIds.length
      ? await this.portfolioRepository.getByIds(goal.portfolioIds)
      : []
    const currentValue = portfolios.reduce((sum, portfolio) => sum + portfolio.currentValue, 0)
    const progressPercent = goal.targetAmount > 0 ? (currentValue / goal.targetAmount) * 100 : 0
    const isAchieved = currentValue >= goal.targetAmount

    return {
      goalId: goal.id,
      currentValue,
      targetAmount: goal.targetAmount,
      progressPercent,
      isAchieved,
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
