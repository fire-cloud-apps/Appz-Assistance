export interface FinancialGoal {
  id: string
  name: string
  description: string
  startDate: string
  targetDate: string
  targetAmount: number
  currentAmount: number
  investorIds: string[]
  portfolioIds: string[]
  sipIds: string[]
  expectedGrowthRate: number
}
