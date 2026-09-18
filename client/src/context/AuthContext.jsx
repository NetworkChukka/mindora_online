import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mindora_token'));
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  // Configure default Axios baseURL and interceptor
  axios.defaults.baseURL = window.location.origin;

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check setup requirement & current authenticated user
  const checkInitialState = async () => {
    try {
      setLoading(true);
      // Check setup status
      const setupRes = await axios.get('/api/auth/setup');
      if (setupRes.data.setupRequired) {
        setSetupRequired(true);
        setLoading(false);
        return;
      } else {
        setSetupRequired(false);
      }

      // If token exists, load current user profile
      if (token) {
        const meRes = await axios.get('/api/auth/me');
        if (meRes.data.success) {
          setUser(meRes.data.user);
        } else {
          logout();
        }
      }
    } catch (err) {
      console.warn('Auth check failed:', err.message);
      if (token) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkInitialState();
  }, [token]);

  const login = async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('mindora_token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mindora_token');
    delete axios.defaults.headers.common['Authorization'];
    axios.post('/api/auth/logout').catch(() => {});
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      setupRequired,
      login,
      logout,
      checkInitialState,
      isAdmin: user?.role === 'ADMIN',
      isOperator: user?.role === 'REGISTRATION_OPERATOR' || user?.role === 'ADMIN',
      isViewer: user?.role === 'VIEWER'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
