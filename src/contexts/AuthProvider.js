/**
 * Authentication Context Provider
 * Manages user authentication state and provides auth methods throughout the app
 * Includes session persistence and real-time auth state monitoring
 * @author Ibraheem Ganayim
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  subscribeToAuthState, 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser,
  getUserDocument,
  isAuthenticated,
  getAuthState,
  updateUserProfile,
  resetPassword
} from '../services/auth';

// Create Auth Context
const AuthContext = createContext({});

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: '@YallaBit:userData',
  AUTH_TOKEN: '@YallaBit:authToken'
};

/**
 * AuthProvider component that wraps the app and provides authentication state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  /**
   * Save user data to AsyncStorage for session persistence
   * @param {Object} userData - User data to persist
   */
  const persistUserData = async (userData) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
    } catch (error) {
      console.error('Error persisting user data:', error);
    }
  };

  /**
   * Load persisted user data from AsyncStorage
   * @returns {Object|null} Persisted user data or null
   */
  const loadPersistedUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error loading persisted user data:', error);
      return null;
    }
  };

  /**
   * Handle authentication state changes
   * @param {Object} firebaseUser - Firebase user object
   */
  const handleAuthStateChange = async (firebaseUser) => {
    setLoading(true);
    
    if (firebaseUser) {
      try {
        // Get additional user data from Firestore
        const userDoc = await getUserDocument(firebaseUser.uid);
        
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || userDoc?.displayName || '',
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL || userDoc?.photoURL || null,
          createdAt: userDoc?.createdAt || null,
          lastLoginAt: userDoc?.lastLoginAt || null
        };

        setUser(userData);
        await persistUserData(userData);
      } catch (error) {
        console.error('Error handling auth state change:', error);
        // Fallback to Firebase user data only
        const fallbackUserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL || null
        };
        setUser(fallbackUserData);
        await persistUserData(fallbackUserData);
      }
    } else {
      setUser(null);
      await persistUserData(null);
    }
    
    setLoading(false);
    if (initializing) {
      setInitializing(false);
    }
  };

  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} displayName - User display name
   * @returns {Promise<Object>} Result object with success status
   */
  const signUp = async (email, password, displayName) => {
    setLoading(true);
    try {
      const result = await registerUser(email, password, displayName);
      
      if (result.success) {
        // User will be automatically set via auth state change listener
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Result object with success status
   */
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        // User will be automatically set via auth state change listener
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out current user
   * @returns {Promise<Object>} Result object with success status
   */
  const signOut = async () => {
    setLoading(true);
    try {
      const result = await logoutUser();
      
      if (result.success) {
        // User will be automatically cleared via auth state change listener
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user data from Firestore
   */
  const refreshUser = async () => {
    if (user?.uid) {
      try {
        const userDoc = await getUserDocument(user.uid);
        if (userDoc) {
          const updatedUser = { ...user, ...userDoc };
          setUser(updatedUser);
          await persistUserData(updatedUser);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Result object with success status
   */
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const result = await updateUserProfile(profileData);
      
      if (result.success) {
        // Refresh user data to get updated profile
        await refreshUser();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<Object>} Result object with success status
   */
  const sendPasswordReset = async (email) => {
    setLoading(true);
    try {
      const result = await resetPassword(email);
      return result;
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  const checkAuthenticated = () => {
    return !!user;
  };

  // Initialize auth state listener and load persisted data
  useEffect(() => {
    let unsubscribe;

    const initializeAuth = async () => {
      try {
        // Load persisted user data first
        const persistedUser = await loadPersistedUserData();
        if (persistedUser) {
          setUser(persistedUser);
        }

        // Set up auth state listener
        unsubscribe = subscribeToAuthState(handleAuthStateChange);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setInitializing(false);
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Context value
  const value = {
    user,
    loading,
    initializing,
    signUp,
    signIn,
    signOut,
    refreshUser,
    updateProfile,
    sendPasswordReset,
    isAuthenticated: checkAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthProvider;
