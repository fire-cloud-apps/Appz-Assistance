# Notes Folder View Screen

This document describes the `NotesFolderViewScreen`, which allows users to view the contents of a specific note folder, including its subfolders and notes.

## 1. Features

*   **Folder Details Display:** Shows the name and description of the currently viewed folder.
*   **Breadcrumb Navigation:** Provides a clear path of the folder hierarchy, allowing users to navigate back to parent folders or the main notes dashboard.
*   **Subfolder Listing:** Displays all subfolders directly nested within the current folder.
*   **Note Listing:** Displays all notes contained within the current folder.
*   **Create New Note:** A button to open a modal for creating a new note directly within the current folder.
*   **Create New Subfolder:** A button to open a modal for creating a new subfolder, available only for root-level folders (level 1).
*   **Edit Note:** Allows users to navigate to the note editor to modify existing notes from the list.
*   **Delete Note:** Provides an option to delete notes from the list, with a confirmation step.
*   **Delete Subfolder:** Allows deleting subfolders from the list, with a confirmation step.
*   **Navigation Controls:** "Back" button to return to the parent folder or the notes dashboard.
*   **Error Handling:** Displays a "Folder not found" message if the specified folder ID is invalid.
*   **Loading State:** Shows a loading indicator while folder contents are being fetched.
*   **Empty States:** Displays messages when there are no subfolders or notes in the current folder, along with actions to create new ones.

## 2. UI Components

The screen utilizes a combination of Mantine UI components for layout and display, along with custom components for specific note functionalities.

*   **Layout & Structure:** `Box`, `Stack`, `Group`, `Center` for organizing content.
*   **Information Display:** `Text` for folder name, description, and messages.
*   **Loading Indicator:** `Loader` for indicating data loading.
*   **Navigation:** `Breadcrumbs` with `Anchor` and `Link` for hierarchical navigation.
*   **Controls:** `Button` for "Back", "New Note", and "New Subfolder" actions.
*   **Icons:** `Icon` from `@iconify/react` for visual cues.
*   **Custom Components:**
    *   `FolderCard`: Displays individual subfolder information and provides actions like selecting and deleting.
    *   `NoteListItem`: Displays individual note information in a list format, with actions for selecting, editing, and deleting.
    *   `CreateFolderModal`: A modal form for creating new folders, pre-filled with the current folder as parent.
    *   `CreateNoteModal`: A modal form for creating new notes, pre-filled with the current folder ID.
    *   `DeleteConfirmationModal`: A generic modal for confirming deletion of both notes and subfolders.

## 3. Data Handling

*   **URL Parameters:** `useParams` hook is used to extract the `id` of the current folder from the URL.
*   **Data Fetching Hooks:**
    *   `useFolderById(id)`: Fetches details of the current folder.
    *   `useSubFolders(id)`: Fetches subfolders directly under the current folder.
    *   `useNotesByFolder(id)`: Fetches notes belonging to the current folder.
    *   `useRootFolders()`: Used to find the parent folder for breadcrumbs.
*   **Data Mutation Hooks:**
    *   `useDeleteFolder()`: Handles the mutation for deleting a folder.
    *   `useDeleteNote()`: Handles the mutation for deleting a note.
*   **Zustand Store (`useNoteStore`):** Manages UI-related state for modals (`isCreateFolderModalOpen`, `isCreateNoteModalOpen`, `isDeleteFolderModalOpen`, etc.).
*   **Local State (`useState`):** Manages the state for the note deletion confirmation modal (`deleteNoteId`, `deleteNoteTitle`, `isDeleteNoteModalOpen`).
*   **Navigation (`useNavigate`):** Used to programmatically navigate to other screens.
*   **Derived State:** `parentFolder` is derived from the current `folder`'s `parentId` and the `rootFolders` list to construct the breadcrumbs and "Back" button logic.

## 4. User Interactions

*   **Navigation:**
    *   Clicking the "Back" button navigates to the parent folder or the notes dashboard.
    *   Clicking on breadcrumb links allows direct navigation to higher-level folders.
    *   Clicking a `FolderCard` navigates into that subfolder.
*   **Note Management:**
    *   Clicking "New Note" or the "Create your first note" button opens the `CreateNoteModal`.
    *   Clicking a `NoteListItem` navigates to the `NotesEditorScreen` to view/edit the note.
    *   Clicking the edit action on a `NoteListItem` navigates to the `NotesEditorScreen`.
    *   Clicking the delete action on a `NoteListItem` opens the `DeleteConfirmationModal` for notes.
*   **Folder Management:**
    *   Clicking "New Subfolder" opens the `CreateFolderModal`.
    *   Clicking the delete action on a `FolderCard` opens the `DeleteConfirmationModal` for subfolders.
*   **Modal Interactions:** Users interact with the modal forms to create notes/folders or confirm deletions.

## 5. Validations

*   **Loading State:** The screen displays a `Loader` while data is being fetched.
*   **Folder Not Found:** If the `id` in the URL does not correspond to an existing folder, a "Folder not found" message is displayed with an option to go to the dashboard.
*   **Deletion Confirmation:** Both folder and note deletions require confirmation via the `DeleteConfirmationModal` to prevent accidental data loss.
*   **Conditional Subfolder Creation:** The "New Subfolder" button is only visible and active if the current folder is a root-level folder (`folder.level === 1`), enforcing the folder hierarchy rules.
*   **Empty States:** Descriptive messages and action buttons are displayed when there are no subfolders or notes within the current folder.

## 6. Enhancements / UX Improvements

*   **Drag-and-Drop for Notes/Subfolders:** Allow users to reorder notes or move them between subfolders using drag-and-drop.
*   **Folder Properties Editing:** Provide an option to edit the current folder's name or description directly from this screen.
*   **Search within Folder:** Implement a search bar to filter notes and subfolders within the current view.
*   **Bulk Actions:** Allow selecting multiple notes/subfolders for bulk deletion or movement.
*   **Visual Indicators:** Use icons or badges to indicate note status (e.g., favorite, pinned).
