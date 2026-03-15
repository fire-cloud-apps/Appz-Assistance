# AppZ – Technical Specification (React + IndexedDB)

## 1. Application Overview

**Application Name:** AppZ
**Platform:** React Web Application (Mobile-First)
**UI Framework:** Mantine UI
**Architecture Style:** Modular + Clean Architecture
**Local Database:** IndexedDB (via Dexie)

AppZ is a **modular productivity platform** where each capability is implemented as a **separate module**.

Initial module:

```
Task Manager
```

Future modules:

```
Notes
Calendar
Knowledge Base
AI Assistant
Personal Finance
```

---

# 2. High-Level Architecture

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
│   └── task_manager
│        ├── data
│        ├── domain
│        ├── presentation
│        └── components
│
├── routes
│
└── app.tsx
```

Architecture layers:

```
Presentation (React UI)
        ↓
Domain Layer (Business Rules)
        ↓
Data Layer (Repositories)
        ↓
IndexedDB Database
```

This allows **future backend replacement without UI changes**.

---

# 3. Technology Stack

### Frontend

| Technology  | Purpose                 |
| ----------- | ----------------------- |
| React       | UI framework            |
| Mantine UI  | Component library       |
| React Query | Data fetching & caching |
| Zustand     | Client state management |
| Dexie       | IndexedDB wrapper       |
| Day.js      | Date utilities          |
| UUID        | Unique ID generation    |

---

### Package Dependencies

```json
{
  "dependencies": {
    "react": "^19.x",
    "react-dom": "^19.x",

    "@mantine/core": "^8.x",
    "@mantine/hooks": "^8.x",
    "@mantine/dates": "^8.x",

    "@tanstack/react-query": "^5.x",
    "zustand": "^5.x",

    "dexie": "^4.x",
    "dexie-react-hooks": "^4.x",

    "uuid": "^13.x",
    "dayjs": "^1.x"
  }
}
```
 Always use the latest framework
---

# 4. Database Architecture

Database Type:

```
IndexedDB
```

Wrapper library:

```
Dexie.js
```

Database name:

```
appzDB
```

Tables:

```
tasks
taskActivities
```

---

# 5. Data Models

## Task Model

```typescript
export interface Task {

  id: string

  parentTaskId?: string | null

  taskLevel: number

  title: string
  description?: string

  status: string
  priority: string

  dueDate?: string | null

  createdAt: string
  updatedAt: string

  isDeleted: boolean
}
```

---

## Activity Model

Activities are allowed **only for parent tasks (level 1)**.

```typescript
export interface TaskActivity {

  id: string

  taskId: string

  activity: string
  notes?: string

  createdAt: string
}
```

---

# 6. IndexedDB Schema

Location:

```
src/core/database/appDatabase.ts
```

Example:

```typescript
import Dexie, { Table } from "dexie"

export class AppDatabase extends Dexie {

  tasks!: Table<Task>
  taskActivities!: Table<TaskActivity>

  constructor() {

    super("appzDB")

    this.version(1).stores({

      tasks: `
        id,
        parentTaskId,
        taskLevel,
        status,
        priority,
        dueDate,
        createdAt,
        updatedAt,
        isDeleted
      `,

      taskActivities: `
        id,
        taskId,
        createdAt
      `
    })

  }
}

export const db = new AppDatabase()
```

---

# 7. Module: Task Manager

Purpose:

Manage hierarchical tasks:

```
Parent Tasks
Child Tasks
Sub Tasks
Activity Logs
```

Maximum depth:

```
3 levels
```

Hierarchy example:

```
Project
   ├── Backend
   │      └── API Design
   └── Frontend
          └── UI Components
```

---

# 8. Business Rules

### Task Hierarchy

```
Level 1 → parentTaskId = null
Level 2 → parentTaskId = Level1
Level 3 → parentTaskId = Level2
Max depth = 3
```

---

### Activity Rules

```
Activity logs allowed only for Level 1 tasks
```

---

### Task Status

```
Pending
InProgress
Completed
Cancelled
```

---

### Priority Levels

```
Low
Medium
High
Critical
```

---

# 9. Repository Layer

Location:

```
modules/task_manager/data/repositories
```

---

## Task Repository

Responsibilities:

```
createTask
updateTask
deleteTask
getTaskById
getTasks
getChildTasks
completeTask
```

Example:

```typescript
export class TaskRepository {

  async createTask(task: Task) {
    return db.tasks.add(task)
  }

  async updateTask(task: Task) {
    return db.tasks.put(task)
  }

  async getTasks() {

    return db.tasks
      .where("isDeleted")
      .equals(false)
      .toArray()
  }

}
```

---

## Activity Repository

Responsibilities:

```
addActivity
getActivities
```

Example:

```typescript
export class ActivityRepository {

  async addActivity(activity: TaskActivity) {
    return db.taskActivities.add(activity)
  }

  async getActivities(taskId: string) {

    return db.taskActivities
      .where("taskId")
      .equals(taskId)
      .sortBy("createdAt")
  }

}
```

---

# 10. State Management

Two layers:

### Server/Database State

```
React Query
```

### UI State

```
Zustand
```

Example store:

```typescript
import { create } from "zustand"

export const useTaskStore = create((set) => ({

  selectedTaskId: null,

  setSelectedTask: (id) =>
    set({ selectedTaskId: id })

}))
```

---

# 11. UI Screens

Built using Mantine components.

---

## Task Dashboard

Displays:

```
Parent Tasks
```

Features:

```
Expandable child tasks
Task status badges
Priority indicators
```

Mantine components:

```
Card
Accordion
Badge
Stack
Group
```

---

## Task Detail Screen

Displays:

```
Task Information
Subtasks
Activity Timeline
```

Mantine components:

```
Tabs
Timeline
List
Badge
```

---

## Create Task Screen

Fields:

```
Title
Description
Priority
Due Date
Parent Task
```

Components:

```
TextInput
Textarea
Select
DateInput
Button
```

---

## Activity Log Screen

Displays:

```
Add activity
Activity timeline
Timestamp
```

Components:

```
Timeline
Textarea
Button
```

---

# 12. UI Component Example

Task Card

```tsx
<Card shadow="sm" p="lg">

  <Group justify="space-between">

    <Text fw={600}>Task Title</Text>

    <Badge color="red">High</Badge>

  </Group>

  <Text size="sm" c="dimmed">

    Status: InProgress

  </Text>

</Card>
```

---

# 13. Validation Rules

```
Title required
Title max length 200
Description max length 2000
Due date cannot be past
Task level cannot exceed 3
Activity allowed only for level 1
```

Recommended libraries:

```
Zod
React Hook Form
```

---

# 14. Folder Structure

```
src
│
├── core
│   ├── database
│   │     └── appDatabase.ts
│   │
│   ├── services
│   ├── utils
│   └── theme
│
├── modules
│   └── task_manager
│        │
│        ├── data
│        │    ├── models
│        │    ├── repositories
│        │    └── datasources
│        │
│        ├── domain
│        │    └── usecases
│        │
│        ├── presentation
│        │    ├── screens
│        │    └── hooks
│        │
│        └── components
│
├── routes
│
└── app.tsx
```

---

# 15. Routing Structure

Example routes:

```
/
 → Task Dashboard

/task/:id
 → Task Detail

/task/create
 → Create Task
```

Use:

```
React Router
```

---

# 16. Future Extensions

Planned platform capabilities:

```
Cloud synchronization
Offline-first sync engine
Task reminders
File attachments
Tags
Comments
Team collaboration
AI task suggestions
Mobile PWA
```

---

# 17. Future Backend Migration

When backend is introduced:

```
React App
     ↓
API Layer
     ↓
MongoDB
```

Local-first architecture:

```
IndexedDB
     ↓
Sync Engine
     ↓
MongoDB
```

This enables:

```
Offline support
Multi-device sync
Conflict resolution
```

---