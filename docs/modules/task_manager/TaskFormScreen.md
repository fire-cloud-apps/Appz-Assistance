# Task Form Screen

This document describes the `TaskFormScreen`, which serves as a versatile interface for both creating new tasks and editing existing ones. It allows users to define all relevant properties of a task, including its recurrence and hierarchical relationships.

## 1. Features

*   **Create New Task:** Provides a form to define and create a brand new task.
*   **Edit Existing Task:** Pre-fills the form with an existing task's details, allowing for modifications.
*   **Title & Description Input:** Fields for entering the task's title (required) and a detailed description (supports multi-line text and tabs).
*   **Status Selection:** A dropdown to set the task's current status (e.g., "Pending", "InProgress", "Completed", "Cancelled").
*   **Priority Selection:** A dropdown to assign a priority level to the task ("Low", "Medium", "High", "Critical").
*   **Due Date & Time Pickers:** Intuitive controls for selecting a due date and an optional specific due time for the task.
*   **Recurrence Configuration:**
    *   A dedicated section to define if a task should repeat.
    *   Opens a `RecurrencePicker` modal to set complex recurrence patterns (e.g., daily, weekly, monthly) and an optional end date for the recurrence.
    *   Displays a human-readable label for the selected recurrence pattern.
    *   Option to clear the recurrence pattern.
*   **Parent Task Assignment:** A dropdown to select an existing task as a parent, thereby making the current task a subtask.
*   **Task Completion Logic:** Integrates special handling for marking tasks as "Completed", particularly for recurring tasks, ensuring that new instances are generated correctly.
*   **Form Submission & Cancellation:** Buttons to submit the form (creating or updating the task) or cancel the operation and return to the previous screen.
*   **Loading State:** Displays a loading overlay when fetching an existing task's data for editing.

## 2. UI Components

The screen utilizes Mantine UI components for layout, input, and display, along with a custom recurrence picker.

*   **Layout & Structure:** `Container`, `Stack`, `Group` for organizing form elements.
*   **Headings:** `Title` for the screen's main heading.
*   **Input Fields:**
    *   `TextInput`: For the task title.
    *   `Textarea`: For the task description.
    *   `Select`: For task status, priority, and parent task selection.
*   **Date & Time Pickers:** `DateInput` and `TimeInput` from `@mantine/dates` for setting due dates and times.
*   **Controls:** `Button` for "Cancel", "Create Task", "Update Task", and opening the recurrence picker.
*   **Feedback & Status:** `LoadingOverlay` for data fetching, `Badge` for displaying recurrence label.
*   **Custom Components:**
    *   `RecurrencePicker`: A modal component for detailed recurrence pattern configuration.

## 3. Data Handling

*   **Form Management (`react-hook-form`):**
    *   `useForm` hook manages the form's state, input values, and validation.
    *   `zodResolver` integrates `createTaskSchema` for schema-based validation.
    *   `register`, `handleSubmit`, `reset`, `setValue`, `watch` are used for form control.
*   **URL Parameters (`useParams`):** Extracts the `id` of the task from the URL to determine if the form is in "edit" mode.
*   **Data Fetching Hooks:**
    *   `useTaskById(taskId)`: Fetches the details of the task to be edited.
    *   `useParentTasks()`: Fetches a list of potential parent tasks for subtask assignment.
*   **Data Mutation Hooks:**
    *   `useCreateTask()`: Handles the mutation for creating a new task.
    *   `useUpdateTask()`: Handles the mutation for updating an existing task.
    *   `useCompleteTaskWithRecurrence()`: Used when a recurring task's status is changed to "Completed", ensuring proper recurrence handling.
*   **Local State (`useState`):** Manages the visibility of the `RecurrencePicker` modal, the `recurrencePattern`, `recurrenceEndDate`, and `dueTime`.
*   **`useEffect` Hooks:**
    *   Populates the form fields with `taskToEdit` data when in "edit" mode.
    *   Resets the form to default values when creating a new task.
*   **Utility Functions:**
    *   `getToday()`: From `dateHelper`, used to set the minimum selectable due date.
    *   `getRecurrenceLabel()`: From `recurrenceHelper`, used to display a human-readable recurrence summary.

## 4. User Interactions

*   **Form Input:** Users fill in text fields, select options from dropdowns, and pick dates/times.
*   **Recurrence Configuration:** Clicking the "Repeat" button opens the `RecurrencePicker` modal, where users can define complex recurrence rules.
*   **Form Submission:** Clicking "Create Task" or "Update Task" submits the form, triggering the appropriate data mutation.
*   **Form Cancellation:** Clicking "Cancel" discards any changes and navigates back to the previous screen.
*   **Description Tab Handling:** The `Textarea` for description has a custom `onKeyDown` handler to insert a tab character when the Tab key is pressed.

## 5. Validations

*   **Schema Validation:** `zodResolver` with `createTaskSchema` enforces validation rules (e.g., required fields, data types) for all form inputs. Error messages are displayed below the respective fields.
*   **Required Fields:** The "Title" field is marked as required.
*   **Minimum Due Date:** The `DateInput` for "Due Date" prevents selecting dates prior to today.
*   **Submission State:** The submit and cancel buttons are disabled while the form is being submitted (`isSubmitting`).
*   **Loading Overlay:** A `LoadingOverlay` is displayed while `taskToEdit` data is being fetched, preventing user interaction with an incomplete form.
*   **Recurring Task Completion Logic:** The `onSubmit` function contains specific logic to differentiate between regular task updates and the completion of recurring tasks, ensuring that `completeTaskWithRecurrence` is called when appropriate.

## 6. Enhancements / UX Improvements

*   **Rich Text Editor for Description:** Replace the `Textarea` with a rich text editor (like Tiptap) for more advanced formatting options in the task description.
*   **Dynamic Due Date/Time Validation:** Implement more sophisticated validation for due dates and times (e.g., ensuring due time is after current time if due date is today).
*   **Task Group Selection:** Allow assigning tasks to predefined groups directly from the form.
*   **Attachments:** Add functionality to attach files or links to tasks.
*   **Assignee/Collaborator Selection:** For multi-user systems, add fields to assign tasks to specific users.
*   **Pre-fill Parent Task:** If the form is opened from a context where a parent task is known (e.g., "Add Subtask" from `TaskDetailScreen`), pre-fill the `parentTaskId` field.
*   **Form Progress Indicator:** For long forms, a progress indicator or step-by-step wizard could improve UX.
