# Break Timer Settings Screen

This document details the `BreakTimerSettingsScreen`, which allows users to configure their break timer preferences.

## 1. Features

*   **Configure Break Interval:** Users can set the duration (in minutes) for work intervals before a break reminder.
*   **Define Working Hours:** Users can specify the start and end times of their typical workday, ensuring break reminders only occur within these hours.
*   **Toggle Break Timer:** A switch to enable or disable the entire break timer functionality. When disabled, no notifications will be shown.
*   **Save Settings:** Persist the configured break timer settings.
*   **Cancel Changes:** Discard any unsaved changes and navigate back to the previous screen.
*   **Display Timer Status:** Visually indicates whether the break timer is currently active or disabled.
*   **User Feedback:** Provides notifications for successful saves and timer status changes.

## 2. UI Components

The screen is built using various components from the Mantine UI library to ensure a consistent and accessible user experience.

*   **Layout:** `Container`, `Paper`, `Stack`, `Group` for structuring the content.
*   **Headings:** `Title` and `Text` for screen title and descriptive text.
*   **Form Inputs:**
    *   `NumberInput`: For the "Break Interval (minutes)".
    *   `TextInput`: For "Working Hours Start (HH:MM)" and "Working Hours End (HH:MM)".
*   **Controls:**
    *   `Switch`: To toggle the "Break Timer Status" (ON/OFF).
    *   `Button`: "Save Settings" and "Cancel" actions.
*   **Visual Separators:** `Divider` to visually separate sections.
*   **Status Indicator:** A `Paper` component with dynamic background color and text to show the current status of the break timer (active/disabled).

## 3. Data Handling

*   **Form State Management:** The `useForm` hook from `@mantine/form` is used to manage the state of the form fields (`breakInterval`, `workingHoursStart`, `workingHoursEnd`).
    *   `initialValues`: Default values are provided, including `id: 'default'` and timestamps.
*   **Loading Settings:**
    *   An `useEffect` hook is used to asynchronously load existing break settings when the component mounts.
    *   `getBreakSettingsUseCase.execute()` is called to retrieve the `BreakSettings` from the data layer (IndexedDB).
    *   The retrieved settings are then used to populate the form fields via `form.setValues()`.
*   **Saving Settings:**
    *   The `handleSubmit` function is triggered upon form submission.
    *   It calls `updateBreakSettingsUseCase.execute(values)` to persist the updated settings to the data layer.
    *   `useBreakTimer().updateBreakSettings(values)` is called to update the active timer with the new settings.
*   **Timer Control:** The `useBreakTimer` hook provides functions like `stopTimer()` to manage the background break timer worker.
*   **Notifications:** The `@mantine/notifications` system is used to display transient messages to the user (e.g., "Settings Saved", "Break Timer Disabled").

## 4. User Interactions

*   **Input Fields:** Users can type numerical values into the `NumberInput` and time strings into the `TextInput` fields.
*   **Toggle Switch:** Users can click the `Switch` component to enable or disable the break timer. This action immediately updates the timer's status and triggers a notification.
*   **Save Button:** Clicking "Save Settings" submits the form, persists changes, and updates the active timer. This button is disabled if the timer is currently disabled.
*   **Cancel Button:** Clicking "Cancel" navigates the user back to the previous screen without saving any changes.

## 5. Validations

*   **Break Interval:** The `NumberInput` for "Break Interval (minutes)" has a `min={1}` constraint, preventing users from entering zero or negative values.
*   **Working Hours Format:** While not explicitly defined in the `useForm` validation schema within this file, the `TextInput` fields for "Working Hours Start" and "Working Hours End" are expected to adhere to the `HH:MM` format. It is assumed that either the `TextInput` component itself or a validation rule (e.g., via Zod schema in `useForm`) would enforce this format.
*   **Save Button State:** The "Save Settings" button is disabled when the `isTimerEnabled` state is `false`, preventing settings from being saved for a disabled timer.

## 6. Enhancements / UX Improvements

*   **Real-time Time Input Validation:** Implement more robust real-time validation for the `HH:MM` format in `TextInput` fields, providing immediate feedback to the user.
*   **Time Picker:** Replace `TextInput` for working hours with a dedicated time picker component (e.g., from `@mantine/dates`) for a more user-friendly and error-proof input experience.
*   **Confirmation Dialog:** For disabling the timer, a small confirmation dialog could be added to prevent accidental toggling.
*   **Visual Feedback for Disabled Fields:** Ensure that disabled input fields are clearly distinguishable from enabled ones.
*   **Accessibility:** Ensure all form elements have proper `aria-labels` or are correctly associated with their labels for screen reader users.
