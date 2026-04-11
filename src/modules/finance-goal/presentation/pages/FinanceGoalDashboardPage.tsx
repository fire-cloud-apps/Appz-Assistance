/**
 * Route: /finance/dashboard
 */
import {
  Box,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Progress,
  Badge,
  Center,
  Alert,
  Button,
  Tooltip,
} from '@mantine/core'
import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts'
import { useFinanceGoalDashboardData, useGoals, useInvestor, usePortfolio, useSIP } from '../hooks'
import { GoalModal, InvestorModal, PortfolioModal, SIPModal } from '../../components'
import type { FinancialGoal, Investor, Portfolio, SIP } from '../../domain/entities'
import { StatusIcon } from '../../../../core/components/StatusIcon'

const chartColors = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6']

export function FinanceGoalDashboardPage() {
  const { portfolios, addPortfolio, error: portfolioError } = usePortfolio()
  const { goals, addGoal, error: goalsError } = useGoals()
  const { sips, addSIP, error: sipError } = useSIP()
  const { investors, addInvestor, error: investorError } = useInvestor()
  const [portfolioModalOpened, setPortfolioModalOpened] = useState(false)
  const [sipModalOpened, setSipModalOpened] = useState(false)
  const [goalModalOpened, setGoalModalOpened] = useState(false)
  const [investorModalOpened, setInvestorModalOpened] = useState(false)
  const error = portfolioError || goalsError || sipError || investorError

  const { portfolioSummary, activeSipsCount, investorHoldings, goalProgress } =
    useFinanceGoalDashboardData({ goals, portfolios, sips, investors })

  const allocationData = useMemo(() => {
    const map = new Map<string, number>()
    portfolios.forEach((portfolio) => {
      map.set(portfolio.amcName, (map.get(portfolio.amcName) ?? 0) + portfolio.currentValue)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [portfolios])

  const sipStatusData = useMemo(() => {
    const active = activeSipsCount
    const inactive = sips.length - active
    return [
      { name: 'Active', value: active },
      { name: 'Inactive', value: inactive },
    ]
  }, [activeSipsCount, sips.length])

  const investorHoldingsChart = useMemo(
    () =>
      investorHoldings.map((holding) => ({
        name: holding.investorName,
        value: holding.totalValue,
      })),
    [investorHoldings]
  )

  return (
    <Box>
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Finance Goal Dashboard</Title>
            <Text c="dimmed">A quick snapshot of portfolios, SIPs, and goals.</Text>
          </div>
          <Group gap="sm">
            <Badge variant="light" color="blue">
              Investors: {investors.length}
            </Badge>
            <Tooltip label="Add Investor">
              <Button
                size="xs"
                onClick={() => setInvestorModalOpened(true)}
                leftSection={<StatusIcon icon="lucide:user-plus" size={14} />}
              >
                Add Investor
              </Button>
            </Tooltip>
            <Tooltip
              label={investors.length === 0 ? 'Add an investor first' : 'Add Portfolio'}
              disabled={investors.length > 0}
            >
              <Button
                size="xs"
                onClick={() => setPortfolioModalOpened(true)}
                disabled={investors.length === 0}
                leftSection={<StatusIcon icon="lucide:briefcase" size={14} />}
              >
                Add Portfolio
              </Button>
            </Tooltip>
            <Tooltip
              label={
                investors.length === 0 || portfolios.length === 0
                  ? 'Add investor and portfolio first'
                  : 'Add SIP'
              }
              disabled={investors.length > 0 && portfolios.length > 0}
            >
              <Button
                size="xs"
                onClick={() => setSipModalOpened(true)}
                disabled={investors.length === 0 || portfolios.length === 0}
                leftSection={<StatusIcon icon="lucide:repeat" size={14} />}
              >
                Add SIP
              </Button>
            </Tooltip>
            <Tooltip
              label={
                investors.length === 0 || portfolios.length === 0
                  ? 'Add investor and portfolio first'
                  : 'Add Goal'
              }
              disabled={investors.length > 0 && portfolios.length > 0}
            >
              <Button
                size="xs"
                onClick={() => setGoalModalOpened(true)}
                disabled={investors.length === 0 || portfolios.length === 0}
                leftSection={<StatusIcon icon="lucide:target" size={14} />}
              >
                Add Goal
              </Button>
            </Tooltip>
          </Group>
        </Group>

        {error && (
          <Alert color="red" title="Finance Goal Error">
            {error}
          </Alert>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder padding="lg" radius="md">
              <Text size="sm" c="dimmed">Current Value</Text>
              <Title order={3}>₹{portfolioSummary.totalCurrentValue.toLocaleString()}</Title>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder padding="lg" radius="md">
              <Text size="sm" c="dimmed">Cost Value</Text>
              <Title order={3}>₹{portfolioSummary.totalCostValue.toLocaleString()}</Title>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder padding="lg" radius="md">
              <Text size="sm" c="dimmed">Appreciation</Text>
              <Title order={3}>₹{portfolioSummary.totalAppreciation.toLocaleString()}</Title>
            </Card>
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Group justify="space-between" mb="md">
                <Title order={4}>Portfolio Allocation</Title>
                <Text size="sm" c="dimmed">By AMC</Text>
              </Group>
              {allocationData.length === 0 ? (
                <Center h={220}>
                  <Text c="dimmed">No portfolio data yet.</Text>
                </Center>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={allocationData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {allocationData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Group justify="space-between" mb="md">
                <Title order={4}>SIP Status</Title>
                <Text size="sm" c="dimmed">Active vs Inactive</Text>
              </Group>
              {sips.length === 0 ? (
                <Center h={220}>
                  <Text c="dimmed">No SIPs tracked yet.</Text>
                </Center>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={sipStatusData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {sipStatusData.map((_entry, index) => (
                        <Cell key={`sip-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Title order={4} mb="md">Goal Progress</Title>
              <Stack gap="md">
                {goals.length === 0 && <Text c="dimmed">No goals created yet.</Text>}
                {goals.map((goal) => {
                  const progressSummary = goalProgress[goal.id]
                  const current = progressSummary?.currentValue ?? 0
                  const targetAmount = progressSummary?.targetAmount ?? goal.targetAmount
                  const progress = progressSummary?.progressPercent ?? 0
                  return (
                    <Card key={goal.id} withBorder radius="md" padding="md">
                      <Group justify="space-between" mb={6}>
                        <Text fw={600}>{goal.name}</Text>
                        <Text size="sm" c="dimmed">
                          ₹{current.toLocaleString()} / ₹{targetAmount.toLocaleString()}
                        </Text>
                      </Group>
                      <Progress value={Math.min(progress, 100)} />
                    </Card>
                  )
                })}
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Title order={4} mb="md">Investor Holdings</Title>
              {investorHoldingsChart.length === 0 ? (
                <Center h={220}>
                  <Text c="dimmed">No investor data yet.</Text>
                </Center>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={investorHoldingsChart}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>

      <InvestorModal
        opened={investorModalOpened}
        onClose={() => setInvestorModalOpened(false)}
        onSubmit={async (investor: Investor) => addInvestor(investor)}
      />
      <PortfolioModal
        opened={portfolioModalOpened}
        onClose={() => setPortfolioModalOpened(false)}
        investors={investors}
        initial={null}
        onSubmit={async (portfolio: Portfolio) => addPortfolio(portfolio)}
      />
      <SIPModal
        opened={sipModalOpened}
        onClose={() => setSipModalOpened(false)}
        investors={investors}
        portfolios={portfolios}
        initial={null}
        onSubmit={async (sip: SIP) => addSIP(sip)}
      />
      <GoalModal
        opened={goalModalOpened}
        onClose={() => setGoalModalOpened(false)}
        investors={investors}
        sips={sips}
        initial={null}
        onSubmit={async (goal: FinancialGoal) => addGoal(goal)}
      />
    </Box>
  )
}
