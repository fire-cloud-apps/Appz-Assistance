export type SIPFrequency = 'Monthly' | 'Quarterly'
export type SIPStatus = 'Active' | 'Inactive'

export interface SIP {
  id: string
  portfolioId: string
  investorId: string
  amount: number
  frequency: SIPFrequency
  startDate: string
  endDate?: string
  status: SIPStatus
}
