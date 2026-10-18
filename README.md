# CreditLens — Comprehensive Loan Affordability & Repayment Planner

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v19.2-blue.svg)](https://react.dev/)
[![Express Version](https://img.shields.io/badge/Express-v4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)](https://cloud.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-84%2F84%20Passing-success.svg)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> A modern, full-stack FinTech web application for analyzing true loan affordability, calculating reducing-balance EMIs, evaluating monthly cashflow solvency, simulating prepayment strategies, and exploring verified bank interest rates.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Key Features](#4-key-features)
5. [Technology Stack](#5-technology-stack)
6. [System Architecture](#6-system-architecture)
7. [Project Folder Structure](#7-project-folder-structure)
8. [Prerequisites](#8-prerequisites)
9. [Installation & Setup](#9-installation--setup)
10. [Environment Variables](#10-environment-variables)
11. [MongoDB Atlas Setup Guide](#11-mongodb-atlas-setup-guide)
12. [Running the Application](#12-running-the-application)
13. [API Documentation](#13-api-documentation)
14. [Core Calculations & Mathematical Formulas](#14-core-calculations--mathematical-formulas)
15. [Authentication & Security](#15-authentication--security)
16. [Automated Testing](#16-automated-testing)
17. [Common Errors & Troubleshooting](#17-common-errors--troubleshooting)
18. [Limitations & Assumptions](#18-limitations--assumptions)
19. [Future Enhancements](#19-future-enhancements)
20. [Financial Disclaimer](#20-financial-disclaimer)
21. [License & Acknowledgments](#21-license--acknowledgments)

---

## 1. Project Overview

**CreditLens** is a comprehensive, production-grade financial planning platform engineered to help borrowers make informed, risk-aware borrowing decisions. While conventional EMI calculators compute monthly payments in isolation, CreditLens evaluates loans within the context of a borrower's complete financial reality—accounting for net take-home income, mandatory living expenses, recurring discretionary costs, existing loan repayments, and targeted savings.

Built with a decoupled **React 19** frontend and a **Node.js/Express.js** REST API backed by **MongoDB Atlas**, CreditLens combines deterministic financial math with an optional Google Gemini AI advisory engine. It provides clear cashflow verdicts (**Comfortable**, **Tight**, or **Risky**), month-by-month reducing-balance amortization schedules, debt freedom prepayment models, emergency fund runway projections, and real interest rate data from 19+ major Indian financial institutions.

---

## 2. Problem Statement

Retail borrowers frequently enter debt commitments with incomplete financial visibility. Common pitfalls include:

- **Isolated EMI Illusion:** Borrowers evaluate whether they can afford an EMI without considering that their existing debt commitments and living expenses already consume most of their income.
- **Teaser Rates & Hidden Interest Costs:** A minor difference in annual interest rates (e.g., 8.5% vs. 9.75%) or an extended tenure can cost a borrower lakhs of rupees in cumulative interest over 15 to 30 years.
- **Overleveraging & Debt Traps:** Borrowers lack clear visibility into their **Debt-to-Income (DTI)** ratio. When debt obligations exceed 40–50% of income, unexpected medical or personal emergencies can trigger severe liquidity crises.
- **Lack of Repayment Optimization:** Borrowers are unaware of how modest extra payments (e.g., paying an additional ₹2,000/month or an annual bonus) can drastically compress loan tenure and save significant interest.
- **Opaque Bank Rates:** Comparing loan rates across major public and private banks typically requires visiting dozens of websites with disparate terminology and disclosure standards.

CreditLens directly solves these issues by providing a transparent, unified financial intelligence dashboard.

---

## 3. Project Objectives

1. **Deterministic Accuracy:** Provide rigorous, bank-grade mathematical models for reducing-balance EMI calculations, 0% promotional financing, and exact zero-balance amortization schedules.
2. **Context-Aware Affordability:** Assess whether a loan is realistically payable by integrating real-time cashflow surplus and debt-to-income benchmarks.
3. **Strategic Debt Optimization:** Enable borrowers to simulate prepayments and calculate the exact interest saved and tenure reduced.
4. **Transparent Market Intelligence:** Offer a centralized, verified comparison of published interest rates across leading Indian banks with direct source links.
5. **Secure Cloud Persistence:** Ensure user profiles, debt portfolios, and saved loan scenarios are encrypted, isolated by user ID, and securely stored in MongoDB Atlas.
6. **Accessible FinTech UI/UX:** Deliver an intuitive, responsive interface featuring interactive charts, print-ready reports, CSV data exports, and high-contrast light/dark themes.

---

## 4. Key Features

### 👤 User Authentication & Session Security
- User registration and login powered by **bcryptjs** (10 salt rounds) and **JSON Web Tokens (JWT)**.
- Secure, stateless Bearer token authorization on all user data routes.
- Automatic session hydration on app load with invalid-token purge.
- Multi-user isolation ensuring borrowers can only access their own profiles and scenarios.

### 💼 Financial Profile & Debt Portfolio (`/profile`)
- Customizable financial baseline:
  - **Net Monthly Take-Home Income** (primary inflow).
  - **Monthly Living Expenses** (food, utilities, rent, healthcare).
  - **Other Discretionary Expenses** (lifestyle, entertainment, subscriptions).
  - **Monthly Savings Target** and **Current Liquid Savings**.
- **Existing Loans Portfolio Manager:** Full CRUD interface to track active loans (Personal, Vehicle, Education, etc.) with monthly EMIs, balances, interest rates, and remaining tenures.
- Automatically prevents double-counting between general expenses and debt obligations.

### 🧮 Interactive EMI Calculator (`/calculator`)
- Dual-input controls: smooth sliders and exact numeric inputs for:
  - **Loan Principal** (₹10,000 to ₹10,00,00,000).
  - **Annual Interest Rate** (0% to 30%).
  - **Tenure** (selectable in Years or Months).
- Instant live updates for monthly EMI, total interest payable, and total loan cost.
- Interactive Recharts visualization (Principal vs. Interest distribution).
- **Stress-Test Scenarios:** 1-click simulations for potential interest rate hikes (+1.5%) and income reductions (-10%).
- 1-click auto-save to cloud scenarios or direct transfer to the Amortization Schedule.

### 📊 Loan Affordability & Cashflow Solvency (`/affordability`)
- Real-time solvency calculation:
  $$\text{Net Balance} = \text{Monthly Income} - (\text{Living Expenses} + \text{Other Expenses} + \text{Existing EMIs} + \text{Proposed EMI})$$
- Automated solvency status badges:
  - 🟢 **Comfortable:** Total debt payments $\le 35\%$ of monthly income with positive cashflow surplus.
  - 🟡 **Tight:** Debt obligations between $35\%$ and $50\%$, or monthly balance falls short of the savings target.
  - 🔴 **Risky:** Total DTI exceeds $50\%$ or net balance is negative (cash deficit).
- Comprehensive DTI and expense ratio progress gauges.
- Deterministic, actionable advice (e.g., tenure extension suggestions, down payment recommendations, debt snowball prioritization).
- Optional **Google Gemini AI Explanations** providing personalized narrative analysis and financial prudence tips.

### 📅 Month-by-Month Amortization Schedule (`/schedule`)
- Detailed schedule tracking opening balance, monthly EMI, principal repayment, interest component, and closing balance.
- **Strict Final-Month Reconciliation:** Guarantees closing balance reaches exactly ₹0 without negative balances or fractional discrepancies.
- Yearly aggregated rollups and expandable monthly breakdowns.
- **Export & Print Tools:**
  - One-click **CSV Download** for spreadsheet analysis.
  - Formatted, print-ready **Executive Report** stylesheet.

### 🔄 Multi-Loan Comparison (`/compare`)
- Compare up to 5 distinct loan structures side-by-side.
- Highlights the **Lowest Monthly EMI** (cashflow friendly) versus the **Lowest Total Interest** (cost-effective).
- Analyzes budget fit for each option against the user's active financial profile.
- Optional Gemini AI comparative insights summarizing trade-offs.

### 🚀 Four Dedicated Planning Simulators
1. **Max Loan Capacity Simulator (`/max-loan`):** Uses an inverse reducing-balance formula to calculate the absolute maximum loan principal a borrower can safely qualify for, bounded by their disposable surplus and a strict 40% DTI safety ceiling.
2. **Prepayment Simulator (`/prepayment`):** Models extra recurring monthly payments or one-time lump-sum principal paydowns. Calculates exact months/years shaved off the loan and total interest saved.
3. **Emergency Fund & Runway Planner (`/emergency-fund`):** Computes essential monthly burn rate (living costs + existing debts + new EMI) and projects financial runway against 3-month, 6-month, and 12-month benchmarks.
4. **Compare Scenarios Simulator (`/compare`):** Multi-dimensional trade-off analysis across loan tenure, rate variations, and monthly outlays.

### 🏦 Verified Bank Interest Rates Comparison (`/bank-rates`)
- Built-in dataset covering **19+ leading Indian banks** (State Bank of India, HDFC Bank, ICICI Bank, Axis Bank, Bank of Baroda, Kotak Mahindra Bank, Punjab National Bank, Canara Bank, Union Bank, etc.).
- Covers 6 retail loan categories:
  - 🏠 Home Loans
  - 🚗 Car Loans
  - 👤 Personal Loans
  - 🎓 Education Loans
  - 🛵 Two-Wheeler Loans
  - 🪙 Gold Loans
- Details include starting rates, maximum rates, rate types (EBLR/RLLR/MCLR linked, Floating, Fixed), benchmark spreads, processing fees, eligibility criteria, and direct links to official bank interest rate pages.
- Real-time search and multi-criteria filtering by bank name, category, and public/private sector.
- **1-Click Auto-Fill:** Transfer any verified bank rate directly into the active EMI Calculator.

### 💾 Saved Loan Scenarios (`/saved-scenarios`)
- Persistent scenario archive in MongoDB Atlas.
- Full CRUD capabilities: Name scenarios, assign custom tags (Home, Auto, Education, Refinance), record notes, view full details, duplicate scenarios with one click, or delete outdated records.

### 🎨 Premium UI/UX & High-Contrast Themes
- Dynamic **Light and Dark Themes** using CSS custom properties (`data-theme="light"` and `data-theme="dark"`).
- State persisted in `localStorage` with system preference auto-detection.
- Modern typography, rich visual hierarchy, glassmorphism cards, and micro-animations.
- Global React `<ErrorBoundary>` preventing blank-screen crashes.

---

## 5. Technology Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Component-based UI library |
| **Vite** | `^8.3.0` | Ultra-fast build tool and dev server |
| **React Router DOM** | `^7.18.4` | Client-side routing and route protection |
| **Recharts** | `^3.10.1` | Financial charts (Pie, Bar, Area charts) |
| **Lucide React** | `^1.59.0` | Clean, modern iconography |
| **Vanilla CSS3** | Custom | Modular design system with CSS custom property design tokens |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` | JavaScript server runtime (ES Modules) |
| **Express.js** | `^4.21.2` | REST API framework |
| **Mongoose** | `^8.9.5` | MongoDB Object Data Modeling (ODM) |
| **JSON Web Tokens (JWT)** | `^9.0.2` | Stateless authentication tokens |
| **bcryptjs** | `^3.0.3` | Password salting and hashing |
| **@google/genai** | `^2.30.0` | Official Google Gen AI SDK for Gemini models |
| **CORS** | `^2.8.5` | Cross-Origin Resource Sharing control |
| **dotenv** | `^16.4.7` | Environment variable management |

### Database & Testing
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **MongoDB Atlas** | v7.0 / v8.0 | Cloud document database with automated replica sets |
| **Node.js Test Runner** | Built-in | Fast native test execution (`node --test`) |
| **Supertest** | `^7.0.0` | HTTP assertion library for REST API tests |
| **Oxlint** | `^1.81.0` | High-performance JavaScript/JSX linter |

---

## 6. System Architecture

CreditLens utilizes a decoupled client-server architecture with strict separation of concerns:

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 19 + Vite)"]
        UI[Interactive UI / Pages]
        AuthCtx[Auth Context & JWT]
        LoanCtx[Loan & Profile Context]
        ThemeCtx[Theme Context - Dark/Light]
        APIClient[Axios / Fetch API Client]
        UI --> AuthCtx
        UI --> LoanCtx
        UI --> ThemeCtx
        LoanCtx --> APIClient
        AuthCtx --> APIClient
    end

    subgraph Server ["Backend (Node.js + Express REST API)"]
        Gateway[Express Gateway - Port 5000]
        CORS[CORS & Security Middleware]
        AuthMW[JWT Auth Middleware]
        ValidateMW[Input Validation]
        
        Gateway --> CORS --> AuthMW --> ValidateMW
        
        subgraph Controllers ["Controllers & Routes"]
            AuthCtrl["Auth Controller (/api/auth)"]
            ProfileCtrl["Profile Controller (/api/profile)"]
            LoanCtrl["Loan Controller (/api/loans)"]
            SimCtrl["Simulator Controller (/api/simulators)"]
            ScenarioCtrl["Scenario Controller (/api/scenarios)"]
            BankCtrl["Bank Rate Controller (/api/bank-rates)"]
            AICtrl["AI Controller (/api/ai)"]
        end
        
        ValidateMW --> AuthCtrl
        ValidateMW --> ProfileCtrl
        ValidateMW --> LoanCtrl
        ValidateMW --> SimCtrl
        ValidateMW --> ScenarioCtrl
        ValidateMW --> BankCtrl
        ValidateMW --> AICtrl

        subgraph Engine ["Calculation Services"]
            EMISvc[EMI Engine]
            AmortSvc[Amortization Engine]
            AffordSvc[Affordability Engine]
            SimSvc[Simulator Engine]
        end
        
        LoanCtrl --> EMISvc
        LoanCtrl --> AmortSvc
        LoanCtrl --> AffordSvc
        SimCtrl --> SimSvc
    end

    subgraph Storage ["Cloud Infrastructure"]
        Atlas[("MongoDB Atlas Cloud Database")]
        Gemini[("Google Gemini AI API")]
    end

    ProfileCtrl --> Atlas
    ScenarioCtrl --> Atlas
    AuthCtrl --> Atlas
    BankCtrl --> Atlas
    AICtrl --> Gemini
    APIClient <==>|HTTP / JSON - Bearer Token| Gateway
```

---

## 7. Project Folder Structure

```text
creditlens/
├── .gitignore                          # Global gitignore (node_modules, .env, build output)
├── README.md                           # Master project documentation
│
├── backend/                            # Express.js REST API
│   ├── .env.example                    # Template for backend environment variables
│   ├── .gitignore                      # Backend-specific ignore rules
│   ├── package.json                    # Backend dependencies and scripts
│   ├── server.js                       # Entrypoint redirecting to src/server.js
│   ├── src/
│   │   ├── app.js                      # Express application setup, routes, CORS, error handling
│   │   ├── server.js                   # Server bootstrap, DB connection, port binding
│   │   ├── config/
│   │   │   └── db.js                   # Mongoose connection with URI masking and auto-reconnect
│   │   ├── controllers/
│   │   │   ├── aiController.js         # Gemini AI narrative explanations and status
│   │   │   ├── authController.js       # Register, login, getMe, logout
│   │   │   ├── bankRateController.js   # Bank interest rate querying, search, and seeding
│   │   │   ├── loanController.js       # EMI, affordability, amortization, compare
│   │   │   ├── profileController.js    # Financial profile CRUD
│   │   │   ├── scenarioController.js   # Cloud scenario CRUD and duplication
│   │   │   └── simulatorController.js  # Max loan, prepayment, and runway calculations
│   │   ├── data/
│   │   │   └── bankRatesData.js        # 19+ verified Indian banks dataset across 6 loan types
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT extraction and validation
│   │   │   ├── errorMiddleware.js      # Global 404 and central error handler
│   │   │   └── validateRequest.js      # Strict boundary and type validation
│   │   ├── models/
│   │   │   ├── BankRate.js             # Verified bank loan scheme schema
│   │   │   ├── FinancialProfile.js     # User income, living costs, existing EMIs schema
│   │   │   ├── LoanScenario.js         # Saved calculation scenario schema
│   │   │   └── User.js                 # User credentials with bcrypt pre-save hook
│   │   ├── routes/
│   │   │   ├── aiRoutes.js             # /api/ai endpoints
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
│   │       ├── geminiService.js        # Google GenAI integration with resilient fallback
│   │       └── simulatorService.js     # Inverse EMI, prepayment, and runway services
│   └── tests/
│       ├── api.test.js                 # Supertest REST API route suite
│       ├── atlas.test.js               # Live MongoDB Atlas integration suite
│       ├── bank_rates.test.js          # Bank interest rates querying and search tests
│       ├── gemini.test.js              # Gemini AI service and fallback tests
│       ├── scenarios.test.js           # Scenario ownership and multi-user isolation tests
│       └── services.test.js            # Pure mathematical unit test suite
│
└── frontend/                           # React 19 Client SPA
    ├── .gitignore                      # Frontend-specific ignore rules
    ├── index.html                      # HTML5 entrypoint with Google Fonts
    ├── package.json                    # Frontend dependencies and scripts
    ├── vite.config.js                  # Vite configuration with /api backend proxy
    └── src/
        ├── App.css                     # Component micro-styles
        ├── App.jsx                     # Router, protected routes, and layout shell
        ├── index.css                   # Global design system, tokens, and dark/light theme CSS
        ├── main.jsx                    # React DOM root render with ErrorBoundary
        ├── components/
        │   └── common/
        │       ├── BackButton.jsx      # Navigation return button
        │       ├── Disclaimer.jsx      # Standard regulatory disclaimer banner
        │       ├── ErrorBoundary.jsx   # Top-level React error recovery boundary
        │       ├── Navbar.jsx          # Top navigation with theme toggle and auth state
        │       ├── ProtectedRoute.jsx  # Route guards (ProtectedRoute, PublicOnlyRoute)
        │       └── Toast.jsx           # Notification toast notifications
        ├── context/
        │   ├── AuthContext.jsx         # User state, token persistence, login/logout
        │   ├── LoanContext.jsx         # Active loan state, profile sync, scenarios sync
        │   └── ThemeContext.jsx        # Light/dark mode context with localStorage
        ├── pages/
        │   ├── AffordabilityPage.jsx   # Cashflow solvency, DTI gauges, AI insights
        │   ├── BankRatesPage.jsx       # 19+ bank rate comparison and search
        │   ├── CalculatorPage.jsx      # EMI calculator with sliders and charts
        │   ├── ComparePage.jsx         # Multi-loan side-by-side comparison
        │   ├── DashboardPage.jsx       # Executive KPI dashboard and simulator launchers
        │   ├── EmergencyFundPage.jsx   # Essential burn rate and runway planner
        │   ├── LoginPage.jsx           # User sign-in
        │   ├── MaxLoanPage.jsx         # Reverse max loan capacity simulator
        │   ├── PrepaymentPage.jsx      # Early payoff and interest savings simulator
        │   ├── ProfilePage.jsx         # Financial baseline and active debts manager
        │   ├── RegisterPage.jsx        # Account registration
        │   ├── SavedScenariosPage.jsx  # Cloud scenario archive and management
        │   └── SchedulePage.jsx        # Amortization schedule, CSV export, print view
        ├── services/
        │   └── api.js                  # Shared API client with error mapping
        └── utils/
            ├── formatters.js           # INR currency (₹) and percentage formatting
            ├── loanCalculations.js     # Client-side mirror of financial calculation engine
            └── loanCalculations.test.js# 21-case automated test suite for financial math
```

---

## 8. Prerequisites

Before installing CreditLens, ensure you have the following installed:

- **Node.js:** `v18.0.0` or higher (Tested on `v18.x`, `v20.x`, and `v24.x`). Check with:
  ```bash
  node -v
  ```
- **npm:** `v9.0.0` or higher (Bundled with Node.js). Check with:
  ```bash
  npm -v
  ```
- **MongoDB:** A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster (recommended) or a local MongoDB server (`mongodb://localhost:27017`).
- **Web Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari.
- **Optional:** A free [Google Gemini API Key](https://aistudio.google.com/) for AI-generated financial explanations. (If omitted, CreditLens automatically uses its built-in rule-based financial advice engine).

---

## 9. Installation & Setup

### Step 1: Clone or Open the Repository
```bash
git clone https://github.com/your-username/creditlens.git
cd creditlens
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Configure Backend Environment Variables
Create a `.env` file inside the `backend/` directory by copying the provided example:
```bash
cp .env.example .env
```
*(On Windows Command Prompt: `copy .env.example .env`)*

Edit `backend/.env` with your actual MongoDB connection string and a secret key (see [Section 10](#10-environment-variables)).

### Step 4: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 10. Environment Variables

All sensitive configuration is isolated in the backend and loaded using `dotenv`. The frontend communicates with the backend via Vite's proxy and never receives database credentials or Gemini API keys.

### Backend `.env` Template (`backend/.env`)

```env
# ==============================================================================
# CreditLens Backend Configuration
# ==============================================================================

# Server Network Settings
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# MongoDB Atlas Connection URI
# Replace <username>, <password>, and <cluster-url> with your real Atlas credentials
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/creditlens?retryWrites=true&w=majority
MONGODB_DB_NAME=creditlens

# JWT Secret Key for Session Signing (Use a strong random string in production)
JWT_SECRET=your_jwt_secret_key_creditlens_fintech_secure_2026

# Optional: Google Gemini API Key for Natural Language Insights
# Get a free key at: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> [!WARNING]
> Never commit your `.env` file to Git. Both root and backend `.gitignore` files are pre-configured to exclude all `.env` files.

---

## 11. MongoDB Atlas Setup Guide

Follow these steps to connect CreditLens to a free cloud MongoDB Atlas cluster:

1. **Create an Account & Cluster:**
   - Sign up or log into [MongoDB Cloud](https://cloud.mongodb.com/).
   - Click **Create Deployment** and select the free **M0 Shared** tier.
   - Choose a cloud provider and region closest to you (e.g., AWS / Mumbai).
   - Click **Create Deployment**.

2. **Create a Database User:**
   - In the left sidebar, navigate to **Security** $\rightarrow$ **Database Access**.
   - Click **Add New Database User**.
   - Select **Password** as the authentication method.
   - Enter a username (e.g., `creditlens_user`) and a secure password.
   - Set Database User Privileges to **Read and write to any database**.
   - Click **Add User**.

3. **Configure Network Access (Whitelist IP):**
   - In the left sidebar, navigate to **Security** $\rightarrow$ **Network Access**.
   - Click **Add IP Address**.
   - Click **Add Current IP Address** to allow your current workstation.
   - *(Optional for development)* Click **Allow Access from Anywhere** (`0.0.0.0/0`) if your ISP assigns dynamic IP addresses.
   - Click **Confirm**.

4. **Obtain Connection String:**
   - Navigate to **Database** in the sidebar and click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the SRV connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Paste it into `backend/.env` as `MONGODB_URI`, replacing `<username>` and `<password>` with the credentials created in Step 2. Add `/creditlens` before the query string:
     ```text
     MONGODB_URI=mongodb+srv://creditlens_user:MySecurePass123@cluster0.xxxxx.mongodb.net/creditlens?retryWrites=true&w=majority
     ```

---

## 12. Running the Application

CreditLens requires running both the backend API server and the frontend client simultaneously. Open two terminal windows:

### Terminal 1: Start the Backend Server
```bash
cd backend
npm run dev
```
- The backend will start on **http://localhost:5000**.
- You should see the terminal confirmation:
  ```text
  [Database] MongoDB Atlas Connected: cluster0-shard-00-00.xxxxx.mongodb.net/creditlens
  [CreditLens Backend] Secure server running on http://localhost:5000 (0.0.0.0:5000)
  [CreditLens Backend] API Health Check: http://localhost:5000/api/health
  ```

*(To run without nodemon, use `npm start`)*

### Terminal 2: Start the Frontend Client
```bash
cd frontend
npm run dev
```
- The Vite development server will start on **http://localhost:5173**.
- Open your browser and navigate to **`http://localhost:5173`**.

### Building for Production
To generate an optimized production bundle:
```bash
cd frontend
npm run build
```
The compiled assets will be output to `frontend/dist/`. The backend is pre-configured in `src/app.js` to serve this static bundle automatically in production when accessed directly on port 5000.

---

## 13. API Documentation

The CreditLens REST API uses JSON for all requests and responses. Protected endpoints require the HTTP header:  
`Authorization: Bearer <jwt_token>`

### Health & Gateway
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | None | Service heartbeat and uptime check |
| `GET` | `/` | None | API metadata and educational disclaimer |

---

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | None | `{ name, email, password }` | Creates user account, returns JWT and user profile |
| `POST` | `/api/auth/login` | None | `{ email, password }` | Authenticates user, returns JWT and user profile |
| `GET` | `/api/auth/me` | Bearer | None | Validates current token, returns user object |
| `POST` | `/api/auth/logout` | None | None | Graceful session termination response |

#### Example: Register User Request
```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@123"
}
```

---

### Financial Profile (`/api/profile`)
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Bearer | None | Fetches authenticated user's financial profile |
| `POST` | `/api/profile` | Bearer | Profile object | Creates or updates profile baseline & debt list |
| `PUT` | `/api/profile` | Bearer | Profile object | Alias for profile update |
| `DELETE` | `/api/profile` | Bearer | None | Resets financial profile to blank defaults |

#### Example: Profile Payload
```json
{
  "monthlyIncome": 100000,
  "monthlyExpenses": 35000,
  "otherExpenses": 5000,
  "monthlySavingsTarget": 20000,
  "currentSavings": 250000,
  "existingEmis": [
    {
      "id": "emi_car_1",
      "name": "Car Loan",
      "amount": 12500,
      "balance": 350000,
      "annualRate": 8.75,
      "remainingMonths": 32
    }
  ]
}
```

---

### Core Loan Calculations (`/api/loans`)
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/loans/calculate-emi` | None | `{ principal, annualRate, tenureMonths }` | Calculates reducing-balance monthly EMI |
| `POST` | `/api/loans/affordability` | Optional | `{ principal, annualRate, tenureMonths, ... }` | Full DTI & solvency evaluation |
| `POST` | `/api/loans/amortization` | None | `{ principal, annualRate, tenureMonths }` | Generates month-by-month repayment schedule |
| `POST` | `/api/loans/compare` | None | `{ loans: [ { principal, annualRate, tenureMonths } ] }` | Compares 2 to 5 loan options |

---

### Planning Simulators (`/api/simulators`)
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/simulators/max-loan` | None | `{ monthlyIncome, monthlyExpenses, existingEmis, ... }` | Max loan capacity via inverse EMI formula |
| `POST` | `/api/simulators/prepayment` | None | `{ principal, annualRate, tenureMonths, extraMonthlyPayment, lumpSumPayment }` | Prepayment tenure & interest savings |
| `POST` | `/api/simulators/emergency-fund`| None | `{ monthlyIncome, monthlyExpenses, currentSavings, targetMonths }` | Essential burn rate and runway analysis |
| `POST` | `/api/simulators/compare-scenarios`| None | `{ loans, profile }` | Side-by-side scenario matrix analysis |

---

### Bank Interest Rates (`/api/bank-rates`)
| Method | Endpoint | Auth | Query Parameters | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/bank-rates` | None | `loanType`, `bank`, `bankType`, `search`, `sortBy`, `sortOrder` | Queries verified bank rates with filters |
| `GET` | `/api/bank-rates/categories` | None | None | Returns supported loan categories with counts |
| `GET` | `/api/bank-rates/banks` | None | None | Returns distinct list of 19+ supported banks |
| `GET` | `/api/bank-rates/search` | None | `bank`, `loanType` | Exact match lookup (e.g., SBI Car Loan) |
| `GET` | `/api/bank-rates/:id` | None | None | Fetches single bank rate scheme details |
| `POST`| `/api/bank-rates/seed` | Bearer | None | Re-seeds database with canonical verified rates |

---

### Saved Loan Scenarios (`/api/scenarios`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/scenarios` | Bearer | List all saved scenarios for authenticated user |
| `POST` | `/api/scenarios` | Bearer | Save a new loan scenario |
| `GET` | `/api/scenarios/:id` | Bearer | Retrieve a specific saved scenario |
| `PUT` | `/api/scenarios/:id` | Bearer | Update an existing saved scenario |
| `POST` | `/api/scenarios/:id/duplicate`| Bearer | Clone an existing scenario with `(Copy)` suffix |
| `DELETE`| `/api/scenarios/:id` | Bearer | Permanently delete a scenario |

---

### AI Financial Insights (`/api/ai`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ai/status` | None | Returns Gemini API status and active model |
| `POST` | `/api/ai/explain-affordability` | Optional | Generates narrative explanation of loan affordability |
| `POST` | `/api/ai/explain-comparison` | Optional | Generates trade-off analysis between loan scenarios |

---

## 14. Core Calculations & Mathematical Formulas

CreditLens uses standardized financial formulas implemented symmetrically across both backend services and frontend utilities.

### 1. Reducing-Balance EMI Calculation
The monthly Equated Monthly Installment (EMI) is computed using the standard reducing-balance amortization formula:

$$EMI = \frac{P \cdot r \cdot (1 + r)^n}{(1 + r)^n - 1}$$

Where:
- $P$ = Principal loan amount
- $r$ = Periodic monthly interest rate: $\frac{\text{Annual Interest Rate}}{12 \times 100}$
- $n$ = Total tenure in months

#### Zero-Interest Edge Case (0% Promotional Financing):
When $r = 0$:
$$EMI = \frac{P}{n}, \quad \text{Total Interest} = 0, \quad \text{Total Payment} = P$$

---

### 2. Debt-to-Income (DTI) & Cashflow Solvency
Solvency determines whether a loan is safe for the borrower's monthly cashflow:

$$\text{Total Monthly Obligations} = \sum \text{Existing EMIs} + \text{Proposed EMI}$$

$$\text{Total Monthly Outflow} = \text{Living Expenses} + \text{Other Expenses} + \text{Total Monthly Obligations}$$

$$\text{Remaining Monthly Balance} = \text{Monthly Income} - \text{Total Monthly Outflow}$$

$$\text{DTI Ratio (\%)} = \left( \frac{\text{Total Monthly Obligations}}{\text{Monthly Income}} \right) \times 100$$

$$\text{Expense Ratio (\%)} = \left( \frac{\text{Living Expenses} + \text{Other Expenses}}{\text{Monthly Income}} \right) \times 100$$

#### Threshold Classification Rules:
- **Comfortable:** $\text{Remaining Balance} \ge 0$ AND $\text{DTI} \le 35\%$
- **Tight:** $\text{Remaining Balance} \ge 0$ AND ($35\% < \text{DTI} \le 50\%$ OR $\text{Remaining Balance} < \text{Savings Target}$)
- **Risky:** $\text{Remaining Balance} < 0$ (Deficit) OR $\text{DTI} > 50\%$

---

### 3. Month-by-Month Amortization & Zero-Balance Reconciliation
For each month $m$ from $1$ to $n$:
1. $\text{Interest Payment}_m = \text{Opening Balance}_m \times r$
2. $\text{Principal Payment}_m = EMI - \text{Interest Payment}_m$
3. In the final month ($m = n$) or if $\text{Principal Payment}_m \ge \text{Balance}$:
   $$\text{Principal Payment}_m = \text{Opening Balance}_m$$
   $$\text{Closing Balance}_m = 0$$
4. Otherwise:
   $$\text{Closing Balance}_m = \text{Opening Balance}_m - \text{Principal Payment}_m$$

---

### 4. Maximum Affordable Loan Capacity (Inverse EMI)
Determines the maximum borrowable principal within a safe 40% DTI ceiling:

1. $\text{Max Allowed Debt} = \text{Monthly Income} \times 0.40$
2. $\text{Max Debt Budget} = \max(0, \text{Max Allowed Debt} - \sum \text{Existing EMIs})$
3. $\text{Cashflow Surplus} = \max(0, \text{Income} - \text{Living Costs} - \sum \text{Existing EMIs} - \text{Savings Target})$
4. $\text{Available EMI Budget} = \min(\text{Cashflow Surplus}, \text{Max Debt Budget})$

Applying the inverse reducing-balance formula:
$$P_{\max} = \text{Available EMI Budget} \times \frac{(1 + r)^n - 1}{r \cdot (1 + r)^n}$$
*(Value is rounded down to clean thousand-rupee increments).*

---

### 5. Prepayment & Interest Savings
When extra payments are applied directly against principal:
- $\text{Total Principal Paid}_m = \text{Regular Principal}_m + \text{Extra Monthly} + \text{Lump Sum}_m$
- Outstanding balance amortizes faster, terminating the schedule when $\text{Balance} = 0$.
- $\text{Months Saved} = n_{\text{original}} - n_{\text{new}}$
- $\text{Interest Saved} = \text{Total Interest}_{\text{baseline}} - \sum \text{Interest}_{\text{prepayment}}$

---

## 15. Authentication & Security

CreditLens adheres to strict modern web application security practices:

1. **Password Salting & Hashing:** Passwords are never stored in plain text. Mongoose models use `bcryptjs` with an automatic pre-save hook using 10 salt rounds.
2. **Stateless JWT Authorization:** Sessions are managed using standard JSON Web Tokens signed with a server-side secret (`JWT_SECRET`) and a 7-day expiration period.
3. **Multi-User Data Isolation:** Every database operation on profiles and scenarios strictly enforces ownership:
   ```javascript
   const scenario = await LoanScenario.findOne({ _id: req.params.id, userId: req.user._id });
   ```
   Users cannot read, modify, or delete scenarios belonging to other accounts.
4. **Credential Masking:** Database connection logs automatically mask sensitive user passwords:
   ```javascript
   // Output: mongodb+srv://creditlens_user:****@cluster0.xxxxx.mongodb.net/
   ```
5. **Input Sanitization & Validation:** All routes use boundary validation (`validateRequest.js`) to reject negative numbers, excessive string lengths, SQL/NoSQL injection tokens, and malformed emails.
6. **CORS Hardening:** Configured in `src/app.js` to whitelist trusted origins and reject unverified cross-origin script injection.

---

## 16. Automated Testing

CreditLens includes a comprehensive, dual-tier automated test suite:

### Backend Test Suite (63 Tests)
The backend uses Node.js native test runner and Supertest. It tests REST endpoints, live database operations, Gemini AI integrations, and loan math.

Run backend tests:
```bash
cd backend
npm test
```

#### Test Suite Breakdown:
- **`tests/api.test.js` (17 tests):** REST API integration, health check, calculation validation, 401 unauthorized rejection, input boundary guards.
- **`tests/atlas.test.js` (6 tests):** Live MongoDB Atlas integration, document creation, updates, and cross-session persistence.
- **`tests/bank_rates.test.js` (16 tests):** Bank rate filtering, keyword search, category counts, single rate retrieval, exact match lookups.
- **`tests/gemini.test.js` (6 tests):** Gemini API communication, schema validation, and graceful rule-based fallback when offline.
- **`tests/scenarios.test.js` (7 tests):** Scenario lifecycle, duplication logic, and cross-user data isolation.
- **`tests/services.test.js` (11 tests):** Unit tests verifying EMI formulas, zero-balance amortization reconciliation, and solvency thresholds.

### Frontend Test Suite (21 Tests)
The frontend includes a standalone test suite verifying client-side mathematical calculations:

Run frontend tests:
```bash
cd frontend
npm test
```
*(On Windows PowerShell, use `cmd /c npm test`)*

**Total Automated Coverage: 84 / 84 tests passing (100%).**

---

## 17. Common Errors & Troubleshooting

### 1. MongoDB Connection Failure: TLS Alert 80 / IP Not Whitelisted
- **Symptom:** Terminal displays `[Database Error] Failed to connect to MongoDB Atlas` or `SSL alert number 80`.
- **Cause:** Your current public IP address is not authorized in MongoDB Atlas Network Access.
- **Resolution:**
  1. Go to [MongoDB Atlas Console](https://cloud.mongodb.com/).
  2. In the left menu, select **Security** $\rightarrow$ **Network Access**.
  3. Click **Add IP Address** and select **Add Current IP Address** (or add `0.0.0.0/0` for development).
  4. Wait 1–2 minutes for the rule to deploy and restart the backend.

### 2. Port Already in Use (`EADDRINUSE: 5000` or `5173`)
- **Symptom:** Server crashes immediately on startup with `EADDRINUSE :::5000`.
- **Cause:** A previous Node.js instance is still running in the background.
- **Resolution:**
  - *Windows:*
    ```cmd
    netstat -ano | findstr :5000
    taskkill /PID <PID> /F
    ```
  - *Mac / Linux:*
    ```bash
    lsof -i :5000
    kill -9 <PID>
    ```

### 3. Frontend Displays "Cannot connect to CreditLens backend service"
- **Symptom:** Login, registration, or profile actions show a network error toast.
- **Cause:** The backend server is not running on port 5000, or the frontend is unable to reach `http://localhost:5000`.
- **Resolution:**
  - Verify that `npm run dev` is active in the `backend/` terminal.
  - Verify `http://localhost:5000/api/health` returns `{"status":"healthy"}` in your browser.

### 4. PowerShell Execution Policy Restriction
- **Symptom:** `npm : File C:\...\npm.ps1 cannot be loaded because running scripts is disabled on this system.`
- **Resolution:** Run commands using the Windows Command Prompt (`cmd /c npm ...`) or adjust your PowerShell execution policy:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```

---

## 18. Limitations & Assumptions

To maintain transparent financial planning standards, CreditLens operates under the following documented assumptions:

1. **Fixed Interest Rate Model:** Calculations assume the selected interest rate remains constant throughout the modeled loan tenure. For floating-rate loans, borrowers should re-evaluate their schedule if benchmark rates change.
2. **Standard Reducing-Balance Convention:** Interest is compounded on a monthly reducing balance. Daily reducing balance conventions used by certain overdraft products are not currently modeled.
3. **Ancillary Fees & Taxes:** Government stamp duty, property registration taxes, processing fee GST, and mandatory mortgage insurance are not added to the principal balance unless manually included by the user.
4. **Prepayment Penalties:** Prepayment simulations assume 0% foreclosure or part-payment penalty fees (as mandated by RBI for floating-rate individual retail loans).
5. **Static Bank Rate Snapshots:** Bank interest rates reflect verified published rates from official bank portals as of March 2026. Real-time rates offered to individual borrowers depend on personalized credit underwriting and CIBIL score tiering.

---

## 19. Future Enhancements

Planned improvements for future releases of CreditLens:

- [ ] **Automated Bank Rate Web Scraping:** Scheduled serverless scrapers to refresh bank rate benchmarks weekly from official bank portals.
- [ ] **PDF Generation Engine:** Server-side headless Chrome / PDFKit rendering for branded, multi-page downloadable PDF reports.
- [ ] **Indian Income Tax Deduction Estimator:** Real-time calculation of tax savings under Section 24(b) (Home loan interest up to ₹2 Lakh) and Section 80C (Principal repayment up to ₹1.5 Lakh).
- [ ] **CIBIL Score Simulator:** Interactive simulator demonstrating how repayment behaviors and DTI reductions impact credit scores over time.
- [ ] **Multi-Currency Support:** Currency localization for USD ($), EUR (€), GBP (£), AED, and SGD.

---

## 20. Financial Disclaimer

> [!IMPORTANT]
> **Educational & Planning Tool Only:**  
> CreditLens is designed strictly for financial planning, educational analysis, and general estimation purposes.  
> 
> - Calculations and outputs provided by CreditLens **do not constitute official lending advice, credit pre-approval, loan guarantees, or formal underwriting commitments**.  
> - Actual loan terms, EMIs, processing charges, and interest rates offered by commercial lenders are subject to individual creditworthiness, credit scores (e.g., CIBIL / Experian), loan-to-value (LTV) ratios, property appraisal, and bank-specific credit policies.  
> - Users should independently verify interest rates, charges, and loan terms with their respective financial institutions before entering into legally binding credit agreements.

---

## 21. License & Acknowledgments

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### Acknowledgments
- Financial formulas based on standard reducing-balance actuarial methodologies.
- Iconography provided by [Lucide Icons](https://lucide.dev/).
- Chart visualizations built using [Recharts](https://recharts.org/).
- Bank interest rate data referenced from published public disclosures of the State Bank of India, HDFC Bank, ICICI Bank, Axis Bank, and Bank of Baroda.
