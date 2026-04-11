# Front-End Design Document

## 1. Design Overview

This document defines an enterprise-grade, modular, scalable, reusable, and **offline-first** front-end architecture intended to serve as a baseline template for future applications. The primary objective is to enable rapid development by reusing a consistent structure, minimizing rework, and enforcing best practices across all front-end projects.

The architecture is designed with the following principles:

* High modularity
* Clear separation of concerns
* Reusability across modules
* Scalability for large applications
* Maintainability and readability
* Offline-first capability
* Local-first data persistence with sync support

---

## 2. Thumb Rules

* Follow strict module boundaries (no cross-module leakage)
* Keep business logic out of UI components
* Prefer reusable abstractions over duplication
* Maintain consistent naming conventions
* Ensure all components are testable
* Avoid tight coupling between layers
* Keep core utilities framework-agnostic where possible
* Design all features to work offline by default
* Treat server as a sync layer, not a dependency

---

## 3. Tools, Technologies, Languages, Services, and Packages

### Core Stack

* Framework: React (or equivalent)
* Language: TypeScript
* State Management: Zustand / Redux Toolkit
* Styling: Tailwind CSS / CSS Modules

### UI & Components

* UI Library: Mantine (or equivalent)
* Icon Library: Iconify ([https://icon-sets.iconify.design](https://icon-sets.iconify.design))

### Data & API

* API Handling: Axios / Fetch
* Data Caching: React Query / TanStack Query

### Local Database (Offline First)

* Frontend DB: PGlite (PostgreSQL in WebAssembly)
* Fallback/Support: IndexedDB (for browser-level persistence if needed)
* ORM/Query Layer: Drizzle ORM / Kysely (recommended)

### Sync Strategy

* Background sync service
* Conflict resolution strategy (last-write-wins / versioning / merge logic)

### Tooling

* Package Manager: npm / pnpm / yarn
* Linting: ESLint
* Formatting: Prettier
* Build Tool: Vite / Webpack

### Testing

* Unit Testing: Jest / Vitest
* Component Testing: React Testing Library

---

## 4. Folder Structure

```
src/
│
├── core/
│   ├── api/
│   ├── config/
│   ├── constants/
│   ├── db/                # PGlite setup, schema, migrations
│   ├── hooks/
│   ├── services/          # sync, storage, background jobs
│   ├── utils/
│   └── theme/
│
├── modules/
│   ├── <module-name>/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── presentation/
│   │   └── index.ts
│
├── shared/
│   ├── components/
│   ├── layouts/
│   ├── forms/
│   └── icons/
│
├── assets/
├── routes/
├── store/
└── main.tsx
```

---

## 5. Module-Level Structure

Each module follows a layered architecture:

```
module/
├── data/
│   ├── api/              # remote API integration
│   ├── dto/
│   ├── repository/       # abstraction over local DB + API
│   └── local/            # PGlite queries
│
├── domain/
│   ├── models/
│   ├── types/
│   └── usecases/
│
├── presentation/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── state/
```

### Responsibilities

* **data**: Handles both local DB (PGlite) and remote APIs
* **domain**: Business logic and core models
* **presentation**: UI components and interaction logic

---

## 6. Architecture Pattern

The architecture follows a combination of:

* Clean Architecture
* Feature-Based Modular Design
* Offline-First Architecture
* Local-First Data Strategy

### Key Concepts

* Dependency flows inward (presentation → domain → data)
* Domain layer is framework-independent
* Local database (PGlite) is the primary data source
* Remote APIs act as synchronization layer

### Data Flow

1. UI interacts with domain use cases
2. Use cases interact with repository
3. Repository reads/writes to PGlite
4. Background sync pushes/pulls from server

---

## 7. Reusable Components

Reusable components are centralized under `shared/`:

* Buttons
* Inputs
* Modals
* Tables
* Loaders
* Error Boundaries

Guidelines:

* Must be stateless or minimally stateful
* Must support extensibility via props
* Must be theme-aware

---

## 8. Icons

* Use Iconify for all icons
* Standardize icon usage across modules
* Maintain an internal icon wrapper for consistency

Reference: [https://icon-sets.iconify.design](https://icon-sets.iconify.design)

---

## 9. Version Control

* Use Git with feature branching strategy

### Branching Model

* main (production)
* develop (integration)
* feature/*
* bugfix/*

### Commit Standards

* Use Conventional Commits
* Example: feat: add task creation module

---

## 10. Documentation

* Maintain docs under `/docs`
* Structure:

  * core/
  * modules/

Each module must include:

* Feature overview
* API contracts
* UI flows
* Sync behavior (offline + online)

---

## 11. Code Standards

* Follow ESLint + Prettier rules

* Use TypeScript strict mode

* Naming conventions:

  * Components: PascalCase
  * Functions: camelCase
  * Constants: UPPER_SNAKE_CASE

* Avoid:

  * Any usage
  * Magic numbers
  * Deep nesting

---

## 12. Quality Control

* Code Reviews mandatory
* Unit test coverage > 70%
* Linting must pass before merge
* Pre-commit hooks using Husky
* Offline scenarios must be tested explicitly

---

## 13. Build and Release

### Build

* Use environment-based configurations
* Optimize bundles using code splitting

### Release

* CI/CD pipeline (GitHub Actions / GitLab CI)
* Automated build and deployment

### Environments

* Development
* Staging
* Production

---

## 14. Objective and Reusability Strategy

This architecture is designed to:

* Serve as a reusable template
* Enable rapid application development
* Ensure consistency across projects
* Support offline-first enterprise applications

To create a new application:

1. Clone base structure
2. Replace module implementations
3. Configure PGlite schema
4. Setup sync strategy
5. Reuse core and shared components

This ensures minimal setup effort while maintaining enterprise-grade quality.

---

## 15. File-Level Documentation Standard

Every code file in the application **must include a short 2–3 line description at the top** explaining:

* Why the file exists
* What problem it solves
* Its role in the architecture

This ensures long-term maintainability, faster onboarding, and better architectural clarity.

### Guidelines

* Mandatory for all files (components, hooks, services, utils, configs, etc.)
* Keep it concise (2–3 lines only)
* Avoid generic descriptions
* Focus on intent and responsibility

### Standard Template

```ts
/**
 * Purpose: <Why this file exists>
 * Responsibility: <What problem it solves>
 * Scope: <Where it fits in the architecture>
 */
```

### Example – Component

```ts
/**
 * Purpose: Renders the task list UI
 * Responsibility: Displays tasks and handles user interactions
 * Scope: Presentation layer (Task Module)
 */
```

### Example – Repository

```ts
/**
 * Purpose: Abstracts task data operations
 * Responsibility: Handles interaction between PGlite and remote API
 * Scope: Data layer (Task Module)
 */
```

### Example – Service

```ts
/**
 * Purpose: Manages background synchronization
 * Responsibility: Syncs local PGlite data with server
 * Scope: Core service layer
 */
```

### Enforcement

* PRs must be rejected if documentation is missing
* Lint rule or custom script can enforce header presence
* Code reviews must validate clarity and correctness

This standard ensures every file is self-explanatory, reducing dependency on external documentation and improving developer productivity.
