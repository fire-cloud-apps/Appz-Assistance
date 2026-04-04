import { z } from 'zod'
import type { Investor, Portfolio } from '../../domain/entities'
import { FinanceGoalDatasource } from '../datasources/FinanceGoalDatasource'
import { InvestorRepository, PortfolioRepository } from '../repositories'

export interface PortfolioImportSummary {
  createdInvestors: number
  createdPortfolios: number
  updatedPortfolios: number
  skipped: number
}

export interface PortfolioExportRecord {
  AMCName: string
  Scheme: string
  Type: string
  Folio: string
  InvestorName: string
  UnitBal: number
  NAVDate: string
  CurrentValue: number
  CostValue: number
  Appreciation: number
  WtgAvg: number
  'Annualised XIRR': number
}

const portfolioRecordSchema = z.object({
  AMCName: z.string().min(1),
  Scheme: z.string().min(1),
  Type: z.string().min(1),
  Folio: z.string().min(1),
  InvestorName: z.string().min(1),
  UnitBal: z.coerce.number(),
  NAVDate: z.string().min(1),
  CurrentValue: z.coerce.number(),
  CostValue: z.coerce.number(),
  Appreciation: z.coerce.number(),
  WtgAvg: z.coerce.number(),
  'Annualised XIRR': z.coerce.number(),
})

const portfolioImportSchema = z.array(portfolioRecordSchema)

type PortfolioImportRecord = z.infer<typeof portfolioRecordSchema>

const datasource = new FinanceGoalDatasource()
const portfolioRepository = new PortfolioRepository(datasource)
const investorRepository = new InvestorRepository(datasource)

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function buildCompositeKey(values: {
  amcName: string
  scheme: string
  type: string
  folio: string
  investorName: string
}): string {
  return [
    normalize(values.amcName),
    normalize(values.scheme),
    normalize(values.type),
    normalize(values.folio),
    normalize(values.investorName),
  ].join('|')
}

function toPortfolioEntity(
  record: PortfolioImportRecord,
  investorId: string,
  existingId?: string
): Portfolio {
  return {
    id: existingId ?? crypto.randomUUID(),
    amcName: record.AMCName,
    scheme: record.Scheme,
    type: record.Type,
    folio: record.Folio,
    investorId,
    unitBalance: record.UnitBal,
    navDate: record.NAVDate,
    currentValue: record.CurrentValue,
    costValue: record.CostValue,
    appreciation: record.Appreciation,
    weightedAvg: record.WtgAvg,
    xirr: record['Annualised XIRR'],
  }
}

export async function importPortfolioJsonFile(file: File): Promise<PortfolioImportSummary> {
  const text = await file.text()
  let payload: unknown

  try {
    payload = JSON.parse(text)
  } catch (error) {
    throw new Error('Invalid JSON file.')
  }

  const records = portfolioImportSchema.parse(payload)
  return importPortfolioRecords(records)
}

export async function importPortfolioRecords(records: PortfolioImportRecord[]): Promise<PortfolioImportSummary> {
  const investors = await investorRepository.getAll()
  const portfolios = await portfolioRepository.getAll()

  const investorsByName = new Map<string, Investor>()
  const investorNameById = new Map<string, string>()

  investors.forEach((investor) => {
    investorsByName.set(normalize(investor.name), investor)
    investorNameById.set(investor.id, investor.name)
  })

  const portfolioByKey = new Map<string, Portfolio>()
  portfolios.forEach((portfolio) => {
    const investorName = investorNameById.get(portfolio.investorId)
    if (!investorName) return
    const key = buildCompositeKey({
      amcName: portfolio.amcName,
      scheme: portfolio.scheme,
      type: portfolio.type,
      folio: portfolio.folio,
      investorName,
    })
    portfolioByKey.set(key, portfolio)
  })

  let createdInvestors = 0
  let createdPortfolios = 0
  let updatedPortfolios = 0
  let skipped = 0

  for (const record of records) {
    const investorKey = normalize(record.InvestorName)
    let investor = investorsByName.get(investorKey)

    if (!investor) {
      investor = { id: crypto.randomUUID(), name: record.InvestorName }
      await investorRepository.create(investor)
      investorsByName.set(investorKey, investor)
      investorNameById.set(investor.id, investor.name)
      createdInvestors += 1
    }

    const key = buildCompositeKey({
      amcName: record.AMCName,
      scheme: record.Scheme,
      type: record.Type,
      folio: record.Folio,
      investorName: investor.name,
    })

    const existing = portfolioByKey.get(key)

    if (existing) {
      const updated: Portfolio = {
        ...existing,
        unitBalance: record.UnitBal,
        navDate: record.NAVDate,
        currentValue: record.CurrentValue,
        costValue: record.CostValue,
        appreciation: record.Appreciation,
        weightedAvg: record.WtgAvg,
        xirr: record['Annualised XIRR'],
      }
      await portfolioRepository.update(updated)
      updatedPortfolios += 1
      continue
    }

    const created = toPortfolioEntity(record, investor.id)
    await portfolioRepository.create(created)
    portfolioByKey.set(key, created)
    createdPortfolios += 1
  }

  return { createdInvestors, createdPortfolios, updatedPortfolios, skipped }
}

export async function exportPortfolioRecords(): Promise<PortfolioExportRecord[]> {
  const investors = await investorRepository.getAll()
  const portfolios = await portfolioRepository.getAll()
  const investorNameById = new Map(investors.map((investor) => [investor.id, investor.name]))

  return portfolios.map((portfolio) => ({
    AMCName: portfolio.amcName,
    Scheme: portfolio.scheme,
    Type: portfolio.type,
    Folio: portfolio.folio,
    InvestorName: investorNameById.get(portfolio.investorId) ?? 'Unknown',
    UnitBal: portfolio.unitBalance,
    NAVDate: portfolio.navDate,
    CurrentValue: portfolio.currentValue,
    CostValue: portfolio.costValue,
    Appreciation: portfolio.appreciation,
    WtgAvg: portfolio.weightedAvg,
    'Annualised XIRR': portfolio.xirr,
  }))
}

export function downloadPortfolioExport(records: PortfolioExportRecord[]): void {
  const filename = `finance_portfolios_${new Date().toISOString().split('T')[0]}.json`
  const jsonString = JSON.stringify(records, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
