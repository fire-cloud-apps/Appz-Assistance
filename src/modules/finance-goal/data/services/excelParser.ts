import * as XLSX from 'xlsx'

export interface ExcelHeaderData {
  investorName: string
  mobileNumber?: string
  email?: string
  pan?: string
  statementPeriod?: string
  fromDate?: string
  toDate?: string
}

export interface ExcelPortfolioRow {
  amcName: string
  scheme: string
  type: string
  folio: string
  unitBal: number
  navDate: string
  currentValue: number
  costValue: number
  appreciation: number
  weightedAvg: number
  xirr: number
}

export interface ExcelParsedData {
  header: ExcelHeaderData
  portfolios: ExcelPortfolioRow[]
  errors: string[]
  sheetName: string
}

export interface ExcelSheetsInfo {
  sheets: string[]
  recommended: string
}

const HEADER_LABELS: Record<string, keyof ExcelHeaderData> = {
  'mobile number': 'mobileNumber',
  'mobile': 'mobileNumber',
  'email': 'email',
  'email id': 'email',
  'pan': 'pan',
  'pan number': 'pan',
  'from date': 'fromDate',
  'to date': 'toDate',
  'to': 'toDate',
}

const PORTFOLIO_FIELD_MAPPINGS: Record<string, keyof ExcelPortfolioRow> = {
  'scheme name': 'scheme',
  'scheme': 'scheme',
  'amc name': 'amcName',
  'amc': 'amcName',
  'category': 'type',
  'type': 'type',
  'folio no.': 'folio',
  'folio': 'folio',
  'folio no': 'folio',
  'units': 'unitBal',
  'unit balance': 'unitBal',
  'invested value': 'costValue',
  'invested amount': 'costValue',
  'cost value': 'costValue',
  'cost': 'costValue',
  'current value': 'currentValue',
  'current': 'currentValue',
  'market value': 'currentValue',
  'returns': 'appreciation',
  'profit/loss': 'appreciation',
  'gain/loss': 'appreciation',
  'gain': 'appreciation',
  'loss': 'appreciation',
  'returns %': 'xirr',
  'xirr': 'xirr',
}

const PREFERRED_SHEETS = ['portfolio details', 'portfolio', 'holdings', 'valuation']

function normalizeLabel(value: string): string {
  return value?.toString().trim().toLowerCase() ?? ''
}

function parseNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.\-]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }
  return 0
}

function isRowEmpty(row: Record<string, unknown>): boolean {
  const values = Object.values(row).filter(v => v !== null && v !== undefined && v !== '')
  return values.length === 0
}

export function maskMobileNumber(mobile: string): string {
  if (!mobile || mobile.length < 8) return mobile
  const hasPlus = mobile.startsWith('+')
  const cleaned = mobile.replace(/[^0-9]/g, '')
  let masked = ''
  if (cleaned.length >= 10) {
    masked = cleaned.slice(0, 5) + 'XXXX' + cleaned.slice(-3)
  } else {
    masked = cleaned.slice(0, 4) + 'XXXX' + cleaned.slice(-4)
  }
  return hasPlus ? '+' + masked : masked
}

export function maskPAN(pan: string): string {
  if (!pan || pan.length < 10) return pan
  return pan.slice(0, 2) + 'XXX' + pan.slice(-4)
}

export function getExcelSheetsInfo(buffer: ArrayBuffer): ExcelSheetsInfo {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheets = workbook.SheetNames
  
  const normalizedSheets = sheets.map(s => normalizeLabel(s))
  const recommended = sheets.find((_, i) => PREFERRED_SHEETS.includes(normalizedSheets[i])) ?? sheets[0]
  
  return { sheets, recommended }
}

function parseSheetData(
  jsonData: Record<string, unknown>[],
  investorColumn: string,
  errors: string[],
  header: ExcelHeaderData,
  portfolios: ExcelPortfolioRow[]
): number {
  for (let i = 0; i < 10; i++) {
    const row = jsonData[i]
    if (!row) continue
    
    const labelKey = row['Name']
    if (!labelKey) continue
    
    const normalizedLabel = normalizeLabel(String(labelKey))
    const mappedField = HEADER_LABELS[normalizedLabel]
    
    if (mappedField && investorColumn) {
      const value = row[investorColumn]
      if (value) {
        if (mappedField === 'fromDate' || mappedField === 'toDate') {
          header.statementPeriod = header.statementPeriod 
            ? `${header.statementPeriod} - ${value}`
            : String(value)
        } else if (mappedField !== 'statementPeriod') {
          header[mappedField] = String(value).trim()
        }
      }
    }
  }

  let headerRowIndex = -1
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i]
    const labelValue = row['Name']
    if (labelValue && normalizeLabel(String(labelValue)) === 'scheme name') {
      headerRowIndex = i
      break
    }
  }

  if (headerRowIndex === -1) {
    errors.push('Could not find portfolio table header row')
    return -1
  }

  const headerRow = jsonData[headerRowIndex]
  const portfolioFieldMap: Map<keyof ExcelPortfolioRow, string> = new Map()
  
  Object.entries(headerRow).forEach(([key, value]) => {
    if (key === 'Name' || key === investorColumn) return
    if (value) {
      const normalized = normalizeLabel(String(value))
      const mappedField = PORTFOLIO_FIELD_MAPPINGS[normalized]
      if (mappedField) {
        portfolioFieldMap.set(mappedField, key)
      }
    }
  })

  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i]
    
    if (isRowEmpty(row)) continue
    
    const schemeValue = row['Name']
    if (!schemeValue || String(schemeValue).trim() === '') continue
    
    try {
      const portfolio: ExcelPortfolioRow = {
        amcName: '',
        scheme: '',
        type: '',
        folio: '',
        unitBal: 0,
        navDate: new Date().toISOString().split('T')[0],
        currentValue: 0,
        costValue: 0,
        appreciation: 0,
        weightedAvg: 0,
        xirr: 0,
      }

      portfolio.scheme = String(schemeValue).trim()
      portfolio.amcName = investorColumn ? String(row[investorColumn] ?? '').trim() : ''
      
      for (const [field, column] of portfolioFieldMap) {
        const value = row[column]
        
        switch (field) {
          case 'type':
            portfolio.type = value ? String(value).trim() : 'Direct'
            break
          case 'folio':
            portfolio.folio = value ? String(value).trim() : ''
            break
          case 'unitBal':
            portfolio.unitBal = parseNumber(value)
            break
          case 'currentValue':
            portfolio.currentValue = parseNumber(value)
            break
          case 'costValue':
            portfolio.costValue = parseNumber(value)
            break
          case 'appreciation':
            portfolio.appreciation = parseNumber(value)
            break
        }
      }

      if (!portfolio.folio) {
        errors.push(`Row ${i + 1}: Missing folio number, skipping`)
        continue
      }
      
      if (!portfolio.amcName) {
        portfolio.amcName = 'Unknown AMC'
      }
      
      portfolios.push(portfolio)
    } catch (err) {
      errors.push(`Row ${i + 1}: Failed to parse - ${(err as Error).message}`)
    }
  }
  
  return portfolios.length
}

export function parseExcelFile(buffer: ArrayBuffer, preferredSheet?: string): ExcelParsedData {
  const errors: string[] = []
  const header: ExcelHeaderData = {
    investorName: 'Unknown',
  }
  const portfolios: ExcelPortfolioRow[] = []
  
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  
  if (workbook.SheetNames.length === 0) {
    errors.push('No sheets found in Excel file')
    return { header, portfolios, errors, sheetName: '' }
  }

  let sheetName = preferredSheet
  if (!sheetName) {
    const normalizedSheets = workbook.SheetNames.map(s => normalizeLabel(s))
    sheetName = workbook.SheetNames.find((_, i) => PREFERRED_SHEETS.includes(normalizedSheets[i])) ?? workbook.SheetNames[0]
  }
  
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    defval: '',
    raw: false,
  }) as Record<string, unknown>[]
  
  if (jsonData.length === 0) {
    errors.push('No data found in Excel sheet')
    return { header, portfolios, errors, sheetName }
  }

  const firstRowKeys = Object.keys(jsonData[0])
  const investorColumn = firstRowKeys[1]
  
  if (investorColumn && investorColumn !== 'Name' && investorColumn !== '__EMPTY') {
    header.investorName = investorColumn
  }

  const count = parseSheetData(jsonData, investorColumn, errors, header, portfolios)
  
  if (count === 0) {
    errors.push('No valid portfolio records found in the file')
  }
  
  return { header, portfolios, errors, sheetName }
}

export interface UserRowSelection {
  headerRowStart: number
  dataStartRow: number
  dataEndRow: number
  sheetName?: string
}

export function parseExcelFileWithSelection(
  buffer: ArrayBuffer,
  selection?: UserRowSelection
): ExcelParsedData {
  if (!selection?.sheetName) {
    return parseExcelFile(buffer)
  }
  
  const errors: string[] = []
  const header: ExcelHeaderData = {
    investorName: 'Unknown',
  }
  const portfolios: ExcelPortfolioRow[] = []
  
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  
  if (workbook.SheetNames.length === 0) {
    errors.push('No sheets found in Excel file')
    return { header, portfolios, errors, sheetName: '' }
  }
  
  const sheetName = selection.sheetName
  const worksheet = workbook.Sheets[sheetName]
  if (!worksheet) {
    errors.push(`Sheet "${sheetName}" not found`)
    return { header, portfolios, errors, sheetName }
  }
  
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    defval: '',
    raw: false,
  }) as Record<string, unknown>[]
  
  if (jsonData.length === 0) {
    errors.push('No data found in Excel sheet')
    return { header, portfolios, errors, sheetName }
  }

  const firstRowKeys = Object.keys(jsonData[0])
  const investorColumn = firstRowKeys[1]
  
  if (investorColumn && investorColumn !== 'Name' && investorColumn !== '__EMPTY') {
    header.investorName = investorColumn
  }

  for (let i = selection.headerRowStart; i < selection.dataStartRow; i++) {
    const row = jsonData[i]
    if (!row) continue
    
    const labelKey = row['Name']
    if (!labelKey) continue
    
    const normalizedLabel = normalizeLabel(String(labelKey))
    const mappedField = HEADER_LABELS[normalizedLabel]
    
    if (mappedField && investorColumn) {
      const value = row[investorColumn]
      if (value) {
        if (mappedField === 'fromDate' || mappedField === 'toDate') {
          header.statementPeriod = header.statementPeriod 
            ? `${header.statementPeriod} - ${value}`
            : String(value)
        } else if (mappedField !== 'statementPeriod') {
          header[mappedField] = String(value).trim()
        }
      }
    }
  }

  const headerRow = jsonData[selection.dataStartRow]
  if (!headerRow) {
    errors.push('Invalid header row selection')
    return { header, portfolios, errors, sheetName }
  }

  const portfolioFieldMap: Map<keyof ExcelPortfolioRow, string> = new Map()
  
  Object.entries(headerRow).forEach(([key, value]) => {
    if (key === 'Name' || key === investorColumn) return
    if (value) {
      const normalized = normalizeLabel(String(value))
      const mappedField = PORTFOLIO_FIELD_MAPPINGS[normalized]
      if (mappedField) {
        portfolioFieldMap.set(mappedField, key)
      }
    }
  })

  const dataStart = selection.dataStartRow + 1
  const dataEnd = Math.min(selection.dataEndRow + 1, jsonData.length)
  
  for (let i = dataStart; i < dataEnd; i++) {
    const row = jsonData[i]
    
    if (isRowEmpty(row)) continue
    
    const schemeValue = row['Name']
    if (!schemeValue || String(schemeValue).trim() === '') continue
    
    try {
      const portfolio: ExcelPortfolioRow = {
        amcName: '',
        scheme: '',
        type: '',
        folio: '',
        unitBal: 0,
        navDate: new Date().toISOString().split('T')[0],
        currentValue: 0,
        costValue: 0,
        appreciation: 0,
        weightedAvg: 0,
        xirr: 0,
      }

      portfolio.scheme = String(schemeValue).trim()
      portfolio.amcName = investorColumn ? String(row[investorColumn] ?? '').trim() : ''
      
      for (const [field, column] of portfolioFieldMap) {
        const value = row[column]
        
        switch (field) {
          case 'type':
            portfolio.type = value ? String(value).trim() : 'Direct'
            break
          case 'folio':
            portfolio.folio = value ? String(value).trim() : ''
            break
          case 'unitBal':
            portfolio.unitBal = parseNumber(value)
            break
          case 'currentValue':
            portfolio.currentValue = parseNumber(value)
            break
          case 'costValue':
            portfolio.costValue = parseNumber(value)
            break
          case 'appreciation':
            portfolio.appreciation = parseNumber(value)
            break
        }
      }

      if (!portfolio.folio) {
        errors.push(`Row ${i + 1}: Missing folio number, skipping`)
        continue
      }
      
      if (!portfolio.amcName) {
        portfolio.amcName = 'Unknown AMC'
      }
      
      portfolios.push(portfolio)
    } catch (err) {
      errors.push(`Row ${i + 1}: Failed to parse - ${(err as Error).message}`)
    }
  }
  
  if (portfolios.length === 0) {
    errors.push('No valid portfolio records found in the file')
  }
  
  return { header, portfolios, errors, sheetName }
}