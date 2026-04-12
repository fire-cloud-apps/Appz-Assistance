import { useEffect, useState } from 'react'
import { Modal, Button, Group, Stack, TextInput, NumberInput, ActionIcon, Table, Badge, Text } from '@mantine/core'
import { useScenarioSettingsStore } from '../../presentation/hooks/useScenarioSettings'
import type { ScenarioRate } from '../../data/models'

interface ScenarioSettingsModalProps {
  opened: boolean
  onClose: () => void
}

export function ScenarioSettingsModal({ opened, onClose }: ScenarioSettingsModalProps) {
  const { scenarios, loadScenarios, addScenario, updateScenario, deleteScenario } = useScenarioSettingsStore()
  const [newLabel, setNewLabel] = useState('')
  const [newRate, setNewRate] = useState<number | string>(12)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editRate, setEditRate] = useState<number | string>(0)

  useEffect(() => {
    if (opened) {
      loadScenarios()
    }
  }, [opened, loadScenarios])

  const handleAdd = async () => {
    if (newLabel.trim() && newRate) {
      await addScenario(newLabel.trim(), Number(newRate))
      setNewLabel('')
      setNewRate(12)
    }
  }

  const handleEdit = (scenario: ScenarioRate) => {
    setEditingId(scenario.id)
    setEditLabel(scenario.label)
    setEditRate(scenario.rate)
  }

  const handleSaveEdit = async () => {
    if (editingId && editLabel.trim()) {
      await updateScenario(editingId, editLabel.trim(), Number(editRate))
      setEditingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteScenario(id)
  }

  const rows = scenarios.map((scenario) => (
    <Table.Tr key={scenario.id}>
      {editingId === scenario.id ? (
        <>
          <Table.Td>
            <TextInput
              size="xs"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              placeholder="Label"
            />
          </Table.Td>
          <Table.Td>
            <NumberInput
              size="xs"
              value={editRate}
              onChange={setEditRate}
              min={0}
              max={100}
              suffix="%"
            />
          </Table.Td>
          <Table.Td>
            <Group gap="xs">
              <ActionIcon size="sm" color="green" variant="light" onClick={handleSaveEdit}>
                <iconify-icon icon="lucide:check" width="14" height="14" />
              </ActionIcon>
              <ActionIcon size="sm" variant="subtle" onClick={() => setEditingId(null)}>
                <iconify-icon icon="lucide:x" width="14" height="14" />
              </ActionIcon>
            </Group>
          </Table.Td>
        </>
      ) : (
        <>
          <Table.Td>
            <Text size="sm">{scenario.label}</Text>
          </Table.Td>
          <Table.Td>
            <Badge variant="light" color="blue">{scenario.rate}%</Badge>
          </Table.Td>
          <Table.Td>
            <Group gap="xs">
              <ActionIcon size="sm" variant="subtle" onClick={() => handleEdit(scenario)}>
                <iconify-icon icon="lucide:edit" width="14" height="14" />
              </ActionIcon>
              <ActionIcon size="sm" color="red" variant="subtle" onClick={() => handleDelete(scenario.id)}>
                <iconify-icon icon="lucide:trash-2" width="14" height="14" />
              </ActionIcon>
            </Group>
          </Table.Td>
        </>
      )}
    </Table.Tr>
  ))

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <iconify-icon icon="lucide:settings" width="20" height="20" />
          <Text fw={600}>Scenario Growth Rates</Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Configure the growth rate scenarios used for goal projections. These rates will be used instead of the default values.
        </Text>

        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Label</Table.Th>
              <Table.Th>Rate</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>

        <Group grow>
          <TextInput
            placeholder="New scenario label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <NumberInput
            placeholder="Rate"
            value={newRate}
            onChange={setNewRate}
            min={0}
            max={100}
            suffix="%"
          />
          <Button onClick={handleAdd} disabled={!newLabel.trim() || !newRate}>
            Add
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}