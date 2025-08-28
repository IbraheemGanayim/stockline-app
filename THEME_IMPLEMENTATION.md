# Dark Mode & Light Mode Implementation Guide

## Overview

This implementation provides full dark mode and light mode support for the Stockline app, including system theme detection, user preference persistence, and automatic theme switching.

## Features Implemented

### 1. Theme System
- **Light Mode Colors**: White background, dark gray text, light borders
- **Dark Mode Colors**: Dark background, light text, gray borders  
- **Consistent Styling**: All components use the same color tokens
- **Backward Compatibility**: Original color system preserved

### 2. Theme Provider
- **React Context**: `ThemeProvider` manages theme state globally
- **System Detection**: Automatically detects system theme preference using `useColorScheme`
- **User Override**: Users can manually override system theme
- **Persistence**: Theme preference saved in AsyncStorage

### 3. Component Updates
- **Screen Component**: Dynamic background and status bar colors
- **FormInput**: Theme-aware input fields and borders
- **PrimaryButton**: Consistent button colors across themes
- **Card Component**: Dynamic card backgrounds and text colors
- **ValidationInput**: Enhanced input with theme support

### 4. User Interface
- **Settings Toggle**: Theme selection in Profile → Settings
- **Visual Feedback**: Icons change based on current theme
- **Immediate Updates**: Theme changes apply instantly

## Usage

### Setup
The ThemeProvider is already configured in `App.js`:

```javascript
import { ThemeProvider } from './src/contexts/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Using Theme in Components

```javascript
import { useTheme } from '../contexts/ThemeProvider';

const MyComponent = () => {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Hello World</Text>
    </View>
  );
};
```

### Available Theme Colors

```javascript
// Light Mode
const lightColors = {
  background: '#FFFFFF',
  textPrimary: '#2D3748',
  textSecondary: '#A0AEC0',
  border: '#E2E8F0',
  inputBackground: '#FFFFFF',
  buttonPrimary: '#33D49D',
  buttonText: '#FFFFFF',
  success: '#52FFC4',
  error: '#FFCC93',
  cardBackground: '#F7FAFC'
};

// Dark Mode
const darkColors = {
  background: '#1A202C',
  textPrimary: '#EDF2F7',
  textSecondary: '#A0AEC0',
  border: '#718096',
  inputBackground: '#2D3748',
  buttonPrimary: '#33D49D',
  buttonText: '#FFFFFF',
  success: '#52FFC4',
  error: '#FFCC93',
  cardBackground: '#2D3748'
};
```

### Theme Modes

```javascript
import { THEME_MODES } from '../contexts/ThemeProvider';

// Available modes:
THEME_MODES.LIGHT    // Force light mode
THEME_MODES.DARK     // Force dark mode  
THEME_MODES.SYSTEM   // Follow system preference
```

## File Structure

```
src/
├── contexts/
│   ├── ThemeProvider.js     # Main theme context and provider
│   └── AuthProvider.js      # (existing)
├── theme/
│   ├── colors.js           # Updated with light/dark color palettes
│   ├── index.js            # (existing)
│   ├── spacing.js          # (existing)
│   └── typography.js       # (existing)
├── components/
│   ├── Screen.js           # Updated with theme support
│   ├── FormInput.js        # Updated with theme support
│   ├── PrimaryButton.js    # Updated with theme support
│   ├── Card.js             # Updated with theme support
│   └── ValidationInput.js  # Updated with theme support
└── screens/
    ├── LoginScreen.js      # Updated with theme support
    ├── SettingsScreen.js   # Added theme toggle
    └── ... (other screens)
```

## Implementation Details

### 1. Color Token Mapping
Each color in the design has been mapped to semantic tokens:
- `background`: Main app background
- `textPrimary`: Primary text color
- `textSecondary`: Secondary/muted text
- `border`: Borders and dividers
- `inputBackground`: Form input backgrounds
- `buttonPrimary`: Primary button color
- `buttonText`: Button text color
- `cardBackground`: Card and container backgrounds

### 2. System Integration
- **Status Bar**: Automatically adjusts based on theme
- **Navigation**: Theme-aware navigation colors
- **Loading States**: Consistent loading indicators

### 3. Performance Considerations
- **Context Optimization**: Theme context only re-renders when theme changes
- **Async Loading**: Theme preference loaded asynchronously on app start
- **Memory Efficient**: Minimal overhead for theme switching

## Testing

### Theme Switching
1. Go to Profile → Settings
2. Tap on "Theme" 
3. Select Light Mode, Dark Mode, or Follow System
4. Verify immediate theme change throughout the app

### System Theme Detection
1. Set theme to "Follow System"
2. Change device theme in system settings
3. Return to app - should reflect system theme

### Persistence
1. Change theme to Light/Dark mode
2. Close and reopen the app
3. Verify theme preference is maintained

## Best Practices

### For Developers
1. **Always use theme colors**: Avoid hard-coded color values
2. **Test both themes**: Ensure components work in light and dark modes
3. **Semantic naming**: Use descriptive color names, not specific values
4. **Accessibility**: Ensure sufficient contrast in both themes

### Adding New Colors
1. Add to both `lightColors` and `darkColors` in `colors.js`
2. Use semantic names (e.g., `warningBackground` not `orange100`)
3. Test in both themes
4. Update documentation

## Troubleshooting

### Common Issues
1. **Hard-coded colors**: Replace with theme colors from context
2. **Status bar issues**: Ensure Screen component is used properly
3. **Performance**: Avoid excessive theme context usage
4. **Persistence**: Check AsyncStorage permissions

### Debug Tips
```javascript
// Log current theme state
const { colors, isDark, themeMode } = useTheme();
console.log('Current theme:', { isDark, themeMode, colors });
```

## Migration Notes

### From Hard-coded Colors
```javascript
// Before
style={{ backgroundColor: '#FFFFFF' }}

// After  
const { colors } = useTheme();
style={{ backgroundColor: colors.background }}
```

### Updating Existing Components
1. Import `useTheme` hook
2. Replace hard-coded colors with theme colors
3. Test in both light and dark modes
4. Update StyleSheet to remove hard-coded values

This implementation provides a robust, user-friendly dark mode experience that follows iOS design patterns and maintains excellent performance.
