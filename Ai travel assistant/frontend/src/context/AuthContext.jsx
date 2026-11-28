import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check existing session on mount
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const response = await authApi.getMe();
        if (isMounted && response?.data) {
          setUser(response.data);
        }
      } catch (_err) {
        // Not authenticated or session expired
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      const userData = response.data;
      if (userData?.token) {
        localStorage.setItem('traveliq_token', userData.token);
      }
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async ({ name, email, password, phone }) => {
    setError(null);
    try {
      const response = await authApi.register({ name, email, password, phone });
      const userData = response.data;
      if (userData?.token) {
        localStorage.setItem('traveliq_token', userData.token);
      }
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (_err) {
      // Ignore logout errors and clear local state
    } finally {
      localStorage.removeItem('traveliq_token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
