# Finance Goal Portfolio Page

This document describes the `FinanceGoalPortfolioPage`, which allows users to manage and track their investment portfolios.

## 1. Features

*   **Portfolio Listing:** Displays all investment portfolios in a paginated and filterable table.
*   **CRUD Operations:**
    *   **Add Portfolio:** Create new portfolio entries via a modal form.
    *   **Edit Portfolio:** Modify existing portfolio details via a modal form.
    *   **Delete Portfolio:** Remove portfolio entries with a confirmation prompt.
*   **Data Export:** Export all portfolio records to a JSON file for backup or external analysis.
*   **Data Import:** Import portfolio data from JSON or Excel (`.xlsx`, `.xls`) files, with progress and summary feedback.
*   **Filtering:** Filter the portfolio list by:
    *   **Investor:** Select a specific investor to view their associated portfolios.
    *   **AMC (Asset Management Company):** Filter portfolios by the AMC name.
*   **Searching:** Search portfolios by scheme name.
*   **Pagination:** Navigate through large sets of portfolio records.
*   **Import Status & Errors:** Provides visual feedback on import progress and displays any errors or warnings during import or other portfolio operations.

## 2. UI Components

The page utilizes a combination of Mantine UI components for layout, input, and display, along with custom components for specific functionalities.

*   **Layout & Structure:** `Box`, `Group`, `Stack` for organizing content.
*   **Information Display:** `Text`, `Title`, `Badge` for headings and summary counts.
*   **Input & Controls:**
    *   `TextInput`: For searching portfolios by scheme name.
    *   `Select`: For filtering by investor and AMC.
    *   `Button`: For "Add Portfolio", "Export JSON", "Import", and "Clear Filters" actions.
    *   `Anchor`: Provides a link to download a CAS sample for import guidance.
*   **Feedback & Status:**
    *   `Alert`: Displays error messages and import summaries.
    *   `Progress`: Shows the progress of the import operation.
*   **Custom Components:**
    *   `StatusIcon`: Used within buttons for visual cues.
    *   `PortfolioTable`: A custom component responsible for rendering the paginated and interactive table of portfolios, including edit and delete actions.
    *   `PortfolioModal`: A modal form used for creating and editing portfolio entries.
*   **Hidden Input:** A hidden `<input type="file" />` element is used to trigger the file selection dialog for imports.

## 3. Data Handling

*   **`usePortfolio` Hook:** This custom hook is central to data management, providing:
    *   Access to the `portfolios` list.
    *   Functions for `addPortfolio`, `updatePortfolio`, `removePortfolio`.
    *   Pagination state (`page`, `pageSize`, `total`, `totalPages`) and controls (`changePage`, `changePageSize`).
    *   Filtering state (`filters`) and controls (`applyFilters`, `clearFilters`).
    *   Error state (`error`).
    *   `reload` function to refresh portfolio data.
*   **`useInvestor` Hook:** Provides the list of `investors` which is used to populate the investor filter `Select` component and passed to the `PortfolioModal`.
*   **`useFinanceGoalStore`:** Used to dynamically derive the list of unique AMC names for the AMC filter.
*   **Import/Export Services:**
    *   `exportPortfolioRecords()`: Fetches data for export.
    *   `downloadPortfolioExport()`: Triggers the download of the exported JSON file.
    *   `importPortfolioJsonFile()`: Parses and processes JSON import files.
    *   `importPortfolioExcelFile()`: Parses and processes Excel import files.
*   **Local State:** `useState` manages the modal's open/closed state, the currently selected portfolio for editing, import messages, and import progress. `useRef` is used to control the hidden file input.
*   **Memoization:** `useMemo` optimizes the generation of `investorOptions` and `amcOptions` to prevent unnecessary re-calculations.

## 4. User Interactions

*   **Adding/Editing:** Clicking "Add Portfolio" or the edit icon in the table opens the `PortfolioModal`.
*   **Deleting:** Clicking the delete icon in the table prompts a confirmation before removing a portfolio.
*   **Exporting:** Clicking "Export JSON" initiates a file download.
*   **Importing:** Clicking "Import" opens the file selection dialog. After selecting a file, the import process begins, showing progress and a summary.
*   **Filtering/Searching:** Typing in the search box or selecting options from the filter dropdowns dynamically updates the displayed portfolio list.
*   **Pagination:** Users interact with pagination controls to navigate through pages of portfolios.
*   **Clearing Filters:** Clicking "Clear Filters" removes all active filters and search terms.

## 5. Validations

*   **Delete Confirmation:** A `window.confirm` dialog is presented before a portfolio is deleted to prevent accidental data loss.
*   **Error Alerts:** Any errors encountered during portfolio operations (e.g., fetching, adding, updating, deleting) are displayed to the user via a Mantine `Alert` component.
*   **Import Feedback:** The import process provides detailed messages, including the number of created/updated portfolios and investors, rejected records, and any warnings.
*   **File Type Check:** The `handleFileChange` function implicitly checks for `.xlsx`, `.xls`, or `.json` file extensions.

## 6. Enhancements / UX Improvements

*   **Bulk Actions:** Implement features for bulk import/export or bulk deletion of portfolios.
*   **Advanced Filtering:** Add more sophisticated filtering options (e.g., by date, value range).
*   **Sorting:** Allow users to sort the portfolio table by different columns.
*   **Drag-and-Drop Import:** Provide a drag-and-drop area for importing files.
*   **Visual Feedback for Empty State:** Display a more engaging message or illustration when no portfolios are found or after applying filters that yield no results.
*   **Detailed Import Error Reporting:** For Excel imports, provide more specific line-by-line error details if possible.
