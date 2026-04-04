/**
 * Route: /finance/investors
 */
import { Box, Group, Stack, Text, Title, Badge, Button, Alert } from '@mantine/core'
import { useState } from 'react'
import { useInvestor, usePortfolio } from '../hooks'
import { InvestorModal, InvestorsTable } from '../../components'
import type { Investor } from '../../domain/entities'

export function FinanceGoalInvestorsPage() {
  const { investors, addInvestor, updateInvestor, removeInvestor, error } = useInvestor()
  const { portfolios } = usePortfolio()
  const [modalOpened, setModalOpened] = useState(false)
  const [selected, setSelected] = useState<Investor | null>(null)

  const investorTotals = investors.map((investor) => {
    const totalValue = portfolios
      .filter((portfolio) => portfolio.investorId === investor.id)
      .reduce((sum, portfolio) => sum + portfolio.currentValue, 0)
    return { ...investor, totalValue }
  })

  const handleCreate = () => {
    setSelected(null)
    setModalOpened(true)
  }

  const handleEdit = (investor: Investor) => {
    setSelected(investor)
    setModalOpened(true)
  }

  const handleDelete = async (investor: Investor) => {
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
          onEdit={(value) => handleEdit({ id: value.id, name: value.name })}
          onDelete={(value) => handleDelete({ id: value.id, name: value.name })}
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
