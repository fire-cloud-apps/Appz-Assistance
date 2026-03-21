import {
  Group,
  Burger,
  ActionIcon,
  Text,
  Flex,
  Image,
} from '@mantine/core'
import { IconSun, IconMoon, IconSettings } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import logo from '../../img/appz-logo.png'
import appConfig from '../config/appConfig.json'
import { NotificationBell } from '../components/NotificationBell'

interface AppZHeaderProps {
  mobileOpened: boolean
  desktopOpened: boolean
  toggleMobile: () => void
  toggleDesktop: () => void
  toggleColorScheme: () => void
  colorScheme: 'light' | 'dark' | 'auto'
}

export function AppZHeader({
  mobileOpened,
  desktopOpened,
  toggleMobile,
  toggleDesktop,
  toggleColorScheme,
  colorScheme,
}: AppZHeaderProps) {
  const navigate = useNavigate()

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
        <NotificationBell />
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
