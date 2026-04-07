# Notes Favorites Screen

This document describes the `NotesFavoritesScreen`, which provides a dedicated view for users to access and manage their notes that have been marked as favorites.

## 1. Features

*   **Favorite Notes Listing:** Displays a comprehensive list of all notes that the user has marked as favorites.
*   **Edit Note:** Allows users to navigate to the note editor directly from the list to modify existing favorite notes.
*   **Delete Note:** Provides an option to delete favorite notes from the list, with a confirmation step.
*   **Navigation to Note Editor:** Clicking on a favorite note in the list navigates the user to the `NotesEditorScreen` for that specific note.
*   **Loading State:** Displays a loading indicator while the list of favorite notes is being fetched.
*   **Empty State:** Presents a clear message and an icon when there are no notes marked as favorites.

## 2. UI Components

The screen utilizes Mantine UI components for layout and display, along with custom components for specific note functionalities.

*   **Layout & Structure:** `Box`, `Stack`, `Center` for organizing content.
*   **Information Display:** `Text` for headings and empty state messages.
*   **Loading Indicator:** `Loader` for indicating data fetching.
*   **Icons:** `Icon` from `@iconify/react` for the empty state message.
*   **Custom Components:**
    *   `NoteListItem`: Displays each individual favorite note in a consistent and clickable format, including edit and delete actions.
    *   `DeleteConfirmationModal`: A generic modal for confirming the deletion of a note.

## 3. Data Handling

*   **Data Fetching Hook (`useFavoriteNotes`):** This custom hook is responsible for:
    *   Fetching all notes that have the `isFavorite` flag set to `true`.
    *   Managing the `isLoading` state during data fetching.
    *   Providing the `favoriteNotes` array of `Note` objects.
*   **Data Mutation Hook (`useDeleteNote`):** Handles the mutation for moving a note to trash (logical deletion).
*   **Local State (`useState`):** Manages the state for the note deletion confirmation modal, including the `deleteNoteId`, `deleteNoteTitle`, and `isDeleteNoteModalOpen` flag.
*   **Navigation (`useNavigate`):** Used to programmatically navigate to the `NotesEditorScreen` or other parts of the application.

## 4. User Interactions

*   **Selecting a Note:** Clicking on any `NoteListItem` in the favorites list navigates the user to the `NotesEditorScreen` for that note.
*   **Editing a Note:** Clicking the edit action within a `NoteListItem` navigates to the `NotesEditorScreen`.
*   **Deleting a Note:** Clicking the delete action within a `NoteListItem` opens the `DeleteConfirmationModal`, prompting the user to confirm the deletion.
*   **Confirming Deletion:** Interacting with the `DeleteConfirmationModal` to confirm the deletion triggers the `deleteNote` mutation.

## 5. Validations

*   **Loading State:** A `Loader` is displayed in the center of the screen while favorite notes are being fetched, providing visual feedback.
*   **Empty State:** If `favoriteNotes.length` is 0, a "No favorite notes yet" message along with a star icon is displayed, clearly indicating that no notes have been marked as favorites.
*   **Deletion Confirmation:** The `DeleteConfirmationModal` is used to ensure users confirm their intention before a note is deleted, preventing accidental data loss.

## 6. Enhancements / UX Improvements

*   **Drag-and-Drop Reordering:** Allow users to reorder their favorite notes to prioritize them.
*   **Filtering/Sorting:** Add options to filter or sort favorite notes (e.g., by creation date, modification date, tags).
*   **Quick Unfavorite Action:** Provide a quick action (e.g., an icon button) within the `NoteListItem` to unmark a note as favorite without navigating to the editor.
*   **Context Menus:** Implement right-click context menus for `NoteListItem` for quick actions.
*   **Bulk Actions:** Allow selecting multiple favorite notes for bulk deletion or other actions.
