import type { FinancialGoal } from '../../domain/entities'
import type { IGoalRepository } from '../../domain/interfaces'
import type { FinancialGoalModel } from '../models'
import { FinanceGoalDatasource } from '../datasources/FinanceGoalDatasource'

export class GoalRepository implements IGoalRepository {
  constructor(private datasource: FinanceGoalDatasource) {}

  async create(goal: FinancialGoal): Promise<string> {
    return this.datasource.addGoal(this.toModel(goal))
  }

  async update(goal: FinancialGoal): Promise<void> {
    await this.datasource.updateGoal(this.toModel(goal))
  }

  async delete(id: string): Promise<void> {
    await this.datasource.deleteGoal(id)
  }

  async getById(id: string): Promise<FinancialGoal | undefined> {
    const result = await this.datasource.getGoalById(id)
    return result ? this.toEntity(result) : undefined
  }

  async getAll(): Promise<FinancialGoal[]> {
    const items = await this.datasource.getGoals()
    return items.map((item) => this.toEntity(item))
  }

  async getByInvestorId(investorId: string): Promise<FinancialGoal[]> {
    const items = await this.datasource.getGoalsByInvestorId(investorId)
    return items.map((item) => this.toEntity(item))
  }

  private toModel(entity: FinancialGoal): FinancialGoalModel {
    return { ...entity }
  }

  private toEntity(model: FinancialGoalModel): FinancialGoal {
    return { ...model }
  }
}
