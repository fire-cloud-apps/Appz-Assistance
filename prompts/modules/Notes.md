# AppZ – Notes Module Technical Specification

## Module Overview

**Module Name:** Notes
**Platform:** React Web Application (Mobile-First)
**UI Framework:** Mantine UI
**Architecture Style:** Modular + Clean Architecture
**Local Database:** IndexedDB (via Dexie)

Notes is a **hierarchical note-taking module** where users can create, organize, and manage notes within a folder structure.

---

## High-Level Architecture

```
AppZ
│
├── core
│   ├── database
│   ├── services
│   ├── theme
│   └── utils
│
├── modules
│   └── notes
│        ├── data
│        ├── domain
│        ├── presentation
│        └── components
│
├── routes
│
└── app.tsx
```

**Architecture layers:**

```
Presentation (React UI)
        ↓
Domain Layer (Business Rules)
        ↓
Data Layer (Repositories)
        ↓
IndexedDB Database (NotesDB)
```

---


## Database Architecture

**Database Type:** IndexedDB
**Wrapper library:** Dexie.js
**Database name:** `notesDB`

**Tables:**
```
folders
notes
```

---

## Data Models

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

---

## IndexedDB Schema

**Location:** `src/core/database/notesDatabase.ts`

```typescript
import Dexie, { Table } from "dexie"

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

export class NotesDatabase extends Dexie {
  folders!: Table<Folder>
  notes!: Table<Note>

  constructor() {
    super("notesDB")

    this.version(1).stores({
      folders: `
        id,
        parentId,
        level,
        name,
        createdAt,
        updatedAt,
        isDeleted
      `,

      notes: `
        id,
        folderId,
        title,
        isPinned,
        isFavorite,
        createdAt,
        updatedAt,
        lastViewedAt,
        isDeleted
      `
    })
  }
}

export const notesDb = new NotesDatabase()
```

---

## Module: Notes

**Purpose:**
Manage hierarchical notes with folder organization:

```
Root Folders (Level 1)
   ├── Sub Folders (Level 2)
   │      └── Notes
   └── Notes
```

**Maximum folder depth:** 2 levels

**Hierarchy example:**
```
Personal
   ├── Journal
   │      └── Daily Notes
   └── Ideas

Work
   ├── Projects
   │      └── Meeting Notes
   └── Reference
```

---

## Business Rules

### Folder Hierarchy

```
Level 1 → parentId = null (Root Folders)
Level 2 → parentId = Level1 (Sub Folders)
Max depth = 2 levels
```

### Folder Rules

```
- Root folders cannot be moved into sub folders
- Sub folders cannot have child folders
- Folders can be empty or contain multiple notes
- Deleting a folder moves all contents to trash (soft delete)
```

### Note Rules

```
- Notes must belong to a folder (Level 1 or Level 2)
- Notes support rich text formatting (Tiptap editor)
- Notes can be pinned to top of folder
- Notes can be marked as favorite
- Notes support tags for cross-folder organization
```

### Note Features

```
- Rich text editing (bold, italic, lists, headings, links)
- Auto-save on content change
- Word count display
- Last edited timestamp
- Full-text search capability
```

---

## Repository Layer

**Location:** `modules/notes/data/repositories`

### Folder Repository

**Responsibilities:**
```
createFolder
updateFolder
deleteFolder (soft)
getFolderById
getRootFolders
getSubFolders
getFolderWithNotes
```

**Example:**
```typescript
export class FolderRepository {
  async createFolder(folder: Folder) {
    return notesDb.folders.add(folder)
  }

  async updateFolder(folder: Folder) {
    folder.updatedAt = new Date().toISOString()
    return notesDb.folders.put(folder)
  }

  async getRootFolders() {
    const allFolders = await notesDb.folders.toArray()
    return allFolders.filter(f => f.parentId === null && !f.isDeleted)
  }

  async getSubFolders(parentId: string) {
    const allFolders = await notesDb.folders.toArray()
    return allFolders.filter(f => f.parentId === parentId && !f.isDeleted)
  }
}
```

### Note Repository

**Responsibilities:**
```
createNote
updateNote
deleteNote (soft)
getNoteById
getNotesByFolder
getPinnedNotes
getFavoriteNotes
searchNotes
```

**Example:**
```typescript
export class NoteRepository {
  async createNote(note: Note) {
    return notesDb.notes.add(note)
  }

  async updateNote(note: Note) {
    note.updatedAt = new Date().toISOString()
    return notesDb.notes.put(note)
  }

  async getNotesByFolder(folderId: string) {
    const allNotes = await notesDb.notes.toArray()
    return allNotes
      .filter(n => n.folderId === folderId && !n.isDeleted)
      .sort((a, b) => {
        // Pinned notes first, then by updated date
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }

  async searchNotes(searchTerm: string) {
    const allNotes = await notesDb.notes.toArray()
    const normalizedTerm = searchTerm.toLowerCase().trim()
    return allNotes.filter(note =>
      !note.isDeleted &&
      (
        note.title.toLowerCase().includes(normalizedTerm) ||
        note.content.toLowerCase().includes(normalizedTerm) ||
        note.tags?.some(tag => tag.toLowerCase().includes(normalizedTerm))
      )
    )
  }
}
```

---

## State Management

### Server/Database State
```
React Query
```

### UI State
```
Zustand
```

**Example store:**
```typescript
import { create } from "zustand"

export const useNoteStore = create((set) => ({
  selectedFolderId: null,
  selectedNoteId: null,
  searchQuery: "",

  setSelectedFolder: (id) => set({ selectedFolderId: id }),
  setSelectedNote: (id) => set({ selectedNoteId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
```

---

## UI Screens

### Notes Dashboard

**Route:** `/notes`

**Displays:**
- Root folders grid
- Recent notes
- Favorite notes
- Quick stats

**Mantine components:**
```
Card, Grid, Stack, Group, Badge, Text
```

---

### Folder View

**Route:** `/notes/folder/:id`

**Displays:**
- Current folder info
- Sub folders (if Level 1 folder)
- Notes list (pinned first)
- Folder actions (edit, delete, new note)

**Mantine components:**
```
Card, Accordion, List, ActionIcon, Menu
```

---

### Note Editor

**Route:** `/notes/editor/:id` (edit) or `/notes/create?folderId=:id` (create)

**Features:**
- Tiptap rich text editor
- Title input
- Tags input
- Pin/Favorite toggles
- Auto-save indicator
- Word count
- Last saved timestamp

**Mantine components:**
```
TextInput, Textarea (Tiptap), Tags, Toggle, Group, Stack
```

---

### Search Results

**Route:** `/notes/search?q=:query`

**Displays:**
- Matching notes (title, content, tags)
- Search term highlighting
- Result count

---

### Favorites

**Route:** `/notes/favorites`

**Displays:**
- All favorite notes across folders
- Sorted by last updated

---

### Trash

**Route:** `/notes/trash`

**Displays:**
- Soft-deleted folders and notes
- Restore option
- Permanent delete option

---

## UI Component Examples

### Folder Card

```tsx
<Card shadow="sm" p="lg" withBorder>
  <Group justify="space-between">
    <Group>
      <ThemeIcon variant="light" size="lg">
        <IconFolder size={20} />
      </ThemeIcon>
      <Stack gap={0}>
        <Text fw={600}>{folder.name}</Text>
        <Text size="xs" c="dimmed">{noteCount} notes</Text>
      </Stack>
    </Group>
    <ActionIcon variant="subtle">
      <IconDots size={18} />
    </ActionIcon>
  </Group>
</Card>
```

### Note List Item

```tsx
<UnstyledButton>
  <Paper p="md" radius="md">
    <Group justify="space-between">
      <Stack gap={4}>
        <Text fw={500} lineClamp={1}>{note.title}</Text>
        <Text size="xs" c="dimmed" lineClamp={2}>
          {stripHtml(note.content)}
        </Text>
        <Group gap="xs">
          {note.tags?.slice(0, 3).map(tag => (
            <Badge key={tag} size="xs" variant="light">{tag}</Badge>
          ))}
        </Group>
      </Stack>
      {note.isPinned && <IconPin size={14} />}
    </Group>
  </Paper>
</UnstyledButton>
```

---

## Validation Rules

### Folder Validation
```
- Name required
- Name max length: 100 characters
- Description max length: 500 characters
- Folder level cannot exceed 2
- Name must be unique within same parent
```

### Note Validation
```
- Title required
- Title max length: 200 characters
- Content max length: 50000 characters
- Tags: max 10 tags per note
- Tag max length: 30 characters each
```

**Recommended libraries:**
```
Zod
React Hook Form
```

---

## Folder Structure

```
src
│
├── core
│   ├── database
│   │     └── notesDatabase.ts
│   │
│   ├── hooks
│   │     └── useNotesNotifications.ts (future)
│   │
│   └── services
│       └── userSettingsService.ts (extended for notes)
│
├── modules
│   └── notes
│        │
│        ├── data
│        │    ├── models
│        │    │     ├── Folder.ts
│        │    │     └── Note.ts
│        │    │
│        │    ├── repositories
│        │    │     ├── FolderRepository.ts
│        │    │     └── NoteRepository.ts
│        │    │
│        │    └── datasources
│        │          └── notesDatabase.ts
│        │
│        ├── domain
│        │    └── usecases
│        │          ├── CreateFolder.ts
│        │          ├── CreateNote.ts
│        │          ├── DeleteFolder.ts
│        │          └── DeleteNote.ts
│        │
│        ├── presentation
│        │    ├── screens
│        │    │     ├── NotesDashboardScreen.tsx
│        │    │     ├── NotesFolderViewScreen.tsx
│        │    │     ├── NotesEditorScreen.tsx
│        │    │     ├── NotesSearchScreen.tsx
│        │    │     ├── NotesFavoritesScreen.tsx
│        │    │     └── NotesTrashScreen.tsx
│        │    │
│        │    ├── hooks
│        │    │     ├── useFolderQueries.ts
│        │    │     └── useNoteQueries.ts
│        │    │
│        │    └── components
│        │          ├── FolderCard.tsx
│        │          ├── NoteListItem.tsx
│        │          ├── NoteEditor.tsx
│        │          └── FolderTree.tsx
│        │
│        └── components
│             ├── CreateFolderModal.tsx
│             └── CreateNoteModal.tsx
│
├── routes
│   └── index.tsx (notes routes added)
│
└── app.tsx
```

---

## Routing Structure

```
/notes
  → Notes Dashboard

/notes/folder/:id
  → Folder View (shows sub folders + notes)

/notes/create?folderId=:id
  → Create Note (with pre-selected folder)

/notes/editor/:id
  → Edit Note

/notes/search?q=:query
  → Search Results

/notes/favorites
  → Favorite Notes

/notes/trash
  → Trash (soft-deleted items)
```

**Use:** React Router

---

## Rich Text Editor Configuration

**Library:** Tiptap (based on ProseMirror)

**Extensions:**
```typescript
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Placeholder.configure({
    placeholder: 'Start writing your note...',
  }),
]
```

**Toolbar Options:**
- Bold, Italic, Strikethrough
- Headings (H1, H2, H3)
- Bullet List, Ordered List
- Blockquote
- Code Block
- Link
- Undo, Redo

---

## Future Extensions

### Short Term
```
- Note templates
- Export notes (PDF, Markdown, TXT)
- Import notes
- Note versioning/history
- Full-text search with highlighting
```

### Medium Term
```
- Note sharing
- Collaborative editing
- Note attachments (images, files)
- Voice notes
- Handwriting support (stylus)
```

### Long Term
```
- Cloud synchronization
- Offline-first sync engine
- Cross-device sync
- AI-powered note summarization
- Smart tags suggestions
- Note linking (bidirectional)
- Knowledge graph visualization
```

---

## Backend Migration Path

**When backend is introduced:**

```
React App
     ↓
API Layer (REST/GraphQL)
     ↓
MongoDB / PostgreSQL
```

**Local-first architecture:**
```
IndexedDB (NotesDB)
     ↓
Sync Engine
     ↓
Cloud Backend
```

**Enables:**
```
- Offline support
- Multi-device sync
- Conflict resolution
- Real-time collaboration
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## Module Menu Integration

**Location:** `src/core/services/MainLayout.tsx`

```typescript
{ id: 'notes', label: 'Notes', icon: '📝', path: '/notes', disabled: false }
```

**Children (future):**
```typescript
children: [
  { id: 'notes-dashboard', label: 'Dashboard', path: '/notes', icon: 'lucide:layout-dashboard' },
  { id: 'notes-favorites', label: 'Favorites', path: '/notes/favorites', icon: 'lucide:star' },
  { id: 'notes-trash', label: 'Trash', path: '/notes/trash', icon: 'lucide:trash' },
]
```

---

**Document Version:** 1.0.0
**Status:** Specification Complete - Ready for Implementation
**Next Step:** Create implementation task plan
