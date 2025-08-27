/**
 * App Stack Navigator
 * Handles navigation for authenticated users (Bottom tab + modal screens)
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import MarketScreen from '../screens/MarketScreen';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';
import CreateItemScreen from '../screens/CreateItemScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import ExchangeScreen from '../screens/ExchangeScreen';
import StockDetailsScreen from '../screens/StockDetailsScreen';
import { theme } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();



/**
 * Bottom Tab Navigator for main app screens
 */
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let IconComponent = Ionicons;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Portfolio':
              iconName = focused ? 'pie-chart' : 'pie-chart-outline';
              break;
            case 'Transactions':
              // Return null for custom button
              return null;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Market':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.neutral[500],
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12),
          height: 80 + Math.max(insets.bottom, 12),
          elevation: 20,
          shadowColor: theme.colors.shadow.medium,
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
          marginTop: route.name === 'Transactions' ? 8 : 4,
        },
        tabBarItemStyle: {
          paddingTop: route.name === 'Transactions' ? 0 : 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: theme.colors.text.primary,
          letterSpacing: -0.5,
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerTitle: 'Stockline',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 24,
            color: theme.colors.primary.main,
            letterSpacing: -1,
          }
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          title: 'Portfolio',
          headerTitle: 'My Portfolio'
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={ExchangeScreen}
        options={{
          title: 'Trade',
          headerTitle: 'Exchange',
          headerShown: false,
          tabBarButton: (props) => (
            <View style={styles.fabWrapper}>
              <TouchableOpacity
                {...props}
                style={[styles.fabButton, props.accessibilityState?.selected && styles.fabButtonSelected]}
                activeOpacity={0.8}
              >
                <View style={styles.fabContainer}>
                  <LinearGradient
                    colors={[theme.colors.primary.light, theme.colors.primary.main, theme.colors.primary.dark]}
                    style={styles.fab}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialIcons name="swap-horiz" size={28} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <Text style={[styles.fabLabelText, props.accessibilityState?.selected && styles.fabLabelTextSelected]}>
                  Trade
                </Text>
              </TouchableOpacity>
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          title: 'Market',
          headerTitle: 'Market Overview'
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'My Account'
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * AppStack component - Main navigation stack for authenticated users
 */
const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB'
        },
        headerTintColor: '#1A1A1A',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: '#1A1A1A'
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: '#FFFFFF'
        }
      }}
    >
      {/* Tab Navigator as the main screen */}
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          headerShown: false
        }}
      />
      
      {/* Modal screens */}
      <Stack.Screen
        name="ItemDetails"
        component={ItemDetailsScreen}
        options={{
          title: 'Item Details',
          presentation: 'card'
        }}
      />
      
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          presentation: 'card'
        }}
      />
      
      <Stack.Screen
        name="TransactionHistory"
        component={TransactionsScreen}
        options={{
          title: 'Transaction History',
          presentation: 'card'
        }}
      />
      
      <Stack.Screen
        name="StockDetails"
        component={StockDetailsScreen}
        options={{
          headerShown: false,
          presentation: 'card'
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    marginTop: -30, // Lift the button above the tab bar
  },
  fabButtonSelected: {
    transform: [{ scale: 1.05 }],
  },
  fabContainer: {
    elevation: 12,
    shadowColor: theme.colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderRadius: 32,
    padding: 2, // White border effect
    backgroundColor: '#FFFFFF',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary.main,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  fabLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary.main,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  fabLabelTextSelected: {
    color: theme.colors.primary.dark,
    transform: [{ scale: 1.05 }],
  },
});

export default AppStack;
