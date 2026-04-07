# Task Kanban Board Screen

This document describes the `TaskKanbanBoardScreen`, which provides a visual Kanban board interface for managing tasks, allowing users to track task progress through different status columns.

## 1. Features

*   **Kanban Board View:** Displays tasks organized into columns representing different statuses: "Pending", "In Progress", "Completed", and "Cancelled".
*   **Drag-and-Drop Task Management:** Users can intuitively change a task's status by dragging and dropping its card from one column to another.
*   **Real-time Status Update:** Task status changes are automatically saved to the database upon successful drag-and-drop.
*   **Task Card Details:** Each task card displays essential information such as title, description (if available), current status, priority, and the number of associated subtasks.
*   **Task Detail Navigation:** Clicking on a task card navigates the user to the `TaskDetailScreen` for a more in-depth view and editing.
*   **New Task Creation:** Provides a button in the header for quickly creating new tasks.
*   **Loading State:** Displays a loading indicator while tasks are being fetched.
*   **Empty State:** Presents an informative message when no tasks exist in the system.
*   **Horizontal Scrolling:** The board supports horizontal scrolling, allowing for an arbitrary number of columns or tasks within columns.
*   **Drag Overlay:** Provides a visual representation of the task being dragged, enhancing the user experience.
*   **Auto-scrolling during Drag:** The board automatically scrolls horizontally when a dragged item approaches the edge of the viewport.

## 2. UI Components

The screen utilizes Mantine UI components for layout and display, along with custom components for the Kanban board functionality and `@dnd-kit` for drag-and-drop.

*   **Layout & Structure:** `Box`, `Stack`, `Center`, `Group`, `ScrollArea`, `Paper` for organizing content and enabling scrolling.
*   **Information Display:** `Text`, `Badge` for column labels, task counts, and task details.
*   **Loading Indicator:** `Loader` for indicating data loading.
*   **Controls:** `ActionIcon` with `Tooltip` for the "New Task" button.
*   **Icons:** `iconify-icon` for various visual cues (e.g., drag handle, plus icon).
*   **Custom Components:**
    *   `TaskDashboardHeader`: Displays the screen title and a "New Task" button.
    *   `TaskEmptyState`: Displays messages for when no tasks are found.
    *   `KanbanColumn`: Represents a single status column on the board, containing `DraggableTask` components.
    *   `KanbanTaskCard`: Displays the details of an individual task within a column.
    *   `DraggableTask`: A wrapper component that makes `KanbanTaskCard` draggable.
*   **Drag-and-Drop Library:**
    *   `DndContext`: The main context provider for `@dnd-kit`.
    *   `DragOverlay`: Renders a copy of the dragged item during the drag operation.
    *   `useDraggable`: Hook to make an element draggable.
    *   `useDroppable`: Hook to make an element a drop target.

## 3. Data Handling

*   **Task State (`useTaskStore`):** Used to set the `selectedTaskId` when navigating to task details.
*   **Data Fetching Hooks:**
    *   `useParentTasks()`: Fetches all top-level tasks to populate the board.
    *   `useChildTasks(taskId)`: Used within `KanbanTaskCard` to display the count of subtasks.
*   **Data Mutation Hook (`useUpdateTask()`):** Handles updating a task's `status` in the database after a successful drag-and-drop operation.
*   **Local State (`useState`):** Manages `activeTaskId` to track which task is currently being dragged, used for the `DragOverlay`.
*   **`useMemo`:** Optimizes the creation of `tasksById` (a map for quick task lookup) and the filtering of tasks into their respective columns.
*   **`useRef`:** Used for `scrollViewportRef` to enable horizontal auto-scrolling during drag operations and `dragMoveRafRef` to manage animation frames for scrolling.
*   **`useSensors`:** Configures the input sensors (`PointerSensor`, `TouchSensor`) for the drag-and-drop functionality.

## 4. User Interactions

*   **Create New Task:** Clicking the "New Task" button in the header navigates the user to the `TaskFormScreen`.
*   **Drag and Drop:** Users can click and drag any `KanbanTaskCard` to move it between `KanbanColumn`s. Releasing the card over a new column updates the task's status.
*   **Task Selection:** Clicking on a `KanbanTaskCard` (without dragging) navigates the user to the `TaskDetailScreen` for that task.
*   **Horizontal Scrolling:** Users can scroll horizontally to view all status columns if they extend beyond the viewport.

## 5. Validations

*   **Loading State:** A `Loader` is displayed in the center of the screen while tasks are being fetched.
*   **Empty State:** If `tasks.length` is 0, a `TaskEmptyState` component is displayed, prompting the user to create their first task.
*   **Status Update Logic:** The `handleDragEnd` function ensures that a task's status is only updated if it's dropped into a different column than its current status.
*   **Drag Constraints:** `PointerSensor` and `TouchSensor` are configured with `activationConstraint` to prevent accidental drags.
*   **Auto-scrolling:** The `handleDragMove` function implements logic to automatically scroll the board horizontally when a dragged item is near the edge, improving usability for wide boards.

## 6. Enhancements / UX Improvements

*   **Column Customization:** Allow users to add, remove, or reorder Kanban columns.
*   **Swimlanes:** Implement swimlanes to further categorize tasks (e.g., by assignee, project).
*   **Filtering/Sorting:** Add options to filter and sort tasks within each column.
*   **Quick Edit on Card:** Allow quick editing of task title or due date directly on the Kanban card.
*   **Context Menus:** Implement right-click context menus for task cards for quick actions.
*   **Visual Indicators:** Use color-coding or icons to highlight task priority or due dates on cards.
*   **Subtask Display:** Optionally display subtasks directly on the parent task card or as a collapsible section.
