import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route guard that requires an active authenticated session.
 * Unauthenticated users are redirected to /login immediately.
 */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="kova-loader-container">
        <div className="kova-pulse-ring" />
        <div className="kova-loader-text">Verifying secure session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Route guard for public-only pages like /login and /register.
 * Authenticated users are automatically redirected to /dashboard.
 */
export const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="kova-loader-container">
        <div className="kova-pulse-ring" />
        <div className="kova-loader-text">Loading CreditLens...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
