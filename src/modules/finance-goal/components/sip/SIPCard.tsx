import { ActionIcon, Badge, Card, Group, SimpleGrid, Text, Tooltip, Box } from '@mantine/core'
import dayjs from 'dayjs'
import type { SIP, Portfolio } from '../../domain/entities'

interface SIPCardProps {
  sips: SIP[]
  portfolios: Portfolio[]
  onEdit?: (sip: SIP) => void
  onDelete?: (sip: SIP) => void
}

function SIPCardItem({ sip, portfolios, onEdit, onDelete }: { sip: SIP; portfolios: Portfolio[]; onEdit?: (sip: SIP) => void; onDelete?: (sip: SIP) => void }) {
  const getPortfolioDisplayName = (portfolioId: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId)
    if (portfolio) {
      return `${portfolio.scheme} ${portfolio.folio ? `(${portfolio.folio})` : ''}`
    }
    return portfolioId
  }

  return (
    <Card withBorder radius="md" padding="md" shadow="sm" style={{ position: 'relative', overflow: 'hidden' }}>
      {sip.icon && (
        <Box
          style={{
            position: 'absolute',
            bottom: -10,
            right: -10,
            opacity: 0.15,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <iconify-icon icon={sip.icon} width="100" height="100" />
        </Box>
      )}
      <Group justify="space-between" mb="xs" style={{ position: 'relative', zIndex: 1 }}>
        <Group gap="sm" style={{ flex: 1 }}>
          {sip.icon && (
            <iconify-icon icon={sip.icon} width="24" height="24" />
          )}
          <Text fw={700} size="lg" lineClamp={2}>
            {sip.name}
          </Text>
        </Group>
      </Group>

      <Box style={{ position: 'relative', zIndex: 1 }}>
        <Text size="sm" c="dimmed" mb="xs" lineClamp={1}>
          {getPortfolioDisplayName(sip.portfolioId)}
        </Text>

        <Group gap="xs" mb="xs">
          <iconify-icon icon="lucide:indian-rupee" width="16" height="16" />
          <Text size="sm" fw={600}>
            {sip.amount.toLocaleString()}
          </Text>
          <Text size="sm" c="dimmed">
            | {sip.frequency}
          </Text>
        </Group>

        <Group gap="xs" mb="md">
          <iconify-icon icon="lucide:calendar-days" width="16" height="16" />
          <Text size="xs" c="dimmed">
            Start: {dayjs(sip.startDate).format('DD MMM YYYY')}
          </Text>
          {sip.endDate && (
            <>
              <Text size="xs" c="dimmed">|</Text>
              <Text size="xs" c="dimmed">
                End: {dayjs(sip.endDate).format('DD MMM YYYY')}
              </Text>
            </>
          )}
        </Group>

        <Group justify="space-between" align="center">
          <Badge
            color={sip.status === 'Active' ? 'green' : 'gray'}
            variant="light"
            size="md"
          >
            {sip.status}
          </Badge>
          <Group gap="xs">
            <Tooltip label="Edit">
              <ActionIcon variant="light" color="blue" onClick={() => onEdit?.(sip)}>
                <iconify-icon icon="lucide:edit" width="16" height="16" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete">
              <ActionIcon variant="light" color="red" onClick={() => onDelete?.(sip)}>
                <iconify-icon icon="lucide:trash-2" width="16" height="16" />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Box>
    </Card>
  )
}

export function SIPCard({ sips, portfolios, onEdit, onDelete }: SIPCardProps) {
  if (sips.length === 0) {
    return (
      <Card withBorder radius="md" padding="lg">
        <Text c="dimmed" ta="center" py="xl">
          No SIP entries yet.
        </Text>
      </Card>
    )
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md" verticalSpacing="md">
      {sips.map((sip) => (
        <SIPCardItem
          key={sip.id}
          sip={sip}
          portfolios={portfolios}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </SimpleGrid>
  )
}
