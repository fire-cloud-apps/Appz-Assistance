# Frontend Architecture

This document outlines the overall frontend architecture of the application, emphasizing a modular, scalable, and maintainable design.

## Layers

The application follows a layered architecture, promoting separation of concerns and clear responsibilities:

1.  **Presentation Layer (`src/core/screens`, `src/modules/*/presentation/screens`, `src/core/components`, `src/modules/*/presentation/components`):**
    *   **Responsibility:** Handles user interface rendering, user interactions, and presentation logic.
    *   **Components:** React components (screens, widgets, UI elements), hooks for UI-specific logic.
    *   **Dependencies:** Depends on the Domain Layer for business logic and data.

2.  **Domain Layer (`src/core/hooks`, `src/modules/*/domain/usecases`, `src/modules/*/domain/entities`, `src/modules/*/domain/interfaces`):**
    *   **Responsibility:** Contains the core business logic, rules, and entities of the application. It is independent of any UI or data storage specifics.
    *   **Components:** Use cases (interactors), entities, value objects, and interfaces (repositories, services).
    *   **Dependencies:** Depends on the Data Layer through interfaces (e.g., repository interfaces) but not on concrete implementations.

3.  **Data Layer (`src/core/database`, `src/core/services`, `src/modules/*/data/repositories`, `src/modules/*/data/datasources`, `src/modules/*/data/models`):**
    *   **Responsibility:** Manages data retrieval, storage, and manipulation. It abstracts the source of data (e.g., API, local storage, IndexedDB).
    *   **Components:** Repositories (implementing domain interfaces), data sources (API clients, database access), data models (DTOs).
    *   **Dependencies:** Depends on external services (APIs, databases) but is independent of the Domain and Presentation Layers.

## Design Principles

*   **Separation of Concerns:** Each layer has a distinct responsibility, minimizing coupling between different parts of the application.
*   **Modularity:** The application is divided into independent modules, each encapsulating a specific feature or domain. This allows for easier development, testing, and maintenance.
*   **Scalability:** The architecture is designed to accommodate new features and modules without significant refactoring of existing code.
*   **Testability:** Clear separation of layers and dependencies makes it easier to write unit, integration, and end-to-end tests.
*   **Maintainability:** Consistent structure and clear responsibilities reduce complexity and make the codebase easier to understand and modify.
*   **Dependency Inversion Principle (DIP):** High-level modules (Presentation, Domain) do not depend on low-level modules (Data) directly. Instead, they depend on abstractions (interfaces) defined in the Domain Layer.

## Modular Approach

The application adopts a feature-driven modular approach. Each major feature (e.g., `break_timer`, `finance-goal`, `task_manager`) resides in its own self-contained module within `src/modules`.

*   **Module Isolation:** Modules are designed to be as independent as possible, minimizing direct dependencies between them. Communication between modules should ideally happen through shared core services or events.
*   **Internal Structure:** Each module typically follows its own internal layered structure (presentation, domain, data) to maintain consistency and separation of concerns within the module itself.
*   **Shared Core:** Common functionalities, utilities, and foundational services that are used across multiple modules are placed in the `src/core` directory. Modules can depend on `src/core`, but `src/core` should not depend on specific modules.
