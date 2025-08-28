/**
 * Profile Screen - Stockline user profile and settings
 * Shows user account info and profile options
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  StyleSheet, 
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components';
import { useAuthUser } from '../hooks';
import { useAuth } from '../contexts/AuthProvider';
import { updateUserProfile, getUserProfile } from '../services/db';
import { getImageFromFirestore } from '../services/storage';
import { theme } from '../theme';

/**
 * ProfileScreen component showing Stockline user profile
 * @param {Object} navigation - React Navigation object
 */
const ProfileScreen = ({ navigation }) => {
  const { user } = useAuthUser();
  const { signOut } = useAuth();
  const [actualPhotoData, setActualPhotoData] = useState(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState('');

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

  // Load complete user profile from Firestore (including phone number)
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.uid) {
        try {
          const firestoreProfile = await getUserProfile(user.uid);
          if (firestoreProfile && firestoreProfile.phoneNumber) {
            setUserPhoneNumber(firestoreProfile.phoneNumber);
          }
        } catch (error) {
          console.error('Error loading user profile from Firestore:', error);
        }
      }
    };

    loadUserProfile();
  }, [user?.uid]);

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
      // Success case is handled by auth context
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  /**
   * Navigate to settings
   */
  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  /**
   * Handle account settings
   */
  const handleAccount = () => {
    navigation.navigate('Account');
  };

  /**
   * Handle security settings
   */
  const handleSecurity = () => {
    console.log('Security settings');
  };

  /**
   * Handle billing/payments
   */
  const handleBilling = () => {
    console.log('Billing/Payments');
  };

  /**
   * Handle language settings
   */
  const handleLanguage = () => {
    navigation.navigate('Language');
  };

  /**
   * Handle FAQ
   */
  const handleFAQ = () => {
    navigation.navigate('FAQ');
  };

  /**
   * Handle invite friends
   */
  const handleInviteFriends = () => {
    console.log('Invite friends');
  };

  const ProfileMenuItem = ({ icon, title, value, onPress, showChevron = true }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={20} color={theme.colors.primary.main} />
        </View>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen padding={false} scrollable={true} style={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {isLoadingPhoto ? (
                <ActivityIndicator size="small" color={theme.colors.primary.main} />
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
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.displayName || 'User'}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email || 'user@example.com'}
              </Text>
              {userPhoneNumber && (
                <Text style={styles.userPhone}>
                  {userPhoneNumber}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Invite Friends Card */}
        <TouchableOpacity style={styles.inviteCard} onPress={handleInviteFriends}>
          <View style={styles.inviteIconContainer}>
            <Ionicons name="gift-outline" size={24} color="white" />
          </View>
          <View style={styles.inviteContent}>
            <Text style={styles.inviteTitle}>Invite Friends</Text>
            <Text style={styles.inviteSubtitle}>Invite your friends and get $15</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <ProfileMenuItem
            icon="person-outline"
            title="Account"
            onPress={handleAccount}
          />
          <ProfileMenuItem
            icon="shield-checkmark-outline"
            title="Security"
            onPress={handleSecurity}
          />
          <ProfileMenuItem
            icon="card-outline"
            title="Billing/Payments"
            onPress={handleBilling}
          />
          <ProfileMenuItem
            icon="language-outline"
            title="Language"
            value="English"
            onPress={handleLanguage}
          />
          <ProfileMenuItem
            icon="settings-outline"
            title="Settings"
            onPress={handleSettings}
          />
          <ProfileMenuItem
            icon="help-circle-outline"
            title="FAQ"
            onPress={handleFAQ}
          />
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error.main} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
  },
  profileHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  userPhone: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  inviteCard: {
    backgroundColor: theme.colors.primary.main,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  inviteContent: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  inviteSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  menuItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginRight: 8,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.error.main,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error.main,
    marginLeft: 8,
  },
});

export default ProfileScreen;
