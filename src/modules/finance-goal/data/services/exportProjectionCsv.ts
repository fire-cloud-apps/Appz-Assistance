import type { YearlyProjection } from '../../domain/services/FinancialProjectionService'

interface ExportProjectionDataOptions {
  goalName: string
  yearlyProjections: YearlyProjection[]
  fileName?: string
}

export function exportProjectionCsv({
  goalName,
  yearlyProjections,
  fileName,
}: ExportProjectionDataOptions): void {
  const headers = ['Year', 'Invested Amount', 'Growth', 'Total Value']

  const rows = yearlyProjections.map(p => {
    const investedAmount = p.futureValueLumpSum + p.futureValueSip
    const totalValue = p.totalFutureValue
    const growth = totalValue - investedAmount
    return [
      p.yearLabel,
      Math.round(investedAmount).toString(),
      Math.round(growth).toString(),
      Math.round(totalValue).toString(),
    ]
  })

  const csvContent = [
    `Goal: ${goalName}`,
    `Generated: ${new Date().toISOString()}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName ?? `${goalName.replace(/[^a-z0-9]/gi, '_')}_projections.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}