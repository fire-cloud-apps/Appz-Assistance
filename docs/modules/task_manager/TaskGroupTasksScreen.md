# Task Group Tasks Screen

This document describes the `TaskGroupTasksScreen`, which allows users to view and manage their tasks organized into logical groups based on either priority or status.

## 1. Features

*   **Grouped Task Display:** Organizes tasks into collapsible groups based on selected criteria (Priority or Status).
*   **Group By Priority:** Displays tasks categorized by "Critical", "High", "Medium", "Low" priority, and "Cancelled" tasks.
*   **Group By Status:** Displays tasks categorized by "In Progress", "Pending", "Completed", and "Cancelled" statuses.
*   **Expand/Collapse Groups:** Each task group can be expanded to show its tasks or collapsed to hide them, improving readability.
*   **Load More Functionality:** For groups containing many tasks, a "Load More" button appears, allowing users to progressively load more tasks within that group.
*   **Add Subtask:** Provides an option within each `TaskCard` to add a subtask to that parent task via a modal.
*   **Task Detail Navigation:** Clicking on a task card navigates the user to the `TaskDetailScreen` for more information.
*   **New Task Creation:** Provides a button in the header and a floating action button (FAB) for quickly creating new tasks.
*   **Loading State:** Displays a loading indicator while tasks are being fetched.
*   **Empty State:** Presents an informative message when no tasks exist.

## 2. UI Components

The screen utilizes Mantine UI components for layout, display, and interaction, along with custom components for specific task functionalities.

*   **Layout & Structure:** `Box`, `Stack`, `Center`, `Group` for organizing content.
*   **Information Display:** `Text`, `Badge` for group labels, task counts, and task details.
*   **Loading Indicator:** `Loader` for indicating data loading.
*   **Tabs:** `Tabs` component to switch between "Priority Group" and "Status Group" views.
*   **Collapsible Sections:** `Collapse` component to manage the expanded/collapsed state of task groups.
*   **Group Headers:** `Paper` wrapped in `UnstyledButton` for interactive group headers, styled with `ThemeIcon` and `Badge`.
*   **Floating Action Button (FAB):** `ActionIcon` with `Tooltip` for quick access to "New Task" creation.
*   **Icons:** `iconify-icon` for various visual cues (group icons, chevron for expand/collapse, plus for new task).
*   **Custom Components:**
    *   `TaskDashboardHeader`: Displays the screen title and a "New Task" button.
    *   `TaskEmptyState`: Displays messages for when no tasks are found.
    *   `TaskCardWithChildCount` (wrapper for `TaskCard`): Displays individual task details, including child task count, and provides actions like expand/collapse and add subtask.
    *   `SubtaskModal`: A modal form for creating new subtasks.

## 3. Data Handling

*   **Task State (`useTaskStore`):** Manages UI-related state such as `expandedTaskIds` (for `TaskCard` expansion), `selectedTaskId` (for navigation), and `subtaskModal` state.
*   **Data Fetching Hooks:**
    *   `useParentTasks()`: Fetches all top-level tasks, which are then grouped.
    *   `useChildTasks(taskId)`: Used within `TaskCardWithChildCount` to determine the number of child tasks for a given parent.
*   **Local State (`useState`):** Manages `selectedParentTask` (for subtask creation context), `groupBy` (current grouping method), `itemsPerPage` (from user settings), `displayedCount` (for "Load More"), and `expandedGroups` (for group collapse state).
*   **`useEffect` Hooks:**
    *   Loads `itemsPerPage` from `userSettingsService` on component mount.
*   **`useMemo`:** Optimizes the `groupedTasks` calculation, ensuring it only re-runs when `tasks` or `groupBy` changes.

## 4. User Interactions

*   **Create New Task:**
    *   Clicking the "New Task" button in the `TaskDashboardHeader`.
    *   Clicking the floating action button (FAB).
    *   Both actions navigate the user to the `TaskFormScreen` for creating a new task.
*   **Switch Grouping:** Clicking on the "Priority Group" or "Status Group" tabs changes how tasks are organized.
*   **Expand/Collapse Groups:** Clicking on a group's header (`UnstyledButton` wrapped `Paper`) toggles the visibility of tasks within that group.
*   **Load More Tasks:** Clicking the "Load More" button within an expanded group displays additional tasks.
*   **Task Selection:** Clicking on a `TaskCard` navigates the user to the `TaskDetailScreen`.
*   **Add Subtask:** Clicking the "Add Subtask" action on a `TaskCard` opens the `SubtaskModal`, pre-filling the parent task context.

## 5. Validations

*   **Loading State:** A `Loader` is displayed in the center of the screen while tasks are being fetched.
*   **Empty State:** If `tasks.length` is 0, a `TaskEmptyState` component is displayed, prompting the user to create their first task.
*   **Conditional "Load More":** The "Load More" button is only rendered if there are more tasks in a group than currently displayed (`displayedCount < groupTasks.length`).
*   **Subtask Modal Context:** The `SubtaskModal` is correctly initialized with the `parentTaskId`, `parentTaskTitle`, and `parentTaskLevel` from the selected parent task.

## 6. Enhancements / UX Improvements

*   **Drag-and-Drop Reordering/Moving:** Implement drag-and-drop functionality to reorder tasks within groups or move them between groups.
*   **Group-specific Actions:** Add actions directly to group headers (e.g., "Add Task to this Group", "Collapse All").
*   **Customizable Grouping:** Allow users to define their own custom task groups.
*   **Filtering within Groups:** Add a search/filter bar within each expanded group to quickly find specific tasks.
*   **Visual Progress Indicators:** Display a summary progress bar or count for each group.
*   **Context Menus:** Implement right-click context menus for tasks and groups for quick actions.
