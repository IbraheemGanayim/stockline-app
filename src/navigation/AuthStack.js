/**
 * Authentication Stack Navigator
 * Handles navigation for unauthenticated users (Login, Signup)
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { theme } from '../theme';
import { useTheme } from '../contexts/ThemeProvider';

const Stack = createStackNavigator();

/**
 * AuthStack component - Navigation stack for authentication flow
 */
const AuthStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.semiBold,
          fontSize: theme.typography.fontSize.lg,
          ...theme.typography.styles.h5
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: colors.background
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
          headerShown: false, // Hide header for signup to make it full screen like login
          gestureEnabled: false // Disable swipe back gesture
        }}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          title: 'Welcome',
          headerShown: false,
          gestureEnabled: false // Disable swipe back gesture
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
