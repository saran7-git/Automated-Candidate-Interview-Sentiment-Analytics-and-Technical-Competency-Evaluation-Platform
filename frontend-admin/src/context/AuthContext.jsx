import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('interviewiq_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('interviewiq_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('interviewiq_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[Auth Verify Warning]: Session expired');
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success && res.data?.token) {
      const userObj = res.data.user;
      const tokenStr = res.data.token;
      setToken(tokenStr);
      setUser(userObj);
      localStorage.setItem('interviewiq_token', tokenStr);
      localStorage.setItem('interviewiq_user', JSON.stringify(userObj));
      return userObj;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (name, email, password, role = 'candidate') => {
    const res = await authAPI.register({ name, email, password, role });
    if (res.data?.success && res.data?.token) {
      const userObj = res.data.user;
      const tokenStr = res.data.token;
      setToken(tokenStr);
      setUser(userObj);
      localStorage.setItem('interviewiq_token', tokenStr);
      localStorage.setItem('interviewiq_user', JSON.stringify(userObj));
      return userObj;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('interviewiq_token');
    localStorage.removeItem('interviewiq_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isRecruiter: user?.role === 'recruiter' || user?.role === 'admin',
        isCandidate: user?.role === 'candidate',
        login,
        register,
        logout,
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
