# Finance Goal Module API Endpoints

This document outlines the API endpoints for the Finance Goal module, based on the `FinancialGoal`, `Investor`, `Portfolio`, `SIP`, and `ScenarioSettings` models.

## FinancialGoal Endpoints

### FinancialGoal Model

```typescript
export interface FinancialGoalModel {
  id: string
  name: string
  description: string
  startDate: string
  targetDate: string
  targetAmount: number
  currentAmount: number
  investorIds: string[]
  portfolioIds: string[]
  sipIds: string[]
  expectedGrowthRate: number
  icon?: string
}
```

### Endpoints

-   **GET /api/finance-goals/goals**: Get all financial goals.
    -   Response: `FinancialGoalModel[]`
-   **GET /api/finance-goals/goals/{id}**: Get a specific financial goal by ID.
    -   Parameters: `id` (string) - The ID of the financial goal.
    -   Response: `FinancialGoalModel`
-   **POST /api/finance-goals/goals**: Create a new financial goal.
    -   Request Body: `Omit<FinancialGoalModel, 'id'>`
    -   Response: `FinancialGoalModel`
-   **PUT /api/finance-goals/goals/{id}**: Update an existing financial goal.
    -   Parameters: `id` (string) - The ID of the financial goal to update.
    -   Request Body: `Partial<Omit<FinancialGoalModel, 'id'>>`
    -   Response: `FinancialGoalModel`
-   **DELETE /api/finance-goals/goals/{id}**: Delete a financial goal.
    -   Parameters: `id` (string) - The ID of the financial goal to delete.
    -   Response: `{ message: string }`

## Investor Endpoints

### Investor Model

```typescript
export interface InvestorModel {
  id: string
  name: string
  mobile?: string
  pan?: string
}
```

### Endpoints

-   **GET /api/finance-goals/investors**: Get all investors.
    -   Response: `InvestorModel[]`
-   **GET /api/finance-goals/investors/{id}**: Get a specific investor by ID.
    -   Parameters: `id` (string) - The ID of the investor.
    -   Response: `InvestorModel`
-   **POST /api/finance-goals/investors**: Create a new investor.
    -   Request Body: `Omit<InvestorModel, 'id'>`
    -   Response: `InvestorModel`
-   **PUT /api/finance-goals/investors/{id}**: Update an existing investor.
    -   Parameters: `id` (string) - The ID of the investor to update.
    -   Request Body: `Partial<Omit<InvestorModel, 'id'>>`
    -   Response: `InvestorModel`
-   **DELETE /api/finance-goals/investors/{id}**: Delete an investor.
    -   Parameters: `id` (string) - The ID of the investor to delete.
    -   Response: `{ message: string }`

## Portfolio Endpoints

### Portfolio Model

```typescript
export interface PortfolioModel {
  id: string
  amcName: string
  scheme: string
  type: string
  folio: string
  investorId: string
  unitBalance: number
  navDate: string
  currentValue: number
  costValue: number
  appreciation: number
  weightedAvg: number
  xirr: number
}
```

### Endpoints

-   **GET /api/finance-goals/portfolios**: Get all portfolios.
    -   Response: `PortfolioModel[]`
-   **GET /api/finance-goals/portfolios/{id}**: Get a specific portfolio by ID.
    -   Parameters: `id` (string) - The ID of the portfolio.
    -   Response: `PortfolioModel`
-   **GET /api/finance-goals/investors/{investorId}/portfolios**: Get all portfolios for a specific investor.
    -   Parameters: `investorId` (string) - The ID of the investor.
    -   Response: `PortfolioModel[]`
-   **POST /api/finance-goals/portfolios**: Create a new portfolio.
    -   Request Body: `Omit<PortfolioModel, 'id'>`
    -   Response: `PortfolioModel`
-   **PUT /api/finance-goals/portfolios/{id}**: Update an existing portfolio.
    -   Parameters: `id` (string) - The ID of the portfolio to update.
    -   Request Body: `Partial<Omit<PortfolioModel, 'id'>>`
    -   Response: `PortfolioModel`
-   **DELETE /api/finance-goals/portfolios/{id}**: Delete a portfolio.
    -   Parameters: `id` (string) - The ID of the portfolio to delete.
    -   Response: `{ message: string }`

## SIP Endpoints

### SIP Model

```typescript
export type SIPFrequency = 'Monthly' | 'Quarterly'
export type SIPStatus = 'Active' | 'Inactive'

export interface SIPModel {
  id: string
  name: string
  portfolioId: string
  investorId: string
  amount: number
  frequency: SIPFrequency
  startDate: string
  endDate?: string
  status: SIPStatus
  icon?: string
}
```

### Endpoints

-   **GET /api/finance-goals/sips**: Get all SIPs.
    -   Response: `SIPModel[]`
-   **GET /api/finance-goals/sips/{id}**: Get a specific SIP by ID.
    -   Parameters: `id` (string) - The ID of the SIP.
    -   Response: `SIPModel`
-   **GET /api/finance-goals/portfolios/{portfolioId}/sips**: Get all SIPs for a specific portfolio.
    -   Parameters: `portfolioId` (string) - The ID of the portfolio.
    -   Response: `SIPModel[]`
-   **POST /api/finance-goals/sips**: Create a new SIP.
    -   Request Body: `Omit<SIPModel, 'id'>`
    -   Response: `SIPModel`
-   **PUT /api/finance-goals/sips/{id}**: Update an existing SIP.
    -   Parameters: `id` (string) - The ID of the SIP to update.
    -   Request Body: `Partial<Omit<SIPModel, 'id'>>`
    -   Response: `SIPModel`
-   **DELETE /api/finance-goals/sips/{id}**: Delete a SIP.
    -   Parameters: `id` (string) - The ID of the SIP to delete.
    -   Response: `{ message: string }`

## ScenarioSettings Endpoints

### ScenarioSettings Model

```typescript
export interface ScenarioSettingsModel {
  key: string
  scenarios: ScenarioRate[]
  updatedAt: string
}

export interface ScenarioRate {
  id: string
  label: string
  rate: number
}

export interface ScenarioSettings {
  id: string
  name: string
  description: string
  settings: ScenarioSettingsModel[]
}
```

### Endpoints

-   **GET /api/finance-goals/scenario-settings**: Get all scenario settings.
    -   Response: `ScenarioSettings[]`
-   **GET /api/finance-goals/scenario-settings/{id}**: Get specific scenario settings by ID.
    -   Parameters: `id` (string) - The ID of the scenario settings.
    -   Response: `ScenarioSettings`
-   **POST /api/finance-goals/scenario-settings**: Create new scenario settings.
    -   Request Body: `Omit<ScenarioSettings, 'id'>`
    -   Response: `ScenarioSettings`
-   **PUT /api/finance-goals/scenario-settings/{id}**: Update existing scenario settings.
    -   Parameters: `id` (string) - The ID of the scenario settings to update.
    -   Request Body: `Partial<Omit<ScenarioSettings, 'id'>>`
    -   Response: `ScenarioSettings`
-   **DELETE /api/finance-goals/scenario-settings/{id}**: Delete scenario settings.
    -   Parameters: `id` (string) - The ID of the scenario settings to delete.
    -   Response: `{ message: string }`