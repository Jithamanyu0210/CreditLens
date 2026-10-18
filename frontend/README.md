# CreditLens — Comprehensive Loan Affordability & Repayment Planner

CreditLens is an advanced, production-grade FinTech web platform designed to analyze real loan affordability, monthly cashflow solvency, amortization schedules, and debt freedom strategies.

---

## 🌟 Complete Feature Set

### 1. ⚡ What-If Loan Simulator
- Live multi-slider simulator allowing instant adjustments to **Loan Principal**, **Interest Rate**, and **Tenure**.
- Real-time impact calculations on Monthly EMI, total interest, and residual cashflow.
- Built-in stress tests: **+1.5% interest rate hike** and **-10% income reduction**.

### 2. 🎯 Maximum Affordable Loan Calculator (`/max-loan`)
- Budget-based reverse loan calculation.
- Determines the exact ceiling you can borrow based on:
  $$\text{Income} - (\text{Living Expenses} + \text{Existing EMIs} + \text{Monthly Savings Target})$$
- Enforces conservative 40% safe DTI ceiling so you never overborrow.

### 3. 💡 Financial Insights & Actionable Explanations
- Pinpoints why a loan is **Comfortable**, **Tight**, or **Risky**.
- Generates 3-4 tailored alternatives:
  - Extend tenure to lower monthly burden.
  - Increase down payment to reach comfortable debt levels.
  - Prioritize paying off high-interest existing debts first.
  - Shop for promotional interest rates.

### 4. 💳 Multiple Individual Loan Management (`/profile`)
- Full CRUD for ongoing debts: name, monthly EMI, total outstanding principal, interest rate, and remaining months.
- Aggregates portfolio debt metrics (Total Outstanding Debt, Total Monthly Outflow).

### 5. 🚀 Loan Prepayment Simulator (`/prepayment`)
- Model **Extra Monthly Payments** (e.g., +₹2,500/mo) or **One-Time Lump-Sum Payments** (e.g., ₹50,000 in Month 12).
- Shows exact **tenure reduction in months and years** and **lifetime interest savings**.
- Comparative Recharts visualization (Baseline vs. Prepayment Outlay).

### 6. 🛡️ Financial Goal & Emergency Fund Planner (`/emergency-fund`)
- Calculates monthly essential burn rate (Living Costs + Existing EMIs + New Loan EMI).
- Evaluates safety runway (3-month basic, 6-month recommended, 12-month conservative).
- Projects months needed to reach safety targets based on post-loan disposable surplus.

### 7. 📄 Downloadable Financial Report & CSV Export
- Generates a branded, printable **Executive PDF Report** containing borrower profile, solvency verdict, DTI ratios, and amortization summary.
- One-click CSV export of the full month-by-month repayment schedule.

### 8. 📚 Loan Scenario History & Archive (`/saved`)
- Store, name, tag (Home, Auto, Education, General), search, and filter previous loan simulations.
- 1-click loading into the active calculator or repayment schedule.

### 9. 🧪 Automated Calculation Test Suite (`npm test`)
- 20 unit tests with 100% pass rate:
  - Standard reducing-balance EMI verification against benchmark cases.
  - 0% promotional interest rate edge cases ($P/N$ math).
  - Strict amortization schedule convergence ($Balance = 0$).
  - Reverse max loan calculations and prepayment tenure reduction.
  - Cashflow solvency and runway math.

### 10. 🔒 Secure Backend & Data Protection (`backend/`)
- Express REST API with MongoDB/Mongoose data models (`User`, `FinancialProfile`, `SavedScenario`).
- JWT authentication and bcrypt password hashing.
- Boundary validation middleware enforcing valid positive numbers and interest rate ranges.

### 11. 🌓 Light & Dark Mode
- Universal theme toggle located in the navigation header.
- Custom FinTech Dark Mode with high-contrast text and glowing metric cards.

### 12. ⚖️ Debt Feasibility & Solvency Engine (Central Feature)
- Dedicated 3-point solvency verdict:
  1. **Monthly EMI Servicing**: Confirms monthly cashflow surplus $\ge 0$.
  2. **Total Principal & Interest Solvency**: Confirms total loan repayment is covered by cumulative projected earnings.
  3. **Savings Target Fulfillment**: Verifies whether user can save their chosen monthly target (e.g. ₹15,000/mo) after paying all debts.

---

## 🚀 Running the Project Locally

### 1. Frontend
```bash
cd frontend
npm install
npm test      # Runs all 20 automated calculation tests
npm run dev   # Starts Vite development server at http://localhost:5173
```

### 2. Backend (Optional for persistent DB)
```bash
cd backend
npm install
npm run dev   # Starts secure Express REST API at http://localhost:5000
```
