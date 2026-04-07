# Break Timer Module Overview

This document provides an overview of the Break Timer module, which is designed to help users manage their work-break cycles effectively. The module allows users to configure break settings, receive notifications, and manage their breaks (skip, snooze).

## Purpose

The primary purpose of the Break Timer module is to promote user well-being and productivity by encouraging regular breaks. It provides a customizable timer and notification system to remind users to take short breaks during their work sessions.

## Features

*   **Configurable Break Settings:** Users can define the duration of work intervals, break durations, and notification preferences.
*   **Break Notifications:** Timely notifications to alert users when it's time to take a break or resume work.
*   **Skip Break:** Option to skip a scheduled break.
*   **Snooze Break:** Option to snooze a break for a short period.
*   **Background Worker:** Utilizes a web worker to run the timer logic in the background, ensuring accuracy and responsiveness without blocking the main UI thread.

## Architecture

The Break Timer module follows the layered architecture defined for the application:

*   **Presentation Layer (`src/modules/break_timer/presentation`):** Contains React components (screens, hooks) responsible for the UI and user interaction.
    *   `BreakTimerSettingsScreen.tsx`: Allows users to configure break settings.
    *   `useBreakTimer.ts`: Custom hook for interacting with the break timer logic.
    *   `useBreakTimerStore.ts`: Zustand store for managing the module's UI state.
*   **Domain Layer (`src/modules/break_timer/domain`):** Encapsulates the core business logic for managing breaks.
    *   `usecases/`: Contains use cases like `GetBreakSettingsUseCase`, `SkipBreakUseCase`, `SnoozeBreakUseCase`, `StartBreakTimerUseCase`, `UpdateBreakSettingsUseCase`.
*   **Data Layer (`src/modules/break_timer/data`):** Handles data persistence for break settings.
    *   `models/BreakSettings.ts`: Defines the data structure for break settings.
    *   `repositories/BreakTimerRepository.ts`: Manages CRUD operations for `BreakSettings` in IndexedDB.
*   **Workers (`src/modules/break_timer/workers`):**
    *   `breakTimerWorker.ts`: A Web Worker that runs the timer logic independently of the main thread, ensuring the timer continues even if the main thread is busy.

## Data Handling

*   Break settings are stored locally using IndexedDB via `BreakTimerRepository`.
*   The `useBreakTimerStore` manages the real-time state of the timer and break status.

## User Interactions

*   Users interact with `BreakTimerSettingsScreen` to adjust their preferences.
*   Notifications provide options to skip or snooze breaks.

## Dependencies

*   **Core:** Depends on `src/core/database` for IndexedDB access, `src/core/utils` for general utilities.
*   **External:** Uses Web Workers for background processing.
