# Task Dashboard Screen

This document describes the `TaskDashboardScreen`, which provides a comprehensive overview of the user's tasks, highlighting key statistics, upcoming deadlines, and overdue items.

## 1. Features

*   **Dashboard Overview:** Presents a high-level summary of the user's task landscape.
*   **Task Statistics:** Displays a grid of key task metrics (e.g., total tasks, completed tasks, pending tasks, overdue tasks).
*   **Upcoming Tasks List:** Shows a curated list of tasks that are due soon, helping users prioritize.
*   **Overdue Tasks List:** Highlights tasks that have passed their due date, prompting immediate attention.
*   **Quick Task Completion:** Allows users to mark tasks as complete directly from the upcoming and overdue lists.
*   **New Task Creation:** Provides a prominent button in the header and a floating action button (FAB) for quickly creating new tasks.
*   **Filtered Navigation:** Clicking on a task statistic (e.g., "Overdue Tasks") navigates the user to the "All Tasks" screen with the corresponding filter applied.
*   **Loading State:** Displays a loading indicator while task data is being fetched.

## 2. UI Components

The screen utilizes Mantine UI components for layout and display, along with custom components for specific task functionalities.

*   **Layout & Structure:** `Box`, `Stack`, `Center` for organizing content.
*   **Loading Indicator:** `Loader` for indicating data loading.
*   **Floating Action Button (FAB):** `ActionIcon` with `Tooltip` for quick access to "New Task" creation, hidden on small screens.
*   **Icons:** `iconify-icon` for the FAB.
*   **Custom Components:**
    *   `TaskDashboardHeader`: Displays the dashboard title and a "New Task" button.
    *   `TaskStatsGrid`: Presents the task statistics in a grid format, with clickable stats.
    *   `UpcomingTasksCard`: Displays a card containing the list of upcoming tasks.
    *   `OverdueTasksCard`: Displays a card containing the list of overdue tasks.

## 3. Data Handling

*   **Data Fetching Hooks:**
    *   `useParentTasks()`: Fetches all top-level tasks to calculate overall statistics.
    *   `useUpcomingTasks(5)`: Fetches a limited number of tasks due in the near future.
    *   `useOverdueTasks(5)`: Fetches a limited number of tasks that are past their due date.
*   **Data Mutation Hook (`useCompleteTaskWithRecurrence`):** Handles the mutation for marking a task as complete, including logic for recurring tasks.
*   **Loading State:** The `isLoading` state from `useParentTasks` is used to display the `Loader` while initial task data is being fetched.

## 4. User Interactions

*   **Create New Task:**
    *   Clicking the "New Task" button in the `TaskDashboardHeader`.
    *   Clicking the floating action button (FAB) at the bottom right of the screen.
    *   Both actions navigate the user to the `TaskFormScreen` for creating a new task.
*   **View Filtered Tasks:** Clicking on any statistic card within the `TaskStatsGrid` navigates the user to the `TaskAllTasksScreen`, applying a filter based on the clicked statistic (e.g., "overdue", "completed").
*   **Complete Task:** Clicking the "Complete Task" action (e.g., a checkbox or button) within the `UpcomingTasksCard` or `OverdueTasksCard` marks the respective task as complete.

## 5. Validations

*   **Loading State:** A `Loader` is displayed in the center of the screen while initial task data is being fetched, ensuring a smooth user experience.
*   **Task Completion Logic:** The `useCompleteTaskWithRecurrence` hook encapsulates the logic for marking tasks as complete, correctly handling single-instance tasks and generating new instances for recurring tasks.

## 6. Enhancements / UX Improvements

*   **Customizable Dashboard Widgets:** Allow users to customize which task cards or statistics are displayed on their dashboard.
*   **Task Prioritization Visuals:** Use color-coding or icons to visually indicate task priority within the upcoming and overdue lists.
*   **Quick Edit/View Task:** Add quick actions to edit or view details of tasks directly from the dashboard cards.
*   **Progress Charts:** Integrate small charts or graphs to visualize task progress over time or by category.
*   **Drag-and-Drop Reordering:** Allow users to reorder tasks within the upcoming/overdue lists.
*   **Context Menus:** Implement right-click context menus for tasks for quick actions.
