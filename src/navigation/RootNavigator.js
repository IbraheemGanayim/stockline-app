/**
 * Root Navigator - Main navigation controller
 * Switches between AuthStack and AppStack based on authentication state
 * @author Ibraheem Ganayim
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { useAuth } from '../contexts/AuthProvider';
import { theme } from '../theme';

/**
 * Loading component displayed only during app initialization (not sign-in attempts)
 */
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator 
      size="large" 
      color="#70C7A0" 
    />
  </View>
);

/**
 * RootNavigator component - Main navigation controller
 * Handles switching between authenticated and unauthenticated flows
 */
const RootNavigator = () => {
  const { user, initializing } = useAuth();

  // Show loading screen only during app initialization, not during sign-in attempts
  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  }
});

export default RootNavigator;
