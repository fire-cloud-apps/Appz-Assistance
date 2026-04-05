import { ActionIcon, Card, Group, Table, Text, Tooltip, Pagination, Select } from '@mantine/core'
import type { Portfolio } from '../../domain/entities'

interface PortfolioTableProps {
  portfolios: Portfolio[]
  onEdit?: (portfolio: Portfolio) => void
  onDelete?: (portfolio: Portfolio) => void
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 per page' },
  { value: '10', label: '10 per page' },
  { value: '25', label: '25 per page' },
  { value: '50', label: '50 per page' },
]

export function PortfolioTable({ 
  portfolios, 
  onEdit, 
  onDelete,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PortfolioTableProps) {
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
      
      {total > 0 && (
        <Group justify="space-between" mt="md">
          <Select
            size="xs"
            value={String(pageSize)}
            data={PAGE_SIZE_OPTIONS}
            onChange={(value) => value && onPageSizeChange(Number(value))}
            style={{ width: 120 }}
          />
          <Text size="sm" c="dimmed">
            Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total}
          </Text>
          <Pagination
            size="sm"
            total={totalPages}
            value={page}
            onChange={onPageChange}
          />
        </Group>
      )}
    </Card>
  )
}