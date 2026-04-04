import type { FinancialGoal } from '../entities'

export interface IGoalRepository {
  create(goal: FinancialGoal): Promise<string>
  update(goal: FinancialGoal): Promise<void>
  delete(id: string): Promise<void>
  getById(id: string): Promise<FinancialGoal | undefined>
  getAll(): Promise<FinancialGoal[]>
  getByInvestorId(investorId: string): Promise<FinancialGoal[]>
}
