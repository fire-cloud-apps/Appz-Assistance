import type { FinancialGoal } from '../entities'
import type { IGoalRepository, ISIPRepository } from '../interfaces'

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
    private sipRepository: ISIPRepository
  ) {}

  async execute(input: { goalId?: string; goal?: FinancialGoal }): Promise<GoalProgressResult> {
    const goal = await this.resolveGoal(input)
    // Calculate current value from SIPs instead of portfolios
    const sips = goal.sipIds.length
      ? await this.sipRepository.getByIds(goal.sipIds)
      : []
    const currentValue = sips.reduce((sum, sip) => sum + sip.amount, 0)
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
