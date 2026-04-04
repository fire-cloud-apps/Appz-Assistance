import type { Investor } from '../entities'

export interface IInvestorRepository {
  create(investor: Investor): Promise<string>
  update(investor: Investor): Promise<void>
  delete(id: string): Promise<void>
  getById(id: string): Promise<Investor | undefined>
  getAll(): Promise<Investor[]>
}
