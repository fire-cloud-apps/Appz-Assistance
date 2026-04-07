# Reusable Components

This document outlines the shared and reusable UI components available in the application. These components are designed to promote consistency, accelerate development, and ensure maintainability across different modules and screens.

## Location

Reusable components are primarily located in the `src/core/components` directory. Components specific to a particular module should reside within that module's `presentation/components` directory.

## Principles for Reusable Components

*   **Generality:** Components should be designed to be as generic as possible, accepting props to customize their behavior and appearance rather than hardcoding specific logic or data.
*   **Single Responsibility:** Each component should ideally do one thing well.
*   **Composition:** Complex UIs should be built by composing smaller, simpler reusable components.
*   **Accessibility:** All reusable components must adhere to accessibility best practices (as outlined in `ui-guidelines.md`).
*   **Theming:** Components should integrate seamlessly with the application's Mantine theme.

## List of Core Reusable Components

Here's a list of some key reusable components found in `src/core/components` and common patterns:

### 1. `AboutModal.tsx`

*   **Description:** A modal dialog used to display information about the application, such as version number, legal notices, or credits.
*   **Usage:** Typically triggered from a settings menu or help section.
*   **Props:** Likely accepts props for controlling visibility and potentially content.

### 2. `NotificationBell.tsx`

*   **Description:** A UI element, typically an icon (bell), that indicates the presence of unread notifications. It often includes a badge displaying the count of new notifications.
*   **Usage:** Placed in the application header or a prominent location for quick access to notifications.
*   **Props:** `count` (number of unread notifications), `onClick` (handler for opening the notifications screen/panel).

### 3. `StatusIcon.tsx`

*   **Description:** A generic icon component that visually represents a status (e.g., success, error, warning, pending).
*   **Usage:** Can be used in lists, tables, or detail views to quickly convey the state of an item.
*   **Props:** `status` (enum or string representing the status), `size`, `color`.

### Common Reusable UI Patterns (often implemented with Mantine components)

Beyond explicitly defined components, the application leverages Mantine's rich set of components to create consistent UI patterns:

*   **Buttons:** `Button` component for all interactive actions.
    *   **Variants:** Primary, secondary, outline, subtle, danger, etc.
    *   **States:** Loading, disabled.
*   **Inputs & Forms:** `TextInput`, `Textarea`, `Select`, `Checkbox`, `Radio`, `DatePicker`, `NumberInput`, etc., from Mantine.
    *   **Validation:** Integrated with `react-hook-form` and `zod` for consistent validation feedback.
*   **Modals & Drawers:** `Modal` and `Drawer` components for overlay content.
    *   **Confirmation Dialogs:** Standardized modals for confirming destructive actions (e.g., delete).
*   **Notifications:** `notifications` system from `@mantine/notifications` for toast messages (success, error, info).
*   **Loaders:** `Loader` component for indicating loading states.
*   **Layout Components:** `Stack`, `Group`, `Flex`, `Grid`, `Container`, `Paper` for consistent spacing and layout.
*   **Typography:** `Title` and `Text` components for consistent headings and body text.
*   **Avatars:** `Avatar` component for user profiles or generic placeholders.
*   **Badges & Tags:** `Badge` component for displaying small, informative labels.
*   **Tables:** `Table` component for displaying tabular data.
*   **Dropdowns & Menus:** `Menu` and `Select` components for contextual actions and selections.

## Creating New Reusable Components

When creating a new reusable component:

1.  **Check Existing:** First, check if a similar component already exists in `src/core/components` or if a Mantine component can be adapted.
2.  **Design for Generality:** Think about how the component can be used in different contexts.
3.  **Define Clear API (Props):** Use TypeScript to define clear and well-documented props.
4.  **Test:** Write unit tests for the component to ensure its reliability.
5.  **Document:** Add a brief description and usage examples to this document or a dedicated component storybook (if implemented).
