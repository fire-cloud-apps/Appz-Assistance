# Finance Goal Investors Page

This document describes the `FinanceGoalInvestorsPage`, which allows users to manage and view details of their investors, including their total holdings across portfolios.

## 1. Features

*   **Investor Listing:** Displays a list of all registered investors.
*   **Total Holdings Calculation:** For each investor, calculates and displays the total current value of all associated portfolios.
*   **CRUD Operations:**
    *   **Add Investor:** Create new investor entries via a modal form.
    *   **Edit Investor:** Modify details of existing investors via a modal form.
    *   **Delete Investor:** Remove investor entries with a confirmation prompt.
*   **Investor Count:** Shows the total number of investors.
*   **Error Reporting:** Displays an alert if any errors occur during investor operations.

## 2. UI Components

The page utilizes Mantine UI components for layout, display, and interaction, along with custom components for specific investor functionalities.

*   **Layout & Structure:** `Box`, `Group`, `Stack` for organizing content.
*   **Information Display:** `Text`, `Title`, `Badge` for headings and total investor count.
*   **Controls:** `Button` for "Add Investor" action.
*   **Feedback & Status:** `Alert` for displaying error messages.
*   **Custom Components:**
    *   `InvestorsTable`: A custom component responsible for rendering the table of investors, including their total holdings, and actions for editing and deleting.
    *   `InvestorModal`: A modal form used for creating and editing investor entries.

## 3. Data Handling

*   **`useInvestor` Hook:** This custom hook provides:
    *   Access to the `investors` list.
    *   Functions for `addInvestor`, `updateInvestor`, `removeInvestor`.
    *   Error state (`error`).
*   **`usePortfolio` Hook:** Provides access to the `portfolios` list, which is used to calculate the `totalValue` for each investor by summing up the `currentValue` of all portfolios linked to that investor.
*   **Local State:** `useState` manages the modal's open/closed state and the currently selected investor for editing.
*   **Derived Data:** The `investorTotals` array is a derived state, created by mapping over the `investors` list and enriching each investor object with their calculated `totalValue`.

## 4. User Interactions

*   **Adding/Editing:** Clicking "Add Investor" or the edit action within the `InvestorsTable` opens the `InvestorModal`.
*   **Deleting:** Clicking the delete action within the `InvestorsTable` prompts a confirmation before removing an investor.
*   **Viewing Holdings:** Users can quickly see the aggregated value of investments for each investor.

## 5. Validations

*   **Delete Confirmation:** A `window.confirm` dialog is presented before an investor is deleted to prevent accidental data loss.
*   **Error Alerts:** Any errors encountered during investor operations (e.g., fetching, adding, updating, deleting) are displayed to the user via a Mantine `Alert` component.

## 6. Enhancements / UX Improvements

*   **Investor Details Page:** Implement a dedicated page for each investor to show a more detailed breakdown of their portfolios, goals, and SIPs.
*   **Filtering/Sorting:** Add filtering and sorting capabilities to the investors table (e.g., by name, total holdings).
*   **Search:** Allow searching investors by name or other identifiers.
*   **Associated Entities:** Display a quick count or link to the number of portfolios, goals, or SIPs associated with each investor directly in the table.
