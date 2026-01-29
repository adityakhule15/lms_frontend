import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user_data'));
      if (userData) {
        setUser(userData);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await axios.post('http://192.168.29.231:8000/api/login/', {
        username,
        password,
      });
      
      const { user: userData, access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser(userData);
      
      // Set default axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return { success: true, data: userData };
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      return { success: false, error: err.response?.data };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post('http://192.168.29.231:8000/api/register/', userData);
      
      const { user: newUser, access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(newUser));
      
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return { success: true, data: newUser };
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
      return { success: false, error: err.response?.data };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      const response = await axios.post('http://192.168.29.231:8000/api/token/refresh/', {
        refresh,
      });
      
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return { success: true };
    } catch (err) {
      logout();
      return { success: false };
    }
  };

  // Add interceptor for token refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const refreshResult = await refreshToken();
        if (refreshResult.success) {
          originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
          return axios(originalRequest);
        }
      }
      
      return Promise.reject(error);
    }
  );

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

