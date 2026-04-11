export interface FinancialGoalModel {
  id: string
  name: string
  description: string
  startDate: string
  targetDate: string
  targetAmount: number
  sipIds: string[]
  investorId: string
  expectedGrowthRate: number
}
