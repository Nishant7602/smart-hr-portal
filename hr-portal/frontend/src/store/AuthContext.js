import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hr_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token, ...userData } = res.data.data;
      localStorage.setItem('hr_token', token);
      localStorage.setItem('hr_user', JSON.stringify(userData));
      setUser(userData);
      toast.success(`Welcome back, ${userData.fullName?.split(' ')[0]}!`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.register(data);
      const { token, ...userData } = res.data.data;
      localStorage.setItem('hr_token', token);
      localStorage.setItem('hr_user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Account created successfully!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_user');
    setUser(null);
    toast.success('Logged out');
  };

  const isAdmin = () => user?.roles?.includes('HR_ADMIN');
  const isRecruiter = () => user?.roles?.some(r => ['HR_ADMIN', 'RECRUITER'].includes(r));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isRecruiter }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
