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
  Box,
} from '@mantine/core'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import logo from '../../img/appz-logo.png'
import appConfig from '../config/appConfig.json'
import { NotificationBell } from '../components/NotificationBell'
import { useAuth0 } from '@auth0/auth0-react'
import { useAuthUser } from '../auth/useAuthUser'
import { useSyncSetting } from '../hooks/useSyncSetting'
import styles from './AppZHeader.module.css'

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
  onAboutClick?: () => void
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
  onAboutClick,
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

  const handleLogoClick = () => {
    if (window.innerWidth < 768) {
      toggleMobile()
    } else {
      toggleDesktop()
    }
  }

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="xs" h="100%">
        <Flex align="center" gap="xs">
          <UnstyledButton onClick={handleLogoClick} className={styles.logoButton}>
            <Group gap="xs">
              <Image src={logo} h={32} w={32} fit="contain" alt="AppZ Logo" className={styles.logoImage} />
              <Stack gap={0}>
                <Text fw={700} size="xl" visibleFrom="sm">
                  {appConfig.app.name}
                </Text>
                <Text fw={700} size="lg" hiddenFrom="sm">
                  {appConfig.app.name}
                </Text>
                <Text c="dimmed" size="xs" visibleFrom="sm">
                  {appConfig.app.tagline} v{appConfig.version.current}
                </Text>
              </Stack>
            </Group>
          </UnstyledButton>
        </Flex>
      </Group>

      <Group gap="xs">
        <NotificationBell />

        {/* Break Timer - Appears when running, shows time on hover */}
        {isBreakTimerRunning && (
          <Tooltip
            label={formatTime(breakTimerTimeRemaining)}
            withArrow
            position="bottom"
            arrowSize={10}
            arrowOffset={15}
          >
            <ActionIcon
              component="button"
              variant="light"
              color="blue"
              size="lg"
              aria-label="Break Timer Running"
              style={{
                animation: 'pulse 2s infinite',
                position: 'relative',
              }}
            >
              <Icon icon="tabler:coffee" width={22} />
              {/* Pulsing dot indicator */}
              <Box
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--mantine-color-blue-filled)',
                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
            </ActionIcon>
          </Tooltip>
        )}

        <Menu
          width={280}
          position="bottom-end"
          withArrow
          shadow="md"
          withinPortal
        >
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
          <Menu.Dropdown
            style={{
              zIndex: 1000,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
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
            
            {/* Break Timer Section */}
            <Menu.Label>Break Timer</Menu.Label>
            {isBreakTimerRunning ? (
              <>
                <Menu.Item
                  leftSection={<Icon icon="tabler:player-pause" width={16} />}
                  onClick={onPauseBreakTimer}
                >
                  Pause Timer
                </Menu.Item>
                <Menu.Item
                  leftSection={<Icon icon="tabler:player-stop" width={16} />}
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
                leftSection={<Icon icon="tabler:player-play" width={16} />}
                onClick={onStartBreakTimer}
              >
                Start Break Timer
              </Menu.Item>
            )}
            
            <Menu.Divider />
            
            {/* Settings Section */}
            <Menu.Label>Settings</Menu.Label>
            <Menu.Item
              leftSection={<Icon icon="tabler:settings" width={16} />}
              onClick={() => navigate('/settings')}
            >
              Settings
            </Menu.Item>
            <Menu.Item
              leftSection={<Icon icon={syncEnabled ? 'tabler:cloud-check' : 'tabler:cloud-off'} width={16} />}
              onClick={toggleSync}
              color={syncEnabled ? 'green' : undefined}
            >
              Sync {syncEnabled ? 'Enabled' : 'Disabled'}
            </Menu.Item>
            <Menu.Item
              leftSection={<Icon icon={colorScheme === 'dark' ? 'tabler:sun' : 'tabler:moon'} width={16} />}
              onClick={toggleColorScheme}
            >
              {colorScheme === 'dark' ? 'Light' : 'Dark'} Mode
            </Menu.Item>
            
            <Menu.Divider />

            {/* About Section */}
            <Menu.Item
              leftSection={<Icon icon="tabler:info-circle" width={16} />}
              onClick={onAboutClick}
            >
              About
            </Menu.Item>

            <Menu.Divider />
            
            {/* Account Section */}
            <Menu.Item leftSection={<Icon icon="tabler:user" width={16} />} onClick={() => navigate('/profile')}>
              Profile
            </Menu.Item>
            <Menu.Item
              leftSection={<Icon icon="tabler:logout" width={16} />}
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  )
}
