/**
 * Route: /finance/investors
 */
import { Box, Group, Stack, Text, Title, Badge, Button, Alert } from '@mantine/core'
import { useState } from 'react'
import { useInvestor, usePortfolio } from '../hooks'
import { InvestorModal, InvestorsTable } from '../../components'
import type { Investor } from '../../domain/entities'

interface InvestorHolding extends Investor {
  totalValue: number
}

export function FinanceGoalInvestorsPage() {
  const { investors, addInvestor, updateInvestor, removeInvestor, error } = useInvestor()
  const { portfolios } = usePortfolio()
  const [modalOpened, setModalOpened] = useState(false)
  const [selected, setSelected] = useState<Investor | null>(null)

  const investorTotals: InvestorHolding[] = investors.map((investor) => {
    const totalValue = portfolios
      .filter((portfolio) => portfolio.investorId === investor.id)
      .reduce((sum, portfolio) => sum + portfolio.currentValue, 0)
    return { ...investor, totalValue }
  })

  const handleCreate = () => {
    setSelected(null)
    setModalOpened(true)
  }

  const handleEdit = (investor: InvestorHolding) => {
    setSelected({ id: investor.id, name: investor.name, mobile: investor.mobile, pan: investor.pan })
    setModalOpened(true)
  }

  const handleDelete = async (investor: InvestorHolding) => {
    if (!window.confirm(`Delete investor ${investor.name}?`)) return
    await removeInvestor(investor.id)
  }

  const handleSubmit = async (investor: Investor) => {
    if (selected) {
      await updateInvestor(investor)
    } else {
      await addInvestor(investor)
    }
  }

  return (
    <Box>
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Investors</Title>
            <Text c="dimmed">View investor-wise holdings.</Text>
          </div>
          <Group gap="sm">
            <Badge variant="light" color="blue">
              Total: {investors.length}
            </Badge>
            <Button onClick={handleCreate}>Add Investor</Button>
          </Group>
        </Group>

        {error && (
          <Alert color="red" title="Investor Error">
            {error}
          </Alert>
        )}

        <InvestorsTable
          investors={investorTotals}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Stack>

      <InvestorModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        initial={selected}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}
