import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app and provides global auth state.
 * Token is persisted in localStorage; user is validated via /api/auth/me on mount.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // true while verifying session on mount

  // ── On mount: if token exists, verify it and load user ──────────────────
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data.user);
      } catch {
        // Token invalid or expired — clear everything
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helper: clear all stored auth state ─────────────────────────────────
  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  /**
   * login — POST /api/auth/login
   * Returns { success, message } — caller decides navigation
   */
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res.data;
  }, []);

  /**
   * register — POST /api/auth/register
   * Returns server response. Does NOT auto-login; caller redirects to /login.
   */
  const register = useCallback(async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res.data;
  }, []);

  /**
   * logout — clears all auth state and redirects to /login
   */
  const logout = useCallback(() => {
    clearAuth();
    window.location.href = '/login';
  }, [clearAuth]);

  /**
   * updateUser — update local user state after a profile/password change
   */
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedData }));
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — custom hook to access AuthContext
 * Throws if used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
