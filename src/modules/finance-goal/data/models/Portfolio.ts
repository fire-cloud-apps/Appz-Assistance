export interface PortfolioModel {
  id: string
  amcName: string
  scheme: string
  type: string
  folio: string
  investorId: string
  unitBalance: number
  navDate: string
  currentValue: number
  costValue: number
  appreciation: number
  weightedAvg: number
  xirr: number
  sync: boolean
  userId: string
}
