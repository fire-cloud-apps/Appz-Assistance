import dayjs from 'dayjs'
import type { FinancialGoal, Portfolio, SIP } from '../entities'
import type { IGoalRepository, ISIPRepository } from '../interfaces'

export interface GoalForecastResult {
  goalId: string
  currentPortfolioValue: number
  currentAmount: number
  futureSipValue: number
  totalFutureValue: number
  targetAmount: number
  achievedByTargetDate: boolean
  estimatedMonthsToTarget: number | null
  estimatedTargetDate: string | null
}

export class ForecastGoalCompletionUseCase {
  constructor(
    private goalRepository: IGoalRepository,
    private sipRepository: ISIPRepository
  ) {}

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
    const futureSipValue = this.calculateSipFutureValue(sips, goal.targetDate, asOf, annualReturnRate)

    const totalFutureValue = totalCurrentValue + futureSipValue
    const achievedByTargetDate = totalFutureValue >= goal.targetAmount

    const remainingAmount = Math.max(goal.targetAmount - totalCurrentValue, 0)
    const estimate = this.estimateMonthsToTarget(sips, remainingAmount, annualReturnRate, asOf)

    return {
      goalId: goal.id,
      currentPortfolioValue,
      currentAmount,
      futureSipValue,
      totalFutureValue,
      targetAmount: goal.targetAmount,
      achievedByTargetDate,
      estimatedMonthsToTarget: estimate.months,
      estimatedTargetDate: estimate.targetDate,
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

  private calculateSipFutureValue(
    sips: SIP[],
    targetDate: string,
    asOf: dayjs.Dayjs,
    annualReturnRate: number
  ): number {
    return sips.reduce((sum, sip) => {
      if (sip.status !== 'Active') {
        return sum
      }
      const contributionCount = this.countContributions(sip, targetDate, asOf)
      if (contributionCount <= 0) {
        return sum
      }

      const periodicRate = this.getPeriodicRate(annualReturnRate, sip.frequency)
      const futureValue =
        periodicRate === 0
          ? sip.amount * contributionCount
          : sip.amount * ((Math.pow(1 + periodicRate, contributionCount) - 1) / periodicRate)
      return sum + futureValue
    }, 0)
  }

  private countContributions(sip: SIP, targetDate: string, asOf: dayjs.Dayjs): number {
    const startDate = dayjs(sip.startDate)
    const endDate = sip.endDate ? dayjs(sip.endDate) : dayjs(targetDate)
    const effectiveStart = startDate.isAfter(asOf) ? startDate : asOf
    const effectiveEnd = endDate.isBefore(dayjs(targetDate)) ? endDate : dayjs(targetDate)

    if (effectiveEnd.isBefore(effectiveStart, 'day')) {
      return 0
    }

    const monthsDiff = effectiveEnd.diff(effectiveStart, 'month')
    const periodMonths = sip.frequency === 'Quarterly' ? 3 : 1
    return Math.floor(monthsDiff / periodMonths) + 1
  }

  private getPeriodicRate(annualReturnRate: number, frequency: SIP['frequency']): number {
    if (annualReturnRate <= 0) {
      return 0
    }
    return frequency === 'Quarterly' ? annualReturnRate / 4 : annualReturnRate / 12
  }

  private estimateMonthsToTarget(
    sips: SIP[],
    remainingAmount: number,
    annualReturnRate: number,
    asOf: dayjs.Dayjs
  ): { months: number | null; targetDate: string | null } {
    if (remainingAmount <= 0) {
      return { months: 0, targetDate: asOf.toISOString() }
    }

    const monthlyContribution = sips.reduce((sum, sip) => {
      if (sip.status !== 'Active') {
        return sum
      }
      const monthlyAmount = sip.frequency === 'Quarterly' ? sip.amount / 3 : sip.amount
      return sum + monthlyAmount
    }, 0)

    if (monthlyContribution <= 0) {
      return { months: null, targetDate: null }
    }

    const monthlyRate = annualReturnRate > 0 ? annualReturnRate / 12 : 0
    let monthsNeeded = 0

    if (monthlyRate === 0) {
      monthsNeeded = Math.ceil(remainingAmount / monthlyContribution)
    } else {
      const targetFactor = 1 + (remainingAmount * monthlyRate) / monthlyContribution
      if (targetFactor <= 1) {
        monthsNeeded = 0
      } else {
        monthsNeeded = Math.ceil(Math.log(targetFactor) / Math.log(1 + monthlyRate))
      }
    }

    const targetDate = asOf.add(monthsNeeded, 'month').toISOString()
    return { months: monthsNeeded, targetDate }
  }
}