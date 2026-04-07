# Task Archive Screen

This document describes the `TaskArchiveScreen`, which provides a dedicated interface for users to view and manage their archived tasks. Archived tasks can be restored or permanently deleted, and their retention period is displayed.

## 1. Features

*   **Archived Task Listing:** Displays a paginated list of all tasks that have been archived.
*   **Restore Task:** Allows users to unarchive a task, moving it back to their active task list.
*   **Permanently Delete Task:** Provides an option to irrevocably delete an archived task from the system, with a confirmation prompt.
*   **Retention Period Display:** For each archived task, the screen shows the date it was archived and calculates the number of days remaining until it is automatically permanently deleted (based on user-defined retention settings).
*   **Expiring Soon Highlight:** Tasks that are nearing their auto-deletion date (e.g., 7 days or less remaining) are visually highlighted.
*   **Task Detail Navigation:** Clicking on an archived task item navigates the user to the `TaskDetailScreen` for more information.
*   **Pagination:** Provides controls to navigate through pages of archived tasks.
*   **Loading State:** Displays a loading indicator while archived tasks are being fetched.
*   **Empty State:** Presents an informative message when there are no tasks in the archive.
*   **New Task Creation:** Provides a button in the header for quickly creating new tasks.

## 2. UI Components

The screen utilizes Mantine UI components for layout, display, and interaction, along with custom components for specific task functionalities.

*   **Layout & Structure:** `Box`, `Stack`, `Center`, `Group` for organizing content.
*   **Information Display:** `Text`, `Badge` for task titles, descriptions, status, priority, archived status, and retention information.
*   **Loading Indicator:** `Loader` for indicating data loading.
*   **Controls:** `Button` for pagination ("Previous", "Next"). `ActionIcon` with `Tooltip` for "Restore task" and "Permanently delete" actions.
*   **Visual Separators:** `Divider` for separating sections.
*   **Custom Components:**
    *   `TaskDashboardHeader`: Displays the screen title and a "New Task" button.
    *   `TaskEmptyState`: Displays messages for when no archived tasks are found.
*   **Icons:** `iconify-icon` for various visual cues (archive, restore, trash, etc.).
*   **Task Card Styling:** Each archived task is displayed within a `Paper` component with custom styling to indicate its archived status and priority.

## 3. Data Handling

*   **Task State (`useTaskStore`):** Used to set the `selectedTaskId` when navigating to task details.
*   **`TaskRepository`:** Directly interacts with the `TaskRepository` for:
    *   `getArchivedTasksPaged(page, pageSize)`: Fetches archived tasks with pagination.
    *   `unarchiveTask(taskId)`: Restores a task from the archive.
    *   `permanentlyDeleteTask(taskId)`: Deletes a task permanently.
*   **Local State (`useState`):** Manages `currentPage`, `itemsPerPage`, `archivedTasks` (the list of tasks), `totalArchived`, `isLoading`, and `retentionDays`.
*   **`useEffect` Hooks:**
    *   Loads `itemsPerPage` and `retentionDays` from `userSettingsService` on component mount.
    *   Triggers `loadArchivedTasks` on component mount and when `currentPage` or `itemsPerPage` changes.
*   **`calculateDaysRemaining(archivedAt)` Function:** A helper function to compute the number of days left until a task is auto-deleted, based on its `archivedAt` timestamp and the `retentionDays` setting.

## 4. User Interactions

*   **Restore Task:** Clicking the "Restore" `ActionIcon` on a task card initiates the unarchiving process.
*   **Permanently Delete Task:** Clicking the "Delete Forever" `ActionIcon` on a task card, after a confirmation, permanently removes the task.
*   **Task Detail View:** Clicking anywhere on an archived task card (except the action buttons) navigates to its `TaskDetailScreen`.
*   **Pagination:** Clicking "Previous" or "Next" buttons navigates through the pages of archived tasks.
*   **New Task:** Clicking the "New Task" button in the header navigates to the `TaskFormScreen`.

## 5. Validations

*   **Loading State:** A `Loader` is displayed while archived tasks are being fetched.
*   **Pagination Controls:** "Previous" and "Next" buttons are disabled when the user is on the first or last page, respectively.
*   **Empty State:** If `archivedTasks.length` is 0, a `TaskEmptyState` component is displayed with a descriptive message.
*   **Permanent Deletion Confirmation:** A `window.confirm` dialog is used to prompt the user before a task is permanently deleted, preventing accidental data loss.
*   **Retention Logic:** The `calculateDaysRemaining` function ensures that the displayed retention information is accurate and highlights tasks nearing expiration.

## 6. Enhancements / UX Improvements

*   **Bulk Actions:** Implement bulk restore or bulk permanent deletion for multiple selected archived tasks.
*   **Search/Filter:** Add search and filtering capabilities to help users find specific archived tasks (e.g., by title, archived date range).
*   **Customizable Retention:** Allow users to modify the `retentionDays` setting directly from this screen.
*   **Visual Progress Bar for Retention:** Instead of just days remaining, a small progress bar could visually represent how much of the retention period has passed.
*   **Context Menus:** Implement right-click context menus for archived tasks for quick actions.
*   **"Empty Archive" Button:** A button to permanently delete all tasks in the archive, with a strong confirmation.
