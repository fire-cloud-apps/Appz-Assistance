import { ActionIcon, Card, Group, Table, Text, Tooltip } from '@mantine/core'
import type { Portfolio } from '../../domain/entities'

interface PortfolioTableProps {
  portfolios: Portfolio[]
  onEdit?: (portfolio: Portfolio) => void
  onDelete?: (portfolio: Portfolio) => void
}

export function PortfolioTable({ portfolios, onEdit, onDelete }: PortfolioTableProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>AMC</Table.Th>
            <Table.Th>Scheme</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Folio</Table.Th>
            <Table.Th>Units</Table.Th>
            <Table.Th>Current Value</Table.Th>
            <Table.Th>Cost Value</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {portfolios.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={8}>
                <Text c="dimmed" ta="center">
                  No portfolio entries yet.
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            portfolios.map((portfolio) => (
              <Table.Tr key={portfolio.id}>
                <Table.Td>{portfolio.amcName}</Table.Td>
                <Table.Td>{portfolio.scheme}</Table.Td>
                <Table.Td>{portfolio.type}</Table.Td>
                <Table.Td>{portfolio.folio}</Table.Td>
                <Table.Td>{portfolio.unitBalance.toLocaleString()}</Table.Td>
                <Table.Td>₹{portfolio.currentValue.toLocaleString()}</Table.Td>
                <Table.Td>₹{portfolio.costValue.toLocaleString()}</Table.Td>
                <Table.Td>
                  <Group gap={6}>
                    <Tooltip label="Edit">
                      <ActionIcon variant="subtle" onClick={() => onEdit?.(portfolio)}>
                        <iconify-icon icon="lucide:edit" width="16" height="16" />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => onDelete?.(portfolio)}
                      >
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
