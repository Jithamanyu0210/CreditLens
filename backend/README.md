# CreditLens Backend – REST API & Financial Planning Engine

The backend for **CreditLens – Loan Affordability & Repayment Planner** is a secure, high-performance REST API built with Node.js, Express.js, MongoDB (Mongoose), and JWT authentication. It provides server-side calculation of reducing-balance EMIs, affordability evaluations, month-by-month amortization schedules, interactive simulators, and persistent user profile & scenario management.

---

## 1. Architecture & Directory Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & configuration
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, session, logout
│   │   ├── profileController.js  # Financial profile CRUD with otherExpenses
│   │   ├── loanController.js     # EMI, affordability, amortization, compare
│   │   ├── simulatorController.js# 4 Planning Simulators endpoints
│   │   └── scenarioController.js # Saved loan scenarios with ownership isolation
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token verification
│   │   ├── errorMiddleware.js    # Central error handler & 404 handler
│   │   └── validateRequest.js    # Input boundary validation
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt password hashing
│   │   ├── FinancialProfile.js   # Income, living/other expenses, existing loans
│   │   └── LoanScenario.js       # Saved scenarios schema with user indexing
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── profileRoutes.js      # /api/profile
│   │   ├── loanRoutes.js         # /api/loans
│   │   ├── simulatorRoutes.js    # /api/simulators
│   │   └── scenarioRoutes.js     # /api/scenarios
│   ├── services/
│   │   ├── emiService.js         # Reducing balance & 0% interest loan math
│   │   ├── affordabilityService.js # DTI, net cashflow, status verdicts & insights
│   │   ├── amortizationService.js# Monthly reducing-balance reconciliation
│   │   └── simulatorService.js   # Max loan, prepayment, runway, comparisons
│   ├── app.js                    # Express app configuration & middleware
│   └── server.js                 # Server listener entry point
├── tests/
│   ├── api.test.js               # Supertest REST API integration suite
│   ├── scenarios.test.js         # Scenario lifecycle & ownership isolation suite
│   └── services.test.js          # Pure financial math unit test suite
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 2. Prerequisites & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB: Local MongoDB server OR a free MongoDB Atlas cloud cluster

### Installation
1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   npm install
   ```

2. Copy `.env.example` to create `.env`:
   ```bash
   cp .env.example .env
   ```

3. Configure your `.env` variables:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_ORIGIN=http://localhost:5173
   MONGODB_URI=mongodb://127.0.0.1:27017/creditlens
   JWT_SECRET=your_secure_jwt_secret_key_here
   ```

---

## 3. MongoDB Setup Options

### Option A: Local MongoDB
- **Windows (Service):**
  ```cmd
  net start MongoDB
  ```
- **Windows (Executable):**
  ```cmd
  mongod --dbpath "C:\data\db"
  ```
- **macOS / Linux:**
  ```bash
  brew services start mongodb/brew/mongodb-community
  # or
  sudo systemctl start mongod
  ```
- Set `MONGODB_URI=mongodb://127.0.0.1:27017/creditlens` in `backend/.env`.

### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a free M0 cluster and create a database user with username and password.
3. Under **Network Access**, add `0.0.0.0/0` (or your current IP address).
4. Click **Connect** -> **Connect your application** and copy the URI:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/creditlens?retryWrites=true&w=majority
   ```
5. Paste this connection string into `backend/.env`.

*(Note: If MongoDB is offline, CreditLens automatically runs with an in-memory store so you can test and develop without any blocking connection errors.)*

---

## 4. Running the Application

### Start Backend API Server
```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```
*Backend runs on `http://localhost:5000`.*

### Start Frontend Application
From the repository root or `frontend` directory:
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 5. Running Automated Backend Tests

The backend includes a comprehensive 35-test suite testing pure services, HTTP endpoints, security boundary validations, and cross-user ownership isolation:

```bash
cd backend
npm test
```

### Test Suites Included:
- **`tests/services.test.js`:** Pure unit tests for reducing-balance EMI, 0% interest, amortization reconciliation to ₹0, no double-counting of expenses, inverse EMI max loan budget, prepayment interest savings, and emergency fund runways.
- **`tests/api.test.js`:** Integration tests with Supertest covering health check, calculation APIs, simulator APIs, auth validation, and JWT verification.
- **`tests/scenarios.test.js`:** Scenario lifecycle CRUD, duplication with `(Copy)` naming, and strict multi-user tenant ownership verification.

---

## 6. API Endpoint Documentation

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive JWT token | No |
| `GET` | `/api/auth/me` | Get currently authenticated user | Yes (Bearer) |
| `POST` | `/api/auth/logout` | Discard session authentication | No |

#### `POST /api/auth/register`
**Request:**
```json
{
  "name": "Rohan Sharma",
  "email": "rohan.sharma@creditlens.demo",
  "password": "Password123"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "67123abc456...",
    "name": "Rohan Sharma",
    "email": "rohan.sharma@creditlens.demo"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Financial Profile (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Retrieve authenticated user's financial profile | Yes |
| `POST` | `/api/profile` | Create or update financial profile | Yes |
| `PUT` | `/api/profile` | Update financial profile | Yes |
| `DELETE` | `/api/profile` | Reset profile to default | Yes |

#### `POST /api/profile`
**Request:**
```json
{
  "monthlyIncome": 85000,
  "monthlyExpenses": 32000,
  "otherExpenses": 6000,
  "monthlySavingsTarget": 15000,
  "currentSavings": 180000,
  "existingEmis": [
    {
      "name": "Two-Wheeler Loan",
      "amount": 3800,
      "balance": 45000,
      "annualRate": 11.5,
      "remainingMonths": 14
    }
  ]
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Financial profile saved successfully",
  "profile": {
    "monthlyIncome": 85000,
    "monthlyExpenses": 32000,
    "otherExpenses": 6000,
    "monthlySavingsTarget": 15000,
    "currentSavings": 180000,
    "existingEmis": [...]
  }
}
```

---

### Loan Calculation APIs (`/api/loans`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/loans/calculate-emi` | Reducing-balance EMI calculation |
| `POST` | `/api/loans/affordability` | Comprehensive budget solvency & rule-based insights |
| `POST` | `/api/loans/amortization` | Month-by-month repayment schedule |
| `POST` | `/api/loans/compare` | Compare 3 to 5 loan options |

#### `POST /api/loans/calculate-emi`
**Request:**
```json
{
  "principal": 1000000,
  "annualRate": 8.75,
  "tenureMonths": 60
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "result": {
    "emi": 20637,
    "exactEmi": 20636.84,
    "totalInterest": 238220,
    "totalPayment": 1238220,
    "principal": 1000000,
    "tenureMonths": 60,
    "annualRate": 8.75
  }
}
```

---

### Simulators (`/api/simulators`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/simulators/max-loan` | Reverse EMI maximum borrowing budget calculator |
| `POST` | `/api/simulators/prepayment` | Early payoff, months saved, and interest savings |
| `POST` | `/api/simulators/emergency-fund` | Essential expense burn rate & safety runway planner |
| `POST` | `/api/simulators/compare-scenarios` | Side-by-side comparison of saved scenario IDs or objects |

#### `POST /api/simulators/max-loan`
**Request:**
```json
{
  "monthlyIncome": 100000,
  "monthlyExpenses": 35000,
  "otherExpenses": 5000,
  "existingEmis": [{ "amount": 5000 }],
  "monthlySavingsTarget": 15000,
  "annualRate": 8.5,
  "tenureMonths": 60
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "result": {
    "maxPrincipal": 1698000,
    "maxAffordableEmi": 35000,
    "actualEmiAtMax": 34842,
    "totalInterestAtMax": 392520,
    "totalPaymentAtMax": 2090520,
    "remainingMonthlyBalance": 20158,
    "limitingFactor": null,
    "message": null
  }
}
```

---

### Saved Scenarios (`/api/scenarios`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/scenarios` | List all saved scenarios for current user | Yes |
| `POST` | `/api/scenarios` | Create & recalculate new loan scenario | Yes |
| `GET` | `/api/scenarios/:id` | Get scenario by ID (with ownership check) | Yes |
| `PUT` | `/api/scenarios/:id` | Update scenario (with ownership check) | Yes |
| `POST` | `/api/scenarios/:id/duplicate` | Duplicate scenario as `[Name] (Copy)` | Yes |
| `DELETE` | `/api/scenarios/:id` | Delete scenario (with ownership check) | Yes |

---

## 7. Security & Rule-Based Solvency

- **Bcrypt Hashing:** Passwords hashed with 10 salt rounds; plain-text passwords never stored or returned.
- **JWT Protection:** Private endpoints enforce Bearer tokens.
- **Multi-Tenant Ownership:** Users are strictly isolated; User A cannot read, update, duplicate, or delete User B's profile or scenarios.
- **Boundary Validation:** Principal $\ge 0$, Rate $0 \le r \le 100\%$, Tenure $1 \le n \le 600$ months.
- **No Double Counting:** Living expenses and `otherExpenses` are clearly separated and combined safely without duplicating existing debt EMIs.
- **Educational Assumption Disclaimers:** All affordability insights state illustrative assumptions without false claims of bank credit approval.
