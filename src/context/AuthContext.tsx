import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const API_URL = 'http://localhost:5001/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_URL;
    if (token) {
      console.log('Setting axios default header with token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('Removing axios default header');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        console.log('No token found, skipping user load');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Attempting to load user data with token');
        const response = await axios.get('/auth/me');
        console.log('User data loaded:', response.data);

        if (response.data.status !== 'success') {
          throw new Error(response.data.message || 'Failed to load user data');
        }

        setUser(response.data.data.user);
      } catch (error: any) {
        console.error('Error loading user:', error.response?.data || error.message);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError('Session expired. Please login again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Attempting login...');

      const response = await axios.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Login failed');
      }

      const { token: newToken, data } = response.data;
      const userData = data.user;

      // Save token to localStorage and update axios headers
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData);

      console.log('Login successful, user role:', userData.role);
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Attempting registration...');

      const response = await axios.post('/auth/register', userData);
      console.log('Registration response:', response.data);

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Registration failed');
      }

      const { token: newToken, data } = response.data;
      const newUser = data.user;

      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(newUser);
      console.log('Registration successful, user role:', newUser.role);
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
