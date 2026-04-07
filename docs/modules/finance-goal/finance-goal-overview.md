# Finance Goal Module Overview

This document provides an overview of the Finance Goal module, designed to help users set, track, and manage their financial objectives, investments, and savings plans.

## Purpose

The primary purpose of the Finance Goal module is to empower users to achieve their financial aspirations by providing tools for goal setting, investment tracking, and systematic investment planning (SIP). It aims to offer a clear picture of their financial progress and guide them towards their targets.

## Features

*   **Dashboard:** A central view providing an overview of all financial goals, current portfolio performance, and SIP statuses.
*   **Goal Management:** Create, view, edit, and track individual financial goals (e.g., buying a house, retirement, child's education).
*   **Portfolio Management:** Track various investment assets, their current value, and performance.
*   **SIP Management:** Set up and monitor Systematic Investment Plans (SIPs) for regular contributions towards goals.
*   **Investor Management:** Manage details of different investors associated with the financial goals or portfolio.

## Architecture

The Finance Goal module follows the layered architecture defined for the application:

*   **Presentation Layer (`src/modules/finance-goal/presentation`):** Contains React components (pages, hooks, store) responsible for the UI and user interaction.
    *   `pages/`: Contains various screens like `FinanceGoalDashboardPage`, `FinanceGoalPortfolioPage`, `FinanceGoalSIPPage`, `FinanceGoalGoalsPage`, `FinanceGoalInvestorsPage`.
    *   `components/`: Module-specific UI components like `GoalsList`, `InvestorsTable`, and various modals (`GoalModal`, `InvestorModal`, `PortfolioModal`, `SIPModal`).
    *   `hooks/`: Custom hooks for interacting with module-specific logic.
    *   `store/`: Zustand store for managing the module's UI state and data.
*   **Domain Layer (`src/modules/finance-goal/domain`):** Encapsulates the core business logic for financial goals, investments, and SIPs.
    *   `entities/`: Defines data structures for goals, portfolios, investors, SIPs.
    *   `interfaces/`: Defines interfaces for repositories and services.
    *   `usecases/`: Contains use cases for managing financial goals (e.g., `CreateGoalUseCase`, `UpdatePortfolioUseCase`).
*   **Data Layer (`src/modules/finance-goal/data`):** Handles data persistence for financial goals.
    *   `datasources/`: Manages interaction with external APIs or local storage.
    *   `models/`: Defines data models for persistence.
    *   `repositories/`: Manages CRUD operations for financial entities in IndexedDB or via API.
    *   `services/`: Module-specific data services.

## Data Handling

*   Financial goals, portfolio details, SIPs, and investor information are stored locally using IndexedDB (via repositories) or potentially synchronized with a backend API (via datasources).
*   The module's Zustand store (`src/modules/finance-goal/presentation/store`) manages the real-time state of financial data for display and interaction.

## User Interactions

*   Users navigate through different pages (Dashboard, Portfolio, SIP, Goals, Investors) to manage their finances.
*   Modals are used for creating, editing, and viewing details of goals, investors, portfolios, and SIPs.
*   Interactive tables and lists display financial data.

## Dependencies

*   **Core:** Depends on `src/core/database` for IndexedDB access, `src/core/utils` for general utilities, `src/core/components` for reusable UI elements.
*   **External:** May interact with external financial data APIs (if implemented).
