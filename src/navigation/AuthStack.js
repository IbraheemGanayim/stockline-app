/**
 * Authentication Stack Navigator
 * Handles navigation for unauthenticated users (Login, Signup)
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import { theme } from '../theme';

const Stack = createStackNavigator();

/**
 * AuthStack component - Navigation stack for authentication flow
 */
const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.light
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.semiBold,
          fontSize: theme.typography.fontSize.lg,
          ...theme.typography.styles.h5
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: theme.colors.background.primary
        }
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Welcome Back',
          headerShown: false // Hide header for login to make it full screen
        }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          title: 'Create Account',
          headerShown: true,
          headerLeft: null, // Remove back button to force users to complete signup
          gestureEnabled: false // Disable swipe back gesture
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
