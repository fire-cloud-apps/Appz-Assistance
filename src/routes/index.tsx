import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '../core/services/MainLayout'
import { TaskDashboardScreen } from '../modules/task_manager/presentation/screens/TaskDashboardScreen'
import { TaskAllTasksScreen } from '../modules/task_manager/presentation/screens/TaskAllTasksScreen'
import { TaskGroupTasksScreen } from '../modules/task_manager/presentation/screens/TaskGroupTasksScreen'
import { TaskDetailScreen } from '../modules/task_manager/presentation/screens/TaskDetailScreen'
import { SettingsScreen } from '../core/services/SettingsScreen'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/tasks/dashboard" replace />,
      },
      {
        path: 'tasks/dashboard',
        element: <TaskDashboardScreen />,
      },
      {
        path: 'tasks/all',
        element: <TaskAllTasksScreen />,
      },
      {
        path: 'tasks/groups',
        element: <TaskGroupTasksScreen />,
      },
      {
        path: 'task/:id',
        element: <TaskDetailScreen />,
      },
      {
        path: 'settings',
        element: <SettingsScreen />,
      },
      {
        path: 'notes',
        element: <ComingSoonScreen moduleName="Notes" />,
      },
      {
        path: 'calendar',
        element: <ComingSoonScreen moduleName="Calendar" />,
      },
      {
        path: 'knowledge',
        element: <ComingSoonScreen moduleName="Knowledge Base" />,
      },
      {
        path: 'finance',
        element: <ComingSoonScreen moduleName="Personal Finance" />,
      },
    ],
  },
])

function ComingSoonScreen({ moduleName }: { moduleName: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h1>🚧</h1>
      <h2>{moduleName}</h2>
      <p style={{ color: 'var(--mantine-color-dimmed)' }}>
        This module is coming soon!
      </p>
    </div>
  )
}
