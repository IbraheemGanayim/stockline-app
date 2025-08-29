/**
 * Settings Screen - App settings and user preferences
 * Includes account management and app information
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components';
import { useAuthUser } from '../hooks';
import { useAuth } from '../contexts/AuthProvider';
import { useTheme, THEME_MODES } from '../contexts/ThemeProvider';

import { resetPassword } from '../services/auth';
import { getImageFromFirestore } from '../services/storage';
import { theme } from '../theme';

/**
 * SettingsScreen component for app settings and account management
 * @param {Object} navigation - React Navigation object
 */
const SettingsScreen = ({ navigation }) => {
  const { user } = useAuthUser();
  const { signOut } = useAuth();
  const { colors, themeMode, setThemeMode, isDark } = useTheme();

  // Password reset state
  const [resetLoading, setResetLoading] = useState(false);
  
  // Profile photo state
  const [actualPhotoData, setActualPhotoData] = useState(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  // Load actual photo data when user changes
  useEffect(() => {
    const loadPhotoData = async () => {
      const photoURL = user?.photoURL;
      if (photoURL && photoURL.startsWith('firestore://')) {
        setIsLoadingPhoto(true);
        try {
          const imageData = await getImageFromFirestore(photoURL);
          setActualPhotoData(imageData);
        } catch (error) {
          console.error('Error loading photo data:', error);
          setActualPhotoData(null);
        } finally {
          setIsLoadingPhoto(false);
        }
      } else if (photoURL && photoURL.startsWith('data:image')) {
        // Already base64 data
        setActualPhotoData(photoURL);
      } else if (photoURL && photoURL.startsWith('http')) {
        // Regular URL, use as-is
        setActualPhotoData(photoURL);
      } else {
        setActualPhotoData(null);
      }
    };

    loadPhotoData();
  }, [user?.photoURL]);

  /**
   * Get theme mode display text
   * @param {string} mode - Theme mode
   * @returns {string} Display text for theme mode
   */
  const getThemeModeText = (mode) => {
    switch (mode) {
      case THEME_MODES.LIGHT:
        return 'Light Mode';
      case THEME_MODES.DARK:
        return 'Dark Mode';
      case THEME_MODES.SYSTEM:
        return 'Follow System';
      default:
        return 'Follow System';
    }
  };

  /**
   * Handle theme mode selection
   */
  const handleThemeSelection = () => {
    Alert.alert(
      'Select Theme',
      'Choose your preferred app theme',
      [
        {
          text: 'Light Mode',
          onPress: () => setThemeMode(THEME_MODES.LIGHT),
          style: themeMode === THEME_MODES.LIGHT ? 'default' : 'default'
        },
        {
          text: 'Dark Mode',
          onPress: () => setThemeMode(THEME_MODES.DARK),
          style: themeMode === THEME_MODES.DARK ? 'default' : 'default'
        },
        {
          text: 'Follow System',
          onPress: () => setThemeMode(THEME_MODES.SYSTEM),
          style: themeMode === THEME_MODES.SYSTEM ? 'default' : 'default'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  /**
   * Handle password reset
   */
  const handlePasswordReset = () => {
    Alert.alert(
      'Reset Password',
      `Send a password reset email to ${user?.email}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Send Email',
          onPress: sendPasswordReset
        }
      ]
    );
  };

  /**
   * Send password reset email
   */
  const sendPasswordReset = async () => {
    setResetLoading(true);

    try {
      const result = await resetPassword(user?.email);

      if (result.success) {
        Alert.alert(
          'Email Sent',
          'A password reset email has been sent to your email address. Please check your inbox and follow the instructions.'
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setResetLoading(false);
    }
  };

  /**
   * Handle logout with confirmation
   */
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: confirmLogout
        }
      ]
    );
  };

  /**
   * Confirm and execute logout
   */
  const confirmLogout = async () => {
    try {
      const result = await signOut();
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to sign out');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  /**
   * Open external link
   * @param {string} url - URL to open
   */
  const openLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open link');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open link');
    }
  };

  /**
   * Render setting item
   * @param {Object} props - Setting item props
   * @returns {JSX.Element} Setting item component
   */
  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    danger = false,
    loading = false 
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} 
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.settingContent}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={danger ? colors.error : colors.textSecondary} 
          style={styles.settingIcon}
        />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: danger ? colors.error : colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showArrow && !loading && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={colors.textSecondary} 
        />
      )}
      {loading && (
        <ActivityIndicator size="small" color={colors.buttonPrimary} />
      )}
    </TouchableOpacity>
  );

  /**
   * Render profile section (read-only)
   * @returns {JSX.Element} Profile section component
   */
  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Profile</Text>
      
      <View style={[styles.profileCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.buttonPrimary }]}>
            {isLoadingPhoto ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : actualPhotoData ? (
              <Image 
                source={{ uri: actualPhotoData }} 
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0)?.toUpperCase() || 
                 user?.email?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>
              {user?.displayName || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  /**
   * Render theme section
   * @returns {JSX.Element} Theme section component
   */
  const renderThemeSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Appearance</Text>
      
      <SettingItem
        icon={isDark ? "moon" : "sunny"}
        title="Theme"
        subtitle={getThemeModeText(themeMode)}
        onPress={handleThemeSelection}
      />
    </View>
  );

  /**
   * Render account section
   * @returns {JSX.Element} Account section component
   */
  const renderAccountSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Account</Text>
      
      <SettingItem
        icon="key-outline"
        title="Reset Password"
        subtitle="Send password reset email"
        onPress={handlePasswordReset}
        loading={resetLoading}
      />
      
      <SettingItem
        icon="log-out-outline"
        title="Sign Out"
        onPress={handleLogout}
        danger={true}
      />
    </View>
  );

  /**
   * Render app info section
   * @returns {JSX.Element} App info section component
   */
  const renderAppInfoSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About</Text>
      
      <SettingItem
        icon="information-circle-outline"
        title="App Version"
        subtitle="1.0.0"
        showArrow={false}
        onPress={() => {}}
      />
      
      <SettingItem
        icon="person-outline"
        title="Developer"
        subtitle="Ibraheem Ganayim"
        showArrow={false}
        onPress={() => {}}
      />
      
      <SettingItem
        icon="logo-github"
        title="Source Code"
        subtitle="View on GitHub"
        onPress={() => openLink('https://github.com')}
      />
    </View>
  );

  return (
    <Screen padding={false} scrollable={true} style={styles.container}>
        <View style={styles.content}>
          {renderProfileSection()}
          {renderThemeSection()}
          {renderAccountSection()}
          {renderAppInfoSection()}
        </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: theme.spacing.screen.horizontal
  },
  section: {
    marginBottom: theme.spacing.xl
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
    // color is now dynamic from theme
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1
    // backgroundColor and borderColor are now dynamic from theme
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden'
    // backgroundColor is now dynamic from theme
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
    // color is now dynamic from theme
  },
  profileEmail: {
    fontSize: 14
    // color is now dynamic from theme
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1
    // backgroundColor and borderColor are now dynamic from theme
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingIcon: {
    marginRight: theme.spacing.md
  },
  settingText: {
    flex: 1
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500'
    // color is now dynamic from theme
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 4
    // color is now dynamic from theme
  }
});

export default SettingsScreen;
