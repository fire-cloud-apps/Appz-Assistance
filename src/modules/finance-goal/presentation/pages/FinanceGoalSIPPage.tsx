/**
 * Route: /finance/sip
 */
import { Box, Group, Stack, Text, Title, Badge, Button, Alert, Tabs } from '@mantine/core'
import { useMemo, useState } from 'react'
import { useInvestor, usePortfolio, useSIP } from '../hooks'
import { SIPModal, SIPTable } from '../../components'
import type { SIP } from '../../domain/entities'

export function FinanceGoalSIPPage() {
  const { sips, addSIP, updateSIP, removeSIP, error } = useSIP()
  const { investors } = useInvestor()
  const { portfolios } = usePortfolio()
  const [modalOpened, setModalOpened] = useState(false)
  const [selected, setSelected] = useState<SIP | null>(null)
  const activeSips = useMemo(() => sips.filter((sip) => sip.status === 'Active'), [sips])
  const inactiveSips = useMemo(() => sips.filter((sip) => sip.status === 'Inactive'), [sips])

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
          <Group gap="sm">
            <Badge variant="light" color="blue">
              Total: {sips.length}
            </Badge>
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
            <SIPTable sips={activeSips} onEdit={handleEdit} onDelete={handleDelete} />
          </Tabs.Panel>
          <Tabs.Panel value="inactive" pt="sm">
            <SIPTable sips={inactiveSips} onEdit={handleEdit} onDelete={handleDelete} />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <SIPModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        investors={investors}
        portfolios={portfolios}
        initial={selected}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}
