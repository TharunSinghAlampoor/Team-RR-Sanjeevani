import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../api/authService';
import { getApiBaseUrl } from '../api/apiConfig';
import {
  saveSessionCookies,
  loadSessionCookies,
  clearSessionCookies,
  saveShoppingState,
  loadShoppingState,
} from '../utils/cookieUtils';
import { cleanLocalStorage } from '../utils/localStorageUtils';

const AuthContext = createContext(null);

// ── Force immediate clean up of localStorage ─────────────────────
(function cleanLocalStorageOnModuleLoad() {
  cleanLocalStorage();
  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = localStorage.getItem('user');
    if (raw && (raw.startsWith('{') || raw.startsWith('['))) {
      try {
        const parsed = JSON.parse(raw);
        const name = parsed.fullName || parsed.name || parsed.email || '';
        localStorage.setItem('user', name);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }
})();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Shopping state cached from cookies for instant badge display
  const [cachedCartCount, setCachedCartCount] = useState(0);
  const [cachedFavoritesCount, setCachedFavoritesCount] = useState(0);

  useEffect(() => {
    cleanLocalStorage();
    const loadSession = async () => {
      // 1. Try loading from sessionStorage first, then localStorage
      let localToken = sessionStorage.getItem('token') || localStorage.getItem('token');
      let localUserName = sessionStorage.getItem('user') || localStorage.getItem('user');
      let localRole = sessionStorage.getItem('user_role') || localStorage.getItem('user_role') || '';

      // If localUserName was stored as JSON, extract just the name string
      if (localUserName && (localUserName.startsWith('{') || localUserName.startsWith('['))) {
        try {
          const parsed = JSON.parse(localUserName);
          localUserName = parsed.fullName || parsed.name || parsed.email || '';
          if (!localRole && parsed.role) localRole = parsed.role;
        } catch (e) {
          localUserName = '';
        }
      }

      // 2. Fallback to session cookies if sessionStorage/localStorage is empty
      if (!localToken || !localUserName) {
        const cookieSession = loadSessionCookies();
        if (cookieSession && cookieSession.token) {
          localToken = cookieSession.token;
          localUserName = cookieSession.userName;
        }
      }

      if (localToken && localUserName) {
        setToken(localToken);
        setUser({ fullName: localUserName, role: localRole });

        // Save token and user name in sessionStorage (and sync localStorage + cookies)
        sessionStorage.setItem('token', localToken);
        sessionStorage.setItem('user', localUserName);
        sessionStorage.setItem('user_role', localRole);
        localStorage.setItem('token', localToken);
        localStorage.setItem('user', localUserName);
        localStorage.setItem('user_role', localRole);
        saveSessionCookies(localUserName, localToken);

        // Load cached shopping counts for instant badge display
        const shopping = loadShoppingState();
        setCachedCartCount(shopping.cartCount);
        setCachedFavoritesCount(shopping.favoritesCount);

        // Unblock loading state immediately so UI renders in <5ms
        setLoading(false);

        // Fetch fresh full profile asynchronously in background
        authService.getCurrentUser().then(response => {
          if (response && response.success && response.data) {
            setUser(response.data);
            const freshName = response.data.fullName || response.data.email || localUserName;
            const freshRole = response.data.role || localRole;
            sessionStorage.setItem('token', localToken);
            sessionStorage.setItem('user', freshName);
            sessionStorage.setItem('user_role', freshRole);
            localStorage.setItem('token', localToken);
            localStorage.setItem('user', freshName);
            localStorage.setItem('user_role', freshRole);
            saveSessionCookies(freshName, localToken);
          }
        }).catch(err => {
          console.warn("Background getCurrentUser fetch notice:", err?.message || err);
        });
      } else {
        setLoading(false);
      }
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
    // Extract display name string only
    const userName = typeof userData === 'string'
      ? userData
      : (userData.fullName || userData.name || userData.email || '');
    const userRole = typeof userData === 'object' && userData.role ? userData.role : '';

    // Set sessionStorage (JWT Token + User Name String + Role)
    sessionStorage.setItem('token', jwtToken);
    sessionStorage.setItem('user', userName);
    sessionStorage.setItem('user_role', userRole);

    // Sync localStorage & cookies
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', userName);
    localStorage.setItem('user_role', userRole);
    saveSessionCookies(userName, jwtToken);

    // Update state
    setToken(jwtToken);
    setUser(userData);
  };

  const clearSession = () => {
    clearSessionCookies();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('user_role');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    setToken(null);
    setUser(null);
    setCachedCartCount(0);
    setCachedFavoritesCount(0);
  };

  // Called by Dashboard to sync shopping counts to cookies
  const updateShoppingState = (cartCount, favoritesCount) => {
    setCachedCartCount(cartCount);
    setCachedFavoritesCount(favoritesCount);
    saveShoppingState({ cartCount, favoritesCount });
  };

  const login = (userData, jwtToken) => {
    saveSession(userData, jwtToken);
  };

  const logout = () => {
    // 1. Capture token before local session clear
    const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token') || getCookie('auth_token') || token;

    // 2. Issue browser-guaranteed keepalive logout request so backend MySQL deletes token from jwt_tokens table
    if (activeToken) {
      try {
        const logoutUrl = `${getApiBaseUrl()}/auth/logout`;
        const authHeader = activeToken.startsWith('Bearer ') ? activeToken : `Bearer ${activeToken}`;
        
        fetch(logoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          keepalive: true,
        }).catch(() => {});
      } catch (e) {
        console.warn('Keepalive logout error:', e);
      }
    }

    // 3. Call authService.logout() backup call
    authService.logout().catch(() => {});

    // 4. Instantly purge local session state & cookies
    clearSession();

    // 5. Instant redirect to login page
    if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    cachedCartCount,
    cachedFavoritesCount,
    updateShoppingState,
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
