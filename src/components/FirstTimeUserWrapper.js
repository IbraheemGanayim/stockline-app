/**
 * First Time User Wrapper - Automatically shows welcome screen for new users
 * @author Ibraheem Ganayim
 */

import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigation } from '@react-navigation/native';

/**
 * Component that automatically navigates to welcome screen for first-time users
 */
const FirstTimeUserWrapper = ({ children }) => {
  const { isFirstTimeUser, user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    // Show welcome screen for first-time users once they're authenticated
    if (isFirstTimeUser && user) {
      // Navigate immediately to welcome screen
      navigation.navigate('Welcome', {
        userName: user.displayName || 'There'
      });
    }
  }, [isFirstTimeUser, user, navigation]);

  return children;
};

export default FirstTimeUserWrapper;
