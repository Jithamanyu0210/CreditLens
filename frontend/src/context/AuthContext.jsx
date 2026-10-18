import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('creditlens_user');
      const token = localStorage.getItem('creditlens_token');
      return saved && token ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !!localStorage.getItem('creditlens_token');
    } catch {
      return false;
    }
  });

  // Sync user state changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('creditlens_user', JSON.stringify(user));
    }
  }, [user]);

  // Verify and refresh existing session on initial application load
  useEffect(() => {
    const token = localStorage.getItem('creditlens_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    authAPI.getMe()
      .then((res) => {
        if (res && res.user) {
          const verifiedUser = {
            ...res.user,
            role: res.user.role || 'Borrower / Planner',
            avatar: res.user.avatar || (res.user.name ? res.user.name.charAt(0).toUpperCase() : 'U')
          };
          setUser(verifiedUser);
        } else {
          // Response invalid: clear stale session
          setUser(null);
          localStorage.removeItem('creditlens_token');
          localStorage.removeItem('creditlens_user');
        }
      })
      .catch((err) => {
        // If unauthorized (401), token has expired: clear session
        if (err.statusCode === 401) {
          setUser(null);
          localStorage.removeItem('creditlens_token');
          localStorage.removeItem('creditlens_user');
        }
        // If network error, preserve cached user so user isn't logged out by transient offline state
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Please provide both email address and password.');
    }

    const res = await authAPI.login(email.trim(), password);
    if (res && res.token && res.user) {
      localStorage.setItem('creditlens_token', res.token);
      const loggedInUser = {
        ...res.user,
        role: res.user.role || 'Borrower / Planner',
        avatar: res.user.avatar || (res.user.name ? res.user.name.charAt(0).toUpperCase() : 'U')
      };
      setUser(loggedInUser);
      return loggedInUser;
    }
    throw new Error('Authentication failed: Invalid response from server.');
  };

  const register = async (name, email, password) => {
    if (!name || !email || !password) {
      throw new Error('Full name, email address, and password are required.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const res = await authAPI.register(name.trim(), email.trim(), password);
    if (res && res.token && res.user) {
      localStorage.setItem('creditlens_token', res.token);
      const newUser = {
        ...res.user,
        role: res.user.role || 'First-time Borrower',
        avatar: res.user.avatar || (res.user.name ? res.user.name.charAt(0).toUpperCase() : 'U')
      };
      setUser(newUser);
      return newUser;
    }
    throw new Error('Registration failed: Invalid response from server.');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('creditlens_token');
      localStorage.removeItem('creditlens_user');
      localStorage.removeItem('creditlens_profile');
      localStorage.removeItem('creditlens_scenarios');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
