/**
 * Dashboard Screen
 * Route: /dashboard
 * Birds-eye view of modules
 */
import {
  Box,
  Text,
  Title,
  Stack,
  SimpleGrid,
  Paper,
  Group,
  Badge,
  ThemeIcon,
} from '@mantine/core'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import classes from './HomeScreen.module.css'
import { useTasks } from '../../modules/task_manager/presentation/hooks/useTaskQueries'
import { useRootFolders } from '../../modules/notes/presentation/hooks/useNoteQueries'
import { useQuery } from '@tanstack/react-query'
import { noteRepository } from '../../modules/notes/data/repositories'
import { useMemo } from 'react'

interface ChartBar {
  label: string
  value: number
  color: string
}

interface DashboardCard {
  id: string
  title: string
  description: string
  icon: string
  color: string
  path: string
  disabled?: boolean
  chart?: ChartBar[]
}

interface DashboardSection {
  id: string
  title: string
  cards: DashboardCard[]
}

export function HomeScreen() {
  const navigate = useNavigate()
  const { data: tasks = [] } = useTasks()
  const { data: rootFolders = [] } = useRootFolders()

  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.isDeleted && !task.isArchived),
    [tasks],
  )

  const taskStatusChart = useMemo<ChartBar[]>(() => {
    const counts: Record<'Pending' | 'InProgress' | 'Completed' | 'Cancelled', number> = {
      Pending: 0,
      InProgress: 0,
      Completed: 0,
      Cancelled: 0,
    }
    activeTasks.forEach((task) => {
      counts[task.status] += 1
    })
    return [
      { label: 'Pending', value: counts.Pending, color: 'var(--mantine-color-yellow-6)' },
      { label: 'In Progress', value: counts.InProgress, color: 'var(--mantine-color-blue-6)' },
      { label: 'Completed', value: counts.Completed, color: 'var(--mantine-color-green-6)' },
      { label: 'Cancelled', value: counts.Cancelled, color: 'var(--mantine-color-red-6)' },
    ]
  }, [activeTasks])

  const { data: notesFolderChart = [] } = useQuery<ChartBar[]>({
    queryKey: ['notes', 'chart', rootFolders.map((folder) => folder.id)],
    queryFn: async () => {
      if (rootFolders.length === 0) return []
      const counts = await Promise.all(
        rootFolders.map((folder) => noteRepository.getNoteCountByFolder(folder.id)),
      )
      const palette = [
        'var(--mantine-color-grape-6)',
        'var(--mantine-color-violet-6)',
        'var(--mantine-color-indigo-6)',
        'var(--mantine-color-cyan-6)',
        'var(--mantine-color-teal-6)',
      ]
      return counts
        .map((count, index) => ({
          count,
          index,
          label: rootFolders[index]?.name || `Folder ${index + 1}`,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((item, idx) => ({
          label: item.label,
          value: item.count,
          color: palette[idx % palette.length],
        }))
    },
    enabled: rootFolders.length > 0,
  })

  const sections: DashboardSection[] = [
    {
      id: 'productivity',
      title: 'Productivity',
      cards: [
        {
          id: 'task-manager',
          title: 'Task Manager',
          description: 'Plan, track, and complete your tasks.',
          icon: 'tabler:clipboard-check',
          color: 'blue',
          path: '/tasks/dashboard',
          chart: taskStatusChart,
        },
        {
          id: 'notes',
          title: 'Notes',
          description: 'Capture thoughts, ideas, and quick notes.',
          icon: 'tabler:note',
          color: 'grape',
          path: '/notes',
          chart: notesFolderChart.length > 0 ? notesFolderChart : [],
        },
        {
          id: 'knowledge',
          title: 'Knowledge Base',
          description: 'Organize your personal wiki and references.',
          icon: 'tabler:book',
          color: 'teal',
          path: '/knowledge',
          disabled: true,
          chart: [],
        },
      ],
    },
    {
      id: 'tools',
      title: 'Tools',
      cards: [
        {
          id: 'sip',
          title: 'SIP',
          description: 'Estimate investments and growth projections.',
          icon: 'tabler:calculator',
          color: 'orange',
          path: '/sip',
          disabled: true,
          chart: [],
        },
        {
          id: 'loan',
          title: 'Loan',
          description: 'Plan repayments and compare loan options.',
          icon: 'tabler:building-bank',
          color: 'cyan',
          path: '/loan',
          disabled: true,
          chart: [],
        },
      ],
    },
    {
      id: 'finance',
      title: 'Finance',
      cards: [
        {
          id: 'finance',
          title: 'Personal Finance',
          description: 'Track expenses and understand cash flow.',
          icon: 'tabler:cash',
          color: 'green',
          path: '/finance',
          disabled: true,
          chart: [],
        },
        {
          id: 'financial-goals',
          title: 'Finance Goals',
          description: 'Set goals and monitor progress over time.',
          icon: 'tabler:target-arrow',
          color: 'indigo',
          path: '/financial-goals',
          disabled: true,
          chart: [],
        },
      ],
    },
  ]

  const handleCardClick = (card: DashboardCard) => {
    if (card.disabled) return
    navigate(card.path)
  }

  return (
    <Box className={classes.page}>
      <Box className={classes.bgGlow} />
      <Stack gap="xl" className={classes.content}>
        <Box className={classes.hero}>
          <Box>
            <Text className={classes.kicker}>AppZ Overview</Text>
            <Title order={1} className={classes.heroTitle}>
              Home
            </Title>
            <Text className={classes.heroSub}>
              Jump into any module and keep momentum with a clean birds-eye view.
            </Text>
            <Group gap="sm" mt="md">
              <Badge className={classes.heroBadge} variant="light" color="teal">
                Fast access
              </Badge>
              <Badge className={classes.heroBadge} variant="light" color="orange">
                Built-in focus
              </Badge>
            </Group>
          </Box>
          <Paper withBorder className={classes.heroCard}>
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                  <Icon icon="tabler:sparkles" width={18} />
                </ThemeIcon>
                <Box>
                  <Text fw={700}>Quick Start</Text>
                  <Text size="xs" c="dimmed">
                    Open your most-used modules in a click.
                  </Text>
                </Box>
              </Group>
              <ThemeIcon variant="light" color="orange" size="lg" radius="md">
                <Icon icon="tabler:bolt" width={18} />
              </ThemeIcon>
            </Group>
          </Paper>
        </Box>

        {sections.map((section) => (
          <Box key={section.id} className={classes.section}>
            <Group justify="space-between" align="center" mb="sm">
          <Title order={3} className={classes.sectionTitle}>
            {section.title}
          </Title>
              <Text size="xs" c="dimmed">
                {section.cards.length} modules
              </Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {section.cards.map((card, index) => (
                <Paper
                  key={card.id}
                  withBorder
                  className={classes.card}
                  data-disabled={card.disabled || undefined}
                  data-group={section.id}
                  onClick={() => handleCardClick(card)}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <Box className={classes.cardTop}>
                    <ThemeIcon className={classes.cardIcon} variant="light" color={card.color} size="lg" radius="md">
                      <Icon icon={card.icon} width={18} />
                    </ThemeIcon>
                    {card.disabled && (
                      <Badge size="xs" variant="light" color="gray">
                        Coming Soon
                      </Badge>
                    )}
                  </Box>
                  <Text fw={700} className={classes.cardTitle}>
                    {card.title}
                  </Text>
                  <Text size="sm" className={classes.cardDesc}>
                    {card.description}
                  </Text>
                  {card.chart && card.chart.length > 0 && (
                    <Box className={classes.cardChart}>
                      {card.chart.map((bar, barIndex) => (
                        <span
                          key={`${card.id}-bar-${barIndex}`}
                          className={classes.cardBar}
                          data-label={bar.label}
                          style={{
                            height: `${Math.max(bar.value, 1) * 3}px`,
                            ['--bar-color' as never]: bar.color,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  <Box className={classes.cardFooter}>
                    <Text size="xs" c="dimmed">
                      Open module
                    </Text>
                    <Icon icon="tabler:arrow-up-right" width={14} />
                  </Box>
                </Paper>
              ))}
            </SimpleGrid>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
