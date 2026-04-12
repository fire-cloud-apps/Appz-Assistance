import dayjs from 'dayjs'
import type { SIP } from '../entities'

export interface ProjectionSummary {
  months: number
  years: number
  futureValueLumpSum: number
  futureValueSip: number
  totalFutureValue: number
  yearlyProjections: YearlyProjection[]
  targetAmount?: number
  surplusOrShortfall?: number
  achievedByTargetDate?: boolean
  estimatedMonthsToTarget?: number | null
  estimatedTargetDate?: string | null
  requiredMonthlySip: number | null
}

export interface YearlyProjection {
  yearLabel: string
  date: string
  monthsFromStart: number
  futureValueLumpSum: number
  futureValueSip: number
  totalFutureValue: number
}

export interface ScenarioProjection {
  ratePercent: number
  summary: ProjectionSummary
}

export class FinancialProjectionService {
  calculateProjection(input: {
    principal: number
    monthlyContribution: number
    annualRatePercent: number
    startDate: string
    targetDate: string
    targetAmount?: number
    asOfDate?: string
  }): ProjectionSummary {
    const asOf = input.asOfDate ? dayjs(input.asOfDate) : dayjs()
    const start = dayjs(input.startDate)
    const target = dayjs(input.targetDate)

    if (!input.startDate || !input.targetDate || !start.isValid() || !target.isValid() || target.isBefore(start)) {
      return this.emptyProjection()
    }

    const effectiveStart = start.isAfter(asOf) ? start : asOf
    const months = Math.max(target.diff(effectiveStart, 'month'), 0)
    const years = months / 12

    const futureValueLumpSum = this.calculateFutureValueLumpSum(
      input.principal,
      input.annualRatePercent,
      years
    )
    const futureValueSip = this.calculateFutureValueSip(
      input.monthlyContribution,
      input.annualRatePercent,
      months
    )

    const totalFutureValue = futureValueLumpSum + futureValueSip
    const targetAmount = input.targetAmount

    const achievedByTargetDate =
      typeof targetAmount === 'number' ? totalFutureValue >= targetAmount : undefined
    const surplusOrShortfall =
      typeof targetAmount === 'number' ? totalFutureValue - targetAmount : undefined

    const estimate = typeof targetAmount === 'number'
      ? (() => {
          try {
            return this.estimateMonthsToTarget({
              principal: input.principal,
              monthlyContribution: input.monthlyContribution,
              annualRatePercent: input.annualRatePercent,
              targetAmount,
              asOfDate: effectiveStart.isValid() ? effectiveStart.toISOString() : undefined,
            })
          } catch {
            return { months: null, targetDate: null }
          }
        })()
      : { months: null, targetDate: null }

    const requiredMonthlySip =
      typeof targetAmount === 'number'
        ? this.calculateRequiredMonthlySip({
            targetAmount,
            principal: input.principal,
            annualRatePercent: input.annualRatePercent,
            months,
          })
        : null

    const yearlyProjections = this.buildYearlyProjections({
      principal: input.principal,
      monthlyContribution: input.monthlyContribution,
      annualRatePercent: input.annualRatePercent,
      effectiveStart,
      target,
    })

    return {
      months,
      years,
      futureValueLumpSum,
      futureValueSip,
      totalFutureValue,
      yearlyProjections,
      targetAmount,
      surplusOrShortfall,
      achievedByTargetDate,
      estimatedMonthsToTarget: estimate.months,
      estimatedTargetDate: estimate.targetDate,
      requiredMonthlySip,
    }
  }

  calculateScenarioProjections(input: {
    principal: number
    monthlyContribution: number
    startDate: string
    targetDate: string
    targetAmount?: number
    ratePercents: number[]
    asOfDate?: string
  }): ScenarioProjection[] {
    return input.ratePercents.map(ratePercent => ({
      ratePercent,
      summary: this.calculateProjection({
        principal: input.principal,
        monthlyContribution: input.monthlyContribution,
        annualRatePercent: ratePercent,
        startDate: input.startDate,
        targetDate: input.targetDate,
        targetAmount: input.targetAmount,
        asOfDate: input.asOfDate,
      }),
    }))
  }

  calculateSipFutureValue(
    sips: SIP[],
    targetDate: string,
    asOf: dayjs.Dayjs,
    annualRatePercent: number
  ): { futureSipValue: number; monthlyContribution: number } {
    if (!targetDate || !dayjs(targetDate).isValid()) {
      return { futureSipValue: 0, monthlyContribution: 0 }
    }
    
    const monthlyRate = this.getMonthlyRate(annualRatePercent)
    const targetDayjs = dayjs(targetDate)

    const futureSipValue = sips.reduce((sum, sip) => {
      if (sip.status !== 'Active' || !sip.startDate) {
        return sum
      }

      const startDate = dayjs(sip.startDate)
      if (!startDate.isValid()) {
        return sum
      }
      
      const endDate = sip.endDate ? dayjs(sip.endDate) : targetDayjs
      if (!endDate.isValid()) {
        return sum
      }
      
      const effectiveStart = startDate.isAfter(asOf) ? startDate : asOf
      const effectiveEnd = endDate.isBefore(targetDayjs) ? endDate : targetDayjs

      if (effectiveEnd.isBefore(effectiveStart, 'day')) {
        return sum
      }

      const periodMonths = sip.frequency === 'Quarterly' ? 3 : 1
      const periodicRate =
        monthlyRate <= 0 ? 0 : Math.pow(1 + monthlyRate, periodMonths) - 1
      const contributionCount = this.countContributions(
        effectiveStart,
        effectiveEnd,
        periodMonths
      )
      const monthsAfterLast = Math.max(dayjs(targetDate).diff(effectiveEnd, 'month'), 0)

      const futureValueAtEnd =
        periodicRate === 0
          ? sip.amount * contributionCount
          : sip.amount * ((Math.pow(1 + periodicRate, contributionCount) - 1) / periodicRate)

      const futureValueAtTarget =
        monthlyRate === 0
          ? futureValueAtEnd
          : futureValueAtEnd * Math.pow(1 + monthlyRate, monthsAfterLast)

      return sum + futureValueAtTarget
    }, 0)

    const monthlyContribution = sips.reduce((sum, sip) => {
      if (sip.status !== 'Active') {
        return sum
      }
      const monthlyEquivalent = sip.frequency === 'Quarterly' ? sip.amount / 3 : sip.amount
      return sum + monthlyEquivalent
    }, 0)

    return { futureSipValue, monthlyContribution }
  }

  calculateFutureValueLumpSum(principal: number, annualRatePercent: number, years: number): number {
    if (principal <= 0 || years <= 0) {
      return Math.max(principal, 0)
    }
    const rate = this.getAnnualRate(annualRatePercent)
    if (rate <= 0) {
      return principal
    }
    return principal * Math.pow(1 + rate, years)
  }

  calculateFutureValueSip(monthlyContribution: number, annualRatePercent: number, months: number): number {
    if (monthlyContribution <= 0 || months <= 0) {
      return 0
    }
    const monthlyRate = this.getMonthlyRate(annualRatePercent)
    if (monthlyRate <= 0) {
      return monthlyContribution * months
    }
    return monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  }

  estimateMonthsToTarget(input: {
    principal: number
    monthlyContribution: number
    annualRatePercent: number
    targetAmount: number
    asOfDate?: string
  }): { months: number | null; targetDate: string | null } {
    const fallbackDate = dayjs().toISOString()
    
    if (input.targetAmount <= 0) {
      return { months: 0, targetDate: input.asOfDate && dayjs(input.asOfDate).isValid() ? input.asOfDate : fallbackDate }
    }

    const principal = Math.max(input.principal, 0)
    const monthlyContribution = Math.max(input.monthlyContribution, 0)
    const monthlyRate = this.getMonthlyRate(input.annualRatePercent)

    if (principal >= input.targetAmount) {
      return { months: 0, targetDate: input.asOfDate && dayjs(input.asOfDate).isValid() ? input.asOfDate : fallbackDate }
    }

    if (monthlyContribution <= 0 && monthlyRate <= 0) {
      return { months: null, targetDate: null }
    }

    let monthsNeeded: number | null = null

    if (monthlyRate <= 0) {
      monthsNeeded = Math.ceil((input.targetAmount - principal) / monthlyContribution)
    } else {
      const numerator = input.targetAmount * monthlyRate + monthlyContribution
      const denominator = principal * monthlyRate + monthlyContribution
      if (numerator <= denominator) {
        monthsNeeded = 0
      } else {
        monthsNeeded = Math.ceil(Math.log(numerator / denominator) / Math.log(1 + monthlyRate))
      }
    }

    const targetDate = monthsNeeded !== null
      ? (() => {
          const baseDate = input.asOfDate && dayjs(input.asOfDate).isValid() 
            ? dayjs(input.asOfDate) 
            : dayjs()
          try {
            return baseDate.add(monthsNeeded, 'month').toISOString()
          } catch {
            return fallbackDate
          }
        })()
      : null

    return { months: monthsNeeded, targetDate }
  }

  calculateRequiredMonthlySip(input: {
    targetAmount: number
    principal: number
    annualRatePercent: number
    months: number
  }): number | null {
    if (input.months <= 0 || input.targetAmount <= 0) {
      return null
    }
    const monthlyRate = this.getMonthlyRate(input.annualRatePercent)
    const principal = Math.max(input.principal, 0)

    if (principal >= input.targetAmount) {
      return 0
    }

    if (monthlyRate <= 0) {
      return Math.max((input.targetAmount - principal) / input.months, 0)
    }

    const growthFactor = Math.pow(1 + monthlyRate, input.months)
    const numerator = input.targetAmount - principal * growthFactor
    const denominator = (growthFactor - 1) / monthlyRate

    if (denominator <= 0) {
      return null
    }

    return Math.max(numerator / denominator, 0)
  }

  private countContributions(
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
    periodMonths: number
  ): number {
    const monthsDiff = end.diff(start, 'month')
    return Math.floor(monthsDiff / periodMonths) + 1
  }

  private getAnnualRate(annualRatePercent: number): number {
    return Math.max(annualRatePercent, 0) / 100
  }

  private getMonthlyRate(annualRatePercent: number): number {
    return this.getAnnualRate(annualRatePercent) / 12
  }

  private emptyProjection(): ProjectionSummary {
    return {
      months: 0,
      years: 0,
      futureValueLumpSum: 0,
      futureValueSip: 0,
      totalFutureValue: 0,
      yearlyProjections: [],
      surplusOrShortfall: 0,
      achievedByTargetDate: false,
      estimatedMonthsToTarget: null,
      estimatedTargetDate: null,
      requiredMonthlySip: null,
    }
  }

  private buildYearlyProjections(input: {
    principal: number
    monthlyContribution: number
    annualRatePercent: number
    effectiveStart: dayjs.Dayjs
    target: dayjs.Dayjs
  }): YearlyProjection[] {
    const projections: YearlyProjection[] = []
    const totalMonths = Math.max(input.target.diff(input.effectiveStart, 'month'), 0)
    const totalYears = Math.max(Math.ceil(totalMonths / 12), 0)

    for (let yearIndex = 1; yearIndex <= totalYears; yearIndex += 1) {
      const monthsFromStart = Math.min(yearIndex * 12, totalMonths)
      const years = monthsFromStart / 12
      const futureValueLumpSum = this.calculateFutureValueLumpSum(
        input.principal,
        input.annualRatePercent,
        years
      )
      const futureValueSip = this.calculateFutureValueSip(
        input.monthlyContribution,
        input.annualRatePercent,
        monthsFromStart
      )
      const date = input.effectiveStart.add(monthsFromStart, 'month')
      projections.push({
        yearLabel: date.format('YYYY'),
        date: date.toISOString(),
        monthsFromStart,
        futureValueLumpSum,
        futureValueSip,
        totalFutureValue: futureValueLumpSum + futureValueSip,
      })
    }

    return projections
  }
}
