# Notes Module Overview

This document provides an overview of the Notes module, which is designed to allow users to create, organize, and manage personal notes.

## Purpose

The primary purpose of the Notes module is to provide a simple yet powerful tool for users to capture thoughts, ideas, and information. It supports rich text editing, organization into folders, and features like search, favorites, and trash for efficient note management.

## Features

*   **Note Creation & Editing:** Create new notes with a rich text editor and edit existing ones.
*   **Folder Organization:** Organize notes into custom folders.
*   **Dashboard:** A central view to see recent notes, folders, and other relevant information.
*   **Search:** Full-text search functionality to quickly find notes.
*   **Favorites:** Mark important notes as favorites for easy access.
*   **Trash:** Move deleted notes to a trash bin for potential recovery.
*   **Rich Text Editor:** Supports various formatting options (bold, italics, lists, etc.).

## Architecture

The Notes module follows the layered architecture defined for the application:

*   **Presentation Layer (`src/modules/notes/presentation`):** Contains React components (screens, hooks, components) responsible for the UI and user interaction.
    *   `screens/`: Contains various screens like `NotesDashboardScreen`, `NotesFolderViewScreen`, `NotesEditorScreen`, `NotesSearchScreen`, `NotesFavoritesScreen`, `NotesTrashScreen`.
    *   `components/`: Module-specific UI components (e.g., `NoteCard`, `FolderList`).
    *   `hooks/`: Custom hooks for interacting with module-specific logic.
*   **Domain Layer (`src/modules/notes/domain`):** Encapsulates the core business logic for notes and folders.
    *   `usecases/`: Contains use cases for managing notes (e.g., `CreateNoteUseCase`, `UpdateNoteUseCase`, `DeleteNoteUseCase`, `GetNotesByFolderUseCase`).
*   **Data Layer (`src/modules/notes/data`):** Handles data persistence for notes and folders.
    *   `datasources/`: Manages interaction with local storage or IndexedDB.
    *   `models/`: Defines data models for notes and folders.
    *   `repositories/`: Manages CRUD operations for notes and folders in IndexedDB.

## Data Handling

*   Notes and folder data are stored locally using IndexedDB via repositories.
*   The module likely uses a Zustand store or React Query to manage the real-time state of notes and folders for display and interaction.

## User Interactions

*   Users navigate through different screens to manage their notes.
*   The rich text editor allows for intuitive note creation and editing.
*   Drag-and-drop functionality might be used for organizing notes into folders.

## Dependencies

*   **Core:** Depends on `src/core/database` for IndexedDB access, `src/core/utils` for general utilities, `src/core/components` for reusable UI elements.
*   **External:** Uses [Tiptap](https://tiptap.dev/) for the rich text editor.
