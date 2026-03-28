# BreakTimer Module - Technical Specification (AppZ Platform)

## 1. Introduction
This document details the technical specifications for integrating "Smart Notifications" (with skip/snooze functionality) and ensuring "Responsive Design" within the AppZ platform, specifically for the BreakTimer module. It builds upon the existing architectural principles and technology stack defined in the main AppZ technical specification.

## 1.1. High-Level Architecture
The BreakTimer module will integrate into the existing AppZ modular architecture. It will operate as an independent module within the `modules` directory, adhering to the Presentation, Domain, and Data layer separation.

## 1.2. Data Models

### BreakSettings Model
This model will define the structure for storing user-configurable break parameters.

```typescript
export interface BreakSettings {
  id: string; // Unique ID, e.g., 'default' or user-specific
  microBreakDuration: number; // Duration in minutes
  microBreakInterval: number; // Interval in minutes
  longBreakDuration: number; // Duration in minutes
  longBreakInterval: number; // Interval in minutes (e.g., after X micro-breaks)
  workingHoursStart: string; // e.g., "09:00"
  workingHoursEnd: string; // e.g., "17:00"
  snoozeDuration: number; // Duration in minutes for snooze
  notificationMessage: string; // Customizable message for break
  theme: string; // e.g., "dark", "light"
  createdAt: string;
  updatedAt: string;
}
```

## 1.3. IndexedDB Schema

Location: `src/core/database/appDatabase.ts` (will be extended)

The `appzDB` will be extended to include a `breakSettings` table.

```typescript
// Inside AppDatabase class in appDatabase.ts
// ...
export class AppDatabase extends Dexie {
  // ... existing tables
  breakSettings!: Table<BreakSettings>;

  constructor() {
    super("appzDB");
    this.version(1).stores({
      // ... existing stores
      breakSettings: `
        id,
        createdAt,
        updatedAt
      `
    });
  }
}
```

## 1.4. Business Rules

### Break Scheduling
*   Breaks will only be scheduled and triggered within the defined `workingHoursStart` and `workingHoursEnd`.
*   Micro-breaks will occur at `microBreakInterval` intervals during working hours.
*   Long breaks will occur after a certain number of micro-breaks or at a `longBreakInterval`.
*   If a break is due but the user is outside working hours, the break will be skipped until working hours resume.

### Skip/Snooze Logic
*   **Skip**: Immediately ends the current break (if active) and resets the timer for the next work session. If a work session is active and a break is due, skipping will prevent the break from starting and reset the work timer.
*   **Snooze**: Pauses the current break (if active) and schedules a new, shorter break reminder after `snoozeDuration`. If a work session is active and a break is due, snoozing will delay the start of the break by `snoozeDuration`.
*   Multiple snoozes might be allowed, but a maximum limit should be considered to prevent indefinite delays.

### Notification Behavior
*   Browser notifications will require user permission.
*   In-app notifications (modal/overlay) will take precedence when the application is in focus.

## 2. Feature: Smart Notifications (Skip/Snooze)

### 2.1. Description
The BreakTimer module will provide intelligent break reminders. When a break is due, a notification will appear, offering the user options to either "Skip" the current break entirely or "Snooze" it for a short, configurable duration.

### 2.2. UI/UX
*   **Notification Display**: When a break is triggered, a full-screen overlay or a prominent modal (leveraging Mantine UI's `Modal` or `Overlay` components) will appear.
*   **Content**: This overlay will display a customizable break message, the remaining break time, and two clear action buttons: "Skip Break" and "Snooze (X min)".
*   **Snooze Configuration**: The snooze duration (e.g., 5 minutes) will be configurable in the BreakTimer settings.
*   **Browser Notifications**: For cases where the application is not in focus, the browser's native Notification API will be used to alert the user. These notifications will be actionable if supported by the browser, allowing direct skip/snooze from the notification itself.

### 2.3. State Management (Zustand)
A new Zustand store, `useBreakTimerStore`, will manage the state related to the current break, including:
*   `isBreakActive`: Boolean indicating if a break is currently in progress.
*   `isWorkActive`: Boolean indicating if a work session is currently in progress.
*   `timeRemaining`: Number, countdown for the current work session or break.
*   `breakSettings`: Object containing configured break durations, intervals, and snooze duration.
*   `notificationStatus`: Enum (`'idle'`, `'pending'`, `'skipped'`, `'snoozed'`).
*   `lastBreakTimestamp`: Timestamp of the last completed break.

Actions within the store will include:
*   `startTimer()`: Initiates the work/break cycle.
*   `pauseTimer()`: Pauses the current timer.
*   `skipBreak()`: Immediately ends the current break and starts the next work session.
*   `snoozeBreak()`: Pauses the current break and schedules a new, shorter break after the snooze duration.
*   `updateBreakSettings(settings)`: Updates user-defined break parameters.

### 2.4. Timer Logic
The core timer logic will reside within a custom React hook (e.g., `useBreakTimer`) that interacts with the `useBreakTimerStore`.
*   It will use `setInterval` or `setTimeout` to manage the countdown.
*   When `skipBreak()` is called, the current break timer will be cleared, and the work timer will be initiated immediately.
*   When `snoozeBreak()` is called, the current break timer will be paused, and a new `setTimeout` will be set for the snooze duration. After the snooze, the break will resume or a new micro-break will be triggered.
*   The timer will respect the `workingHours` configuration, pausing or not initiating breaks outside these hours.

### 2.5. Data Persistence (IndexedDB)
User-defined break settings, including snooze duration, will be persisted in `IndexedDB` via `Dexie.js` to ensure they are retained across sessions, aligning with the AppZ platform's data persistence strategy. This will be handled by the `BreakTimerRepository` interacting with the `appzDB`.

### 2.6. Browser Notifications
*   The Web Notification API (`new Notification()`) will be used to send system-level notifications.
*   Permission for notifications will be requested from the user.
*   The notification content will include the break message and potentially actions (if supported by the browser and implemented).

## 3. Feature: Responsive Design

### 3.1. Description
The BreakTimer module, like the rest of the AppZ platform, will be designed with a mobile-first approach, ensuring optimal usability and visual consistency across a wide range of devices, from mobile phones to large desktop monitors.

### 3.2. UI Framework (Mantine UI)
Mantine UI components are inherently responsive. The design will leverage Mantine's:
*   **`Grid` and `SimpleGrid` components**: For flexible layout structures that adapt to screen size.
*   **`Stack` and `Group` components**: For managing spacing and alignment of elements.
*   **Responsive props**: Many Mantine components accept responsive props (e.g., `p={{ base: 'md', sm: 'lg' }}`) to adjust padding, margin, and other styles based on breakpoints.
*   **Hooks**: `useMediaQuery` for conditional rendering or styling based on screen size.

### 3.3. CSS Strategy
While Mantine provides significant responsive capabilities, custom responsive styles will be implemented using:
*   **CSS Modules**: For component-specific styles, ensuring no global style conflicts. Media queries will be used within these modules to apply styles at different breakpoints.
*   **Inline styles/Style objects**: For dynamic, component-driven responsive adjustments where appropriate.

### 3.4. Component Adaptation
*   **Navigation**: A responsive navigation pattern (e.g., a hamburger menu on smaller screens, a sidebar on larger screens) will be implemented, consistent with the overall AppZ structure.
*   **Settings Forms**: Forms for configuring break schedules and working hours will adapt their layout (e.g., stacking inputs vertically on mobile, side-by-side on desktop) to maintain usability.
*   **Notification Overlay**: The break notification overlay will be designed to be full-screen on mobile devices and potentially a centered modal on larger screens.

### 3.5. Breakpoints
The design will primarily follow Mantine's default breakpoints:
*   `xs`: 36em (576px)
*   `sm`: 48em (768px)
*   `md`: 62em (992px)
*   `lg`: 75em (1200px)
*   `xl`: 88em (1408px)

## 4. Integration with AppZ Architecture
The BreakTimer module will adhere to the modular and layered architecture of AppZ:
*   **Presentation Layer**: UI components (e.g., `BreakTimerSettings`, `BreakNotificationModal`) will reside in `modules/break_timer/presentation/screens` and `modules/break_timer/components`.
*   **Domain Layer**: Business logic for break scheduling, skipping, and snoozing will be encapsulated in use cases within `modules/break_timer/domain/usecases`.
*   **Data Layer**: Persistence of break settings will be handled by a `BreakTimerRepository` in `modules/break_timer/data/repositories`, interacting with `localStorage` or potentially `IndexedDB` if more complex data structures are needed.

## 5. Affected Modules/Components
*   **New Module**: `modules/break_timer`
*   **Core Components**:
    *   `modules/break_timer/presentation/screens/BreakTimerSettings.tsx`
    *   `modules/break_timer/components/BreakNotificationModal.tsx`
    *   `modules/break_timer/domain/usecases/StartBreakTimer.ts`
    *   `modules/break_timer/domain/usecases/SkipBreak.ts`
    *   `modules/break_timer/domain/usecases/SnoozeBreak.ts`
    *   `modules/break_timer/data/repositories/BreakTimerRepository.ts`
    *   `modules/break_timer/data/models/BreakSettings.ts`
    *   `src/core/services/NotificationService.ts` (potentially a new core service for browser notifications)
*   **Global State**: `src/core/database/appDatabase.ts` (if break settings are stored in IndexedDB, though localStorage is initially preferred for simplicity).
*   **App.tsx/Routing**: Integration of the BreakTimer settings route.

## 6. Folder Structure

The `break_timer` module will follow a similar clean architecture structure as the `task_manager` module:

```
modules
└── break_timer
     │
     ├── data
     │    ├── models
     │    ├── repositories
     │    └── datasources (if needed, e.g., for browser APIs)
     │
     ├── domain
     │    └── usecases
     │
     ├── presentation
     │    ├── screens
     │    └── hooks
     │
     └── components
```
