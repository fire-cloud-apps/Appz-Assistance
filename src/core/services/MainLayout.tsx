/**
 * Main layout component wrapping all routes
 * Ref: routes/index.tsx
 */
import {
  AppShell,
  useMantineColorScheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { AppZHeader } from './AppZHeader'
import { ModuleMenu } from './ModuleMenu'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

export function MainLayout() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false)
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const navigate = useNavigate()
  const location = useLocation()

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
      ],
    },
    { id: 'notes', label: 'Notes', icon: '📝', path: '/notes', disabled: true },
    { id: 'calendar', label: 'Calendar', icon: '📅', path: '/calendar', disabled: true },
    { id: 'knowledge', label: 'Knowledge Base', icon: '📚', path: '/knowledge', disabled: true },
{ id: 'finance', label: 'Personal Finance', icon: '💰', path: '/finance', disabled: true },
    { id: 'family-tree', label: 'Family Tree', icon: '🌳', path: '/family-tree', disabled: true },
    { id: 'financial-goals', label: 'Financial Goals', icon: '🎯', path: '/financial-goals', disabled: true },
  ]

  const activePath = location.pathname
  const activeModule =
    activePath === '/' || activePath.startsWith('/tasks') || activePath.startsWith('/task')
      ? 'task-manager'
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
