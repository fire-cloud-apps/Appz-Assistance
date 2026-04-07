# State Management

This document outlines the strategies and best practices for managing state within the frontend application, covering both global and module-level state, as well as data flow.

## Global State Management

The application primarily uses [Zustand](https://zustand-demo.pmnd.rs/) for managing global application state. Zustand is chosen for its simplicity, small bundle size, and performance.

### Principles for Global State

*   **Shared Data:** Global state is reserved for data that needs to be accessed or modified by multiple, disparate parts of the application, often across different modules or deeply nested components.
*   **Application-wide Settings:** User preferences, authentication status, theme settings, and other application-wide configurations are good candidates for global state.
*   **Minimalism:** Keep the global state as lean as possible. Avoid putting data into global state if it can be managed locally within a component or module.

### Implementation with Zustand

*   Zustand stores are defined as simple functions that return an object containing state and actions.
*   Selectors should be used to consume only the necessary parts of the state, preventing unnecessary re-renders.
*   Actions within Zustand stores encapsulate state mutations, ensuring predictable state updates.

## Module-Level State Management

For state that is specific to a particular module or a component tree, the following approaches are used:

### 1. React Query (TanStack Query) for Server State

[React Query](https://tanstack.com/query/latest) is the primary tool for managing asynchronous data (server state) fetched from APIs or local databases (like IndexedDB).

#### Principles for React Query

*   **Server State vs. UI State:** React Query excels at managing server state (data that persists on a backend or database), handling caching, revalidation, background updates, and error handling automatically. UI state (e.g., form input values, modal open/close status) should be managed locally or with Zustand.
*   **Data Freshness:** React Query provides mechanisms to keep data fresh and synchronized with the backend, reducing the need for manual data fetching logic.
*   **Optimistic Updates:** Encourages optimistic UI updates for a better user experience, with built-in rollback mechanisms.

#### Implementation with React Query

*   `useQuery` for fetching data.
*   `useMutation` for creating, updating, or deleting data.
*   Query keys are used to uniquely identify and manage cached data.
*   Query invalidation is used to refetch data when underlying data changes.

### 2. Local Component State

For simple UI-specific state that doesn't need to be shared beyond a single component or its immediate children, React's built-in `useState` and `useReducer` hooks are used.

### 3. Context API

The React Context API can be used for passing data down the component tree without prop-drilling, especially for module-specific configurations or themes that don't warrant a global Zustand store. However, overuse should be avoided as it can lead to performance issues if not optimized with memoization.

## Data Flow Strategy

The application generally follows a unidirectional data flow:

1.  **User Interaction:** A user action (e.g., button click, form submission) triggers an event.
2.  **Action Dispatch:** This event might trigger an action in a Zustand store, a `useMutation` in React Query, or a local state update.
3.  **State Update:** The action modifies the relevant state (global, server, or local).
4.  **UI Re-render:** Components subscribed to that state automatically re-render to reflect the new state.

## Best Practices

*   **Clear Ownership:** Clearly define whether a piece of state belongs to global state, server state (React Query), or local component state.
*   **Immutability:** Always treat state as immutable. When updating state, create new objects/arrays instead of directly modifying existing ones.
*   **Memoization:** Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders, especially for components consuming global state or complex calculations.
*   **Error Handling:** Implement robust error handling for all data fetching and state mutations.
*   **Loading States:** Provide clear loading indicators for asynchronous operations.
*   **Data Transformation:** Transform data at the appropriate layer (e.g., in the data layer before storing, or in the presentation layer before displaying) to ensure consistency and optimize performance.
