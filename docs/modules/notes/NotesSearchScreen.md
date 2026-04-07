# Notes Search Screen

This document describes the `NotesSearchScreen`, which provides functionality for users to search across all their notes and view the results.

## 1. Features

*   **Full-Text Search:** Allows users to search for notes based on keywords or phrases across note titles and content.
*   **Dynamic Search:** The search is performed as the user types, and results are updated in real-time.
*   **Search Results List:** Displays matching notes in a list format, showing key information for each note.
*   **Result Count:** Informs the user about the number of notes found for the current query.
*   **Loading Indicator:** Provides visual feedback while the search operation is in progress.
*   **No Results Message:** Displays a clear message when no notes match the search query.
*   **Navigation to Note Editor:** Clicking on a search result navigates the user directly to the `NotesEditorScreen` for that specific note.
*   **URL Integration:** The search query is reflected in the URL, allowing users to share search results or bookmark specific searches.

## 2. UI Components

The screen utilizes Mantine UI components for layout, input, and display, along with a custom component for displaying note items.

*   **Layout & Structure:** `Box`, `Stack`, `Center` for organizing content.
*   **Information Display:** `Text` for headings, result count, loading status, and no-results messages.
*   **Input:** `TextInput` for entering the search query, with a search icon.
*   **Loading Indicator:** `Loader` for indicating data fetching.
*   **Icons:** `Icon` from `@iconify/react` for the search input.
*   **Custom Components:**
    *   `NoteListItem`: Displays each individual note result in a consistent and clickable format.

## 3. Data Handling

*   **URL Parameters:** `useSearchParams` hook is used to read the `q` (query) parameter from the URL, which represents the current search term.
*   **Search Hook (`useSearchNotes`):** A custom hook (`useSearchNotes(query)`) is responsible for:
    *   Triggering the search operation based on the provided `query`.
    *   Fetching matching notes from the data layer.
    *   Managing the `isLoading` state during the search.
    *   Providing the `results` array of `Note` objects.
*   **Navigation (`useNavigate`):** Used to programmatically update the URL with the new search query and to navigate to the `NotesEditorScreen` when a result is selected.

## 4. User Interactions

*   **Typing Search Query:** Users type their search terms into the `TextInput`. The `onChange` event handler updates the URL's `q` parameter, which in turn triggers the `useSearchNotes` hook to perform a new search.
*   **Selecting a Result:** Clicking on any `NoteListItem` in the search results navigates the user to the `NotesEditorScreen` for that note, allowing them to view or edit its content.

## 5. Validations

*   **Loading State:** A `Loader` is displayed in the center of the screen while the search operation is in progress, providing clear visual feedback.
*   **No Results Feedback:** If a query has been entered but `results.length` is 0, a "No notes found" message is displayed, indicating that the search yielded no matches.
*   **URL Encoding:** The search query is `encodeURIComponent` to ensure it is safely passed in the URL.

## 6. Enhancements / UX Improvements

*   **Search Filters:** Add options to filter search results by tags, folders, creation date, or modification date.
*   **Highlighting Matches:** Highlight the search terms within the displayed note titles or snippets in the search results.
*   **Search History/Suggestions:** Provide a list of recent searches or suggestions as the user types.
*   **Advanced Search Syntax:** Support for advanced search operators (e.g., "AND", "OR", "NOT", exact phrases).
*   **Snippet Display:** Show a small snippet of the note content where the search term was found, rather than just the title.
*   **Keyboard Navigation:** Enhance keyboard navigation for quickly browsing search results.
