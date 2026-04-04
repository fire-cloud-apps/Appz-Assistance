export interface FinancialGoalModel {
  id: string
  name: string
  description: string
  startDate: string
  targetDate: string
  targetAmount: number
  sipIds: string[]
  portfolioIds: string[]
  investorId: string
}
