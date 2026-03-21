/**
 * Used by: TaskDashboardScreen
 * Ref: /tasks/dashboard
 */
import { Box, Group, SimpleGrid, Text, ThemeIcon, UnstyledButton } from '@mantine/core'
import { Task } from '../../../../core/database/models'
import { StatusIcon } from '../../../../core/components/StatusIcon'

type TaskStatsGridProps = {
  tasks: Task[]
  onStatClick?: (status: string) => void
}

export function TaskStatsGrid({ tasks, onStatClick }: TaskStatsGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing="sm">
      <TaskStatCard
        title="Total Tasks"
        value={tasks.length}
        color="blue"
        icon="lucide:list-checks"
        onClick={() => onStatClick?.('all')}
      />
      <TaskStatCard
        title="Completed"
        value={tasks.filter((t) => t.status === 'Completed').length}
        color="green"
        icon="lucide:check-circle"
        onClick={() => onStatClick?.('Completed')}
      />
      <TaskStatCard
        title="In Progress"
        value={tasks.filter((t) => t.status === 'InProgress').length}
        color="orange"
        icon="lucide:loader-circle"
        onClick={() => onStatClick?.('InProgress')}
      />
      <TaskStatCard
        title="Pending"
        value={tasks.filter((t) => t.status === 'Pending').length}
        color="gray"
        icon="lucide:clock"
        onClick={() => onStatClick?.('Pending')}
      />
      <TaskStatCard
        title="Cancelled"
        value={tasks.filter((t) => t.status === 'Cancelled').length}
        color="red"
        icon="lucide:x-circle"
        onClick={() => onStatClick?.('Cancelled')}
      />
    </SimpleGrid>
  )
}

type TaskStatCardProps = {
  title: string
  value: number
  color: string
  icon: string
  onClick?: () => void
}

function TaskStatCard({ title, value, color, icon, onClick }: TaskStatCardProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        width: '100%',
        background: `var(--mantine-color-${color}-light)`,
        borderRadius: 'var(--mantine-radius-md)',
        padding: 'var(--mantine-spacing-md)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
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
    </UnstyledButton>
  )
}
