import type { SIP } from '../entities'
import type { ISIPRepository } from '../interfaces'

export class GetActiveSIPsUseCase {
  constructor(private sipRepository: ISIPRepository) {}

  async execute(input?: { investorId?: string; portfolioId?: string }): Promise<SIP[]> {
    const sips = await this.loadSIPs(input)
    return sips.filter((sip) => sip.status === 'Active')
  }

  private async loadSIPs(input?: { investorId?: string; portfolioId?: string }): Promise<SIP[]> {
    if (input?.investorId) {
      return this.sipRepository.getByInvestorId(input.investorId)
    }
    if (input?.portfolioId) {
      return this.sipRepository.getByPortfolioId(input.portfolioId)
    }
    return this.sipRepository.getAll()
  }
}
