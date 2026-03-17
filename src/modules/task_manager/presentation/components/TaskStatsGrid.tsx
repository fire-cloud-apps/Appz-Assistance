/**
 * Used by: TaskDashboardScreen
 * Ref: /tasks/dashboard
 */
import { Box, Group, SimpleGrid, Text, ThemeIcon } from '@mantine/core'
import { Task } from '../../../../core/database/models'
import { StatusIcon } from '../../../../core/components/StatusIcon'

type TaskStatsGridProps = {
  tasks: Task[]
}

export function TaskStatsGrid({ tasks }: TaskStatsGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing="sm">
      <TaskStatCard
        title="Total Tasks"
        value={tasks.length}
        color="blue"
        icon="lucide:list-checks"
      />
      <TaskStatCard
        title="Completed"
        value={tasks.filter((t) => t.status === 'Completed').length}
        color="green"
        icon="lucide:check-circle"
      />
      <TaskStatCard
        title="In Progress"
        value={tasks.filter((t) => t.status === 'InProgress').length}
        color="orange"
        icon="lucide:loader-circle"
      />
      <TaskStatCard
        title="Pending"
        value={tasks.filter((t) => t.status === 'Pending').length}
        color="gray"
        icon="lucide:clock"
      />
      <TaskStatCard
        title="Cancelled"
        value={tasks.filter((t) => t.status === 'Cancelled').length}
        color="red"
        icon="lucide:x-circle"
      />
    </SimpleGrid>
  )
}

type TaskStatCardProps = {
  title: string
  value: number
  color: string
  icon: string
}

function TaskStatCard({ title, value, color, icon }: TaskStatCardProps) {
  return (
    <Box
      style={{
        background: `var(--mantine-color-${color}-light)`,
        borderRadius: 'var(--mantine-radius-md)',
        padding: 'var(--mantine-spacing-md)',
      }}
    >
      <Group justify="space-between" align="center">
        <Box>
          <Text size="sm" c="dimmed">{title}</Text>
          <Text size="xl" fw={700} c={`${color}-filled`}>{value}</Text>
        </Box>
        <ThemeIcon
          variant="light"
          color={color}
          size="lg"
          radius="md"
        >
          <StatusIcon icon={icon} size={20} />
        </ThemeIcon>
      </Group>
    </Box>
  )
}
