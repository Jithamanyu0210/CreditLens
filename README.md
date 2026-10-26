# CreditLens — Comprehensive Loan Affordability & Repayment Planner

[![GitHub Repository](https://img.shields.io/badge/GitHub-Jithamanyu0210%2FCreditLens-blue?logo=github)](https://github.com/Jithamanyu0210/CreditLens)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express Version](https://img.shields.io/badge/Express-v4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://cloud.mongodb.com/)
[![Google Gemini API](https://img.shields.io/badge/AI-Google%20Gemini-8E75C2?logo=google&logoColor=white)](https://aistudio.google.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-84%2F84%20Passing-success)](https://github.com/Jithamanyu0210/CreditLens)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)

> **CreditLens** is a full-stack FinTech web application that helps borrowers analyze true loan affordability, calculate reducing-balance EMIs, evaluate monthly cashflow solvency, simulate prepayment strategies, explore verified bank interest rates, and make risk-aware financial decisions.

---

## 📋 Table of Contents

- [A. Project Title & Introduction](#a-project-title--introduction)
- [B. Problem Statement](#b-problem-statement)
- [C. Objectives](#c-objectives)
- [D. Features](#d-features)
  - [AI Financial Assistant (`/ai-assistant`)](#10-ai-financial-assistant-ai-assistant)
- [E. Technology Stack](#e-technology-stack)
- [F. System Architecture](#f-system-architecture)
- [G. Project Directory Structure](#g-project-directory-structure)
- [H. Installation & Local Setup](#h-installation--local-setup)
- [I. Environment Variables](#i-environment-variables)
- [J. API Documentation](#j-api-documentation)
- [K. Deployment on Vercel](#k-deployment-on-vercel)
- [L. Testing & Troubleshooting](#l-testing--troubleshooting)
- [M. Security](#m-security)
- [N. Future Enhancements](#n-future-enhancements)
- [O. Limitations & Disclaimer](#o-limitations--disclaimer)
- [P. Results & Conclusion](#p-results--conclusion)
- [Q. Contribution & License](#q-contribution--license)

---

## A. Project Title & Introduction

**CreditLens** is a modern, production-grade financial planning platform engineered to demystify retail borrowing. While conventional loan calculators compute a single Equated Monthly Installment (EMI) in isolation, CreditLens evaluates loans within the holistic context of a borrower's real-world cashflow: net take-home pay, non-negotiable living costs, discretionary lifestyle expenses, active loan obligations, and targeted liquid emergency savings.

By bridging mathematical rigor with an intuitive user experience and optional **Google Gemini AI** contextual analysis, CreditLens transforms opaque loan terms into actionable financial clarity.

- **GitHub Repository**: [https://github.com/Jithamanyu0210/CreditLens](https://github.com/Jithamanyu0210/CreditLens)
- **Primary Domain**: Retail Lending, Loan Amortization, Personal Debt Planning, and FinTech Analytics.

---

## B. Problem Statement

Retail borrowers frequently enter long-term credit agreements with incomplete financial visibility. Critical pain points include:

1. **The Isolated EMI Trap**: Traditional bank calculators tell users *what* the monthly EMI is, but not *whether* they can safely afford it alongside existing obligations and living costs.
2. **Opaque Cumulative Interest**: Borrowers underestimate the impact of seemingly minor rate differentials (e.g., 8.5% vs. 9.75%) or longer tenures, which can cost lakhs of rupees over the loan lifetime.
3. **Overleveraging & Debt Distress**: Without tracking their **Debt-to-Income (DTI)** ratio, borrowers easily exceed safe borrowing ceilings (40–50% of income), making them vulnerable to default during personal emergencies.
4. **Unrealized Prepayment Opportunities**: Borrowers are rarely shown how small, regular extra payments (e.g., an additional ₹2,000/month or an annual bonus) compress loan amortization and yield massive interest savings.
5. **Fragmented Bank Disclosures**: Comparing lending rates across public and private sector banks requires navigating dozens of institution portals with inconsistent disclosure terminology.

CreditLens directly addresses these challenges through a unified, transparent intelligence dashboard.

---

## C. Objectives

- **Estimate Loan Affordability**: Evaluate borrowing capacity against a user's income, expense baseline, and existing debt commitments.
- **Calculate Accurate EMIs & Interest**: Deliver deterministic calculations for standard reducing-balance and 0% promotional loans.
- **Provide Month-by-Month Amortization**: Generate complete repayment schedules with exact zero-balance final month reconciliation.
- **Enable Side-by-Side Loan Comparison**: Compare up to 5 distinct loan structures simultaneously, identifying the lowest monthly EMI vs. the lowest total interest cost.
- **Evaluate What-If Scenarios**: Model accelerated prepayments, emergency fund runways, and borrowing capacity ceilings.
- **Offer Market Rate Transparency**: Maintain a verified catalog of retail loan rates from 19+ leading Indian financial institutions.
- **Support Data Persistence & Isolation**: Securely store profiles and scenarios in MongoDB Atlas with strict per-user authorization.

---

## D. Features

The features documented below are **fully implemented and verified** in the active codebase:

### 1. Financial Profile & Debt Portfolio (`/profile`)
- **Baseline Cashflow Inputs**: Net monthly take-home income, mandatory living expenses, recurring discretionary lifestyle costs, monthly savings targets, and current liquid cash reserves.
- **Active Debt Manager**: Full CRUD manager for existing loan commitments (Personal, Vehicle, Education, etc.) with monthly EMIs, balances, interest rates, and remaining tenures.
- **Double-Counting Prevention**: Prevents counting debt repayments inside general living expenses to ensure mathematical solvency.

### 2. Interactive EMI Calculator (`/calculator`)
- Dual-control synchronized sliders and exact numeric inputs for Loan Principal (₹10,000 to ₹10,00,00,000), Annual Interest Rate (0% to 30%), and Tenure (in Years or Months).
- Real-time updates for monthly EMI, total interest payable, and total loan cost.
- Principal vs. Interest breakdown chart powered by Recharts.
- **Stress-Test Scenarios**: Instant 1-click simulations for potential interest rate hikes (+1.5%) and income reductions (-10%).
- Direct 1-click action to transfer calculations into the Amortization Schedule or save to cloud scenarios.

### 3. Loan Affordability & Cashflow Solvency (`/affordability`)
- Real-time solvency calculation:
  $$\text{Net Balance} = \text{Monthly Income} - (\text{Living Expenses} + \text{Other Expenses} + \text{Existing EMIs} + \text{Proposed EMI})$$
- Automated rule-based classification:
  - 🟢 **Comfortable**: Total debt payments $\le 35\%$ of income with positive cashflow surplus.
  - 🟡 **Tight**: Debt payments between $35\%$ and $50\%$ of income, or surplus is below the savings target.
  - 🔴 **Risky**: Total DTI exceeds $50\%$ or monthly cashflow is in deficit.
- Comprehensive DTI and expense ratio progress gauges with contextual advice.

### 4. Month-by-Month Amortization Schedule (`/schedule`)
- Granular schedule detailing opening balance, EMI, principal payment, interest component, and closing balance.
- **Strict Zero-Balance Reconciliation**: Mathematical guarantee that the final month closing balance hits exactly ₹0.
- Yearly aggregated rollups and monthly expandable views.
- **Data Export Tools**: One-click CSV export and a print-ready Executive Report stylesheet.

### 5. Multi-Loan Comparison (`/compare`)
- Compare up to 5 distinct loan structures side-by-side.
- Automated highlight badges for **Lowest Monthly EMI** (cashflow friendly) and **Lowest Total Interest** (cost-effective).
- Profile compatibility check indicating whether each loan fits the active budget.

### 6. Four Dedicated Planning Simulators
- **Maximum Affordable Loan Simulator (`/max-loan`)**: Computes the borrowing ceiling via inverse reducing-balance math bounded by disposable surplus and a strict 40% DTI ceiling.
- **Prepayment Simulator (`/prepayment`)**: Models recurring extra monthly payments or lump-sum principal paydowns, computing exact months shaved off tenure and cumulative interest saved.
- **Emergency Fund Runway Planner (`/emergency-fund`)**: Evaluates essential monthly burn rate (living expenses + all EMIs) and calculates runway against 3-month, 6-month, and 12-month safety benchmarks.
- **Scenario Comparison Matrix (`/compare`)**: Multi-dimensional trade-off matrix across tenure, interest rate, and outlay.

### 7. Verified Bank Interest Rates Comparison (`/bank-rates`)
- Curated dataset covering **19+ leading Indian banks** (State Bank of India, HDFC Bank, ICICI Bank, Axis Bank, Bank of Baroda, Kotak Mahindra Bank, Punjab National Bank, Canara Bank, Union Bank, etc.).
- Covers 6 retail categories: **Home**, **Car**, **Personal**, **Education**, **Two-Wheeler**, and **Gold Loans**.
- Displays minimum rates, maximum rates, processing charges, and links to official bank rate disclosures.
- Instant search by bank name, category, and public/private sector with a 1-click **Auto-Fill into Calculator** feature.
- Streamlined rate discovery interface focused purely on actionable comparison data.

### 8. Saved Loan Scenarios (`/saved-scenarios`)
- Persistent scenario storage in MongoDB Atlas.
- Full CRUD operations: name scenarios, assign tags (Home, Auto, Education, Refinance), write notes, duplicate with 1 click, and delete.

### 9. User Authentication & Login-First Session Routing
- User registration and login utilizing **bcryptjs** (10 salt rounds) and **JSON Web Tokens (JWT)**.
- **Login-First Route Protection**: Unauthenticated users visiting the site or attempting direct access to protected routes are automatically redirected to the Sign In page.
- **Session Restoration on Refresh**: Active valid sessions are smoothly restored from secure storage on page refresh without forcing users to re-authenticate.
- **Automatic Token Purge**: Expired or invalid tokens are safely cleared with an immediate redirect to Sign In.
- Strict multi-tenant user isolation ensuring users cannot access or mutate records belonging to others.

### 10. AI Financial Assistant (`/ai-assistant`)
A dedicated, single-page conversational intelligence suite placed separately in the sidebar, powered by backend **Google Gemini AI** and deterministic financial calculations:
- **Feature A — AI Financial Insights**:
  - 1-click **Generate Financial Insights** action analyzing the user's actual saved income, expenses, active EMIs, and liquid reserves.
  - Plain-English executive summary accompanied by 4 key metric cards (Inflow, Outflow, Debt Servicing, Disposable Cashflow).
  - Categorized breakdown: *Affordability & Cash Flow Concerns*, *Cash Flow Optimization Suggestions*, and *Key Considerations Before Additional Borrowing*.
  - Clean missing data detection and real-time regeneration.
- **Feature B — Monthly Budget Insights**:
  - Detailed income vs. outflow comparison utilizing backend-calculated totals.
  - Identifies expense commitments requiring attention and evaluates debt-to-income balance.
  - Realistic budgeting frameworks (e.g. 50/30/20 standard) and actionable savings improvement strategies.
  - Emergency cushion analysis (target cushion vs. existing savings and monthly burn rate).
- **Feature C — Ask CreditLens: AI Chat Assistant**:
  - Interactive conversational interface with a welcome guide, message thread, and loading states.
  - **5 Instant Starter Questions**:
    1. *How can I improve my monthly savings?*
    2. *Can I afford another loan based on my current finances?*
    3. *How can I reduce my monthly financial burden?*
    4. *Explain my current financial situation in simple words.*
    5. *What should I consider before taking a loan?*
  - Dual-layer safety: Deterministic calculations remain the source of truth, Gemini explains results, and server-only API key handling ensures zero key exposure.
  - Includes duplicate send prevention, clear quota/error notifications, and financial disclaimer badges.

### 11. Distinct Light & Dark Theme Dashboard
- **Light Theme**: Clean, bright `#f8fafc` canvas, pure `#ffffff` cards with subtle borders (`#e2e8f0`), deep slate typography (`#0f172a`), emerald green positive metrics, and rich indigo accents.
- **Dark Theme**: Deep navy/obsidian `#080d19` background, `#131d35` cards with luminous borders (`rgba(148, 163, 184, 0.16)`), readable `#f8fafc` and `#cbd5e1` text, cyan/indigo buttons, and high-contrast form inputs.
- Preserved theme switching with CSS tokens (`data-theme="light"` / `data-theme="dark"`), persisted in `localStorage` with system preference fallback.
- Stable, responsive layout with zero unwanted horizontal overflow or page shaking.

> [!NOTE]
> **Implementation Status**: All 11 features above are fully implemented and backed by passing automated tests. Automated daily web scraping of live bank websites and server-side PDF generation are planned for future versions.

---

## E. Technology Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Component-based user interface library |
| **Vite** | `^8.3.0` | Frontend build tool and local dev server |
| **React Router DOM** | `^7.18.4` | Client-side routing and protected navigation |
| **Recharts** | `^3.10.1` | Financial chart visualizations (Pie, Bar, Area) |
| **Lucide React** | `^1.59.0` | UI iconography |
| **Vanilla CSS3** | Custom | Modular design system with CSS tokens and light/dark theme variables |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` | JavaScript server runtime (ES Modules) |
| **Express.js** | `^4.21.2` | REST API gateway and routing |
| **Mongoose** | `^8.9.5` | MongoDB Object Data Modeling (ODM) |
| **JSON Web Tokens (JWT)**| `^9.0.2` | Stateless authentication tokens |
| **bcryptjs** | `^3.0.3` | Password hashing and salting |
| **CORS** | `^2.8.5` | Cross-Origin Resource Sharing control |
| **dotenv** | `^16.4.7` | Local environment variable management |

### Database
| Technology | Hosting | Purpose |
| :--- | :--- | :--- |
| **MongoDB Atlas** | Cloud Cluster (M0+) | Document store for users, profiles, scenarios, and bank rates |

### AI Integration
| Technology | SDK | Purpose |
| :--- | :--- | :--- |
| **Google Gemini API** | `@google/genai` `^2.30.0` | Contextual narrative financial explanations and trade-off insights |

### Deployment & Tooling
| Technology | Role | Purpose |
| :--- | :--- | :--- |
| **Vercel** | Cloud Host | Serverless Express API & Vite static frontend deployment |
| **Node.js Test Runner** | Built-in (`node --test`) | Native test runner for integration and unit suites |
| **Supertest** | `^7.0.0` | HTTP assertion testing for Express REST endpoints |
| **Oxlint** | `^1.81.0` | High-performance JavaScript/JSX linter |
| **Git / GitHub** | Version Control | Source code repository and workflow management |

---

## F. System Architecture

CreditLens uses a modern decoupled architecture where the React Single-Page Application (SPA) and the Express REST API are maintained in the same repository but deployable as independent micro-services on Vercel:

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 19 + Vite on Vercel)"]
        UI["Interactive UI Pages (Dashboard, Calculator, Affordability, Simulators)"]
        AuthCtx["Auth Context (JWT & Session Hydration)"]
        LoanCtx["Loan Context (State Sync & Calculators)"]
        ThemeCtx["Theme Context (Dark / Light Mode)"]
        APIClient["API Client (services/api.js)"]

        UI --> AuthCtx
        UI --> LoanCtx
        UI --> ThemeCtx
        LoanCtx --> APIClient
        AuthCtx --> APIClient
    end

    subgraph Edge ["API Gateway (Express on Vercel Serverless)"]
        VercelRewrite["vercel.json Catch-All Rewrites (/(.*) -> /api/index.js)"]
        ServerlessHandler["api/index.js (Cold Start DB Pre-warm & Handler)"]
        ExpressApp["src/app.js (CORS, JSON Parser, Error Handlers)"]

        VercelRewrite --> ServerlessHandler --> ExpressApp
    end

    subgraph BackendServices ["Backend Controllers & Calculation Engine"]
        AuthCtrl["Auth Controller (/api/auth)"]
        ProfileCtrl["Profile Controller (/api/profile)"]
        LoanCtrl["Loan Controller (/api/loans)"]
        SimCtrl["Simulator Controller (/api/simulators)"]
        ScenarioCtrl["Scenario Controller (/api/scenarios)"]
        BankCtrl["Bank Rate Controller (/api/bank-rates)"]
        AICtrl["AI Controller (/api/ai)"]

        EMISvc["EMI Service (Reducing-Balance Math)"]
        AmortSvc["Amortization Service (Zero-Balance Schedule)"]
        AffordSvc["Affordability Service (DTI & Solvency Math)"]
        SimSvc["Simulator Service (Max Loan, Prepayment, Runway)"]

        LoanCtrl --> EMISvc
        LoanCtrl --> AmortSvc
        LoanCtrl --> AffordSvc
        SimCtrl --> SimSvc
    end

    subgraph CloudInfra ["Cloud Infrastructure"]
        Atlas[("MongoDB Atlas Cloud Database (Users, Profiles, Scenarios)")]
        Gemini[("Google Gemini AI API (gemini-3.8-flash)")]
    end

    APIClient <==>|"HTTPS / REST (Bearer JWT)"| VercelRewrite
    ExpressApp --> AuthCtrl
    ExpressApp --> ProfileCtrl
    ExpressApp --> LoanCtrl
    ExpressApp --> SimCtrl
    ExpressApp --> ScenarioCtrl
    ExpressApp --> BankCtrl
    ExpressApp --> AICtrl

    AuthCtrl --> Atlas
    ProfileCtrl --> Atlas
    ScenarioCtrl --> Atlas
    BankCtrl --> Atlas
    AICtrl --> Gemini
```

### Component Roles
1. **Frontend Client**: Manages client routing, user inputs, mathematical client-side mirrors, local storage caching, and API calls.
2. **Serverless Handler (`api/index.js`)**: Serves as the Vercel entrypoint, ensuring the MongoDB Atlas connection is cached across lambda warm states and initialized on cold starts.
3. **Calculation Engine (`src/services/`)**: Deterministic mathematical core executing financial calculations independently of the database.
4. **MongoDB Atlas**: Cloud data layer storing hashed credentials, financial baselines, and user scenarios.
5. **Google Gemini API**: External AI service transforming deterministic calculation outputs into personalized, accessible prose.

---

## G. Project Directory Structure

```text
creditlens/
├── .gitignore                          # Root ignore file
├── README.md                           # Master project documentation
├── package-lock.json                   # Root lockfile
│
├── backend/                            # Express.js REST API
│   ├── .env.example                    # Template for backend environment variables
│   ├── .gitignore                      # Backend-specific ignore rules (includes .vercel)
│   ├── package.json                    # Backend dependencies and scripts
│   ├── server.js                       # Local redirect stub to src/server.js
│   ├── vercel.json                     # Vercel serverless rewrite configuration
│   ├── api/
│   │   └── index.js                    # Vercel Serverless Function entrypoint
│   ├── src/
│   │   ├── app.js                      # Express application, routes, CORS, error middleware
│   │   ├── server.js                   # Local server bootstrap, port listener, DB startup
│   │   ├── config/
│   │   │   └── db.js                   # Mongoose connection with promise caching & URI masking
│   │   ├── controllers/
│   │   │   ├── aiController.js         # Gemini insights, budget analysis, chat assistant & status
│   │   │   ├── authController.js       # Register, login, getMe, logout
│   │   │   ├── bankRateController.js   # Verified bank rates querying, search, and seed
│   │   │   ├── loanController.js       # EMI, affordability, amortization, compare
│   │   │   ├── profileController.js    # Financial profile and debt manager CRUD
│   │   │   ├── scenarioController.js   # Saved scenario CRUD and duplication
│   │   │   └── simulatorController.js  # Max loan, prepayment, and runway calculations
│   │   ├── data/
│   │   │   └── bankRatesData.js        # 19+ verified Indian banks dataset across 6 loan types
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT extraction and validation middleware
│   │   │   ├── errorMiddleware.js      # Global 404 and centralized error handler
│   │   │   └── validateRequest.js      # Boundary and type validation middleware
│   │   ├── models/
│   │   │   ├── BankRate.js             # Bank loan scheme Mongoose schema
│   │   │   ├── FinancialProfile.js     # User cashflow baseline and existing EMIs schema
│   │   │   ├── LoanScenario.js         # Saved calculation scenario schema
│   │   │   └── User.js                 # User credentials schema with bcrypt pre-save hook
│   │   ├── routes/
│   │   │   ├── aiRoutes.js             # /api/ai endpoints (insights, budget, chat, status)
│   │   │   ├── authRoutes.js           # /api/auth endpoints
│   │   │   ├── bankRateRoutes.js       # /api/bank-rates endpoints
│   │   │   ├── loanRoutes.js           # /api/loans endpoints
│   │   │   ├── profileRoutes.js        # /api/profile endpoints
│   │   │   ├── scenarioRoutes.js       # /api/scenarios endpoints
│   │   │   └── simulatorRoutes.js      # /api/simulators endpoints
│   │   └── services/
│   │       ├── affordabilityService.js # DTI, solvency verdicts, and cashflow math
│   │       ├── amortizationService.js  # Month-by-month zero-balance amortization
│   │       ├── emiService.js           # Reducing-balance & 0% interest formulas
│   │       ├── geminiService.js        # Google GenAI integration (gemini-3.5-flash) with fallback
│   │       └── simulatorService.js     # Inverse EMI, prepayment, and runway services
│   └── tests/
│       ├── api.test.js                 # Supertest REST API integration suite
│       ├── atlas.test.js               # Live MongoDB Atlas integration suite
│       ├── bank_rates.test.js          # Bank rates query and search suite
│       ├── gemini.test.js              # Gemini AI service and fallback suite
│       ├── scenarios.test.js           # Scenario lifecycle and user isolation suite
│       └── services.test.js            # Pure mathematical unit test suite
│
└── frontend/                           # React 19 Client SPA
    ├── .gitignore                      # Frontend-specific ignore rules
    ├── index.html                      # HTML5 entrypoint with Google Fonts
    ├── package.json                    # Frontend dependencies and scripts
    ├── vite.config.js                  # Vite configuration with /api proxy
    └── src/
        ├── App.css                     # Component micro-styles
        ├── App.jsx                     # Router, route protection, and navigation shell
        ├── index.css                   # Global design tokens, resets, light/dark themes
        ├── main.jsx                    # React DOM root entrypoint with ErrorBoundary
        ├── components/
        │   └── common/
        │       ├── BackButton.jsx      # Navigation return button
        │       ├── Disclaimer.jsx      # Regulatory financial disclaimer banner
        │       ├── ErrorBoundary.jsx   # Top-level React error recovery boundary
        │       ├── HelpTooltip.jsx     # Floating contextual help tooltips
        │       ├── Navbar.jsx          # Top navigation with theme toggle and user state
        │       ├── ProtectedRoute.jsx  # Route guards (ProtectedRoute, PublicOnlyRoute)
        │       ├── Sidebar.jsx         # Collapsible sidebar with AI Financial Assistant link
        │       ├── TopNavbar.jsx       # Header bar with session and theme controls
        │       └── Toast.jsx           # Global notification toast system
        ├── context/
        │   ├── AuthContext.jsx         # User state, JWT storage, login/logout, session restore
        │   ├── LoanContext.jsx         # Active loan state, profile sync, scenarios sync
        │   └── ThemeContext.jsx        # Dark/Light mode state with localStorage
        ├── pages/
        │   ├── AffordabilityPage.jsx   # Solvency calculations, DTI gauges, AI insights
        │   ├── AiAssistantPage.jsx     # Dedicated AI suite: Insights, Budget, & Chat
        │   ├── BankRatesPage.jsx       # 19+ bank rate comparison and search
        │   ├── CalculatorPage.jsx      # EMI calculator with sliders and charts
        │   ├── ComparePage.jsx         # Multi-loan comparison matrix
        │   ├── DashboardPage.jsx       # Executive KPI dashboard and simulator hub
        │   ├── EmergencyFundPage.jsx   # Essential burn rate and runway planner
        │   ├── LoginPage.jsx           # User sign-in
        │   ├── MaxLoanPage.jsx         # Reverse max loan capacity simulator
        │   ├── PrepaymentPage.jsx      # Early payoff and interest savings simulator
        │   ├── ProfilePage.jsx         # Financial baseline and active debts manager
        │   ├── RegisterPage.jsx        # Account registration
        │   ├── SavedScenariosPage.jsx  # Saved scenarios archive
        │   └── SchedulePage.jsx        # Amortization schedule, CSV export, print view
        ├── services/
        │   └── api.js                  # Shared API client with error handling & AI methods
        └── utils/
            ├── formatters.js           # Currency (₹) and percentage formatting helpers
            ├── loanCalculations.js     # Client-side mirror of financial calculation engine
            └── loanCalculations.test.js# 21-case automated test suite for financial math
```

---

## H. Installation & Local Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/)). Verify with `node -v`.
- **npm**: `v9.0.0` or higher. Verify with `npm -v`.
- **MongoDB**: A free cloud cluster on [MongoDB Atlas](https://cloud.mongodb.com/) (recommended) or a local instance (`mongodb://127.0.0.1:27017`).
- **Google Gemini API Key** (Optional): Obtain a free key from [Google AI Studio](https://aistudio.google.com/).

### Step 1: Clone the Repository
```bash
git clone https://github.com/Jithamanyu0210/CreditLens.git
cd CreditLens
```

### Step 2: Set Up the Backend
Open a terminal and navigate to the `backend/` directory:
```bash
cd backend
npm install
```

Create your local `.env` file from the example template:
- **Linux / macOS**:
  ```bash
  cp .env.example .env
  ```
- **Windows (PowerShell / Command Prompt)**:
  ```powershell
  copy .env.example .env
  ```

Open `backend/.env` in your editor and configure your credentials (see [Section I](#i-environment-variables)).

### Step 3: Set Up the Frontend
Open a separate terminal window and navigate to `frontend/`:
```bash
cd frontend
npm install
```

### Step 4: Run the Application Locally

#### Terminal 1 — Start the Backend Server:
```bash
cd backend
npm run dev
```
*Output confirmation:*
```text
[Database] MongoDB Atlas Connected: cluster0-shard-00-00.xxxxx.mongodb.net/creditlens
[CreditLens Backend] Secure server running on http://localhost:5000 (0.0.0.0:5000)
[CreditLens Backend] API Health Check: http://localhost:5000/api/health
```

#### Terminal 2 — Start the Frontend Dev Server:
```bash
cd frontend
npm run dev
```
*Output confirmation:*
```text
  VITE v8.3.0  ready in 240 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and navigate to **`http://localhost:5173`**.

> [!TIP]
> **Windows PowerShell Tip**: If script execution is disabled on your system (`npm.ps1 cannot be loaded`), run commands via Command Prompt:
> ```powershell
> cmd /c "npm run dev"
> cmd /c "npm test"
> ```

---

## I. Environment Variables

All sensitive credentials and database connection strings are isolated on the server. **Never commit `.env` files to Git.** Both the root `.gitignore` and `backend/.gitignore` are pre-configured to exclude `.env` files.

### Backend Environment Variables (`backend/.env`)

| Variable Name | Required | Default / Example Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `5000` | Port for the local Express HTTP server |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development`, `production`, `test`) |
| `CLIENT_ORIGIN` | **Required in Prod** | `http://localhost:5173` | Allowed frontend origin for CORS. Supports comma-separated domains. |
| `MONGODB_URI` | **Required** | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/creditlens?retryWrites=true&w=majority` | MongoDB Atlas SRV connection string |
| `MONGODB_DB_NAME` | Optional | `creditlens` | Database name inside MongoDB |
| `JWT_SECRET` | **Required** | `your_long_random_jwt_secret_key_here` | Cryptographic secret for signing session JWTs |
| `GEMINI_API_KEY` | Optional | `your_gemini_api_key_here` | Google Gemini API key for natural language explanations |
| `GEMINI_MODEL` | Optional | `gemini-3.5-flash` | Gemini model identifier (supports `gemini-3.5-flash`) |

#### Safe Backend Template Example:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/creditlens?retryWrites=true&w=majority
MONGODB_DB_NAME=creditlens
JWT_SECRET=super_secret_creditlens_fintech_key_change_in_production
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
```

### Frontend Environment Variables (`frontend/.env.production`)

| Variable Name | Required | Example Production Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | **Required in Prod** | `https://credit-lens-fvm8.vercel.app/api` | Full base URL of the deployed backend API gateway |

*During local development, `VITE_API_URL` is optional because Vite's proxy automatically routes `/api` calls to `http://localhost:5000`.*

---

## J. API Documentation

All API requests and responses use the `application/json` content type. Authenticated endpoints require a Bearer token in the request header:  
`Authorization: Bearer <jwt_token>`

### 1. Gateway & Health Checks
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | None | API heartbeat and system status check |
| `GET` | `/health` | None | Direct health check alias |
| `GET` | `/` | None | API metadata and regulatory disclaimer |

### 2. Authentication (`/api/auth`)
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | None | Registers a new user account; returns JWT and user profile |
| `POST` | `/api/auth/login` | None | Authenticates user credentials; returns JWT and user profile |
| `GET` | `/api/auth/me` | Bearer | Returns the authenticated user's profile |
| `POST` | `/api/auth/logout` | None | Session invalidation confirmation |

### 3. Financial Profile & Debt Portfolio (`/api/profile`)
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Bearer | Retrieves user's financial baseline and existing debts |
| `POST` | `/api/profile` | Bearer | Creates or updates user financial baseline and debt list |
| `PUT` | `/api/profile` | Bearer | Updates financial profile (alias for POST) |
| `DELETE`| `/api/profile` | Bearer | Resets financial profile and active loans to defaults |

### 4. Loan Calculations (`/api/loans`)
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/loans/calculate-emi` | None | Computes reducing-balance EMI, total interest, and total cost |
| `POST` | `/api/loans/affordability` | Optional | Evaluates DTI, cashflow solvency verdict, and advice |
| `POST` | `/api/loans/amortization` | None | Generates month-by-month zero-balance amortization schedule |
| `POST` | `/api/loans/compare` | None | Compares 2 to 5 distinct loan structures |

### 5. Planning Simulators (`/api/simulators`)
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/simulators/max-loan` | None | Computes maximum borrowing capacity within a 40% DTI ceiling |
| `POST` | `/api/simulators/prepayment` | None | Computes tenure compression and interest saved via extra payments |
| `POST` | `/api/simulators/emergency-fund` | None | Evaluates essential monthly burn rate and runway (3/6/12 months) |
| `POST` | `/api/simulators/compare-scenarios` | None | Generates multi-loan scenario comparison matrix |

### 6. Verified Bank Interest Rates (`/api/bank-rates`)
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bank-rates` | None | Queries verified bank rates (supports filters: `loanType`, `bank`, `search`) |
| `GET` | `/api/bank-rates/categories` | None | Returns supported loan categories with rate counts |
| `GET` | `/api/bank-rates/banks` | None | Returns distinct list of 19+ Indian banks |
| `GET` | `/api/bank-rates/search` | None | Exact match lookup by bank code and loan type |
| `GET` | `/api/bank-rates/:id` | None | Fetches single bank rate scheme details |
| `POST` | `/api/bank-rates/seed` | Bearer | Maintenance route to refresh canonical bank rates |
| `POST` | `/api/bank-rates` | Bearer | Creates a verified bank rate record |
| `PUT` | `/api/bank-rates/:id` | Bearer | Updates an existing bank rate record |

### 7. Saved Scenarios (`/api/scenarios`)
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/scenarios` | Bearer | Lists all saved scenarios for the authenticated user |
| `POST` | `/api/scenarios` | Bearer | Saves a new loan calculation scenario |
| `GET` | `/api/scenarios/:id` | Bearer | Retrieves a single saved scenario by ID |
| `PUT` | `/api/scenarios/:id` | Bearer | Updates an existing saved scenario |
| `POST` | `/api/scenarios/:id/duplicate` | Bearer | Duplicates an existing scenario with `(Copy)` label |
| `DELETE`| `/api/scenarios/:id` | Bearer | Deletes a scenario (enforcing user ownership) |

### 8. Gemini AI Financial Insights & Assistant (`/api/ai`)
| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ai/status` | None | Returns Gemini API availability, active model, and supported features |
| `POST` | `/api/ai/financial-insights` | Bearer | Generates executive financial insights, concerns, and suggestions for user |
| `POST` | `/api/ai/budget-insights` | Bearer | Generates monthly budget comparison, expense alerts, and emergency cushion |
| `POST` | `/api/ai/chat` | Bearer | Contextual chat assistant responding to financial questions with profile data |
| `POST` | `/api/ai/explain-affordability` | Optional | Generates narrative explanation of loan affordability |
| `POST` | `/api/ai/explain-comparison` | Optional | Generates trade-off analysis comparing multiple loan options |

---

## K. Deployment on Vercel

CreditLens is architected to deploy on [Vercel](https://vercel.com/) as **two separate projects** linked to the same GitHub repository: one for the Vite frontend and one for the Express serverless backend.

```text
GitHub: Jithamanyu0210/CreditLens
  ├── Project 1: Frontend SPA (Root Directory: frontend)  ->  https://credit-lens-orcin.vercel.app
  └── Project 2: Backend REST (Root Directory: backend)   ->  https://credit-lens-fvm8.vercel.app
```

### Pre-Deployment Requirement: MongoDB Atlas Network Access
Because Vercel Serverless Functions execute on dynamic IP ranges hosted on AWS, you must allow universal network access:
1. Log into your [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. In the left navigation, go to **Security** $\rightarrow$ **Network Access**.
3. Click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Confirm**.

---

### Step-by-Step Vercel Deployment

#### Part 1: Deploy the Backend Project
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** $\rightarrow$ **Project**.
2. Select your repository: **`Jithamanyu0210/CreditLens`**.
3. In the project configuration:
   - **Project Name**: e.g., `credit-lens-backend`
   - **Framework Preset**: Select **Other**.
   - **Root Directory**: Click *Edit* and select **`backend`**.
4. Expand **Environment Variables** and add:
   - `MONGODB_URI` = `<your-mongodb-atlas-srv-connection-string>`
   - `MONGODB_DB_NAME` = `creditlens`
   - `JWT_SECRET` = `<a-strong-random-secret-key>`
   - `GEMINI_API_KEY` = `<your-google-gemini-api-key>` (optional)
   - `CLIENT_ORIGIN` = `https://credit-lens-orcin.vercel.app`
5. Click **Deploy**.
6. When deployment finishes, your assigned backend domain is **`https://credit-lens-fvm8.vercel.app`**.
7. Verify by opening `https://credit-lens-fvm8.vercel.app/api/health` in your browser. It returns `{"status":"healthy"}`.

#### Part 2: Deploy the Frontend Project
1. In your Vercel Dashboard, click **Add New...** $\rightarrow$ **Project**.
2. Select the same repository: **`Jithamanyu0210/CreditLens`**.
3. In the project configuration:
   - **Project Name**: e.g., `credit-lens-frontend`
   - **Framework Preset**: Select **Vite**.
   - **Root Directory**: Click *Edit* and select **`frontend`**.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://credit-lens-fvm8.vercel.app/api`
5. Click **Deploy**.
6. Your assigned frontend domain is **`https://credit-lens-orcin.vercel.app`**.

#### Part 3: Synchronize CORS on the Backend
1. Open your **Backend Project** on Vercel $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**.
2. Set `CLIENT_ORIGIN` to your exact frontend production URL:
   ```env
   CLIENT_ORIGIN=https://credit-lens-orcin.vercel.app
   ```
3. Trigger a redeployment of the backend (**Deployments** $\rightarrow$ **Redeploy**) so the CORS filter accepts requests from your production frontend.

> [!TIP]
> **Active Production Deployments**:
> - **Live Frontend**: [https://credit-lens-orcin.vercel.app/](https://credit-lens-orcin.vercel.app/)
> - **Live Backend API**: [https://credit-lens-fvm8.vercel.app/](https://credit-lens-fvm8.vercel.app/)
> - **Official Guides**: Refer to [Vercel Node.js Serverless Functions](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js) and [Vercel Vite Deployment](https://vercel.com/docs/frameworks/vite).

---

## L. Testing & Troubleshooting

### Automated Test Suites

CreditLens includes **84 automated tests** with 100% passing status:

```bash
# 1. Run Backend Test Suite (63 tests across 6 suites)
cd backend
npm test

# 2. Run Frontend Calculation Test Suite (21 math tests)
cd frontend
npm test
```

#### Test Suite Coverage:
- **`tests/services.test.js`**: Pure mathematical calculations for reducing-balance EMI, zero-balance amortization reconciliation, prepayment savings, and solvency thresholds.
- **`tests/api.test.js`**: REST endpoints, status codes, input validations, and error handling.
- **`tests/atlas.test.js`**: Live database integration, document persistence, and updates.
- **`tests/bank_rates.test.js`**: Bank rate querying, category counting, and keyword search.
- **`tests/gemini.test.js`**: Gemini AI API response handling and graceful fallback behavior.
- **`tests/scenarios.test.js`**: User scenario duplication and multi-tenant data isolation.
- **`frontend/src/utils/loanCalculations.test.js`**: Client-side financial formula validation.

---

### Common Troubleshooting Scenarios

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **MongoDB SSL Alert 80 / TLS Error** | Public IP address is not authorized in Atlas. | Go to MongoDB Atlas $\rightarrow$ **Security** $\rightarrow$ **Network Access** and add `0.0.0.0/0` (Allow from anywhere) or add your current IP. |
| **CORS Blocked in Browser** | `CLIENT_ORIGIN` on backend does not match frontend domain. | Update `CLIENT_ORIGIN` in Vercel backend environment variables to match your exact frontend URL (e.g. `https://creditlens-frontend.vercel.app`) and redeploy. |
| **Frontend displays "Cannot connect to backend"** | `VITE_API_URL` is missing, misconfigured, or server is down. | Ensure `VITE_API_URL` points to `https://YOUR_BACKEND_VERCEL_URL/api`. Verify the backend is healthy by visiting `/api/health`. |
| **Port Conflict (`EADDRINUSE: 5000`)** | A previous Node.js process is still bound to port 5000. | Windows: `taskkill /F /IM node.exe`<br>Linux/macOS: `kill -9 $(lsof -t -i:5000)` |
| **Vercel Backend returns 404 for all routes** | Missing `vercel.json` rewrite or wrong Root Directory. | Confirm `backend/vercel.json` exists with rewrite rule `/(.*) -> /api/index.js`, and the Vercel project Root Directory is set to `backend`. |
| **Registration returns 503 "Database Unavailable"** | Backend cannot establish connection to MongoDB Atlas. | Check `MONGODB_URI` environment variable syntax and verify database user credentials in MongoDB Atlas. |

---

## M. Security

1. **Secret Isolation**: Sensitive credentials (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`) are exclusively accessible to the backend environment and never exposed in client-side bundles.
2. **Password Protection**: Passwords are salted and hashed using `bcryptjs` with 10 salt rounds via an automated pre-save Mongoose hook. Plaintext passwords are never stored.
3. **Stateless JWT Authorization**: User sessions rely on JSON Web Tokens signed with a cryptographic secret. Tokens expire after 30 days and are verified on all private endpoints via `authMiddleware.js`.
4. **Data Isolation (Multi-Tenancy)**: All scenario and profile queries strictly filter by `userId: req.user._id`, ensuring users cannot access or alter data belonging to other accounts.
5. **Connection URI Masking**: MongoDB connection strings are programmatically masked in terminal logs (`maskMongoURI`), hiding passwords from stdout.
6. **Input Boundary Validation**: The `validateRequest.js` middleware enforces numeric bounds, email formats, and string limits to protect against injection attacks.

---

## N. Future Enhancements

The following features represent realistic planned roadmap items:

- [ ] **Automated Bank Rate Scraping**: Scheduled background workers to periodically update bank interest rates from public financial portals.
- [ ] **Downloadable PDF Reports**: Branded, printable PDF generation for comprehensive loan amortization schedules and affordability summaries.
- [ ] **Indian Income Tax Deduction Estimator**: Real-time tax savings estimates under Section 24(b) (home loan interest up to ₹2 Lakh) and Section 80C (principal repayment up to ₹1.5 Lakh).
- [ ] **CIBIL Score Impact Simulator**: Educational module visualizing how debt reduction and timely EMI payments affect credit scores over time.
- [ ] **Multi-Currency Localization**: Support for international currencies (USD, EUR, GBP, AED, SGD) with localized numbering formats.

---

## O. Limitations & Disclaimer

### Genuine Technical Limitations
1. **Constant Interest Rate Model**: Calculations assume the interest rate remains constant across the entire tenure. Floating-rate loans may fluctuate with external benchmark adjustments.
2. **Monthly Reducing Balance**: Mathematical calculations assume monthly compounding. Daily reducing balance overdraft products may produce slight fractional variations.
3. **Ancillary Charges Excluded**: Government stamp duty, property registration taxes, processing fee GST, and mandatory mortgage insurance are not automatically included unless entered manually.
4. **Bank Rate Disclosures**: Listed bank interest rates represent verified baseline published rates as of March 2026. Final rates offered to an individual borrower vary according to lender credit appraisal, income stability, and credit score tiers.

### Regulatory Financial Disclaimer
> [!IMPORTANT]
> **Educational & Planning Tool Only**:  
> CreditLens is designed strictly for financial planning, educational analysis, and general estimation purposes.
> 
> - Calculations, simulations, and AI-generated insights provided by CreditLens **do not constitute official lending advice, credit pre-approval, loan guarantees, or formal underwriting commitments**.
> - Actual loan terms, EMIs, processing charges, and interest rates offered by commercial lenders depend on individual creditworthiness, credit scores (e.g., CIBIL / Experian), loan-to-value (LTV) ratios, property appraisal, and bank-specific credit policies.
> - Users should independently verify interest rates, charges, and loan terms with their respective financial institutions before entering into legally binding credit agreements.

---

## P. Results & Conclusion

CreditLens provides borrowers with a rigorous, transparent platform for debt planning. By integrating:
- Bank-grade mathematical calculations (reducing-balance EMI, zero-balance reconciliation, inverse loan capacity).
- Real cashflow context (take-home pay, living expenses, existing debt portfolios, emergency reserves).
- Market intelligence (19+ major Indian banks across 6 loan categories).
- Optional AI narrative explanations (Google Gemini API).

The application enables consumers to avoid the isolated EMI illusion, understand cumulative interest burdens, evaluate prepayment benefits, and make grounded financial decisions.

---

## Q. Contribution & License

### Contributing
Contributions to CreditLens are welcome! To contribute:
1. Fork the repository: [https://github.com/Jithamanyu0210/CreditLens](https://github.com/Jithamanyu0210/CreditLens)
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes with clear, descriptive messages:
   ```bash
   git commit -m "Add: your feature description"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request on GitHub.

### License
*No license has been specified yet for this project.* All rights are reserved by the repository owner unless otherwise stated.
