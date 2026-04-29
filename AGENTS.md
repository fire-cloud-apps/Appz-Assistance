# AGENTS

## Purpose
This repository is a React + TypeScript frontend app with a modular architecture.
Use this file as the fast-start guide, then follow linked documentation for details.

## Quick Start
- Install dependencies: npm install
- Start dev server: npm run dev
- Build: npm run build
- Lint: npm run lint
- Preview production build: npm run preview

## First Files To Read
- Project docs index: [docs/README.md](docs/README.md)
- Architecture: [docs/core/architecture.md](docs/core/architecture.md)
- Folder conventions: [docs/core/folder-structure.md](docs/core/folder-structure.md)
- State strategy: [docs/core/state-management.md](docs/core/state-management.md)
- Routing strategy: [docs/core/routing.md](docs/core/routing.md)
- API and persistence: [docs/core/api-layer.md](docs/core/api-layer.md)
- UI rules: [docs/core/ui-guidelines.md](docs/core/ui-guidelines.md)

## Codebase Shape
- App entry and shell: src/main.tsx, src/App.tsx
- Shared cross-cutting code lives under src/core
- Feature code lives under src/modules
- Routes are centralized in src/routes/index.tsx
- Modules should depend on src/core; src/core must not depend on module code

## Working Rules For Agents
- Keep changes small and local to the relevant module.
- Follow existing layer boundaries in modules: presentation, domain, data.
- Reuse Mantine components first, then create custom UI only when needed.
- Prefer existing hooks, repositories, and utilities before adding new abstractions.
- Preserve current route patterns and path naming conventions.

## Data And State Conventions
- Use Zustand for shared app-level state.
- Use React Query for async/server-like state and cache invalidation.
- Use Dexie repositories for IndexedDB persistence access.
- Keep transient UI state local to component scope unless sharing is required.

## Routing Notes
- Index route behavior is handled by IndexRouteHandler in [src/routes/index.tsx](src/routes/index.tsx).
- Auth callback query params are intentionally handled before redirecting from root.
- Feature routes are grouped by prefix: tasks, notes, finance, settings.

## Quality Checks Before Finishing
- Run npm run build for type-check + production build validation.
- Run npm run lint when touching linted TypeScript/React code.
- If behavior changes, update related documentation in docs/modules and docs/core.

## Known Practical Constraints
- No dedicated test suite is currently present in the repo.
- Prefer validating changes with targeted manual checks via the affected routes.

## When Adding New Features
- Keep module isolation: avoid direct module-to-module imports when possible.
- Add shared code to src/core only if genuinely cross-module.
- Add or update module documentation under docs/modules for new screens or major flows.
