/**
 * Application routes configuration
 * Route: /
 */
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '../core/services/MainLayout'
import { TaskDashboardScreen } from '../modules/task_manager/presentation/screens/TaskDashboardScreen'
import { TaskAllTasksScreen } from '../modules/task_manager/presentation/screens/TaskAllTasksScreen'
import { TaskGroupTasksScreen } from '../modules/task_manager/presentation/screens/TaskGroupTasksScreen'
import { TaskKanbanBoardScreen } from '../modules/task_manager/presentation/screens/TaskKanbanBoardScreen'
import { TaskArchiveScreen } from '../modules/task_manager/presentation/screens/TaskArchiveScreen'
import { TaskDetailScreen } from '../modules/task_manager/presentation/screens/TaskDetailScreen'
import { TaskFormScreen } from '../modules/task_manager/presentation/screens/TaskFormScreen' // New import
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
        path: 'tasks/kanban',
        element: <TaskKanbanBoardScreen />,
      },
      {
        path: 'tasks/archive',
        element: <TaskArchiveScreen />,
      },
      {
        path: 'tasks/create', // New route for creation
        element: <TaskFormScreen />,
      },
      {
        path: 'tasks/edit/:id', // New route for update
        element: <TaskFormScreen />,
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
        path: 'knowledge',
        element: <ComingSoonScreen moduleName="Knowledge Base" />,
      },
{
        path: 'finance',
        element: <ComingSoonScreen moduleName="Personal Finance" />,
      },
      {
        path: 'family-tree',
        element: <ComingSoonScreen moduleName="Family Tree" />,
      },
      {
        path: 'financial-goals',
        element: <ComingSoonScreen moduleName="Financial Goals" />,
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
