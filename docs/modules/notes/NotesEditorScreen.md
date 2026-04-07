# Notes Editor Screen

This document describes the `NotesEditorScreen`, which provides a rich interface for creating new notes and editing existing ones. It supports rich text formatting, tagging, and status management (pin, favorite).

## 1. Features

*   **Note Creation:** Allows users to create new notes. If initiated from a folder view, the note is pre-assigned to that folder.
*   **Note Editing:** Enables comprehensive editing of existing notes, including title, content, tags, and status.
*   **Rich Text Editor:** Integrates a full-featured rich text editor (`NoteEditor`) for formatting note content (bold, italics, lists, etc.).
*   **Title Input:** A prominent text input field for the note's title.
*   **Tagging System:** Users can add multiple tags to a note using a `TagsInput` component, aiding in organization and search.
*   **Pin/Favorite Toggles:** Dedicated `Switch` components to mark a note as "pinned" (for quick access) or "favorite" (for important notes).
*   **Autosave Functionality:** Automatically saves changes to the note content and metadata after a short delay, preventing data loss.
*   **Manual Save Option:** A button to explicitly trigger a save operation at any time.
*   **Saving Status Indicator:** Displays real-time feedback on the saving status (e.g., "Saving...", "Typing...", "Saved X time ago", "New note", "No changes").
*   **Word Count:** Shows the total number of words in the note's content.
*   **Navigation:** A "Back" button to return to the previous screen (e.g., dashboard or folder view).
*   **Folder Context:** Displays the name of the folder the note belongs to, if applicable.

## 2. UI Components

The screen utilizes a combination of Mantine UI components for layout, input, and display, along with custom components for the rich text editor.

*   **Layout & Structure:** `Box`, `Stack`, `Group`, `Center` for organizing content.
*   **Information Display:** `Text` for status messages, word count, and folder name.
*   **Loading Indicator:** `Loader` for indicating data loading when fetching an existing note.
*   **Input Fields:**
    *   `TextInput`: For the note title.
    *   `TagsInput`: For managing note tags.
*   **Controls:**
    *   `Switch`: For "Pin" and "Favorite" toggles.
    *   `Button`: For "Back" navigation.
    *   `ActionIcon`: For manual save.
    *   `Tooltip`: Provides hover information for the manual save icon.
*   **Icons:** `Icon` from `@iconify/react` for visual cues (e.g., pin, star, floppy disk).
*   **Custom Components:**
    *   `NoteEditor`: The core rich text editor component, handling content input and formatting.

## 3. Data Handling

*   **URL Parameters:** `useParams` extracts the `id` (note ID) for editing existing notes. `useSearchParams` extracts `folderId` for new notes.
*   **Data Fetching Hooks:**
    *   `useNoteById(id)`: Fetches an existing note's data for editing.
    *   `useFolderById(folderId)`: Fetches folder details to display the folder name.
*   **Data Mutation Hooks:**
    *   `useUpdateNote()`: Handles the mutation for updating an existing note.
    *   `useCreateNote()`: Handles the mutation for creating a new note.
*   **Local State (`useState`):** Manages the current state of the note's `title`, `content`, `contentHtml`, `tags`, `isPinned`, `isFavorite`, and `initialLoadComplete`.
*   **Autosave Hook (`useDebouncedAutosave`):** A custom hook that debounces changes to the `noteData` and triggers the `saveNote` function automatically.
*   **`saveNote` Function:** An asynchronous callback that performs either a `createNote` or `updateNote` mutation based on whether the note is new or existing. It also handles navigation after creation.
*   **`NoteData` Interface:** Defines the structure of the data being managed and saved for a note.
*   **`dayjs`:** Used for formatting the "Saved X time ago" message.

## 4. User Interactions

*   **Title Input:** Users type directly into the `TextInput` to set the note's title.
*   **Content Editing:** Users interact with the `NoteEditor` to input and format the note's rich text content.
*   **Tag Management:** Users type tags into the `TagsInput` and press Enter to add them. They can also remove tags.
*   **Status Toggles:** Users click the `Switch` components to toggle the "Pin" and "Favorite" statuses.
*   **Navigation:** Clicking the "Back" button navigates to the previous screen.
*   **Manual Save:** Clicking the floppy disk `ActionIcon` explicitly saves the note.

## 5. Validations

*   **Empty Title Prevention:** Both the autosave and manual save mechanisms prevent saving if the note title is empty (after trimming whitespace).
*   **Manual Save Button State:** The manual save button is disabled if the title is empty, if a save operation is already in progress, or if there are no changes to save.
*   **Loading State:** A `Loader` is displayed when an existing note is being fetched, providing visual feedback.
*   **Initial Load Completion:** The `initialLoadComplete` state ensures that the autosave mechanism does not trigger prematurely before the existing note's data has been fully loaded into the component's state.

## 6. Enhancements / UX Improvements

*   **Version History:** Implement a version history feature to allow users to revert to previous versions of a note.
*   **Markdown Support:** Add an option to switch between rich text and Markdown editing modes.
*   **Image/File Upload:** Integrate functionality to embed images or attach files to notes.
*   **Collaboration Features:** For multi-user environments, add real-time collaboration capabilities.
*   **Note Templates:** Allow users to create notes from predefined templates.
*   **Offline Support:** Enhance offline capabilities to ensure notes can be created and edited without an internet connection and synced later.
