# Front-End Design Document

This document outlines the front-end architecture, design principles, and technical stack for the AppZ application. The objective is to establish a clear, enterprise-grade pattern that can be easily adapted and reused for future front-end applications, ensuring consistency, scalability, and maintainability.

## Design Overview

The AppZ front-end is designed as a modular, single-page application (SPA) built with React and TypeScript. It follows a layered architectural approach, emphasizing separation of concerns, reusability, and testability. The application is structured around core functionalities and distinct, independent modules, allowing for flexible development and easy integration of new features. A strong emphasis is placed on a consistent user experience through a unified UI library and design system.

## Thumb Rule

*   **Modularity:** Break down features into small, independent, and reusable modules.
*   **Separation of Concerns:** Each component, hook, or service should have a single responsibility.
*   **Consistency:** Adhere to established coding standards, design patterns, and UI guidelines.
*   **Performance:** Optimize for fast loading times and smooth user interactions.
*   **Maintainability:** Write clean, readable, and well-documented code.
*   **Scalability:** Design components and services to handle growth and increased complexity.
*   **Type Safety:** Leverage TypeScript extensively to catch errors early and improve code quality.
*   **User Experience:** Prioritize intuitive interfaces and responsive design.

## Tools, Technology, Languages, Services, and Packages Used

### Languages & Frameworks
*   **TypeScript:** Primary language for application development, ensuring type safety and improved developer experience.
*   **React:** Declarative JavaScript library for building user interfaces.

### Build & Development
*   **Vite:** Next-generation front-end tooling for fast development and optimized builds.
*   **ESLint:** For static code analysis and enforcing code style.

### UI & Styling
*   **Mantine:** A comprehensive React components library for building modern and responsive user interfaces. This includes:
    *   `@mantine/core`
    *   `@mantine/dates`
    *   `@mantine/form`
    *   `@mantine/hooks`
    *   `@mantine/notifications`
    *   `@mantine/tiptap`
*   **CSS Modules:** For scoped styling of React components (`.module.css`).

### State Management
*   **Zustand:** A fast, scalable, and bear-bones state-management solution for React.
*   **TanStack Query (`@tanstack/react-query`):** For managing server state, data fetching, caching, and synchronization.

### Routing
*   **React Router DOM (`react-router-dom`):** Declarative routing for React applications.

### Form Management & Validation
*   **React Hook Form (`react-hook-form`):** Performant, flexible, and extensible forms with easy-to-use validation.
*   **Zod:** TypeScript-first schema declaration and validation library.
*   `@hookform/resolvers`: Integration between React Hook Form and Zod.

### Client-Side Data Storage
*   **Dexie.js (`dexie`):** A wrapper for IndexedDB, providing a more developer-friendly API for client-side database operations.
*   `dexie-react-hooks`: React hooks for Dexie.js.

### Authentication
*   **Auth0 React (`@auth0/auth0-react`):** SDK for integrating Auth0 authentication into React applications.

### Rich Text Editing
*   **Tiptap (`@tiptap/react`, `@tiptap/starter-kit`):** Headless editor framework for the web, integrated with Mantine. Includes various extensions for rich text features:
    *   `@tiptap/extension-color`
    *   `@tiptap/extension-highlight`
    *   `@tiptap/extension-placeholder`
    *   `@tiptap/extension-subscript`
    *   `@tiptap/extension-superscript`
    *   `@tiptap/extension-task-item`
    *   `@tiptap/extension-task-list`
    *   `@tiptap/extension-text-align`
    *   `@tiptap/extension-text-style`
    *   `@tiptap/extension-underline`

### Drag and Drop
*   **Dnd Kit (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`):** A modular and performant drag and drop toolkit for React.

### Data Visualization
*   **Recharts (`recharts`):** A composable charting library built with React and D3.

### Utilities
*   **Day.js (`dayjs`):** A minimalist JavaScript library for parsing, validating, manipulating, and formatting dates.
*   **UUID (`uuid`):** For generating universally unique identifiers.
*   **XLSX (`xlsx`):** For reading and writing spreadsheet files.

### Progressive Web App (PWA)
*   **VitePWA (`vite-plugin-pwa`):** Vite plugin to build PWAs.

## Folder Structure

The project adheres to a clear and consistent folder structure to promote organization and maintainability.

```
.
├───public/                 # Static assets (images, manifest, service worker)
├───src/                    # Main application source code
│   ├───App.tsx             # Main application component
│   ├───main.tsx            # Entry point for React application
│   ├───index.css           # Global styles
│   ├───vite-env.d.ts       # Vite environment type definitions
│   ├───core/               # Core application functionalities, shared across modules
│   │   ├───auth/           # Authentication logic and components
│   │   ├───components/     # Global reusable UI components
│   │   ├───config/         # Application-wide configurations
│   │   ├───database/       # Client-side database setup and repositories
│   │   ├───hooks/          # Global custom React hooks
│   │   ├───screens/        # Core application screens (e.g., Home, Notifications)
│   │   ├───services/       # Global application services (e.g., notifications, settings)
│   │   ├───theme/          # Theming and styling configurations
│   │   └───utils/          # Global utility functions
│   ├───img/                # Application images
│   ├───modules/            # Feature-specific modules (e.g., Task Manager, Finance Goal)
│   │   ├───break_timer/
│   │   ├───finance-goal/
│   │   ├───notes/
│   │   └───task_manager/
│   ├───routes/             # Application routing definitions
│   └───types/              # Global TypeScript type definitions
├───docs/                   # Project documentation
├───generic-design/         # General design documents and guidelines
├───prompts/                # AI prompt related files
├───release-notes/          # Release notes for different versions
└───package.json            # Project dependencies and scripts
```

## Module Level Structure

Each feature module within the `src/modules` directory follows a consistent internal structure, inspired by Clean Architecture principles, to ensure clear separation of concerns:

```
src/modules/[module-name]/
├───components/     # Module-specific reusable UI components
│   ├───index.ts    # Export all components
│   └───[feature-area]/ # Sub-folders for complex component groups
├───data/           # Data layer for the module
│   ├───datasources/    # Abstractions for external data sources (e.g., API, IndexedDB)
│   ├───models/         # Data models (DTOs, entities) for data transfer and persistence
│   ├───repositories/   # Implementations of domain interfaces, handling data fetching and storage
│   └───services/       # Module-specific data services
├───domain/         # Domain layer (business logic) for the module
│   ├───entities/       # Core business entities (plain objects/interfaces)
│   ├───interfaces/     # Abstractions for repositories and other domain services
│   └───usecases/       # Application-specific business rules and operations
└───presentation/   # Presentation layer (UI) for the module
    ├───hooks/          # Module-specific custom React hooks
    ├───screens/        # Module-specific screens/pages
    └───[module-name].tsx # Main entry component for the module
```

This structure ensures that:
*   **Domain** logic is independent of UI and data implementation details.
*   **Data** layer handles all interactions with external data sources.
*   **Presentation** layer focuses solely on rendering the UI and handling user interactions.

## Architecture Pattern

The front-end employs a **Layered Architecture** with strong influences from **Clean Architecture** principles, particularly at the module level.

1.  **Presentation Layer:** (e.g., `src/modules/[module]/presentation`, `src/core/screens`, `src/core/components`)
    *   Responsible for rendering the UI, handling user input, and displaying data.
    *   Consists of React components, screens, and presentation-specific hooks.
    *   Communicates with the Domain Layer via use cases.
    *   Utilizes Mantine for UI components and Zustand/TanStack Query for local/server state management.

2.  **Domain Layer:** (e.g., `src/modules/[module]/domain`)
    *   Contains the core business logic and rules of the application.
    *   Independent of any UI framework or database.
    *   Defines entities, interfaces (for repositories), and use cases (interactors).
    *   Use cases orchestrate the flow of data to and from entities and repositories.

3.  **Data Layer:** (e.g., `src/modules/[module]/data`, `src/core/database`)
    *   Responsible for retrieving and persisting data.
    *   Implements the interfaces defined in the Domain Layer (repositories).
    *   Interacts with various data sources (e.g., REST APIs, IndexedDB via Dexie.js).
    *   Handles data mapping between external formats and domain entities.

4.  **Core Layer:** (e.g., `src/core`)
    *   Provides cross-cutting concerns and shared functionalities that are not specific to any single module.
    *   Includes global components, authentication, configuration, shared utilities, and common services.

## Reusable Components

Reusable components are categorized and stored in two main locations:

1.  **Global Reusable Components (`src/core/components`):**
    *   Components that are generic and can be used across multiple modules or core screens (e.g., `AboutModal`, `NotificationBell`, `StatusIcon`).
    *   These components should be highly configurable and stateless where possible, focusing on UI presentation.

2.  **Module-Specific Reusable Components (`src/modules/[module-name]/components`):**
    *   Components that are specific to a particular module but are reused within that module (e.g., a `TaskCard` within the `task_manager` module).
    *   These components might have more direct ties to the module's domain logic or data structures.

All components leverage Mantine for styling and accessibility, ensuring a consistent look and feel.

## Icons to Use

The application utilizes icons from **Iconify** (`@iconify/react`). Developers should refer to `icon-sets.iconify.design` to browse available icon sets and select appropriate icons. This ensures a unified and scalable icon system.

## Version Control

**Git** is used for version control. The following practices are enforced:
*   **Branching Strategy:** Feature branches for new features/bug fixes, merging into `develop` or `main` via pull requests.
*   **Commit Messages:** Clear, concise, and descriptive commit messages following a conventional commit format (e.g., `feat: add new feature`, `fix: resolve bug`).
*   **.gitignore:** Properly configured to ignore build artifacts, node modules, and sensitive files.

## Documentations

Documentation is a critical aspect of maintaining an enterprise-grade application.
*   **`docs/` folder:** Contains high-level architectural documentation, module overviews, and specific component/screen documentation (e.g., `core/architecture.md`, `modules/task_manager/task_manager-overview.md`).
*   **Inline Code Comments:** Used sparingly for explaining *why* complex logic is implemented, not *what* does.
*   **README files:** At the root and within key directories for quick overviews.
*   **`prompts/` folder:** Contains documentation related to AI prompts and interactions, including API specifications and business logic descriptions.

## Code Standards

*   **TypeScript:** Strict type checking is enforced (`tsconfig.json`).
*   **ESLint:** Used for linting and enforcing consistent code style and best practices. Configuration is defined in `package.json` scripts.
*   **Prettier (Implicit):** While not explicitly listed, a code formatter like Prettier is highly recommended to ensure consistent formatting.
*   **Naming Conventions:**
    *   Components: PascalCase (e.g., `MyComponent.tsx`).
    *   Hooks: `use` prefix (e.g., `useMyHook.ts`).
    *   Interfaces/Types: PascalCase (e.g., `MyInterface.ts`).
    *   Variables/Functions: camelCase.
    *   CSS Modules: kebab-case (e.g., `my-component.module.css`).

## Quality Control

*   **Type Checking:** `tsc` is run as part of the build process to ensure type correctness.
*   **Linting:** `eslint` is run to identify potential issues and enforce code style.
*   **Unit Tests:** (Implicit, but essential for enterprise-grade) Each module's domain logic, use cases, and complex components should have comprehensive unit tests. (e.g., using Vitest/Jest and React Testing Library).
*   **Integration Tests:** (Implicit) To verify interactions between different layers and modules.
*   **End-to-End (E2E) Tests:** (Implicit) To simulate user flows and ensure the entire application functions as expected (e.g., using Cypress or Playwright).
*   **Code Reviews:** All code changes undergo peer review before merging.

## Build and Release

*   **Build Tool:** **Vite** is used for bundling the application for production.
*   **Build Command:** `npm run build` (executes `tsc -b && vite build`).
*   **Optimizations:** Vite handles code splitting, minification, and tree-shaking. Rollup options are configured for vendor chunking to optimize loading.
*   **Progressive Web App (PWA):** The application is configured as a PWA using `vite-plugin-pwa`, enabling offline capabilities and installability.
*   **Deployment:** The `vercel.json` file indicates deployment to **Vercel**, suggesting a continuous deployment pipeline.
*   **Release Notes:** Maintained in the `release-notes/` directory, following a `YYYY.MM.DD.release.md` format.
