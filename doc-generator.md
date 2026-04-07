⸻


# Frontend Documentation Generator – CLI Prompt

You are a frontend architecture and documentation expert.

Your task is to generate a complete, production-ready frontend technical documentation system for an application.

---

## 📁 Documentation Structure

Create a `/docs` folder at the root with the following structure:

docs/
│
├── core/
│   ├── architecture.md
│   ├── tech-stack.md
│   ├── folder-structure.md
│   ├── state-management.md
│   ├── routing.md
│   ├── api-layer.md
│   ├── ui-guidelines.md
│   ├── reusable-components.md
│   └── utilities.md
│
└── modules/
├── /
│   ├── -overview.md
│   ├── .md
│   ├── .md
│   └── …

---

## 🧩 Core Documentation (`/docs/core`)

Generate separate markdown files for all shared and foundational aspects of the frontend:

### Required Files

1. **architecture.md**
   - Define overall frontend architecture
   - Explain layers (Presentation, Domain, Data)
   - Describe design principles and modular approach

2. **tech-stack.md**
   - Framework (React / Flutter / etc.)
   - Language (TypeScript / Dart)
   - State management approach
   - Database (IndexedDB / SQLite)
   - Styling system

3. **folder-structure.md**
   - Define project folder structure (`src/core`, `src/modules`)
   - Explain separation rules
   - Enforce module isolation

4. **state-management.md**
   - Global vs module-level state
   - Best practices
   - Data flow strategy

5. **routing.md**
   - Routing structure
   - Module-based navigation
   - Lazy loading approach

6. **api-layer.md**
   - API abstraction strategy
   - Service structure
   - Error handling and transformation

7. **ui-guidelines.md**
   - UI/UX principles
   - Design consistency rules
   - Accessibility considerations

8. **reusable-components.md**
   - List and define shared components
   - Examples: dropdowns, modals, tables, form controls

9. **utilities.md**
   - Common helper functions
   - Validation, formatting, storage, file parsing

---

## 📦 Module Documentation (`/docs/modules`)

Each module must be documented independently.

### Module Structure Rules

For each module:

1. Create a module folder:

docs/modules//

2. Add a main overview file:

-overview.md

3. If the module contains multiple screens/pages:
- Create a **separate markdown file for each screen**
- Do NOT combine multiple screens into one file

---

## 📄 Screen-Level Documentation Requirements

Each screen file must include:

### 1. Features
- Complete list of functionalities available on the screen

### 2. UI Components
- Layout structure
- Forms, tables, buttons, dropdowns, etc.

### 3. Data Handling
- Data sources
- API or local storage interaction
- State usage

### 4. User Interactions
- Actions (create, edit, delete, search, filter)
- Navigation behavior

### 5. Validations
- Field validations
- Error handling

### 6. Enhancements / UX Improvements
- Performance optimizations
- Usability improvements
- New features that can be added later
---

## 🔍 Feature Coverage Rules

- Ensure ALL features are fully documented
- Do NOT leave gaps or partial descriptions
- Infer missing details logically using standard frontend practices

---

## 🎯 UX & Data Guidelines

- Always display **Names instead of IDs**
- Use **searchable dropdowns** for large datasets
- Implement **runtime search** where applicable
- Prefer **user-friendly labels over technical identifiers**
- Include clear validation and feedback mechanisms

---

## ⚙️ Architectural Constraints

- Maintain strict separation between `core` and `modules`
- Avoid cross-module dependencies
- Ensure each module is self-contained
- Shared logic must reside only in `core`

---

## 🧾 Output Expectations

- Generate clean, professional markdown files
- Use headings, tables, and bullet points
- Keep content structured and implementation-ready
- Follow consistent naming conventions
- Ensure scalability and maintainability

---

## 🚀 Goal

Produce a complete frontend documentation system that:
- Is modular and scalable
- Covers all features in detail
- Can be directly used in a real-world production project
- Aligns with modern frontend architecture best practices
- If the document file already exists, then check for the code changes and update the new/modifed features accordingly.

---