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
import { TaskFormScreen } from '../modules/task_manager/presentation/screens/TaskFormScreen'
import { NotesDashboardScreen } from '../modules/notes/presentation/screens/NotesDashboardScreen'
import { NotesFolderViewScreen } from '../modules/notes/presentation/screens/NotesFolderViewScreen'
import { NotesEditorScreen } from '../modules/notes/presentation/screens/NotesEditorScreen'
import { NotesSearchScreen } from '../modules/notes/presentation/screens/NotesSearchScreen'
import { NotesFavoritesScreen } from '../modules/notes/presentation/screens/NotesFavoritesScreen'
import { NotesTrashScreen } from '../modules/notes/presentation/screens/NotesTrashScreen'
import { SettingsScreen } from '../core/services/SettingsScreen'
import { ProfileScreen } from '../core/services/ProfileScreen'
import { NotificationsScreen } from '../core/screens/NotificationsScreen'

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
        path: 'tasks/create',
        element: <TaskFormScreen />,
      },
      {
        path: 'tasks/edit/:id',
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
        path: 'profile',
        element: <ProfileScreen />,
      },
      {
        path: 'notifications',
        element: <NotificationsScreen />,
      },
      {
        path: 'notes',
        element: <NotesDashboardScreen />,
      },
      {
        path: 'notes/folder/:id',
        element: <NotesFolderViewScreen />,
      },
      {
        path: 'notes/editor/:id',
        element: <NotesEditorScreen />,
      },
      {
        path: 'notes/create',
        element: <NotesEditorScreen />,
      },
      {
        path: 'notes/search',
        element: <NotesSearchScreen />,
      },
      {
        path: 'notes/favorites',
        element: <NotesFavoritesScreen />,
      },
      {
        path: 'notes/trash',
        element: <NotesTrashScreen />,
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
