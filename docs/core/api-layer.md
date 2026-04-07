# API Layer

This document describes the application's strategy for interacting with external APIs and managing local data persistence, including abstraction, service structure, error handling, and data transformation.

## Overview

The application's data interaction layer is designed to abstract away the complexities of data fetching and storage, providing a consistent interface for the rest of the application. It primarily leverages:

*   **React Query (TanStack Query):** For managing server state, including data fetching, caching, synchronization, and error handling for external API interactions.
*   **Dexie.js:** For interacting with the local IndexedDB, providing a robust and type-safe way to manage client-side persistent data.

## API Abstraction Strategy

Instead of a single, monolithic API client, the application adopts a service-oriented approach where each domain or feature has its own dedicated service or repository responsible for data operations.

### External API Interaction

For external APIs, the interaction typically follows these steps:

1.  **Data Fetching Functions:** Small, focused functions (often within `src/core/services` or `src/modules/*/data/datasources`) are responsible for making HTTP requests using the native `fetch` API. These functions return Promises that resolve with the fetched data or reject with an error.
2.  **React Query Hooks:** These fetching functions are then integrated with `useQuery` or `useMutation` hooks from React Query. React Query handles:
    *   **Caching:** Automatically caches query results, reducing redundant network requests.
    *   **Loading States:** Provides `isLoading`, `isFetching` states for UI feedback.
    *   **Error Handling:** Catches errors from the fetching functions and provides `isError`, `error` states.
    *   **Retries & Refetching:** Configurable automatic retries and manual refetching mechanisms.
    *   **Optimistic Updates:** Facilitates optimistic UI updates for mutations.

### Local Data Persistence (IndexedDB)

For local data storage, the application uses `Dexie.js` (a wrapper for IndexedDB).

1.  **Database Instance:** A central `appDatabase.ts` (in `src/core/database`) defines the IndexedDB schema and initializes the Dexie database instance.
2.  **Repositories:** Each data entity (e.g., `InAppNotification`, `BreakSettings`) has a corresponding repository (e.g., `inAppNotificationRepository.ts`, `BreakTimerRepository.ts`) that encapsulates CRUD (Create, Read, Update, Delete) operations for that entity. These repositories interact directly with the Dexie database instance.
3.  **Dexie React Hooks:** `dexie-react-hooks` are used in components or custom hooks to easily interact with these repositories and reactively update the UI when local data changes.

## Service Structure

*   **`src/core/services`:** Contains application-wide services that might interact with external APIs (e.g., `notificationService.ts` for sending notifications, `dataExportImportService.ts` for file operations). These services might use `fetch` directly or leverage React Query.
*   **`src/modules/*/data/datasources`:** For modules that interact with their own specific external APIs, data source files within the module's `data` layer would contain the API calling logic.
*   **`src/modules/*/data/repositories`:** These files primarily handle interactions with the local IndexedDB via Dexie.js, providing an abstraction over the raw database operations.

## Error Handling

### External API Errors

*   **HTTP Status Codes:** The fetching functions should check for non-2xx HTTP status codes and throw an error with relevant information (e.g., status code, error message from API response).
*   **React Query:** `useQuery` and `useMutation` hooks expose an `error` object and `isError` boolean, allowing components to display error messages to the user.
*   **Global Error Boundary/Notification:** A global error handling mechanism (e.g., a React Error Boundary or a notification service) can catch unhandled errors and display a generic error message or log the error.

### Local Database Errors

*   **Dexie.js:** Dexie operations are Promise-based, allowing standard `try...catch` blocks or `.catch()` handlers to manage errors during database interactions.
*   **User Feedback:** Errors during local data operations should be communicated to the user, perhaps via a notification system.

## Data Transformation

Data transformation occurs at various points to ensure data consistency and usability:

*   **API Response to Application Model:** Raw data received from external APIs might be transformed into application-specific data models (entities) within the data source or repository layer before being passed to the domain or presentation layers. This ensures the rest of the application works with a consistent data structure.
*   **Application Model to API Request:** Similarly, data from the application might be transformed into a format expected by the API before being sent in a request payload.
*   **UI Formatting:** Data is formatted for display in the presentation layer (e.g., date formatting, currency formatting) using utility functions from `src/core/utils`.
