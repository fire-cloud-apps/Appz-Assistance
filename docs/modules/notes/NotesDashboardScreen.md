# Notes Dashboard Screen

This document describes the `NotesDashboardScreen`, which serves as the main entry point for the Notes module, providing an overview of folders, recent notes, and favorite notes.

## 1. Features

*   **Folder Overview:** Displays a list of all root-level note folders, allowing users to quickly access and manage their organized notes.
*   **Recent Notes:** Shows a curated list of the most recently accessed or modified notes (up to 5), enabling quick resumption of work.
*   **Favorite Notes:** Presents a list of notes marked as favorites (up to 5), providing easy access to important information.
*   **Create Folder:** Provides a button to open a modal for creating new note folders.
*   **Create Note:** Allows creating new notes, either directly or associated with a specific folder via the folder card.
*   **Edit Note:** Users can navigate to the note editor directly from the recent or favorite notes lists to modify existing notes.
*   **Delete Note:** Provides an option to delete notes from the recent or favorite lists, with a confirmation step.
*   **Delete Folder:** Allows deleting folders from the dashboard, with a confirmation step.
*   **Navigation:** Facilitates navigation to individual folder views and the note editor for specific notes.
*   **Loading State:** Displays a loading indicator while folder data is being fetched.
*   **Empty State:** Provides a clear message and action button when no folders have been created yet.

## 2. UI Components

The screen utilizes a combination of Mantine UI components for layout and display, along with custom components for specific note functionalities.

*   **Layout & Structure:** `Box`, `Grid`, `Stack`, `Group`, `Center` for organizing content.
*   **Information Display:** `Text` for headings and descriptive messages.
*   **Loading Indicator:** `Loader` for indicating data loading.
*   **Controls:** `Button` for "New Folder" and "Create your first folder" actions.
*   **Icons:** `Icon` from `@iconify/react` for visual cues.
*   **Custom Components:**
    *   `FolderCard`: Displays individual folder information and provides actions like selecting, editing, deleting, and adding notes/subfolders.
    *   `NoteListItem`: Displays individual note information in a list format, with actions for selecting, editing, and deleting.
    *   `CreateFolderModal`: A modal form for creating new folders.
    *   `CreateNoteModal`: A modal form for creating new notes (though direct navigation to editor is also used).
    *   `DeleteConfirmationModal`: A generic modal for confirming deletion of both notes and folders.

## 3. Data Handling

*   **Data Fetching Hooks:**
    *   `useRootFolders()`: Fetches the list of top-level folders.
    *   `useRecentNotes(5)`: Fetches the 5 most recent notes.
    *   `useFavoriteNotes()`: Fetches notes marked as favorites.
*   **Data Mutation Hooks:**
    *   `useDeleteFolder()`: Handles the mutation for deleting a folder.
    *   `useDeleteNote()`: Handles the mutation for deleting a note.
*   **Zustand Store (`useNoteStore`):** Manages UI-related state for the Notes module, including:
    *   `isCreateFolderModalOpen`, `isCreateNoteModalOpen`, `isDeleteFolderModalOpen`: Boolean flags for modal visibility.
    *   `openCreateFolderModal`, `closeCreateFolderModal`, `closeCreateNoteModal`, `openDeleteFolderModal`, `closeDeleteFolderModal`: Functions to control modal states.
    *   `deleteFolderId`, `deleteFolderName`: State for the folder being deleted.
    *   `selectedFolderId`, `setSelectedFolder`: State for the currently selected folder.
*   **Local State (`useState`):** Manages the state for the note deletion confirmation modal (`deleteNoteId`, `deleteNoteTitle`, `isDeleteNoteModalOpen`).
*   **Navigation (`useNavigate`):** Used to programmatically navigate to other screens (folder view, note editor).

## 4. User Interactions

*   **Folder Management:**
    *   Clicking "New Folder" button opens the `CreateFolderModal`.
    *   Clicking a `FolderCard` navigates to the `NotesFolderViewScreen` for that folder.
    *   Clicking the delete action on a `FolderCard` opens the `DeleteConfirmationModal` for folders.
    *   Clicking the "Add Note" action on a `FolderCard` navigates to the `NotesEditorScreen` to create a new note within that folder.
*   **Note Management:**
    *   Clicking a `NoteListItem` (from Recent or Favorites) navigates to the `NotesEditorScreen` to view/edit the note.
    *   Clicking the edit action on a `NoteListItem` navigates to the `NotesEditorScreen`.
    *   Clicking the delete action on a `NoteListItem` opens the `DeleteConfirmationModal` for notes.
*   **Modal Interactions:** Users interact with the modal forms to create folders or confirm deletions.

## 5. Validations

*   **Loading State:** The screen displays a `Loader` while `useRootFolders` is fetching data, providing visual feedback to the user.
*   **Empty Folder State:** If no folders exist, a descriptive message and a button to "Create your first folder" are displayed.
*   **Deletion Confirmation:** Both folder and note deletions require confirmation via the `DeleteConfirmationModal` to prevent accidental data loss.

## 6. Enhancements / UX Improvements

*   **Drag-and-Drop for Folders/Notes:** Implement drag-and-drop functionality for organizing notes into folders or reordering items.
*   **More Recent/Favorite Notes:** Allow users to configure the number of recent/favorite notes displayed.
*   **Search Bar:** Add a quick search bar directly on the dashboard for immediate note lookup.
*   **Customizable Dashboard Layout:** Allow users to customize which sections (folders, recent, favorites) are displayed and their order.
*   **Visual Feedback for Actions:** Provide subtle animations or transitions for actions like adding/deleting items.
*   **Context Menus:** Implement right-click context menus for folders and notes for quick actions.
