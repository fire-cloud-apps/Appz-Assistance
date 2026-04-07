# Folder Structure

This document outlines the standardized folder structure of the frontend application, emphasizing modularity, separation of concerns, and maintainability.

## Root Level

```
Appz-Assistance/
├── public/                 # Static assets (images, manifest, etc.)
├── src/                    # Main application source code
├── docs/                   # Project documentation (this section)
├── node_modules/           # Installed dependencies
├── .git/                   # Git version control
├── package.json            # Project metadata and dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── ...                     # Other configuration files (.gitignore, vercel.json, etc.)
```

## `src` Directory

The `src` directory is the heart of the application, divided into `core` and `modules` to enforce strict separation of shared functionalities from feature-specific implementations.

```
src/
├── App.tsx                 # Main application component
├── main.tsx                # Entry point for the React application
├── index.css               # Global styles
├── vite-env.d.ts           # Vite environment type definitions
├── core/                   # Shared, foundational, and cross-cutting concerns
├── modules/                # Feature-specific modules
├── routes/                 # Application routing configuration
├── types/                  # Global TypeScript type definitions
└── img/                    # Application images
```

### `src/core` - Shared and Foundational Concerns

This directory contains code that is shared across multiple modules or represents foundational aspects of the application. It should **not** have dependencies on specific modules.

```
src/core/
├── auth/                   # Authentication logic (Auth0 integration, auth screens, hooks)
├── components/             # Reusable UI components used across modules (e.g., modals, notifications)
├── config/                 # Application-wide configuration (e.g., appConfig.json)
├── database/               # IndexedDB setup and repository implementations (Dexie.js)
│   ├── models/             # Database models/entities
│   └── ...
├── hooks/                  # Reusable React hooks (e.g., useInAppNotifications, useSyncSetting)
├── screens/                # Core application screens (e.g., HomeScreen, NotificationsScreen, ProfileScreen, SettingsScreen)
├── services/               # Application-wide services (e.g., appStore, notificationService, userSettingsService)
├── theme/                  # Theming configuration (Mantine theme, global styles)
└── utils/                  # General utility functions (date helpers, ID generators, recurrence logic)
```

### `src/modules` - Feature-Specific Modules

Each subdirectory within `src/modules` represents a distinct, self-contained feature or domain of the application. Modules are designed to be independent and encapsulate their own presentation, domain, and data logic.

```
src/modules/
├── break_timer/            # Break Timer feature module
│   ├── data/               # Data layer for break timer (models, repositories)
│   ├── domain/             # Domain layer for break timer (use cases)
│   └── presentation/       # Presentation layer for break timer (hooks, screens)
├── finance-goal/           # Finance Goal feature module
│   ├── components/         # Module-specific UI components
│   ├── data/               # Data layer for finance goal
│   ├── domain/             # Domain layer for finance goal
│   └── presentation/       # Presentation layer for finance goal (hooks, pages, store)
├── notes/                  # Notes feature module
│   ├── data/               # Data layer for notes
│   ├── domain/             # Domain layer for notes
│   └── presentation/       # Presentation layer for notes (components, hooks, screens)
└── task_manager/           # Task Manager feature module
    ├── components/         # Module-specific UI components
    ├── data/               # Data layer for task manager
    ├── domain/             # Domain layer for task manager
    └── presentation/       # Presentation layer for task manager (components, hooks, screens)
```

## Separation Rules

*   **Core vs. Modules:**
    *   `src/core` contains code that is generic and reusable across the entire application.
    *   `src/modules` contains code specific to a particular feature.
    *   `src/core` should **never** depend on `src/modules`.
    *   `src/modules` can depend on `src/core`.
*   **Module Isolation:**
    *   Modules should ideally not depend on other modules directly. Communication between modules should be minimized and, if necessary, mediated through shared services in `src/core` or a well-defined event system.
    *   Each module should be able to function independently or be easily removed/added without impacting other modules significantly.
*   **Layered Architecture within Modules:**
    *   Each module generally follows its own internal layered structure (`data`, `domain`, `presentation`) to maintain consistency with the overall architectural principles.
    *   `presentation` depends on `domain`, `domain` depends on `data` (via interfaces), and `data` depends on external services/databases.

```