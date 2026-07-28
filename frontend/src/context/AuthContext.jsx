import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load persisted session on app startup
    const loadSession = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        
        // Migrate / parse storedUser to get the name
        let name = storedUser;
        if (storedUser.trim().startsWith('{') && storedUser.trim().endsWith('}')) {
          try {
            const parsed = JSON.parse(storedUser);
            name = parsed.fullName || name;
          } catch (e) {}
        }
        
        // Update local storage to only contain the plain name string
        localStorage.setItem('user', name);
        setUser({ fullName: name });

        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch (err) {
          if (err.response && err.response.status === 401) {
            clearSession();
          }
        }
      }
      setLoading(false);
    };

    loadSession();

    // Global listener for unauthorized calls (401)
    const handleUnauthorized = () => {
      clearSession();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const saveSession = (userData, jwtToken) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', userData.fullName);
    setToken(jwtToken);
    setUser(userData);
  };

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const login = (userData, jwtToken) => {
    saveSession(userData, jwtToken);
  };

  const logout = () => {
    clearSession();
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
