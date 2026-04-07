# Finance Goal Dashboard Page

This document describes the `FinanceGoalDashboardPage`, which serves as the central overview for the user's financial goals, portfolios, and systematic investment plans (SIPs).

## 1. Features

*   **Financial Overview:** Displays key metrics such as total current value, cost value, and appreciation of all managed portfolios.
*   **Portfolio Allocation Chart:** A pie chart visualizing the distribution of investments by Asset Management Company (AMC).
*   **SIP Status Chart:** A pie chart showing the breakdown of active versus inactive Systematic Investment Plans.
*   **Goal Progress Tracking:** Lists all defined financial goals and displays their current progress towards the target amount using a progress bar.
*   **Investor Holdings Chart:** A bar chart illustrating the total holdings attributed to each investor.
*   **Quick Add Actions:** Provides buttons to quickly add new investors, portfolios, SIPs, and financial goals via dedicated modal forms.
*   **Error Reporting:** Displays an alert if any errors occur during data fetching or processing.

## 2. UI Components

The page leverages a combination of Mantine UI components for layout and presentation, and Recharts for data visualization.

*   **Layout & Structure:** `Box`, `Card`, `Grid`, `Group`, `Stack` are used to organize content into a responsive and readable layout.
*   **Information Display:** `Text`, `Title`, `Badge` for displaying textual information, headings, and summary counts (e.g., number of investors).
*   **Data Visualization:**
    *   `PieChart`, `Pie`, `Cell`, `ResponsiveContainer` (from Recharts): Used for Portfolio Allocation and SIP Status charts.
    *   `BarChart`, `Bar`, `XAxis`, `YAxis` (from Recharts): Used for Investor Holdings chart.
    *   `RechartsTooltip`: Provides interactive tooltips for chart data points.
    *   `Progress`: Displays the completion progress for individual financial goals.
*   **Interactive Elements:**
    *   `Button`: For "Add Investor", "Add Portfolio", "Add SIP", "Add Goal" actions.
    *   `Tooltip`: Provides contextual help and explains why certain buttons might be disabled.
    *   `Alert`: Displays error messages to the user.
*   **Custom Components:**
    *   `StatusIcon`: Used within buttons to provide visual cues for actions.
    *   `InvestorModal`, `PortfolioModal`, `SIPModal`, `GoalModal`: Modal forms for creating and editing financial entities.

## 3. Data Handling

*   **Data Hooks:** The page utilizes several custom hooks to fetch and manage financial data:
    *   `useFinanceGoalDashboardData`: Aggregates and processes data from goals, portfolios, SIPs, and investors to generate dashboard summaries (e.g., `portfolioSummary`, `activeSipsCount`, `investorHoldings`, `goalProgress`).
    *   `useGoals`, `useInvestor`, `usePortfolio`, `useSIP`: Hooks responsible for fetching and providing access to the respective lists of entities, along with functions to add new ones.
*   **Memoization:** `useMemo` is extensively used to optimize performance by memoizing derived data for charts (`allocationData`, `sipStatusData`, `investorHoldingsChart`), preventing unnecessary re-calculations on re-renders.
*   **Data Flow to Modals:** Functions like `addPortfolio`, `addGoal`, `addSIP`, `addInvestor` are passed as `onSubmit` props to their respective modal components, allowing the modals to trigger data persistence upon form submission.

## 4. User Interactions

*   **Navigation:** Users can view a comprehensive overview of their financial status.
*   **Modal Activation:** Clicking the "Add" buttons (Investor, Portfolio, SIP, Goal) opens the corresponding modal dialogs, allowing users to input new financial data.
*   **Chart Interaction:** Hovering over chart segments or bars displays detailed information via tooltips.

## 5. Validations

*   **Prerequisite-based Button Disabling:** The "Add Portfolio", "Add SIP", and "Add Goal" buttons are conditionally disabled if necessary prerequisites are not met (e.g., "Add Portfolio" is disabled if no investors exist; "Add SIP" and "Add Goal" are disabled if no investors or portfolios exist). This guides the user through the correct data entry sequence.
*   **Error Display:** Any errors encountered by the data fetching hooks (`usePortfolio`, `useGoals`, etc.) are captured and displayed prominently at the top of the dashboard using a Mantine `Alert` component, informing the user of potential data loading issues.

## 6. Enhancements / UX Improvements

*   **Interactive Charts:** Add more interactive features to charts, such as drill-down capabilities or filtering options.
*   **Date Range Filtering:** Allow users to filter dashboard data by specific date ranges to see historical performance.
*   **Customizable Dashboard:** Enable users to customize the layout and types of widgets displayed on their dashboard.
*   **Loading Skeletons:** Implement loading skeletons for data cards and charts to provide a better user experience while data is being fetched.
*   **Empty State Illustrations:** Provide more engaging illustrations or messages when there is "No data yet" for charts or goals.
