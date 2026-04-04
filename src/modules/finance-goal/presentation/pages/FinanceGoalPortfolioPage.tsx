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
} from '@mantine/core'
import { useRef, useState } from 'react'
import { usePortfolio, useInvestor } from '../hooks'
import { PortfolioModal, PortfolioTable } from '../../components'
import type { Portfolio } from '../../domain/entities'
import {
  downloadPortfolioExport,
  exportPortfolioRecords,
  importPortfolioJsonFile,
} from '../../data/services/financeGoalImportExportService'
import { StatusIcon } from '../../../../core/components/StatusIcon'

export function FinanceGoalPortfolioPage() {
  const { portfolios, addPortfolio, updatePortfolio, removePortfolio, error } = usePortfolio()
  const { investors } = useInvestor()
  const [modalOpened, setModalOpened] = useState(false)
  const [selected, setSelected] = useState<Portfolio | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
      const summary = await importPortfolioJsonFile(file)
      setImportProgress(90)
      setImportMessage(
        `Imported: ${summary.createdPortfolios} created, ${summary.updatedPortfolios} updated, ${summary.createdInvestors} new investors.`
      )
      setImportProgress(100)
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
                Total: {portfolios.length}
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
                Import JSON
              </Button>
              <Button leftSection={<StatusIcon icon="lucide:plus" size={14} />} onClick={handleCreate}>
                Add Portfolio
              </Button>
            </Group>
            <Text size="sm" c="dimmed">
              Download or refer to a sample portfolio valuation format before uploading your JSON file.{' '}
              <Anchor
                href="https://www.camsonline.com/Investors/Statements/Portfolio-Valuation-Statement"
                target="_blank"
                rel="noreferrer"
              >
                Download Sample JSON Schema
              </Anchor>
            </Text>
          </Stack>
        </Group>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
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

        <PortfolioTable portfolios={portfolios} onEdit={handleEdit} onDelete={handleDelete} />
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
