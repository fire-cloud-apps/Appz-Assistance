import { ActionIcon, Badge, Card, Group, Table, Text, Tooltip } from '@mantine/core'
import dayjs from 'dayjs'
import type { SIP, Portfolio } from '../../domain/entities'

interface SIPTableProps {
  sips: SIP[]
  portfolios: Portfolio[]
  onEdit?: (sip: SIP) => void
  onDelete?: (sip: SIP) => void
}

export function SIPTable({ sips, portfolios, onEdit, onDelete }: SIPTableProps) {
  const getPortfolioDisplayName = (portfolioId: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId)
    if (portfolio) {
      return `${portfolio.scheme} ${portfolio.folio ? `(${portfolio.folio})` : ''}`
    }
    return portfolioId
  }

  return (
    <Card withBorder radius="md" padding="lg">
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>SIP Name</Table.Th>
            <Table.Th>Portfolio</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Frequency</Table.Th>
            <Table.Th>Start Date</Table.Th>
            <Table.Th>End Date</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sips.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={8}>
                <Text c="dimmed" ta="center">
                  No SIP entries yet.
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            sips.map((sip) => (
              <Table.Tr key={sip.id}>
                <Table.Td fw={600}>{sip.name}</Table.Td>
                <Table.Td>{getPortfolioDisplayName(sip.portfolioId)}</Table.Td>
                <Table.Td>₹{sip.amount.toLocaleString()}</Table.Td>
                <Table.Td>{sip.frequency}</Table.Td>
                <Table.Td>{dayjs(sip.startDate).format('DD MMM YYYY')}</Table.Td>
                <Table.Td>{sip.endDate ? dayjs(sip.endDate).format('DD MMM YYYY') : '-'}</Table.Td>
                <Table.Td>
                  <Badge color={sip.status === 'Active' ? 'green' : 'gray'} variant="light">
                    {sip.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={6}>
                    <Tooltip label="Edit">
                      <ActionIcon variant="subtle" onClick={() => onEdit?.(sip)}>
                        <iconify-icon icon="lucide:edit" width="16" height="16" />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon variant="subtle" color="red" onClick={() => onDelete?.(sip)}>
                        <iconify-icon icon="lucide:trash-2" width="16" height="16" />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Card>
  )
}
