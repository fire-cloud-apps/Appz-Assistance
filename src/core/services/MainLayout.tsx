/**
 * Main layout component wrapping all routes
 * Ref: routes/index.tsx
 */
import {
  AppShell,
  Center,
  Loader,
  useMantineColorScheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { AppZHeader } from './AppZHeader'
import { ModuleMenu } from './ModuleMenu'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTaskNotifications } from '../hooks/useTaskNotifications'
import { useEffect, useMemo } from 'react'
import { archiveCleanupService } from '../../modules/task_manager/data/repositories/archiveCleanupService'
import { useAuth0 } from '@auth0/auth0-react'
import { AuthScreen } from '../auth/AuthScreen'
import { useSyncSetting } from '../hooks/useSyncSetting'
import { useBreakTimer } from '../../modules/break_timer/presentation/hooks/useBreakTimer'
import { AboutModal } from '../components/AboutModal'
import { getModuleVisibility } from './userSettingsService'

export function MainLayout() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false)
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const [aboutModalOpened, { open: openAboutModal, close: closeAboutModal }] = useDisclosure(false);
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  const { syncEnabled } = useSyncSetting()

  // Break Timer - for starting timer from header
  const { isTimerRunning, timeRemaining, startTimer, pauseTimer, stopTimer } = useBreakTimer();

  // Initialize task notifications (must always be called)
  useTaskNotifications()

  // Initialize archive cleanup service
  useEffect(() => {
    archiveCleanupService.startCleanupJob()

    return () => {
      archiveCleanupService.stopCleanupJob()
    }
  }, [])

  // Check auth state for rendering
  const showAuthLoading = syncEnabled && isLoading
  const showAuthScreen = syncEnabled && !isLoading && !isAuthenticated

  if (showAuthLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }

  if (showAuthScreen) {
    return <AuthScreen onLogin={() => loginWithRedirect()} />
  }

  const allModuleGroups = [
    {
      id: 'productivity',
      label: 'Productivity',
      modules: [
        {
          id: 'task-manager',
          label: 'Task Manager',
          icon: '📋',
          path: '/tasks/dashboard',
          disabled: false,
          children: [
            { id: 'task-dashboard', label: 'Task Dashboard', path: '/tasks/dashboard', icon: 'lucide:layout-dashboard' },
            { id: 'task-all', label: 'All Tasks', path: '/tasks/all', icon: 'lucide:list-checks' },
            { id: 'task-groups', label: 'Group Tasks', path: '/tasks/groups', icon: 'lucide:layers' },
            { id: 'task-kanban', label: 'Kanban Board', path: '/tasks/kanban', icon: 'lucide:columns-3' },
            { id: 'task-archive', label: 'Archive Tasks', path: '/tasks/archive', icon: 'lucide:archive' },
          ],
        },
        {
          id: 'notes',
          label: 'Notes',
          icon: '📝',
          path: '/notes',
          disabled: false,
          children: [
            { id: 'notes-dashboard', label: 'Dashboard', path: '/notes', icon: 'lucide:layout-dashboard' },
            { id: 'notes-favorites', label: 'Favorites', path: '/notes/favorites', icon: 'lucide:star' },
            { id: 'notes-trash', label: 'Trash', path: '/notes/trash', icon: 'lucide:trash' },
          ],
        },
        { id: 'knowledge', label: 'Knowledge Base', icon: '📚', path: '/knowledge', disabled: true },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      modules: [
        { id: 'sip', label: 'SIP', icon: '🧮', path: '/sip', disabled: true },
        { id: 'loan', label: 'Loan', icon: '🏦', path: '/loan', disabled: true },
      ],
    },
    {
      id: 'finance',
      label: 'Finance',
      modules: [
        {
          id: 'financial-goals',
          label: 'Finance Goals',
          icon: '🎯',
          path: '/finance/dashboard',
          disabled: false,
          children: [
            { id: 'finance-dashboard', label: 'Dashboard', path: '/finance/dashboard', icon: 'lucide:layout-dashboard' },
            { id: 'finance-portfolio', label: 'Portfolio', path: '/finance/portfolio', icon: 'lucide:pie-chart' },
            { id: 'finance-sip', label: 'SIP', path: '/finance/sip', icon: 'lucide:repeat' },
            { id: 'finance-goals', label: 'Goals', path: '/finance/goals', icon: 'lucide:target' },
            { id: 'finance-investors', label: 'Investors', path: '/finance/investors', icon: 'lucide:users' },
          ],
        },
      ],
    },
  ]

  const moduleGroups = useMemo(() => {
    return allModuleGroups
      .map((group) => ({
        ...group,
        modules: group.modules.filter((module) => {
          const moduleIdMap: Record<string, 'taskManager' | 'notes' | 'knowledge' | 'sip' | 'loan' | 'financeGoals'> = {
            'task-manager': 'taskManager',
            'notes': 'notes',
            'knowledge': 'knowledge',
            'sip': 'sip',
            'loan': 'loan',
            'financial-goals': 'financeGoals',
          }
          const settingKey = moduleIdMap[module.id]
          if (settingKey) {
            return getModuleVisibility(settingKey)
          }
          return !module.disabled
        }),
      }))
      .filter((group) => group.modules.length > 0)
  }, [])

  const modules = moduleGroups.flatMap((group) => group.modules)

  const activePath = location.pathname
  const activeModule =
    activePath === '/home'
      ? 'dashboard'
      : activePath === '/' || activePath.startsWith('/tasks') || activePath.startsWith('/task')
      ? 'task-manager'
      : activePath.startsWith('/notes')
        ? 'notes'
        : activePath.startsWith('/finance')
          ? 'financial-goals'
          : activePath.startsWith('/financial-goals')
            ? 'financial-goals'
            : modules.find((module) => activePath.startsWith(module.path))?.id || 'task-manager'

  const handleModuleClick = (_moduleId: string, path: string, disabled?: boolean) => {
    if (disabled) return
    closeMobile()
    navigate(path)
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <AppZHeader
          mobileOpened={mobileOpened}
          desktopOpened={desktopOpened}
          toggleMobile={toggleMobile}
          toggleDesktop={toggleDesktop}
          toggleColorScheme={toggleColorScheme}
          colorScheme={colorScheme === 'auto' ? 'light' : colorScheme}
          onStartBreakTimer={startTimer}
          onPauseBreakTimer={pauseTimer}
          onStopBreakTimer={stopTimer}
          isBreakTimerRunning={isTimerRunning}
          breakTimerTimeRemaining={timeRemaining}
          onAboutClick={openAboutModal}
        />
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <ModuleMenu
          moduleGroups={moduleGroups}
          activeModule={activeModule}
          activePath={activePath}
          onModuleClick={handleModuleClick}
        />
      </AppShell.Navbar>

      <AppShell.Main style={{ overflowX: 'hidden' }}>
        <Outlet />
      </AppShell.Main>

      <AboutModal opened={aboutModalOpened} onClose={closeAboutModal} />
    </AppShell>
  )
}
