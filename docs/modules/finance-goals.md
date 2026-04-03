# **Technical Specification Document**

## **Module: Finance Goal**

## **Application: AppZ (React SPA – Offline First)**

---

# **1. Executive Summary**

The **Finance Goal Module** enables users to:

* Track mutual fund portfolios
* Manage SIPs (Systematic Investment Plans)
* Define and monitor financial goals
* Analyze investor-wise holdings
* Forecast goal achievement timelines

This module follows a **Clean Architecture pattern**, ensuring scalability, maintainability, and separation of concerns.

---

# **2. Architectural Alignment**

## **2.1 Base Architecture (Unchanged)**

```plaintext
AppZ
│
├── core
├── modules
├── routes
└── app.tsx
```

---

## **2.2 Finance Goal Module Integration**

```plaintext
modules/
└── finance-goal
     ├── data
     ├── domain
     ├── presentation
     └── components
```

---

# **3. Technology Stack**

| Category  | Technology              |
| --------- | ----------------------- |
| Framework | React (Vite)            |
| UI        | Mantine UI              |
| State     | Zustand (module scoped) |
| Storage   | IndexedDB (Dexie.js)    |
| Routing   | React Router            |
| Forms     | React Hook Form + Zod   |
| Charts    | Recharts                |
| Date      | Day.js                  |
| Language  | TypeScript              |

---

# **4. High-Level Architecture**

```plaintext
Presentation Layer (UI + State)
        ↓
Domain Layer (Business Logic)
        ↓
Data Layer (Repositories)
        ↓
IndexedDB (Dexie via core/database)
```

---

# **5. Module Structure (Detailed)**

```plaintext
finance-goal/
│
├── data/
│   ├── models/
│   ├── repositories/
│   ├── datasources/
│
├── domain/
│   ├── entities/
│   ├── interfaces/
│   ├── usecases/
│
├── presentation/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│
├── components/
│   ├── portfolio/
│   ├── sip/
│   ├── goals/
│   ├── investors/
```

---

# **6. Data Design (IndexedDB Schema)**

## **6.1 Centralized DB (core/database)**

```ts
db.version(2).stores({
  portfolios: "id, investorId",
  sip: "id, portfolioId, investorId, status",
  goals: "id, investorId",
  investors: "id"
});
```

---

## **6.2 Data Models**

### **Portfolio**

```ts
{
  id: string;
  amcName: string;
  scheme: string;
  type: string;
  folio: string;
  investorId: string;
  unitBalance: number;
  navDate: string;
  currentValue: number;
  costValue: number;
  appreciation: number;
  weightedAvg: number;
  xirr: number;
}
```

---

### **SIP**

```ts
{
  id: string;
  portfolioId: string;
  investorId: string;
  amount: number;
  frequency: "Monthly" | "Quarterly";
  startDate: string;
  endDate?: string;
  status: "Active" | "Inactive";
}
```

---

### **Financial Goal**

```ts
{
  id: string;
  name: string;
  description: string;
  startDate: string;
  targetDate: string;
  targetAmount: number;
  sipIds: string[];
  portfolioIds: string[];
  investorId: string;
}
```

---

### **Investor**

```ts
{
  id: string;
  name: string;
}
```

---

# **7. Domain Layer**

## **7.1 Entities**

* Portfolio
* SIP
* FinancialGoal
* Investor

---

## **7.2 Repository Interfaces**

```ts
interface IPortfolioRepository { ... }
interface ISIPRepository { ... }
interface IGoalRepository { ... }
interface IInvestorRepository { ... }
```

---

## **7.3 Use Cases**

| Use Case               | Description                |
| ---------------------- | -------------------------- |
| GetPortfolioSummary    | Aggregates investment data |
| GetActiveSIPs          | Filters active SIPs        |
| CalculateGoalProgress  | Computes % completion      |
| ForecastGoalCompletion | Predicts achievement       |
| GetInvestorHoldings    | Aggregates investor value  |

---

# **8. Business Logic**

## **8.1 Goal Progress**

```ts
progress = (currentValue / targetAmount) * 100
```

---

## **8.2 SIP Future Value**

```ts
FV = P × [(1 + r)^n - 1] / r
```

---

## **8.3 Goal Forecast Logic**

```plaintext
Total Future Value =
  Current Portfolio Value
+ Future SIP Contribution

If >= Target → Goal Achieved
Else → Calculate required time
```

---

## **8.4 Investor Holdings**

```ts
Total = Σ portfolio.currentValue grouped by investor
```

---

# **9. Data Layer Design**

## **9.1 Datasources**

* Dexie-based CRUD operations

## **9.2 Repositories**

* Map DB models → domain entities

---

# **10. Presentation Layer**

## **10.1 Pages**

| Page      | Description              |
| --------- | ------------------------ |
| Dashboard | Overview + charts        |
| Portfolio | Fund listing             |
| SIP       | Active/Inactive tracking |
| Goals     | Goal tracking            |
| Investors | Holdings                 |

---

## **10.2 Hooks**

```ts
usePortfolio()
useSIP()
useGoals()
useInvestor()
```

---

## **10.3 State Management (Zustand)**

```ts
useFinanceGoalStore = {
  portfolios: [],
  sip: [],
  goals: [],
  investors: [],
  loadAll(),
  addGoal(),
  updateSIP()
}
```

---

# **11. UI Design (Mantine)**

## **11.1 Components**

* DataTable (Portfolio)
* Cards (Summary)
* Tabs (SIP Active/Inactive)
* Progress Bars (Goals)
* Charts (Allocation)

---

## **11.2 UX Features**

* Dashboard KPIs
* Drill-down navigation
* Modal-based CRUD
* Responsive layout

---

# **12. Routing Integration**

```ts
/finance
  /dashboard
  /portfolio
  /sip
  /goals
  /investors
```

---

# **13. Validation Rules**

* Target Date > Start Date
* SIP > 0
* Goal must have portfolios
* Portfolio must belong to investor

---

# **14. Non-Functional Requirements**

| Category        | Requirement     |
| --------------- | --------------- |
| Performance     | Fast (<2s load) |
| Offline         | Full support    |
| Scalability     | Modular         |
| Maintainability | Strong typing   |
| Security        | Local storage   |

---

# **15. Error Handling**

* Graceful fallback UI
* Validation errors (forms)
* IndexedDB failure handling

---

# **16. Testing Strategy**

| Type        | Scope             |
| ----------- | ----------------- |
| Unit        | Use cases         |
| Integration | Repository        |
| UI          | Component testing |

---

# **17. Future Enhancements**

* Backend sync
* CAS import
* AI recommendations
* Risk profiling
* Alerts & notifications

---

# **18. Folder Structure (Final)**

```plaintext
AppZ
│
├── core
│   ├── database
│   ├── services
│   ├── theme
│   └── utils
│
├── modules
│   ├── notes
│   └── finance-goal
│        ├── data
│        ├── domain
│        ├── presentation
│        └── components
│
├── routes
└── app.tsx
```

---

# **19. Code Generation Prompt (Final)**

```plaintext
Create a React SPA module "finance-goal" inside AppZ.

Architecture:
- data (models, repositories, datasources)
- domain (entities, interfaces, usecases)
- presentation (pages, hooks, store)
- components (portfolio, sip, goals, investors)

Tech:
- Mantine UI
- Zustand
- Dexie (reuse core/database)

Features:
- Portfolio tracking
- SIP management
- Financial goals
- Investor holdings
- Goal forecasting

Constraints:
- Follow clean architecture
- No cross-module coupling
- Strong typing
- Offline-first
```

---

# **20. Conclusion**

This module:

* Fits seamlessly into your **existing architecture**
* Maintains **clean separation of concerns**
* Supports **offline-first financial tracking**
* Is ready for **enterprise-grade scaling**

---
