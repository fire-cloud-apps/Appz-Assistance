import { ActionIcon, Card, Group, Table, Text, Tooltip } from '@mantine/core'
interface InvestorHolding {
  id: string
  name: string
  mobile?: string
  pan?: string
  totalValue: number
  sync: boolean
  userId: string
}

interface InvestorsTableProps {
  investors: InvestorHolding[]
  onEdit?: (investor: InvestorHolding) => void
  onDelete?: (investor: InvestorHolding) => void
}

export function InvestorsTable({ investors, onEdit, onDelete }: InvestorsTableProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Investor</Table.Th>
            <Table.Th>Mobile</Table.Th>
            <Table.Th>PAN</Table.Th>
            <Table.Th>Total Holdings</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {investors.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text c="dimmed" ta="center">
                  No investors available yet.
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            investors.map((investor) => (
              <Table.Tr key={investor.id}>
                <Table.Td>{investor.name}</Table.Td>
                <Table.Td>{investor.mobile ?? '-'}</Table.Td>
                <Table.Td>{investor.pan ?? '-'}</Table.Td>
                <Table.Td>₹{investor.totalValue.toLocaleString()}</Table.Td>
                <Table.Td>
                  <Group gap={6}>
                    <Tooltip label="Edit">
                      <ActionIcon variant="subtle" onClick={() => onEdit?.(investor)}>
                        <iconify-icon icon="lucide:edit" width="16" height="16" />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon variant="subtle" color="red" onClick={() => onDelete?.(investor)}>
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
