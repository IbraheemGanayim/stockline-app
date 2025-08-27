/**
 * Custom hook for accessing authentication user data
 * Provides easy access to current user and auth state
 * @author Ibraheem Ganayim
 */

import { useAuth } from '../contexts/AuthProvider';

/**
 * Custom hook to get current authenticated user
 * @returns {Object} Object containing user data and auth state
 */
export const useAuthUser = () => {
  const { user, loading, initializing, isAuthenticated, refreshUser } = useAuth();

  return {
    user,
    loading,
    initializing,
    isAuthenticated: isAuthenticated(),
    refreshUser,
    // Convenience properties
    userId: user?.uid || null,
    userEmail: user?.email || null,
    userName: user?.displayName || '',
    isEmailVerified: user?.emailVerified || false
  };
};

export default useAuthUser;
