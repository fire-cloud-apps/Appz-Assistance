/**
 * Route: /finance/portfolio
 */
import {
  Box,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Button,
  Alert,
  Progress,
  Anchor,
  TextInput,
  Select,
} from '@mantine/core'
import { useEffect, useRef, useState, useMemo } from 'react'
import { usePortfolio, useInvestor } from '../hooks'
import { PortfolioModal, PortfolioTable } from '../../components'
import type { Portfolio } from '../../domain/entities'
import { useFinanceGoalStore } from '../store/useFinanceGoalStore'
import {
  downloadPortfolioExport,
  exportPortfolioRecords,
  importPortfolioJsonFile,
  importPortfolioExcelFile,
} from '../../data/services/financeGoalImportExportService'
import { StatusIcon } from '../../../../core/components/StatusIcon'

export function FinanceGoalPortfolioPage() {
  const {
    portfolios,
    addPortfolio,
    updatePortfolio,
    removePortfolio,
    error,
    page,
    pageSize,
    total,
    totalPages,
    changePage,
    changePageSize,
    reload,
    applyFilters,
    clearFilters,
    filters,
  } = usePortfolio()
  const { investors } = useInvestor()
  const store = useFinanceGoalStore()
  const [modalOpened, setModalOpened] = useState(false)
  const [selected, setSelected] = useState<Portfolio | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Reset portfolio state when navigating to this page to allow paginated loading
  useEffect(() => {
    store.resetPortfoliosState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const investorOptions = useMemo(() => 
    investors.map(inv => ({ value: inv.id, label: inv.name })),
    [investors]
  )

  const amcOptions = useMemo(() => {
    const store = useFinanceGoalStore.getState()
    const amcs = new Set<string>()
    store.investors.forEach((inv) => {
      store.portfolios
        .filter(p => p.investorId === inv.id)
        .forEach(p => {
          if (p.amcName) amcs.add(p.amcName)
        })
    })
    return Array.from(amcs).map(amc => ({ value: amc, label: amc }))
  }, [investors])

  const handleCreate = () => {
    setSelected(null)
    setModalOpened(true)
  }

  const handleEdit = (portfolio: Portfolio) => {
    setSelected(portfolio)
    setModalOpened(true)
  }

  const handleDelete = async (portfolio: Portfolio) => {
    if (!window.confirm(`Delete portfolio ${portfolio.scheme}?`)) return
    await removePortfolio(portfolio.id)
  }

  const handleSubmit = async (portfolio: Portfolio) => {
    if (selected) {
      await updatePortfolio(portfolio)
    } else {
      await addPortfolio(portfolio)
    }
  }

  const handleExport = async () => {
    const records = await exportPortfolioRecords()
    downloadPortfolioExport(records)
  }

  const handleImportClick = () => {
    setImportMessage(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    setImportProgress(5)
    try {
      setImportProgress(30)
      let summary
      let errors: string[] = []
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const result = await importPortfolioExcelFile(file)
        summary = result.summary
        errors = result.errors
      } else {
        summary = await importPortfolioJsonFile(file)
      }
      
      setImportProgress(90)
      
      let message = `Imported: ${summary.createdPortfolios} created, ${summary.updatedPortfolios} updated, ${summary.createdInvestors} new investors.`
      if (summary.rejected > 0) {
        message += ` Rejected: ${summary.rejected} portfolio(s) with zero values.`
      }
      if (errors.length > 0) {
        message += ` Warnings: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`
      }
      setImportMessage(message)
      setImportProgress(100)
      reload()
    } catch (error) {
      setImportMessage((error as Error).message)
    } finally {
      setTimeout(() => {
        setIsImporting(false)
        setImportProgress(0)
      }, 500)
      event.target.value = ''
    }
  }

  const handleSearch = (value: string) => {
    setSearchValue(value)
    if (value) {
      applyFilters({ ...filters, schemeSearch: value })
    } else {
      clearFilters()
    }
  }

  const handleInvestorChange = (value: string | null) => {
    if (value) {
      applyFilters({ ...filters, investorId: value })
    } else {
      const { investorId, ...rest } = filters
      applyFilters(rest)
    }
  }

  const handleAmcChange = (value: string | null) => {
    if (value) {
      applyFilters({ ...filters, amcName: value })
    } else {
      const { amcName, ...rest } = filters
      applyFilters(rest)
    }
  }

  const handleClearFilters = () => {
    setSearchValue('')
    clearFilters()
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <Box>
      <Stack gap="lg">
        <Group justify="space-between" align="center" wrap="nowrap">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title order={2}>Portfolio Value</Title>
            <Text c="dimmed">Track mutual fund holdings and performance.</Text>
          </div>
          <Stack gap={6} align="flex-end">
            <Group gap="sm">
              <Badge variant="light" color="blue">
                Total: {total}
              </Badge>
              <Button
                variant="light"
                color="teal"
                leftSection={<StatusIcon icon="lucide:download" size={14} />}
                onClick={handleExport}
              >
                Export JSON
              </Button>
              <Button
                variant="light"
                color="orange"
                leftSection={<StatusIcon icon="lucide:upload" size={14} />}
                onClick={handleImportClick}
              >
                Import
              </Button>
              <Button leftSection={<StatusIcon icon="lucide:plus" size={14} />} onClick={handleCreate}>
                Add Portfolio
              </Button>
            </Group>
            <Text size="sm" c="dimmed">
              Import portfolio data from JSON or Excel (.xlsx) files. Export your data as JSON for backup.{' '}
              <Anchor
                href="https://www.camsonline.com/Investors/Statements/Portfolio-Valuation-Statement"
                target="_blank"
                rel="noreferrer"
              >
                Download CAS Sample
              </Anchor>
            </Text>
          </Stack>
        </Group>

        <Group gap="md">
          <TextInput
            placeholder="Search by Scheme Name"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ flex: 1, maxWidth: 300 }}
          />
          <Select
            placeholder="Filter by Investor"
            data={[{ value: '', label: 'All Investors' }, ...investorOptions]}
            value={filters.investorId || ''}
            onChange={(value) => handleInvestorChange(value || null)}
            style={{ width: 200 }}
            clearable
          />
          <Select
            placeholder="Filter by AMC"
            data={[{ value: '', label: 'All AMCs' }, ...amcOptions]}
            value={filters.amcName || ''}
            onChange={(value) => handleAmcChange(value || null)}
            style={{ width: 200 }}
            clearable
          />
          {hasActiveFilters && (
            <Button variant="subtle" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </Group>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {error && (
          <Alert color="red" title="Portfolio Error">
            {error}
          </Alert>
        )}

        {importMessage && (
          <Alert color="blue" title="Import Summary">
            {importMessage}
          </Alert>
        )}

        {isImporting && (
          <Alert color="blue" title="Importing Portfolio Data">
            <Text size="sm" c="dimmed" mb="xs">
              Processing the JSON file and syncing portfolio records…
            </Text>
            <Progress value={importProgress} animated />
          </Alert>
        )}

        <PortfolioTable 
          portfolios={portfolios} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPageChange={changePage}
          onPageSizeChange={changePageSize}
        />
      </Stack>

      <PortfolioModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        investors={investors}
        initial={selected}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}