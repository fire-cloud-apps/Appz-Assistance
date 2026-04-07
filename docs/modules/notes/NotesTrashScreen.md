# Notes Trash Screen

This document describes the `NotesTrashScreen`, which provides a dedicated area for users to manage their deleted notes. Notes moved to trash can either be restored or permanently deleted.

## 1. Features

*   **Deleted Notes Listing:** Displays a list of all notes that have been logically deleted (moved to the trash).
*   **Restore Note:** Allows users to restore a deleted note, moving it back to its original folder or a default location.
*   **Permanently Delete Note:** Provides an option to permanently remove a note from the system, making it unrecoverable.
*   **Deletion Date Display:** Shows the date when each note was deleted, providing context for its presence in the trash.
*   **Loading State:** Displays a loading indicator while the list of deleted notes is being fetched.
*   **Empty Trash Message:** Presents a clear message and an icon when the trash is empty.

## 2. UI Components

The screen utilizes Mantine UI components for layout and display, along with icons for actions.

*   **Layout & Structure:** `Box`, `Stack`, `Center`, `Group` for organizing content.
*   **Information Display:** `Text` for headings, note titles, deletion dates, and empty state messages.
*   **Loading Indicator:** `Loader` for indicating data fetching.
*   **Icons:** `Icon` from `@iconify/react` for the empty state message and action buttons.
*   **Controls:** `Button` for "Restore" and "Delete Forever" actions.
*   **Visual Cues:** Deleted notes are displayed with a `line-through` style on their title and reduced opacity to visually distinguish them.

## 3. Data Handling

*   **Data Fetching Hook (`useDeletedNotes`):** This custom hook is responsible for:
    *   Fetching all notes that have been marked as deleted (`isDeleted: true`).
    *   Managing the `isLoading` state during data fetching.
    *   Providing the `deletedNotes` array of `Note` objects.
*   **Data Mutation Hooks:**
    *   `useRestoreNote()`: Handles the mutation to change a note's `isDeleted` status back to `false`.
    *   `usePermanentlyDeleteNote()`: Handles the mutation to completely remove a note from the database.

## 4. User Interactions

*   **Restoring a Note:** Clicking the "Restore" button next to a deleted note triggers the `restoreNote` mutation, moving the note out of the trash.
*   **Permanently Deleting a Note:** Clicking the "Delete Forever" button next to a deleted note triggers the `permanentlyDeleteNote` mutation, removing the note from the system.

## 5. Validations

*   **Loading State:** A `Loader` is displayed in the center of the screen while deleted notes are being fetched, providing clear visual feedback.
*   **Empty State:** If `deletedNotes.length` is 0, a "Trash is empty" message along with a trash icon is displayed, clearly indicating that there are no items to manage in the trash.
*   **Confirmation (Implicit):** While not explicitly shown in this file, it is a best practice to include a confirmation dialog before permanently deleting a note to prevent accidental data loss. This could be implemented using a generic `DeleteConfirmationModal` similar to other screens.

## 6. Enhancements / UX Improvements

*   **Confirmation Dialogs:** Implement explicit confirmation modals for both "Restore" and "Delete Forever" actions to improve user safety.
*   **Bulk Actions:** Allow users to select multiple deleted notes for bulk restore or permanent deletion.
*   **Search/Filter in Trash:** Add search and filtering capabilities to help users find specific deleted notes, especially if the trash contains many items.
*   **Empty Trash Button:** Provide a single button to "Empty Trash" (permanently delete all notes in trash) with a strong confirmation.
*   **Time-based Auto-deletion:** Implement a policy to automatically permanently delete notes after a certain period (e.g., 30 days) in the trash.
