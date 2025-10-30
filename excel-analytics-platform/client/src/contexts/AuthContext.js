import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// Auth state reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        loading: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        loading: false,
        user: null,
        token: null,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  console.log('🔐 Auth Provider initialized, token exists:', !!state.token);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔍 Found token on app start, verifying...');
      verifyToken();
    } else {
      console.log('ℹ️  No token found, user is not logged in');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Verify token validity
  const verifyToken = async () => {
    try {
      dispatch({ type: 'LOADING' });
      console.log('🔍 Verifying token with server...');
      const response = await authAPI.verifyToken();
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.user,
          token: localStorage.getItem('token'),
        },
      });
      console.log('✅ Token verified, user logged in:', response.data.user.name);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOADING' });
      console.log('🔐 Attempting login for:', email);
      
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      console.log('✅ Login successful for:', user.name);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.log('❌ Login failed:', errorMessage);
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'LOADING' });
      console.log('📝 Attempting registration for:', userData.email);
      
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      console.log('✅ Registration successful for:', user.name);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      console.log('❌ Registration failed:', errorMessage);
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  // Update user profile
  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    verifyToken,
  };

  return (
    <AuthContext.Provider value={value}>
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