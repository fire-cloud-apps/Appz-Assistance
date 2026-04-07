# UI/UX Guidelines

This document outlines the principles and guidelines for designing and implementing the user interface (UI) and user experience (UX) of the application. It emphasizes consistency, usability, and accessibility, leveraging the [Mantine](https://mantine.dev/) component library.

## UI/UX Principles

*   **Clarity:** Information should be presented clearly and concisely, making it easy for users to understand.
*   **Consistency:** Maintain a consistent look, feel, and behavior across the entire application. This includes typography, colors, spacing, component usage, and interaction patterns.
*   **Efficiency:** Design workflows that allow users to complete tasks quickly and with minimal effort.
*   **Feedback:** Provide immediate and clear feedback to users about their actions and the system's status (e.g., loading indicators, success messages, error notifications).
*   **Forgiveness:** Allow users to easily recover from errors, providing clear error messages and options to undo actions.
*   **Accessibility:** Ensure the application is usable by people with diverse abilities, adhering to WCAG guidelines.

## Design Consistency Rules

### 1. Component Library Usage

*   **Mantine First:** Always prioritize using components from the [Mantine UI library](https://mantine.dev/components/overview/). This ensures a consistent visual language and behavior.
*   **Custom Components:** Create custom components only when a suitable Mantine component does not exist or cannot be adequately customized. Custom components should follow Mantine's design philosophy.
*   **Props and Variants:** Utilize Mantine's extensive prop system and variants to achieve desired visual styles and behaviors without resorting to custom CSS where possible.

### 2. Theming and Styling

*   **Centralized Theme:** The application's theme is defined in `src/core/theme/appTheme.ts`. All styling should adhere to the values defined in this theme (colors, spacing, font sizes, etc.).
*   **CSS Modules:** For component-specific styling that cannot be achieved with Mantine props or theme overrides, use CSS Modules (`.module.css`). This scopes styles locally and prevents global style conflicts.
*   **Avoid Inline Styles:** Minimize the use of inline styles (`style={{...}}`) as they can be difficult to maintain and override.
*   **Responsive Design:** Design and implement components to be responsive, adapting gracefully to different screen sizes and orientations. Mantine's responsive props and hooks should be utilized.

### 3. Typography

*   **Font Family:** Use the font family defined in `appTheme.ts`.
*   **Headings:** Use Mantine's `Title` component for headings (h1-h6) and adhere to the defined sizes and weights.
*   **Body Text:** Use Mantine's `Text` component for paragraphs and general text, utilizing its `size` and `weight` props.

### 4. Color Palette

*   **Theme Colors:** Only use colors defined in the Mantine theme palette. Avoid hardcoding hex codes or RGB values.
*   **Semantic Colors:** Use colors semantically (e.g., `primary`, `secondary`, `error`, `success`, `warning`) to convey meaning consistently.

### 5. Spacing and Layout

*   **Mantine Spacing:** Use Mantine's `Space`, `Stack`, `Group`, `Flex`, and `Grid` components, along with spacing props (e.g., `p`, `m`, `gap`), to manage layout and spacing. These props map to values defined in the theme.
*   **Consistent Gaps:** Maintain consistent spacing between elements and sections to create a clean and organized layout.

### 6. Iconography

*   **Iconify:** Use icons from the [Iconify](https://iconify.design/) library via the `@iconify/react` component.
*   **Consistent Sizing:** Maintain consistent icon sizing within a context (e.g., all icons in a navigation bar should be the same size).

## Accessibility Considerations (A11y)

Accessibility is a core aspect of the application's UI/UX. Mantine components are generally built with accessibility in mind, but developers must ensure custom implementations also adhere to these principles.

*   **Semantic HTML:** Use appropriate HTML elements for their intended purpose (e.g., `<button>` for buttons, `<nav>` for navigation).
*   **Keyboard Navigation:** Ensure all interactive elements are reachable and operable via keyboard.
    *   Use `tabIndex` appropriately for custom interactive elements.
    *   Manage focus effectively, especially in modals and complex widgets.
*   **ARIA Attributes:** Use ARIA (Accessible Rich Internet Applications) attributes when semantic HTML alone is insufficient to convey meaning to assistive technologies (e.g., `aria-label`, `aria-describedby`, `role`).
*   **Color Contrast:** Ensure sufficient color contrast between text and background elements to meet WCAG 2.1 AA standards. The theme's color palette should be designed with this in mind.
*   **Form Labels:** All form fields must have associated labels. Use Mantine's `Input.Wrapper` or `label` prop for form components.
*   **Alternative Text for Images:** Provide meaningful `alt` text for all informative images.
*   **Focus Indicators:** Ensure visible focus indicators for all interactive elements. Mantine handles this by default for its components.
*   **Dynamic Content Updates:** For dynamic content updates (e.g., notifications, live regions), use ARIA live regions (`aria-live`) to announce changes to screen reader users.
