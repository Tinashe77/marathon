// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Validate token and get user data
      fetchCurrentUser(token);
    }
    setLoading(false);
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const response = await axios.get('/auth/me');
      const userData = response.data.data;
      setUser({ ...userData, token });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // If token is invalid, logout
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user data
        const userResponse = await axios.get('/auth/me');
        const userData = userResponse.data.data;
        
        setUser({ ...userData, token });
        return true;
      }
      throw new Error('No token received');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };