import {
  Group,
  Burger,
  ActionIcon,
  Text,
  Flex,
  Image,
  Avatar,
  Menu,
  Stack,
  UnstyledButton,
  Tooltip,
  Badge,
} from '@mantine/core'
import {
  IconSun,
  IconMoon,
  IconSettings,
  IconLogout,
  IconUser,
  IconCloudCheck,
  IconCloudOff,
  IconCoffee,
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerStop,
  IconBell,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import logo from '../../img/appz-logo.png'
import appConfig from '../config/appConfig.json'
import { NotificationBell } from '../components/NotificationBell'
import { useAuth0 } from '@auth0/auth0-react'
import { useAuthUser } from '../auth/useAuthUser'
import { useSyncSetting } from '../hooks/useSyncSetting'

interface AppZHeaderProps {
  mobileOpened: boolean
  desktopOpened: boolean
  toggleMobile: () => void
  toggleDesktop: () => void
  toggleColorScheme: () => void
  colorScheme: 'light' | 'dark' | 'auto'
  onStartBreakTimer?: () => void
  onStopBreakTimer?: () => void
  onPauseBreakTimer?: () => void
  isBreakTimerRunning?: boolean
  breakTimerTimeRemaining?: number
  onNavigateToSettings?: () => void
}

export function AppZHeader({
  mobileOpened,
  desktopOpened,
  toggleMobile,
  toggleDesktop,
  toggleColorScheme,
  colorScheme,
  onStartBreakTimer,
  onStopBreakTimer,
  onPauseBreakTimer,
  isBreakTimerRunning = false,
  breakTimerTimeRemaining = 0,
  onNavigateToSettings,
}: AppZHeaderProps) {
  const navigate = useNavigate()
  const { logout } = useAuth0()
  const { profile } = useAuthUser()
  const { syncEnabled, toggleSync } = useSyncSetting()
  const displayName = profile?.name ?? 'User'
  const displayEmail = profile?.email ?? 'No email'
  const displayRole = profile?.roles?.[0]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="xs" h="100%">
        <Burger
          opened={mobileOpened}
          onClick={toggleMobile}
          hiddenFrom="sm"
          size="sm"
        />
        <Burger
          opened={desktopOpened}
          onClick={toggleDesktop}
          visibleFrom="sm"
          size="sm"
        />
        <Flex align="center" gap="xs">
          <Image src={logo} h={32} w={32} fit="contain" alt="AppZ Logo" />
          <Text fw={700} size="xl" visibleFrom="sm">
            {appConfig.app.name}
          </Text>
          <Text fw={700} size="lg" hiddenFrom="sm">
            {appConfig.app.name}
          </Text>
          <Text c="dimmed" size="sm" visibleFrom="sm">
            {appConfig.app.tagline}
          </Text>
          <Text c="dimmed" size="xs" visibleFrom="sm">
            v{appConfig.version.current}
          </Text>
        </Flex>
      </Group>

      <Group gap="xs">
        {/* Break Timer Menu */}
        <Menu width={220} position="bottom-end" withArrow>
          <Menu.Target>
            <Tooltip label={isBreakTimerRunning ? `Break Timer: ${formatTime(breakTimerTimeRemaining)}` : 'Start Break Timer'}>
              <ActionIcon
                component="button"
                variant={isBreakTimerRunning ? 'filled' : 'subtle'}
                color={isBreakTimerRunning ? 'blue' : 'gray'}
                aria-label="Break Timer"
                style={{
                  animation: isBreakTimerRunning ? 'pulse 2s infinite' : 'none',
                }}
              >
                <IconCoffee size={20} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Break Timer</Menu.Label>
            {isBreakTimerRunning ? (
              <>
                <Menu.Item
                  leftSection={<IconPlayerPause size={16} />}
                  onClick={onPauseBreakTimer}
                >
                  Pause Timer
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconPlayerStop size={16} />}
                  onClick={onStopBreakTimer}
                  color="red"
                >
                  Stop Timer
                </Menu.Item>
                <Menu.Divider />
                <Stack gap="xs" px="sm" py="xs">
                  <Text size="xs" c="dimmed">Time Remaining</Text>
                  <Badge size="lg" color="blue" variant="filled">
                    {formatTime(breakTimerTimeRemaining)}
                  </Badge>
                </Stack>
              </>
            ) : (
              <Menu.Item
                leftSection={<IconPlayerPlay size={16} />}
                onClick={onStartBreakTimer}
              >
                Start Timer
              </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconBell size={16} />}
              onClick={onNavigateToSettings}
            >
              Timer Settings
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu width={240} position="bottom-end" withArrow>
          <Menu.Target>
            <UnstyledButton>
              <Group gap="xs">
                <Avatar
                  src={profile?.image}
                  radius="xl"
                  size={32}
                  name={displayName}
                />
                <Stack gap={0} visibleFrom="sm">
                  <Text size="sm" fw={600} lineClamp={1}>
                    {displayName}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {displayEmail}
                  </Text>
                </Stack>
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Stack gap={2} px="sm" py="xs">
              <Text size="sm" fw={600} lineClamp={1}>
                {displayName}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {displayEmail}
              </Text>
              {displayRole && (
                <Text size="xs" c="dimmed" lineClamp={1}>
                  Role: {displayRole}
                </Text>
              )}
            </Stack>
            <Menu.Divider />
            <Menu.Item leftSection={<IconUser size={16} />} onClick={() => navigate('/profile')}>
              Profile
            </Menu.Item>
            <Menu.Item
              leftSection={<IconLogout size={16} />}
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <NotificationBell />
        <Tooltip label={syncEnabled ? 'Sync enabled' : 'Sync disabled'}>
          <ActionIcon
            variant="subtle"
            color={syncEnabled ? 'green' : 'gray'}
            onClick={toggleSync}
            aria-label="Toggle sync"
          >
            {syncEnabled ? <IconCloudCheck size={20} /> : <IconCloudOff size={20} />}
          </ActionIcon>
        </Tooltip>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        >
          <IconSettings size={20} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={toggleColorScheme}
          aria-label="Toggle color scheme"
        >
          {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>
      </Group>
    </Group>
  )
}
