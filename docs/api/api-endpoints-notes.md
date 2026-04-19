# Notes Module API Endpoints

This document outlines the API endpoints for the Notes module, based on the `Folder` and `Note` models.

## Folder Endpoints

### Folder Model

```typescript
export interface Folder {
  id: string
  parentId: string | null
  level: number
  name: string
  description?: string
  color?: string
  icon?: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}
```

### Endpoints

-   **GET /api/notes/folders**: Get all folders.
    -   Response: `Folder[]`
-   **GET /api/notes/folders/{id}**: Get a specific folder by ID.
    -   Parameters: `id` (string) - The ID of the folder.
    -   Response: `Folder`
-   **POST /api/notes/folders**: Create a new folder.
    -   Request Body: `Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>`
    -   Response: `Folder`
-   **PUT /api/notes/folders/{id}**: Update an existing folder.
    -   Parameters: `id` (string) - The ID of the folder to update.
    -   Request Body: `Partial<Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>>`
    -   Response: `Folder`
-   **DELETE /api/notes/folders/{id}**: Delete a folder (soft delete).
    -   Parameters: `id` (string) - The ID of the folder to delete.
    -   Response: `{ message: string }`

## Note Endpoints

### Note Model

```typescript
export interface Note {
  id: string
  folderId: string
  title: string
  content: string
  contentHtml?: string
  tags?: string[]
  color?: string
  isPinned: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  lastViewedAt?: string
  isDeleted: boolean
}
```

### Endpoints

-   **GET /api/notes/notes**: Get all notes.
    -   Response: `Note[]`
-   **GET /api/notes/notes/{id}**: Get a specific note by ID.
    -   Parameters: `id` (string) - The ID of the note.
    -   Response: `Note`
-   **GET /api/notes/folders/{folderId}/notes**: Get all notes within a specific folder.
    -   Parameters: `folderId` (string) - The ID of the folder.
    -   Response: `Note[]`
-   **POST /api/notes/notes**: Create a new note.
    -   Request Body: `Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>`
    -   Response: `Note`
-   **PUT /api/notes/notes/{id}**: Update an existing note.
    -   Parameters: `id` (string) - The ID of the note to update.
    -   Request Body: `Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>`
    -   Response: `Note`
-   **DELETE /api/notes/notes/{id}**: Delete a note (soft delete).
    -   Parameters: `id` (string) - The ID of the note to delete.
    -   Response: `{ message: string }`
-   **POST /api/notes/notes/{id}/pin**: Pin a note.
    -   Parameters: `id` (string) - The ID of the note to pin.
    -   Response: `Note`
-   **DELETE /api/notes/notes/{id}/pin**: Unpin a note.
    -   Parameters: `id` (string) - The ID of the note to unpin.
    -   Response: `Note`
-   **POST /api/notes/notes/{id}/favorite**: Mark a note as favorite.
    -   Parameters: `id` (string) - The ID of the note to mark as favorite.
    -   Response: `Note`
-   **DELETE /api/notes/notes/{id}/favorite**: Unmark a note as favorite.
    -   Parameters: `id` (string) - The ID of the note to unmark as favorite.
    -   Response: `Note`