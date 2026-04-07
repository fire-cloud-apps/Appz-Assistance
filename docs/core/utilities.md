# Utilities

This document describes the common utility functions and helper modules available in the application. These utilities provide reusable logic for various cross-cutting concerns such as date manipulation, ID generation, data formatting, and other general-purpose tasks.

## Location

General-purpose utility functions are primarily located in the `src/core/utils` directory. Module-specific utilities that are not intended for broader use should reside within that module's `utils` subdirectory (if any).

## Principles for Utilities

*   **Pure Functions:** Utilities should ideally be pure functions, meaning they produce the same output for the same input and have no side effects.
*   **Single Responsibility:** Each utility function should perform a single, well-defined task.
*   **Testability:** Utilities should be easily testable in isolation.
*   **No UI Dependencies:** Utility functions should not have direct dependencies on UI components or React hooks.

## List of Core Utilities

Here's a list of key utility modules and their functionalities:

### 1. `dateHelper.ts`

*   **Description:** Provides functions for common date and time operations, leveraging the [Day.js](https://day.js.org/) library.
*   **Functionalities:**
    *   Formatting dates and times into various display formats.
    *   Parsing date strings into `Day.js` objects.
    *   Calculating differences between dates (e.g., days, hours, minutes).
    *   Adding or subtracting time units from dates.
    *   Checking if a date is within a certain range.
    *   Converting between different time zones (if applicable).
*   **Usage:** Used throughout the application for displaying dates, scheduling, and any date-related logic.

### 2. `idGenerator.ts`

*   **Description:** Provides functions for generating unique identifiers.
*   **Functionalities:**
    *   Generating UUIDs (Universally Unique Identifiers) using the `uuid` library.
    *   Potentially other forms of unique ID generation if needed (e.g., short IDs).
*   **Usage:** Essential for creating new entities (tasks, notes, goals) that require a unique primary key, especially before persistence to a database.

### 3. `index.ts` (Barrel File)

*   **Description:** This file typically serves as a barrel file, re-exporting functions and types from other utility files within the `src/core/utils` directory.
*   **Usage:** Simplifies imports for consumers of the utility module (e.g., `import { formatDate, generateId } from '@/core/utils';`).

### 4. `recurrenceHelper.ts`

*   **Description:** Contains logic for handling recurring events or tasks.
*   **Functionalities:**
    *   Defining recurrence patterns (e.g., daily, weekly, monthly, custom intervals).
    *   Calculating future occurrences based on a given start date and recurrence rule.
    *   Checking if a specific date falls within a recurrence pattern.
*   **Usage:** Primarily used in modules like `task_manager` for scheduling recurring tasks or `finance-goal` for recurring investments (SIPs).

## Other Common Utility Patterns

While not explicitly in `src/core/utils`, the following patterns are common:

*   **Validation Utilities:** Although `zod` is used for schema validation, smaller, ad-hoc validation functions might exist for specific input checks.
*   **Data Transformation/Formatting:** Functions to transform data structures (e.g., flattening nested objects, converting arrays to maps) or format data for display (e.g., currency, percentages).
*   **Local Storage/Session Storage Helpers:** Functions to abstract interactions with `localStorage` or `sessionStorage`, providing type-safe access and error handling.
*   **File Parsing/Handling:** Utilities for reading or processing local files (e.g., parsing CSV, JSON, or Excel files for import/export functionality, potentially using `xlsx` library).

## Adding New Utilities

When a new utility function is needed:

1.  **Evaluate Scope:** Determine if the utility is truly generic and reusable across the application. If it's highly specific to a single module, it should reside within that module.
2.  **Create New File:** Create a new `.ts` file in `src/core/utils` (e.g., `newUtility.ts`).
3.  **Implement and Test:** Write the utility function(s) and ensure they are thoroughly tested.
4.  **Export:** Export the function(s) from the new file and potentially re-export them from `src/core/utils/index.ts` for easier access.
5.  **Document:** Add a description of the new utility to this document.
