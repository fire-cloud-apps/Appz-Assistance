# Routing

This document describes the application's routing structure, module-based navigation, and the approach to handling different views and screens using `react-router-dom`.

## Routing Library

The application utilizes [React Router DOM](https://reactrouter.com/en/main) for client-side routing, specifically `createBrowserRouter` for defining the route configuration.

## Routing Structure

All primary application routes are defined in `src/routes/index.tsx`. The routes are organized hierarchically, with a main layout wrapping most of the feature-specific routes.

```tsx
// src/routes/index.tsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // Main application layout
    children: [
      // ... core application routes
      // ... module-specific routes
    ],
  },
  // ... other top-level routes if any
])
```

### Main Layout (`MainLayout.tsx`)

The `MainLayout` component (located in `src/core/services/MainLayout.tsx`) serves as the primary wrapper for most application content. It typically includes shared UI elements like the header, sidebar (if any), and provides a consistent structure for the application's main views.

### Core Application Routes

Routes related to core functionalities or global screens are defined directly under the `MainLayout`'s children. Examples include:

*   `/home`: The application's dashboard or landing page (`HomeScreen`).
*   `/settings`: Application settings (`SettingsScreen`).
*   `/profile`: User profile management (`ProfileScreen`).
*   `/notifications`: In-app notifications screen (`NotificationsScreen`).

### Module-Based Navigation

The application adopts a module-based navigation strategy, where routes for specific features are grouped under a common path prefix. This enhances organization and reflects the modular architecture.

Examples of module-based routes:

*   **Task Manager Module (`src/modules/task_manager`):**
    *   `/tasks/dashboard`
    *   `/tasks/all`
    *   `/tasks/kanban`
    *   `/tasks/create`
    *   `/tasks/edit/:id`
    *   `/task/:id` (for individual task details)
*   **Notes Module (`src/modules/notes`):**
    *   `/notes`
    *   `/notes/folder/:id`
    *   `/notes/editor/:id`
    *   `/notes/create`
*   **Finance Goal Module (`src/modules/finance-goal`):**
    *   `/finance/dashboard`
    *   `/finance/portfolio`
    *   `/finance/sip`
    *   `/finance/goals`
*   **Break Timer Module (`src/modules/break_timer`):**
    *   `/settings/break-timer` (integrated into the settings section)

### Dynamic Routes

Routes with parameters (e.g., `:id`) are used to display details or edit specific entities. For example:

*   `/tasks/edit/:id`: Edits a task with a specific ID.
*   `/task/:id`: Displays details of a task with a specific ID.
*   `/notes/folder/:id`: Displays notes within a specific folder.

### Redirects

The `Navigate` component from `react-router-dom` is used for redirects, such as:

*   Redirecting the root path `/` to `/home`.
*   Redirecting `/financial-goals` to `/finance/dashboard`.

## Lazy Loading Approach

Currently, the application's routing configuration in `src/routes/index.tsx` does not explicitly implement route-based lazy loading using `React.lazy` and `Suspense`. All screen components are imported directly.

For future performance optimizations, especially as the application grows, lazy loading can be introduced by dynamically importing module-specific screens or entire module route configurations.

```tsx
// Example of potential lazy loading implementation (not currently in use)
// const LazyTaskDashboardScreen = React.lazy(() => import('../modules/task_manager/presentation/screens/TaskDashboardScreen'));

// In router configuration:
// {
//   path: 'tasks/dashboard',
//   element: (
//     <React.Suspense fallback={<div>Loading...</div>}>
//       <LazyTaskDashboardScreen />
//     </React.Suspense>
//   ),
// },
```
This approach would allow the application to load JavaScript bundles for specific routes only when they are accessed, improving initial load times.
