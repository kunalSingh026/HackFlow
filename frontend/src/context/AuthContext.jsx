import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
// import axios from 'axios'; // We will uncomment this when we connect the real API

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing token on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Session expired or no active session.');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Listen to custom logout event on token refresh failure
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, []);

  // Login Function
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'A network error occurred. Please try again.',
      };
    }
  };

  // Logout Function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext easily in any component
export const useAuth = () => {
  return useContext(AuthContext);
};
