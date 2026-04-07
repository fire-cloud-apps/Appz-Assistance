# Finance Goal SIP Page

This document describes the `FinanceGoalSIPPage`, which allows users to manage and monitor their Systematic Investment Plans (SIPs).

## 1. Features

*   **SIP Listing:** Displays all recorded SIPs, categorized into "Active" and "Inactive" tabs for easy management.
*   **CRUD Operations:**
    *   **Add SIP:** Create new SIP entries via a modal form.
    *   **Edit SIP:** Modify details of existing SIPs via a modal form.
    *   **Delete SIP:** Remove SIP entries with a confirmation prompt.
*   **SIP Count:** Shows the total number of SIPs.
*   **Error Reporting:** Displays an alert if any errors occur during SIP operations.

## 2. UI Components

The page utilizes Mantine UI components for layout, display, and interaction, along with custom components for specific SIP functionalities.

*   **Layout & Structure:** `Box`, `Group`, `Stack` for organizing content.
*   **Information Display:** `Text`, `Title`, `Badge` for headings and total SIP count.
*   **Navigation:** `Tabs` component to switch between "Active" and "Inactive" SIP lists.
*   **Controls:** `Button` for "Add SIP" action.
*   **Feedback & Status:** `Alert` for displaying error messages.
*   **Custom Components:**
    *   `SIPTable`: A custom component responsible for rendering the table of SIPs, including edit and delete actions.
    *   `SIPModal`: A modal form used for creating and editing SIP entries.

## 3. Data Handling

*   **`useSIP` Hook:** This custom hook provides:
    *   Access to the `sips` list.
    *   Functions for `addSIP`, `updateSIP`, `removeSIP`.
    *   Error state (`error`).
*   **`useInvestor` Hook:** Provides the list of `investors` which is passed to the `SIPModal` for associating SIPs with investors.
*   **`usePortfolio` Hook & `useFinanceGoalStore`:** The `loadAllPortfolios` function from `usePortfolio` is called on component mount to ensure all portfolios are loaded. The `portfolios` list from `useFinanceGoalStore` is then used and passed to the `SIPModal` for associating SIPs with portfolios.
*   **Local State:** `useState` manages the modal's open/closed state and the currently selected SIP for editing.
*   **Memoization:** `useMemo` is used to efficiently filter the `sips` array into `activeSips` and `inactiveSips` based on their status.

## 4. User Interactions

*   **Adding/Editing:** Clicking "Add SIP" or the edit icon in the `SIPTable` opens the `SIPModal`.
*   **Deleting:** Clicking the delete icon in the `SIPTable` prompts a confirmation before removing an SIP.
*   **Tab Navigation:** Users can switch between "Active" and "Inactive" tabs to view different sets of SIPs.

## 5. Validations

*   **Delete Confirmation:** A `window.confirm` dialog is presented before an SIP is deleted to prevent accidental data loss.
*   **Error Alerts:** Any errors encountered during SIP operations (e.g., fetching, adding, updating, deleting) are displayed to the user via a Mantine `Alert` component.

## 6. Enhancements / UX Improvements

*   **SIP Performance Tracking:** Integrate features to track the performance of individual SIPs over time.
*   **SIP Reminders:** Implement notifications or reminders for upcoming SIP installments.
*   **Bulk Actions:** Allow for bulk updates or deletions of SIPs.
*   **Filtering/Sorting:** Add more filtering options (e.g., by portfolio, amount) and sorting capabilities to the SIP table.
*   **Visual Indicators:** Use visual indicators (e.g., color-coded badges) to highlight SIPs that are due soon or have missed payments.
