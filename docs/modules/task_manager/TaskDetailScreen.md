# Task Detail Screen

This document describes the `TaskDetailScreen`, which provides a comprehensive view of a specific task, including its properties, subtasks, and activity log.

## 1. Features

*   **Task Information Display:** Shows the task's title, description, status, priority, creation date, due date, task level, and recurrence pattern (if applicable).
*   **Edit Task:** Provides an action to navigate to the `TaskFormScreen` to modify the task's details.
*   **Archive Task:** Allows users to archive the task, moving it out of the active task lists. This option is not available if the task is already archived.
*   **Subtask Management:**
    *   Lists all direct child tasks (subtasks) associated with the current task.
    *   Provides a button to add new subtasks to the current task.
    *   Subtask section is only visible if the current task is not at the maximum nesting level (Level 3).
*   **Activity Log:** Displays a chronological log of significant events and changes related to the task. This feature is specifically enabled only for top-level tasks (Level 1).
*   **Navigation:**
    *   "Back" action icon to return to the previous screen.
    *   "Back to All Tasks" button for direct navigation to the `TaskAllTasksScreen`.
*   **Error Handling:** Displays an alert if the requested task cannot be found.
*   **Loading State:** Shows a loading indicator while task data is being fetched.
*   **Missing ID Handling:** Automatically redirects to the dashboard if the task ID is missing from the URL.

## 2. UI Components

The screen utilizes Mantine UI components for layout, display, and interaction, along with custom components for specific task functionalities.

*   **Layout & Structure:** `Box`, `Stack`, `Group`, `Card`, `Title`, `Divider` for organizing content.
*   **Information Display:** `Text`, `Badge` for task properties, status, priority, and recurrence.
*   **Controls:** `Button` for "Add Subtask" and "Back to All Tasks". `ActionIcon` for "Back", "Edit", and "Archive".
*   **Feedback & Status:** `Alert` for displaying error messages (e.g., task not found).
*   **Icons:** `iconify-icon` for various visual cues (back, edit, archive, plus, repeat).
*   **Custom Components:**
    *   `ActivityLog`: Displays the activity history for the task.
    *   `TaskCard`: Used to display individual subtasks in a concise format.
    *   `ArchiveConfirmationModal`: A modal for confirming task archiving.
    *   `SubtaskModal`: A modal for creating new subtasks, pre-filled with parent task context.

## 3. Data Handling

*   **URL Parameters (`useParams`):** Extracts the `id` of the task from the URL.
*   **Data Fetching Hooks:**
    *   `useTaskById(id)`: Fetches the details of the main task being viewed.
    *   `useChildTasks(id)`: Fetches all direct subtasks of the current task.
*   **Task State (`useTaskStore`):** Manages UI-related state such as `setSelectedTaskId` (for subtask navigation), `openArchiveModal`, and `openSubtaskModal`.
*   **`getRecurrenceLabel`:** A utility function from `recurrenceHelper` to provide a human-readable description of the task's recurrence pattern.
*   **`useEffect`:** Used to handle the redirection if the `id` parameter is missing from the URL.

## 4. User Interactions

*   **Navigation:**
    *   Clicking the "Back" `ActionIcon` or "Back to All Tasks" button navigates the user away from the detail screen.
    *   Clicking on a subtask `TaskCard` navigates to the `TaskDetailScreen` for that subtask.
*   **Task Actions:**
    *   Clicking the "Edit" `ActionIcon` navigates to the `TaskFormScreen` to edit the current task.
    *   Clicking the "Archive" `ActionIcon` opens the `ArchiveConfirmationModal`.
    *   Clicking the "Add Subtask" button opens the `SubtaskModal`.

## 5. Validations

*   **Missing Task ID:** If the `id` parameter is missing from the URL, the user is redirected to the dashboard.
*   **Task Not Found:** If `useTaskById` returns no data for the given ID, an `Alert` is displayed indicating that the task could not be found.
*   **Loading State:** A loading message is displayed while task data is being fetched.
*   **Conditional UI Elements:**
    *   The "Archive" `ActionIcon` is only displayed if the task is not already archived.
    *   The "Subtasks" section and "Add Subtask" button are only displayed if the task's `taskLevel` is less than 3.
    *   The `ActivityLog` component is only rendered for tasks with `taskLevel === 1`.

## 6. Enhancements / UX Improvements

*   **Inline Editing:** Allow users to edit certain task properties (e.g., title, due date, status) directly on the detail screen without navigating to a separate form.
*   **Drag-and-Drop for Subtasks:** Enable drag-and-drop functionality to reorder subtasks or move them between parent tasks.
*   **Task History/Versions:** Provide a more detailed history of changes to the task, potentially with the ability to revert to previous versions.
*   **Comments/Discussions:** Integrate a comments section for discussions related to the task.
*   **Attachments:** Allow users to attach files or links to tasks.
*   **Context Menus:** Implement right-click context menus for subtasks for quick actions.
*   **Progress Visualization:** For tasks with subtasks, display a progress bar indicating the completion status of its subtasks.
