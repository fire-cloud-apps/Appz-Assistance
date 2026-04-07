# Task Manager Module Overview

This document provides an overview of the Task Manager module, which is designed to help users organize, track, and manage their tasks and to-do lists effectively.

## Purpose

The primary purpose of the Task Manager module is to enhance user productivity by providing a comprehensive system for task creation, scheduling, prioritization, and progress tracking. It aims to simplify task management, from simple to-do items to more complex projects with subtasks and recurrence.

## Features

*   **Task Creation & Editing:** Create new tasks with details like title, description, due date, priority, and recurrence. Edit existing tasks.
*   **Task Organization:** Categorize tasks, assign them to groups, and manage subtasks.
*   **Multiple Views:**
    *   **Dashboard:** Overview of upcoming tasks, priorities, and progress.
    *   **All Tasks:** A comprehensive list of all active tasks.
    *   **Grouped Tasks:** View tasks organized by custom groups.
    *   **Kanban Board:** Visual task management using a Kanban-style board.
    *   **Archive:** Manage completed or archived tasks.
*   **Task Details:** View detailed information for each task, including activity logs.
*   **Recurrence:** Set up recurring tasks with various patterns (daily, weekly, monthly, custom).
*   **Subtasks:** Break down larger tasks into smaller, manageable subtasks.
*   **Activity Log:** Track changes and progress for each task.
*   **Search & Filter:** Efficiently find tasks using search and filtering options.

## Architecture

The Task Manager module follows the layered architecture defined for the application:

*   **Presentation Layer (`src/modules/task_manager/presentation`):** Contains React components (screens, hooks, components) responsible for the UI and user interaction.
    *   `screens/`: Contains various screens like `TaskDashboardScreen`, `TaskAllTasksScreen`, `TaskGroupTasksScreen`, `TaskKanbanBoardScreen`, `TaskArchiveScreen`, `TaskDetailScreen`, `TaskFormScreen`.
    *   `components/`: Module-specific UI components like `TaskCard`, `ActivityLog`, `RecurrencePicker`, and various modals (`CreateTaskModal`, `SubtaskModal`, `DeleteConfirmationModal`, `ArchiveConfirmationModal`).
    *   `hooks/`: Custom hooks for interacting with module-specific logic.
*   **Domain Layer (`src/modules/task_manager/domain`):** Encapsulates the core business logic for tasks and subtasks.
    *   `usecases/`: Contains use cases for managing tasks (e.g., `CreateTaskUseCase`, `UpdateTaskUseCase`, `DeleteTaskUseCase`, `GetTasksByGroupUseCase`).
*   **Data Layer (`src/modules/task_manager/data`):** Handles data persistence for tasks.
    *   `models/`: Defines data models for tasks, subtasks, and activity logs.
    *   `repositories/`: Manages CRUD operations for tasks in IndexedDB.

## Data Handling

*   Task data, including subtasks and activity logs, is stored locally using IndexedDB via repositories.
*   The module likely uses a Zustand store or React Query to manage the real-time state of tasks for display and interaction across different views.

## User Interactions

*   Users navigate through different screens to manage their tasks.
*   Forms and modals are used for creating, editing, and configuring tasks and subtasks.
*   Drag-and-drop functionality might be used in the Kanban board for changing task status or order.

## Dependencies

*   **Core:** Depends on `src/core/database` for IndexedDB access, `src/core/utils` for general utilities (especially `recurrenceHelper.ts`, `idGenerator.ts`), `src/core/components` for reusable UI elements.
*   **External:** May use `@dnd-kit` for drag-and-drop functionality in the Kanban board.
