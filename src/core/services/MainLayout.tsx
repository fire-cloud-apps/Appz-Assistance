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
import { useEffect } from 'react'
import { archiveCleanupService } from '../../modules/task_manager/data/repositories/archiveCleanupService'
import { useAuth0 } from '@auth0/auth0-react'
import { AuthScreen } from '../auth/AuthScreen'
import { useSyncSetting } from '../hooks/useSyncSetting'
import { useBreakTimer } from '../../modules/break_timer/presentation/hooks/useBreakTimer'

export function MainLayout() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false)
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  const { syncEnabled } = useSyncSetting()

  // Break Timer - for starting timer from header
  const { isTimerRunning, timeRemaining, startTimer, pauseTimer, stopTimer } = useBreakTimer();

  // Initialize task notifications
  useTaskNotifications()

  // Initialize archive cleanup service
  useEffect(() => {
    archiveCleanupService.startCleanupJob()

    return () => {
      archiveCleanupService.stopCleanupJob()
    }
  }, [])

  const modules = [
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
{ id: 'finance', label: 'Personal Finance', icon: '💰', path: '/finance', disabled: true },
    { id: 'family-tree', label: 'Family Tree', icon: '🌳', path: '/family-tree', disabled: true },
    { id: 'financial-goals', label: 'Financial Goals', icon: '🎯', path: '/financial-goals', disabled: true },
  ]

  const activePath = location.pathname
  const activeModule =
    activePath === '/' || activePath.startsWith('/tasks') || activePath.startsWith('/task')
      ? 'task-manager'
      : activePath.startsWith('/notes')
        ? 'notes'
        : modules.find((module) => activePath.startsWith(module.path))?.id || 'task-manager'

  const handleModuleClick = (_moduleId: string, path: string, disabled?: boolean) => {
    if (disabled) return
    closeMobile()
    navigate(path)
  }

  if (syncEnabled) {
    if (isLoading) {
      return (
        <Center h="100vh">
          <Loader />
        </Center>
      )
    }

    if (!isAuthenticated) {
      return <AuthScreen onLogin={() => loginWithRedirect()} />
    }
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
          onNavigateToSettings={() => navigate('/settings/break-timer')}
        />
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <ModuleMenu
          modules={modules}
          activeModule={activeModule}
          activePath={activePath}
          onModuleClick={handleModuleClick}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
