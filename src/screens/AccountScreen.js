/**
 * Account Screen - User account settings and information
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components';
import { useAuthUser } from '../hooks';
import { useAuth } from '../contexts/AuthProvider';
import { updateUserProfile } from '../services/db';
import { syncPreferencesWithFirebase, getUserPreferences } from '../services/userPreferences';
import { theme } from '../theme';

const AccountScreen = ({ navigation }) => {
  const { user } = useAuthUser();
  const { updateProfile, loading } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [originalData, setOriginalData] = useState({});

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const userData = {
        displayName: user.displayName || '',
        phone: user.phoneNumber || ''
      };
      setDisplayName(userData.displayName);
      setPhone(userData.phone);
      setOriginalData(userData);
    }
  }, [user]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      // Update Firebase Auth profile
      const authUpdateResult = await updateProfile({
        displayName: displayName.trim()
      });

      if (!authUpdateResult.success) {
        throw new Error(authUpdateResult.error);
      }

      // Update Firestore user document
      const firestoreUpdateResult = await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        phoneNumber: phone.trim()
      });

      if (firestoreUpdateResult.success) {
        // Sync user preferences to ensure consistency
        try {
          const preferences = await getUserPreferences();
          await syncPreferencesWithFirebase(user.uid, preferences);
        } catch (prefError) {
          console.warn('Could not sync user preferences:', prefError);
        }

        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
        setOriginalData({ displayName: displayName.trim(), phone: phone.trim() });
      } else {
        throw new Error(firestoreUpdateResult.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(originalData.displayName || '');
    setPhone(originalData.phone || '');
    setIsEditing(false);
  };

  const AccountField = ({ label, value, onChangeText, editable = false, keyboardType = 'default' }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editable && isEditing ? (
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.fieldValue}>{value || 'Not provided'}</Text>
      )}
    </View>
  );

  const ActionButton = ({ icon, title, onPress, color = theme.colors.text.primary }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.actionTitle, { color }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top + 8 : 8 }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            disabled={isSaving}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account</Text>
          <TouchableOpacity 
            style={[styles.editButton, (isSaving || loading) && styles.editButtonDisabled]} 
            onPress={isEditing ? handleCancel : () => setIsEditing(true)}
            disabled={isSaving || loading}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.colors.primary.main} />
            ) : (
              <Text style={[styles.editButtonText, (isSaving || loading) && styles.editButtonTextDisabled]}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.profileCard}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.displayName?.charAt(0)?.toUpperCase() || 
                   user?.email?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              {isEditing && (
                <TouchableOpacity style={styles.changePhotoButton}>
                  <Ionicons name="camera" size={16} color={theme.colors.primary.main} />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Fields */}
            <AccountField
              label="Full Name"
              value={displayName}
              onChangeText={setDisplayName}
              editable={true}
            />
            
            <AccountField
              label="Email Address"
              value={email}
              editable={false}
            />
            
            <AccountField
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              editable={true}
              keyboardType="phone-pad"
            />

            <AccountField
              label="Account Type"
              value="Standard Account"
              editable={false}
            />

            <AccountField
              label="Member Since"
              value="January 2024"
              editable={false}
            />
          </View>

          {/* Save Changes Button */}
          {isEditing && (
            <TouchableOpacity 
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <View style={styles.actionsCard}>
            <ActionButton
              icon="key-outline"
              title="Change Password"
              onPress={() => Alert.alert('Change Password', 'Password change functionality will be available soon.')}
            />
            
            <ActionButton
              icon="mail-outline"
              title="Email Preferences"
              onPress={() => Alert.alert('Email Preferences', 'Email preferences functionality will be available soon.')}
            />
            
            <ActionButton
              icon="notifications-outline"
              title="Notification Settings"
              onPress={() => Alert.alert('Notifications', 'Notification settings functionality will be available soon.')}
            />
            
            <ActionButton
              icon="download-outline"
              title="Download Data"
              onPress={() => Alert.alert('Download Data', 'Data download functionality will be available soon.')}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <View style={styles.dangerCard}>
            <ActionButton
              icon="trash-outline"
              title="Delete Account"
              onPress={() => Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => {
                    Alert.alert('Account Deletion', 'Account deletion functionality will be available soon.');
                  }}
                ]
              )}
              color={theme.colors.error.main}
            />
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
    elevation: 2,
    shadowColor: theme.colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background.secondary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.main + '10',
  },
  editButtonDisabled: {
    opacity: 0.5,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
  editButtonTextDisabled: {
    color: theme.colors.text.disabled,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary.main + '10',
    borderRadius: 16,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary.main,
    marginLeft: 4,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: theme.colors.text.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  fieldInput: {
    fontSize: 16,
    color: theme.colors.text.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
  },
  saveButton: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: theme.colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dangerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountScreen;
