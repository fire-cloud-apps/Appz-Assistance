# Task All Tasks Screen

This document describes the `TaskAllTasksScreen`, which provides a comprehensive, paginated, and filterable list of all tasks managed by the user.

## 1. Features

*   **Paginated Task List:** Displays tasks in a list format, with controls to navigate through pages.
*   **Status Filtering:** Allows users to filter tasks by their status (e.g., "Pending", "Completed", "InProgress", "Cancelled") using URL query parameters, often linked from the dashboard.
*   **Search Functionality:** Enables searching tasks by their title or description, with a debounced input for efficient querying.
*   **Filter Indicator:** Clearly shows the currently active status filter (if any) with an option to clear it.
*   **Task Completion Toggle:** Users can mark tasks as complete or incomplete directly from the list using a checkbox. This includes special handling for recurring tasks.
*   **Task Detail Navigation:** Clicking on a task item navigates the user to the `TaskDetailScreen` for more information.
*   **New Task Creation:** Provides a button in the header and a floating action button (FAB) for quickly creating new tasks.
*   **Loading State:** Displays a loading indicator while tasks are being fetched or searched.
*   **Empty States:** Presents informative messages when no tasks are found (either generally or for a specific filter/search).
*   **Dynamic Pagination:** Adjusts pagination based on the total number of tasks and items per page, which can be configured in user settings.

## 2. UI Components

The screen utilizes Mantine UI components for layout, input, and display, along with custom components for specific task functionalities.

*   **Layout & Structure:** `Box`, `Stack`, `Center`, `Group` for organizing content.
*   **Information Display:** `Text`, `Badge` for task titles, descriptions, status, priority, and filter indicators.
*   **Loading Indicator:** `Loader` for indicating data loading.
*   **Input & Controls:**
    *   `TextInput`: For searching tasks.
    *   `Checkbox`: For toggling task completion.
    *   `Button`: For "Clear filter", "Prev", "Next", and "New Task" actions.
    *   `ActionIcon` with `Tooltip`: Floating action button for "New Task".
*   **Visual Separators:** `Divider` for separating sections.
*   **Custom Components:**
    *   `TaskDashboardHeader`: Displays the screen title and a "New Task" button.
    *   `TaskEmptyState`: Displays messages for empty task lists or search results.
    *   `StatusIcon`: Used for status and priority indicators.
*   **Icons:** `iconify-icon` for various visual cues (search, plus, chevron, repeat).

## 3. Data Handling

*   **Task State (`useTaskStore`):** Used to set the `selectedTaskId` when navigating to task details.
*   **Data Fetching Hooks:**
    *   `useParentTasksPaged(currentPage, itemsPerPage)`: Fetches top-level tasks with pagination.
    *   `useSearchTasksPaged(debouncedSearchTerm, currentPage, itemsPerPage)`: Fetches tasks matching a search term with pagination.
*   **Data Mutation Hooks:**
    *   `useUpdateTask()`: Used for general task updates (e.g., uncompleting a task).
    *   `useCompleteTaskWithRecurrence()`: Handles marking tasks as complete, specifically designed to manage recurring tasks by generating new instances.
*   **Local State (`useState`):** Manages `currentPage`, `itemsPerPage`, `searchTerm`, `debouncedSearchTerm`, `isPagingDisabled`, and `totalTasks`.
*   **`useEffect` Hooks:**
    *   Loads `itemsPerPage` from `userSettingsService` on component mount.
    *   Debounces the `searchTerm` to `debouncedSearchTerm` to limit API calls.
    *   Updates `totalTasks` based on data from `useParentTasksPaged` or `useSearchTasksPaged`.
    *   Adjusts `currentPage` if it exceeds `totalPages` (e.g., after filtering reduces total tasks).
*   **URL Parameters (`useSearchParams`):** Reads the `status` query parameter to apply initial filtering.

## 4. User Interactions

*   **Searching:** Users type into the `TextInput` to search for tasks. The search is debounced, and results are displayed dynamically.
*   **Filtering:** Clicking "Clear filter" removes the active status filter. Status filters are typically applied by navigating from the dashboard.
*   **Task Selection:** Clicking anywhere on a task item (except the checkbox) navigates to its `TaskDetailScreen`.
*   **Task Completion:** Clicking the `Checkbox` next to a task toggles its completion status.
*   **Pagination:** Clicking "Prev" or "Next" buttons navigates through the task pages.
*   **New Task:** Clicking the "New Task" button in the header or the FAB navigates to the `TaskFormScreen`.

## 5. Validations

*   **Loading State:** A `Loader` is displayed while tasks are being fetched or searched.
*   **Pagination Controls:** "Prev" and "Next" buttons are disabled when the user is on the first or last page, respectively, or during loading.
*   **Empty States:** `TaskEmptyState` component provides user-friendly messages when no tasks are found, either due to no tasks existing or no results matching a search/filter.
*   **Debounced Search:** The `searchTerm` is debounced to prevent rapid, unnecessary API calls as the user types.
*   **Recurring Task Completion:** The `handleToggleComplete` function correctly differentiates between regular and recurring tasks, using the specialized `completeTaskMutation` for recurring tasks to ensure proper recurrence handling.

## 6. Enhancements / UX Improvements

*   **Sorting Options:** Allow users to sort tasks by due date, priority, creation date, etc.
*   **Advanced Filters:** Add more filtering options (e.g., by tags, assigned user, creation date range).
*   **Bulk Actions:** Implement bulk completion, deletion, or status change for multiple selected tasks.
*   **Drag-and-Drop Reordering:** Allow users to reorder tasks within the list.
*   **Context Menus:** Implement right-click context menus for tasks for quick actions.
*   **Customizable Items Per Page:** Provide a dropdown to allow users to change `itemsPerPage` directly on the screen.
*   **Visual Priority Indicators:** Use more prominent visual cues (e.g., color-coded borders, icons) to highlight task priority.
