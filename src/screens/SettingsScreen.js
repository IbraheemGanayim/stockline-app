/**
 * Settings Screen - App settings and user preferences
 * Includes account management and app information
 * @author Ibraheem Ganayim
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components';
import { useAuthUser } from '../hooks';
import { useAuth } from '../contexts/AuthProvider';

import { resetPassword } from '../services/auth';
import { theme } from '../theme';

/**
 * SettingsScreen component for app settings and account management
 * @param {Object} navigation - React Navigation object
 */
const SettingsScreen = ({ navigation }) => {
  const { user } = useAuthUser();
  const { signOut } = useAuth();



  // Password reset state
  const [resetLoading, setResetLoading] = useState(false);



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
      style={styles.settingItem} 
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.settingContent}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={danger ? theme.colors.error.main : theme.colors.text.secondary} 
          style={styles.settingIcon}
        />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showArrow && !loading && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={theme.colors.text.tertiary} 
        />
      )}
      {loading && (
        <ActivityIndicator size="small" color={theme.colors.primary.main} />
      )}
    </TouchableOpacity>
  );

  /**
   * Render profile section (read-only)
   * @returns {JSX.Element} Profile section component
   */
  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profile</Text>
      
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0)?.toUpperCase() || 
               user?.email?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.displayName || 'User'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  /**
   * Render account section
   * @returns {JSX.Element} Account section component
   */
  const renderAccountSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account</Text>
      
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
      <Text style={styles.sectionTitle}>About</Text>
      
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
    color: '#1A1A1A',
    marginBottom: 16
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#70C7A0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
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
    color: '#1A1A1A',
    marginBottom: 4
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280'
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
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
    fontWeight: '500',
    color: '#1A1A1A'
  },
  settingTitleDanger: {
    color: '#F44336'
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  }
});

export default SettingsScreen;
