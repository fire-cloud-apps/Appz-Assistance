# Finance Goal Goals Page

This document describes the `FinanceGoalGoalsPage`, which allows users to define, track, and manage their financial goals.

## 1. Features

*   **Goal Listing:** Displays a comprehensive list of all defined financial goals.
*   **CRUD Operations:**
    *   **Add Goal:** Create new financial goals via a modal form.
    *   **Edit Goal:** Modify details of existing goals via a modal form.
    *   **Delete Goal:** Remove goals with a confirmation prompt.
*   **Goal Count:** Shows the total number of financial goals.
*   **Goal Forecasting:** Integrates and displays forecasts related to each goal, helping users understand their progress and potential outcomes.
*   **Error Reporting:** Displays an alert if any errors occur during goal operations or forecast calculations.

## 2. UI Components

The page utilizes Mantine UI components for layout, display, and interaction, along with custom components for specific goal functionalities.

*   **Layout & Structure:** `Box`, `Group`, `Stack` for organizing content.
*   **Information Display:** `Text`, `Title`, `Badge` for headings and total goal count.
*   **Controls:** `Button` for "Add Goal" action.
*   **Feedback & Status:** `Alert` for displaying error messages.
*   **Custom Components:**
    *   `GoalsList`: A custom component responsible for rendering the list of goals, including their progress, forecasts, and actions for editing and deleting.
    *   `GoalModal`: A modal form used for creating and editing financial goals.

## 3. Data Handling

*   **`useGoals` Hook:** This custom hook provides:
    *   Access to the `goals` list.
    *   Functions for `addGoal`, `updateGoal`, `removeGoal`.
    *   Error state (`error`).
*   **`useInvestor`, `useSIP`, `usePortfolio` Hooks:** These hooks are used to fetch and provide the necessary data (investors, SIPs, portfolios) that might be linked to a financial goal. `loadAllPortfolios` is called on mount to ensure portfolio data is available, and `useFinanceGoalStore` provides access to the `portfolios` list. This data is passed to the `GoalModal` and `GoalsList` for context.
*   **`useGoalForecasts` Hook:** This hook calculates and provides `forecasts` for the given goals, including any associated errors.
*   **Local State:** `useState` manages the modal's open/closed state and the currently selected goal for editing.
*   **`useEffect`:** Used to ensure all portfolios are loaded when the component mounts, as they are a dependency for goal management.

## 4. User Interactions

*   **Adding/Editing:** Clicking "Add Goal" or the edit action within the `GoalsList` opens the `GoalModal`.
*   **Deleting:** Clicking the delete action within the `GoalsList` prompts a confirmation before removing a goal.
*   **Viewing Progress:** Users can view the progress and forecasts for each of their financial goals.

## 5. Validations

*   **Delete Confirmation:** A `window.confirm` dialog is presented before a goal is deleted to prevent accidental data loss.
*   **Error Alerts:** Any errors encountered during goal operations (e.g., fetching, adding, updating, deleting) or during forecast calculations are displayed to the user via a Mantine `Alert` component.

## 6. Enhancements / UX Improvements

*   **Goal Prioritization:** Allow users to prioritize their goals.
*   **Scenario Planning:** Implement tools for users to model different investment scenarios for their goals.
*   **Visual Goal Timelines:** Display goals on a timeline to visualize their deadlines and progress.
*   **Goal Categories:** Allow categorization of goals (e.g., short-term, long-term, retirement).
*   **Detailed Forecast Breakdown:** Provide a more detailed breakdown of how forecasts are calculated.
