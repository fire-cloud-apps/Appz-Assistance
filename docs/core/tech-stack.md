# Technology Stack

This document details the core technologies and libraries used in the frontend application.

## Core Technologies

*   **Framework:** [React](https://react.dev/)
    *   A JavaScript library for building user interfaces.
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
    *   A superset of JavaScript that adds static types, enhancing code quality and maintainability.
*   **Build Tool:** [Vite](https://vitejs.dev/)
    *   A fast build tool that provides a lightning-fast development experience.

## UI & Styling

*   **UI Library:** [Mantine](https://mantine.dev/)
    *   A comprehensive React components library with a focus on usability, accessibility, and developer experience.
*   **Styling:**
    *   **CSS Modules:** Used for component-scoped styling, preventing style conflicts.
    *   **Mantine Styles:** Leverages Mantine's built-in styling system for consistent theming and component customization.

## State Management

*   **Global State:** [Zustand](https://zustand-demo.pmnd.rs/)
    *   A small, fast, and scalable bear-bones state-management solution using simplified flux principles.
*   **Data Fetching & Caching:** [React Query (TanStack Query)](https://tanstack.com/query/latest)
    *   Manages server state, providing powerful caching, synchronization, and data fetching capabilities.

## Data Storage

*   **Local Database:** [IndexedDB (via Dexie.js)](https://dexie.org/)
    *   A wrapper for IndexedDB, providing a more developer-friendly API for client-side data storage.
    *   `dexie-react-hooks` is used for seamless integration with React components.

## Routing

*   **Client-Side Routing:** [React Router DOM](https://reactrouter.com/en/main)
    *   A collection of navigational components that compose declaratively with your application.

## Forms & Validation

*   **Form Management:** [React Hook Form](https://react-hook-form.com/)
    *   A performant, flexible, and extensible forms library with easy-to-use validation.
*   **Schema Validation:** [Zod](https://zod.dev/)
    *   A TypeScript-first schema declaration and validation library. Used with `@hookform/resolvers` for form validation.

## Rich Text Editing

*   **Rich Text Editor:** [Tiptap](https://tiptap.dev/)
    *   A headless wrapper around ProseMirror, providing a flexible and extensible rich text editor. Various extensions are used for features like highlighting, text alignment, task lists, etc.

## Authentication

*   **Authentication Service:** [Auth0](https://auth0.com/)
    *   Used for secure user authentication and authorization, integrated via `@auth0/auth0-react`.

## Utilities & Other Libraries

*   **Drag and Drop:** [Dnd Kit](https://dndkit.com/)
    *   A lightweight, performant, accessible, and extensible drag & drop toolkit for React.
*   **Date Manipulation:** [Day.js](https://day.js.org/)
    *   A minimalist JavaScript library for parsing, validating, manipulating, and formatting dates.
*   **Unique IDs:** [UUID](https://www.npmjs.com/package/uuid)
    *   For generating universally unique identifiers.
*   **Icons:** [Iconify](https://iconify.design/)
    *   Provides access to a vast collection of open-source icon sets, integrated via `@iconify/react`.
*   **Charting:** [Recharts](https://recharts.org/)
    *   A composable charting library built with React and D3.
*   **Excel File Handling:** [XLSX](https://docs.sheetjs.com/)
    *   For reading and writing spreadsheet files.
