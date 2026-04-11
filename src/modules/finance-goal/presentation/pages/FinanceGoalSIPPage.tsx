import { useEffect, useRef, useState } from 'react'
import { Box, Group, Stack, Text, Title, Badge, Button, Alert, Tabs, ActionIcon } from '@mantine/core'
import { useMemo } from 'react'
import { useInvestor, useSIP } from '../hooks'
import { SIPModal, SIPTable, SIPCard } from '../../components'
import type { SIP, Portfolio } from '../../domain/entities'
import { FinanceGoalDatasource } from '../../data/datasources/FinanceGoalDatasource'
import { PortfolioRepository } from '../../data/repositories/PortfolioRepository'

type ViewType = 'table' | 'card'

const sipDatasource = new FinanceGoalDatasource()
const sipPortfolioRepo = new PortfolioRepository(sipDatasource)

export function FinanceGoalSIPPage() {
  const { sips, addSIP, updateSIP, removeSIP, error } = useSIP()
  const { investors } = useInvestor()
  const [modalOpened, setModalOpened] = useState(false)
  const [selected, setSelected] = useState<SIP | null>(null)
  const [viewType, setViewType] = useState<ViewType>('card')
  const [localPortfolios, setLocalPortfolios] = useState<Portfolio[]>([])
  const hasLoadedAllPortfolios = useRef(false)
  const activeSips = useMemo(() => sips.filter((sip) => sip.status === 'Active'), [sips])
  const inactiveSips = useMemo(() => sips.filter((sip) => sip.status === 'Inactive'), [sips])

  // Use local portfolios only - no fallback to store to prevent race condition
  const displayPortfolios = localPortfolios

  useEffect(() => {
    if (!hasLoadedAllPortfolios.current) {
      hasLoadedAllPortfolios.current = true
      // Load portfolios directly from repository to avoid race conditions
      sipPortfolioRepo.getAll().then(setLocalPortfolios).catch(console.error)
    }
  }, [])

  const handleCreate = () => {
    setSelected(null)
    setModalOpened(true)
  }

  const handleEdit = (sip: SIP) => {
    setSelected(sip)
    setModalOpened(true)
  }

  const handleDelete = async (sip: SIP) => {
    if (!window.confirm('Delete this SIP?')) return
    await removeSIP(sip.id)
  }

  const handleSubmit = async (sip: SIP) => {
    if (selected) {
      await updateSIP(sip)
    } else {
      await addSIP(sip)
    }
  }

  return (
    <Box>
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>SIP Management</Title>
            <Text c="dimmed">Monitor active and inactive SIPs.</Text>
          </div>
          <Group gap="sm" align="center">
            <Badge variant="light" color="blue">
              Total: {sips.length}
            </Badge>
            <Group gap={4} align="center" wrap="nowrap">
              <ActionIcon
                variant={viewType === 'table' ? 'filled' : 'subtle'}
                color={viewType === 'table' ? 'blue' : 'gray'}
                onClick={() => setViewType('table')}
                size="lg"
                radius="md"
              >
                <iconify-icon icon="lucide:table" width="18" height="18" />
              </ActionIcon>
              <ActionIcon
                variant={viewType === 'card' ? 'filled' : 'subtle'}
                color={viewType === 'card' ? 'blue' : 'gray'}
                onClick={() => setViewType('card')}
                size="lg"
                radius="md"
              >
                <iconify-icon icon="lucide:layout-grid" width="18" height="18" />
              </ActionIcon>
            </Group>
            <Button onClick={handleCreate}>Add SIP</Button>
          </Group>
        </Group>

        {error && (
          <Alert color="red" title="SIP Error">
            {error}
          </Alert>
        )}

        <Tabs defaultValue="active">
          <Tabs.List>
            <Tabs.Tab value="active">Active ({activeSips.length})</Tabs.Tab>
            <Tabs.Tab value="inactive">Inactive ({inactiveSips.length})</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="active" pt="sm">
            {viewType === 'table' ? (
              <SIPTable sips={activeSips} portfolios={displayPortfolios} onEdit={handleEdit} onDelete={handleDelete} />
            ) : (
              <SIPCard sips={activeSips} portfolios={displayPortfolios} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </Tabs.Panel>
          <Tabs.Panel value="inactive" pt="sm">
            {viewType === 'table' ? (
              <SIPTable sips={inactiveSips} portfolios={displayPortfolios} onEdit={handleEdit} onDelete={handleDelete} />
            ) : (
              <SIPCard sips={inactiveSips} portfolios={displayPortfolios} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <SIPModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        investors={investors}
        portfolios={displayPortfolios}
        initial={selected}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}
