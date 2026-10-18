import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kova-auth-wrapper">
      <div className="kova-auth-glow-bg" />
      <div className="kova-auth-card">
        {/* Header Branding */}
        <div className="kova-auth-header">
          <div className="kova-auth-icon-badge">
            <LogIn size={26} />
          </div>
          <h1 className="kova-auth-title">Welcome Back</h1>
          <p className="kova-auth-subtitle">
            Sign in to access your financial profile, saved loan scenarios, and live bank comparisons
          </p>
        </div>

        {/* Tab switch between Sign In and Sign Up */}
        <div className="kova-auth-tabs">
          <button type="button" className="kova-auth-tab active">
            Sign In
          </button>
          <Link to="/register" className="kova-auth-tab">
            Create Account
          </Link>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="kova-alert kova-alert-error" role="alert">
            <AlertCircle size={18} className="kova-alert-icon" />
            <div className="kova-alert-body">
              <span className="kova-alert-title">Authentication Error</span>
              <p className="kova-alert-desc">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="kova-auth-form" noValidate>
          <div className="kova-form-group">
            <label className="kova-form-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="kova-input-wrapper">
              <span className="kova-input-icon">
                <Mail size={18} />
              </span>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="kova-input has-left-icon"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="kova-form-group">
            <div className="kova-form-label-row">
              <label className="kova-form-label" htmlFor="login-password">
                Password
              </label>
            </div>
            <div className="kova-input-wrapper">
              <span className="kova-input-icon">
                <Lock size={18} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="kova-input has-left-icon has-right-icon"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="kova-input-action-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="kova-btn kova-btn-primary kova-btn-lg kova-btn-block"
            disabled={loading}
          >
            {loading ? (
              <span className="kova-btn-loading">
                <span className="kova-spinner-small" />
                <span>Authenticating with MongoDB...</span>
              </span>
            ) : (
              <>
                <span>Sign In to CreditLens</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="kova-auth-footer-prompt">
          Don't have a CreditLens account?{' '}
          <Link to="/register" className="kova-auth-link">
            Create an account
          </Link>
        </div>

        {/* Security badge */}
        <div className="kova-auth-security-badge">
          <ShieldCheck size={15} className="kova-security-icon" />
          <span>MongoDB Atlas Encrypted &bull; User-Isolated Sessions</span>
        </div>
      </div>
    </div>
  );
};
