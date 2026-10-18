import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LoanProvider } from './context/LoanContext';
import { Navbar } from './components/common/Navbar';
import { Toast } from './components/common/Toast';
import { ProtectedRoute, PublicOnlyRoute } from './components/common/ProtectedRoute';

import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { CalculatorPage } from './pages/CalculatorPage';
import { AffordabilityPage } from './pages/AffordabilityPage';
import { SchedulePage } from './pages/SchedulePage';
import { ComparePage } from './pages/ComparePage';
import { SavedScenariosPage } from './pages/SavedScenariosPage';
import { PrepaymentPage } from './pages/PrepaymentPage';
import { MaxLoanPage } from './pages/MaxLoanPage';
import { EmergencyFundPage } from './pages/EmergencyFundPage';
import { BankRatesPage } from './pages/BankRatesPage';

/**
 * ScrollToTop ensures that navigating between any view automatically scrolls to the top of the viewport.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <LoanProvider>
            <ScrollToTop />
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public Authentication Pages (Login is initial entrypoint) */}
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicOnlyRoute>
                        <RegisterPage />
                      </PublicOnlyRoute>
                    }
                  />

                  {/* Root and Protected Dashboard */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Financial Profile & Debt Portfolio */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Core Calculation Tools */}
                  <Route
                    path="/calculator"
                    element={
                      <ProtectedRoute>
                        <CalculatorPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bank-rates"
                    element={
                      <ProtectedRoute>
                        <BankRatesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/rates"
                    element={
                      <ProtectedRoute>
                        <BankRatesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/affordability"
                    element={
                      <ProtectedRoute>
                        <AffordabilityPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/schedule"
                    element={
                      <ProtectedRoute>
                        <SchedulePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Simulators */}
                  <Route
                    path="/max-loan"
                    element={
                      <ProtectedRoute>
                        <MaxLoanPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/maxloan"
                    element={
                      <ProtectedRoute>
                        <MaxLoanPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/max-capacity"
                    element={
                      <ProtectedRoute>
                        <MaxLoanPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/simulator/capacity"
                    element={
                      <ProtectedRoute>
                        <MaxLoanPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/prepayment"
                    element={
                      <ProtectedRoute>
                        <PrepaymentPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/prepay"
                    element={
                      <ProtectedRoute>
                        <PrepaymentPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/simulator/prepayment"
                    element={
                      <ProtectedRoute>
                        <PrepaymentPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/emergency-fund"
                    element={
                      <ProtectedRoute>
                        <EmergencyFundPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/emergency"
                    element={
                      <ProtectedRoute>
                        <EmergencyFundPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/simulator/emergency"
                    element={
                      <ProtectedRoute>
                        <EmergencyFundPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/compare"
                    element={
                      <ProtectedRoute>
                        <ComparePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/compare-scenarios"
                    element={
                      <ProtectedRoute>
                        <ComparePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/simulator/compare"
                    element={
                      <ProtectedRoute>
                        <ComparePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Saved Scenarios */}
                  <Route
                    path="/saved"
                    element={
                      <ProtectedRoute>
                        <SavedScenariosPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/saved-scenarios"
                    element={
                      <ProtectedRoute>
                        <SavedScenariosPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Toast />
            </div>
          </LoanProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
