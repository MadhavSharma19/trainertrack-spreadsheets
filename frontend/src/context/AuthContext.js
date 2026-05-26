import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// ⚠️ REPLACE THIS with your actual deployed backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://YOUR_DEPLOYED_BACKEND_URL_HERE';

const API = axios.create({ baseURL: BACKEND_URL });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('tt_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('tt_token');
    const savedUser = localStorage.getItem('tt_user');
    if (saved && savedUser) {
      setToken(saved);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const { data } = await API.post('/login', { email, password });
    localStorage.setItem('tt_token', data.token);
    localStorage.setItem('tt_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('tt_token');
    localStorage.removeItem('tt_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { API, BACKEND_URL };
