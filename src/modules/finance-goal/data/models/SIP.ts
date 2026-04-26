export type SIPFrequency = 'Monthly' | 'Quarterly'
export type SIPStatus = 'Active' | 'Inactive'

export interface SIPModel {
  id: string
  name: string
  portfolioId: string
  investorId: string
  amount: number
  frequency: SIPFrequency
  startDate: string
  endDate?: string
  status: SIPStatus
  icon?: string
  sync: boolean
  userId: string
}
