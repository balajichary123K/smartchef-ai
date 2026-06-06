import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default auth headers for axios
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load User on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        // Fallback to Guest User Role
        setUser({
          name: 'Guest Cook',
          email: 'guest@smartchef.ai',
          role: 'guest',
          preferences: {
            dietary: [],
            allergies: [],
            cookingLevel: 'beginner',
            nutritionGoals: {
              weightLoss: false, muscleGain: false, diabeticFriendly: false,
              highProtein: false, keto: false, vegan: false
            }
          },
          favorites: [],
          groceryList: []
        });
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
        setError(null);
      } catch (err) {
        console.warn('Failed to load user with token, falling back to guest:', err.message);
        localStorage.removeItem('token');
        setToken(null);
        setUser({
          name: 'Guest Cook',
          email: 'guest@smartchef.ai',
          role: 'guest',
          preferences: {
            dietary: [],
            allergies: [],
            cookingLevel: 'beginner',
            nutritionGoals: {
              weightLoss: false, muscleGain: false, diabeticFriendly: false,
              highProtein: false, keto: false, vegan: false
            }
          },
          favorites: [],
          groceryList: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register User
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/signup', { name, email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setError(null);
      return res.data.user;
    } catch (err) {
      const errMsg = err.response?.data?.msg || 'Signup failed. Please try again.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setError(null);
      return res.data.user;
    } catch (err) {
      const errMsg = err.response?.data?.msg || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Google Login Simulation
  const googleLogin = async (googleData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/google', {
        name: googleData.name || 'Google User',
        email: googleData.email,
        googleId: googleData.sub || googleData.googleId
      });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setError(null);
      return res.data.user;
    } catch (err) {
      const errMsg = err.response?.data?.msg || 'Google Login failed.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update Preferences
  const updatePreferences = async (preferencesData) => {
    if (user?.role === 'guest') {
      // Local updates for Guest
      setUser(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          ...preferencesData
        }
      }));
      return preferencesData;
    }

    try {
      const res = await axios.put('/api/auth/preferences', preferencesData);
      setUser(prev => ({
        ...prev,
        preferences: res.data
      }));
      return res.data;
    } catch (err) {
      console.error('Failed to update preferences:', err.message);
      throw err;
    }
  };

  // Sync Grocery List to Backend
  const syncGroceryList = async (list) => {
    if (user?.role === 'guest') {
      setUser(prev => ({ ...prev, groceryList: list }));
      return list;
    }

    try {
      const res = await axios.post('/api/auth/grocery-list', { list });
      setUser(prev => ({ ...prev, groceryList: res.data }));
      return res.data;
    } catch (err) {
      console.error('Failed to sync grocery list:', err.message);
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser({
      name: 'Guest Cook',
      email: 'guest@smartchef.ai',
      role: 'guest',
      preferences: {
        dietary: [],
        allergies: [],
        cookingLevel: 'beginner',
        nutritionGoals: {
          weightLoss: false, muscleGain: false, diabeticFriendly: false,
          highProtein: false, keto: false, vegan: false
        }
      },
      favorites: [],
      groceryList: []
    });
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        googleLogin,
        updatePreferences,
        syncGroceryList,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
