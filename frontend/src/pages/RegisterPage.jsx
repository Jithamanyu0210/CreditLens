import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your passwords.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      // New user redirected to profile to configure their financial parameters
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            <UserPlus size={26} />
          </div>
          <h1 className="kova-auth-title">Create Your Account</h1>
          <p className="kova-auth-subtitle">
            Start planning affordable loan terms, stress-testing repayments, and comparing real bank rates
          </p>
        </div>

        {/* Tab switch between Sign In and Sign Up */}
        <div className="kova-auth-tabs">
          <Link to="/login" className="kova-auth-tab">
            Sign In
          </Link>
          <button type="button" className="kova-auth-tab active">
            Create Account
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="kova-alert kova-alert-error" role="alert">
            <AlertCircle size={18} className="kova-alert-icon" />
            <div className="kova-alert-body">
              <span className="kova-alert-title">Registration Error</span>
              <p className="kova-alert-desc">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="kova-auth-form" noValidate>
          <div className="kova-form-group">
            <label className="kova-form-label" htmlFor="reg-name">
              Full Name
            </label>
            <div className="kova-input-wrapper">
              <span className="kova-input-icon">
                <User size={18} />
              </span>
              <input
                id="reg-name"
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="kova-input has-left-icon"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="kova-form-group">
            <label className="kova-form-label" htmlFor="reg-email">
              Email Address
            </label>
            <div className="kova-input-wrapper">
              <span className="kova-input-icon">
                <Mail size={18} />
              </span>
              <input
                id="reg-email"
                type="email"
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="kova-input has-left-icon"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="kova-form-group">
            <label className="kova-form-label" htmlFor="reg-password">
              Password <span className="kova-form-label-hint">(min 6 characters)</span>
            </label>
            <div className="kova-input-wrapper">
              <span className="kova-input-icon">
                <Lock size={18} />
              </span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="kova-input has-left-icon has-right-icon"
                autoComplete="new-password"
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

          <div className="kova-form-group">
            <label className="kova-form-label" htmlFor="reg-confirm-password">
              Confirm Password
            </label>
            <div className="kova-input-wrapper">
              <span className="kova-input-icon">
                <Lock size={18} />
              </span>
              <input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="kova-input has-left-icon"
                autoComplete="new-password"
                required
              />
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
                <span>Creating MongoDB Account...</span>
              </span>
            ) : (
              <>
                <span>Create CreditLens Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="kova-auth-footer-prompt">
          Already have an account?{' '}
          <Link to="/login" className="kova-auth-link">
            Sign in
          </Link>
        </div>

        {/* Security badge */}
        <div className="kova-auth-security-badge">
          <ShieldCheck size={15} className="kova-security-icon" />
          <span>Bcrypt Password Hashing &bull; Real Database Persistence</span>
        </div>
      </div>
    </div>
  );
};
