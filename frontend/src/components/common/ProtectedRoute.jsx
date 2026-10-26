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
 * Public route wrapper for authentication pages like /login and /register.
 * Allows users to access the login and registration interfaces directly.
 */
export const PublicOnlyRoute = ({ children }) => {
  return children;
};
