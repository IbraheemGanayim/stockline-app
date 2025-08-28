# Screen Theme Update Guide

## Overview
This guide shows how to update the remaining screens to support dark mode and light mode. I've already updated the most critical screens (LoginScreen, SignupScreen, SettingsScreen, HomeScreen). 

## Pattern for Updating Screens

### 1. Import Theme Hook
```javascript
// Add this import to any screen file
import { useTheme } from '../contexts/ThemeProvider';
```

### 2. Use Theme in Component
```javascript
const YourScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  
  // Rest of your component logic
};
```

### 3. Apply Theme Colors to UI Elements
```javascript
// Example updates for common UI elements:

// Background colors
<View style={[styles.container, { backgroundColor: colors.background }]}>

// Text colors
<Text style={[styles.title, { color: colors.textPrimary }]}>
<Text style={[styles.subtitle, { color: colors.textSecondary }]}>

// Input backgrounds
<TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]} />

// Button colors
<TouchableOpacity style={[styles.button, { backgroundColor: colors.buttonPrimary }]}>

// Card backgrounds
<View style={[styles.card, { backgroundColor: colors.cardBackground }]}>

// Border colors
<View style={[styles.border, { borderColor: colors.border }]}>

// Icons
<Ionicons name="icon-name" color={colors.textPrimary} />

// Conditional colors for dark/light mode
<Ionicons name="apple" color={isDark ? colors.textPrimary : "#000000"} />
```

### 4. Update StyleSheet
```javascript
// Remove hard-coded colors from StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1
    // backgroundColor: '#FFFFFF' <- Remove this
    // backgroundColor is now dynamic from theme
  },
  title: {
    fontSize: 18,
    fontWeight: '600'
    // color: '#000000' <- Remove this
    // color is now dynamic from theme
  }
});
```

## Quick Update for Remaining Screens

### For each screen file, follow this pattern:

1. **Add Theme Import:**
```javascript
import { useTheme } from '../contexts/ThemeProvider';
```

2. **Add Theme Hook:**
```javascript
const { colors, isDark } = useTheme();
```

3. **Update Key Elements:**
- SafeAreaView: `style={[styles.safeArea, { backgroundColor: colors.background }]}`
- Main containers: `{ backgroundColor: colors.background }`
- Text elements: `{ color: colors.textPrimary }` or `{ color: colors.textSecondary }`
- Input fields: `{ backgroundColor: colors.inputBackground, color: colors.textPrimary }`
- Cards/containers: `{ backgroundColor: colors.cardBackground }`
- Borders: `{ borderColor: colors.border }`
- Icons: `color={colors.textPrimary}` or `color={colors.buttonPrimary}`

## Screens That Need Updates

### High Priority (User-facing)
1. **ProfileScreen.js** - Profile information display
2. **PortfolioScreen.js** - Investment portfolio view
3. **TransactionsScreen.js** - Transaction history
4. **WelcomeScreen.js** - App onboarding
5. **ExchangeScreen.js** - Trading interface

### Medium Priority (Feature screens)
6. **StockDetailsScreen.js** - Individual stock information
7. **MarketScreen.js** - Stock market browser
8. **CreateItemScreen.js** - Adding new items
9. **ItemDetailsScreen.js** - Item detail view

### Low Priority (Settings/Info)
10. **AccountScreen.js** - Account management
11. **FAQScreen.js** - Help information
12. **LanguageScreen.js** - Language selection

## Example: Complete ProfileScreen Update

```javascript
/**
 * ProfileScreen - Updated with theme support
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeProvider';
import { Screen } from '../components';

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();

  return (
    <Screen style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>
        <TouchableOpacity 
          style={[styles.settingsButton, { backgroundColor: colors.background }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
        <Text style={[styles.value, { color: colors.textPrimary }]}>John Doe</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
    // backgroundColor removed - now dynamic
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
    // backgroundColor removed - now dynamic
  },
  title: {
    fontSize: 24,
    fontWeight: '700'
    // color removed - now dynamic
  },
  // ... other styles with colors removed
});

export default ProfileScreen;
```

## Components Already Supporting Theme

These components automatically support theming (no updates needed):
- ✅ Screen
- ✅ FormInput  
- ✅ PrimaryButton
- ✅ Card
- ✅ ValidationInput

## Testing Dark Mode

1. Go to Profile → Settings → Appearance → Theme
2. Select "Dark Mode"
3. Navigate through all screens to verify theming
4. Test "Follow System" mode with device settings

## Notes

- The theme system is already fully implemented and working
- All core components support theming automatically
- Main screens (Login, Signup, Settings, Home) are already updated
- Following this pattern ensures consistent theming across the app
- StatusBar automatically adjusts based on theme
- Theme preferences persist across app restarts

This implementation provides a solid foundation for dark mode support throughout the entire Stockline app!
