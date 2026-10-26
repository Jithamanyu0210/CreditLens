import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoanProvider } from './context/LoanContext';
import { Sidebar } from './components/common/Sidebar';
import { TopNavbar } from './components/common/TopNavbar';
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
import { AiAssistantPage } from './pages/AiAssistantPage';

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


/**
 * AppContent wraps the main layout with the persistent Left Sidebar and TopNavbar
 * for authenticated sessions, while displaying clean standalone auth pages for Login/Register.
 */
function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // During initial session verification, render full-page loader to prevent unauthenticated content flashes or premature redirects
  if (loading) {
    return (
      <div className="kova-loader-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="kova-pulse-ring" />
        <div className="kova-loader-text">Verifying secure session...</div>
      </div>
    );
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const showSidebar = !!user && !isAuthPage;

  return (
    <div className={`app-container ${showSidebar ? 'has-sidebar' : 'auth-mode'}`}>
      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div className={showSidebar ? 'cl-app-main-wrapper' : 'cl-auth-wrapper-full'}>
        {showSidebar && (
          <TopNavbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        )}
        <main className={showSidebar ? 'main-content' : 'auth-main'}>
          <Routes>
            {/* Public Authentication Pages */}
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

            {/* Initial entrypoint: Opening the website always shows the Sign In page first */}
            <Route path="/" element={<Navigate to="/login" replace />} />
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

            {/* Core Features */}
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

            {/* Financial Simulators */}
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

            {/* AI Financial Assistant */}
            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <AiAssistantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai"
              element={
                <ProtectedRoute>
                  <AiAssistantPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Toast />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <LoanProvider>
            <ScrollToTop />
            <AppContent />
          </LoanProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
