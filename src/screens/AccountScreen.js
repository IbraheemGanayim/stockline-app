/**
 * Account Screen - User account settings and information
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../components';
import { useAuthUser } from '../hooks';
import { useAuth } from '../contexts/AuthProvider';
import { updateUserProfile, getUserProfile } from '../services/db';
import { uploadImage, getImageFromFirestore } from '../services/storage';
import { syncPreferencesWithFirebase, getUserPreferences } from '../services/userPreferences';
import { theme } from '../theme';

// AccountField component definition (moved outside to prevent re-renders)
const AccountField = React.memo(({ 
  label, 
  value, 
  onChangeText, 
  editable = false, 
  keyboardType = 'default', 
  error = null,
  placeholder = '',
  isLast = false,
  isEditing = false
}) => (
  <View style={[styles.fieldContainer, isLast && styles.lastFieldContainer]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {editable && isEditing ? (
      <>
        <TextInput
          style={[
            styles.fieldInput,
            error && styles.fieldInputError
          ]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          autoCorrect={false}
          autoCapitalize={keyboardType === 'phone-pad' ? 'none' : 'words'}
        />
        {error && (
          <Text style={styles.fieldError}>{error}</Text>
        )}
      </>
    ) : (
      <View style={styles.fieldValueContainer}>
        <Text style={[
          styles.fieldValueText, 
          !value && styles.fieldValueEmpty
        ]}>
          {value || 'Not provided'}
        </Text>
        {editable && (
          <Ionicons 
            name="create-outline" 
            size={16} 
            color={theme.colors.text.tertiary} 
            style={styles.editIcon}
          />
        )}
      </View>
    )}
  </View>
));

const AccountScreen = ({ navigation }) => {
  const { user } = useAuthUser();
  const { updateProfile, loading } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [actualPhotoData, setActualPhotoData] = useState(null); // For storing actual base64 data
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const userData = {
        displayName: user.displayName || '',
        phone: user.phoneNumber || '', // This might be empty since Firebase Auth doesn't store phone
        photoURL: user.photoURL || ''
      };
      setDisplayName(userData.displayName);
      setPhone(userData.phone);
      setPhotoURL(userData.photoURL);
      setOriginalData(userData);
    }
  }, [user]);

  // Load complete user profile from Firestore (including phone number)
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.uid) {
        try {
          const firestoreProfile = await getUserProfile(user.uid);
          if (firestoreProfile) {
            // Update phone number from Firestore if available
            if (firestoreProfile.phoneNumber && firestoreProfile.phoneNumber !== phone) {
              setPhone(firestoreProfile.phoneNumber);
              
              // Update original data to include Firestore phone number
              setOriginalData(prev => ({
                ...prev,
                phone: firestoreProfile.phoneNumber
              }));
            }
          }
        } catch (error) {
          console.error('Error loading user profile from Firestore:', error);
        }
      }
    };

    loadUserProfile();
  }, [user?.uid]);

  // Check for changes when data updates
  useEffect(() => {
    if (originalData.displayName !== undefined) {
      const changed = 
        displayName !== originalData.displayName ||
        phone !== originalData.phone ||
        photoURL !== originalData.photoURL;
      setHasChanges(changed);
    }
  }, [displayName, phone, photoURL, originalData]);

  // Load actual photo data when photoURL changes
  useEffect(() => {
    const loadPhotoData = async () => {
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
  }, [photoURL]);

  /**
   * Validate display name
   */
  const validateDisplayName = (name) => {
    if (!name.trim()) {
      return { isValid: false, error: 'Display name is required' };
    }
    if (name.trim().length < 2) {
      return { isValid: false, error: 'Display name must be at least 2 characters' };
    }
    if (name.trim().length > 50) {
      return { isValid: false, error: 'Display name must be less than 50 characters' };
    }
    return { isValid: true };
  };

  /**
   * Validate phone number format
   */
  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber.trim()) {
      return { isValid: true }; // Phone number is optional
    }

    // Basic phone number validation (international format)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
      return {
        isValid: false,
        error: 'Please enter a valid phone number (including country code if international)'
      };
    }

    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      return {
        isValid: false,
        error: 'Phone number must be between 7 and 15 digits'
      };
    }

    return { isValid: true };
  };

  /**
   * Handle display name change with validation
   */
  const handleDisplayNameChange = useCallback((text) => {
    setDisplayName(text);
    const validation = validateDisplayName(text);
    setValidationErrors(prev => ({
      ...prev,
      displayName: validation.isValid ? null : validation.error
    }));
  }, []);

  /**
   * Handle phone change with validation
   */
  const handlePhoneChange = useCallback((text) => {
    setPhone(text);
    const validation = validatePhoneNumber(text);
    setValidationErrors(prev => ({
      ...prev,
      phone: validation.isValid ? null : validation.error
    }));
  }, []);

  const handleSave = async () => {
    // Validate all fields
    const displayNameValidation = validateDisplayName(displayName);
    const phoneValidation = validatePhoneNumber(phone);

    if (!displayNameValidation.isValid) {
      Alert.alert('Invalid Display Name', displayNameValidation.error);
      return;
    }

    if (!phoneValidation.isValid) {
      Alert.alert('Invalid Phone Number', phoneValidation.error);
      return;
    }

    setIsSaving(true);
    try {
      // Update Firebase Auth profile
      const authUpdateResult = await updateProfile({
        displayName: displayName.trim(),
        photoURL: photoURL
      });

      if (!authUpdateResult.success) {
        throw new Error(authUpdateResult.error);
      }

      // Update Firestore user document
      const firestoreUpdateResult = await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        phoneNumber: phone.trim(),
        photoURL: photoURL
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
        setHasChanges(false);
        setValidationErrors({});
        setOriginalData({ 
          displayName: displayName.trim(), 
          phone: phone.trim(),
          photoURL: photoURL
        });
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
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setDisplayName(originalData.displayName || '');
              setPhone(originalData.phone || '');
              setPhotoURL(originalData.photoURL || '');
              setValidationErrors({});
              setIsEditing(false);
              setHasChanges(false);
            }
          }
        ]
      );
    } else {
      setValidationErrors({});
      setIsEditing(false);
    }
  };

  /**
   * Handle photo upload
   */
  const handlePhotoUpload = async () => {
    try {
      // Request media library permissions first
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need photo library permissions to change your profile picture.');
        return;
      }

      // For emulator, go straight to photo library since camera might not work
      if (__DEV__) {
        Alert.alert(
          'Change Profile Photo',
          'Choose your photo source',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Photo Library', onPress: () => pickImage('library') },
            { text: 'Camera', onPress: () => pickImage('camera') }
          ]
        );
      } else {
        // For real device, show all options
        Alert.alert(
          'Change Profile Photo',
          'Choose your photo source',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Camera', onPress: () => pickImage('camera') },
            { text: 'Photo Library', onPress: () => pickImage('library') }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  /**
   * Pick image from camera or library
   */
  const pickImage = async (source) => {
    try {
      setIsUploadingPhoto(true);
      
      console.log('Starting image pick process...', source);
      
      let result;
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduced quality for smaller file size
        allowsMultipleSelection: false,
        exif: false,
      };

      if (source === 'camera') {
        console.log('Requesting camera permissions...');
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPermission.status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera permissions to take a photo.');
          return;
        }
        console.log('Launching camera...');
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        console.log('Launching image library...');
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      console.log('Image picker result:', {
        canceled: result.canceled,
        assetsLength: result.assets?.length,
        firstAsset: result.assets?.[0] ? {
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          mimeType: result.assets[0].mimeType,
          width: result.assets[0].width,
          height: result.assets[0].height,
          size: result.assets[0].fileSize || result.assets[0].size
        } : null
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        console.log('Processing selected asset...', asset);
        
        // Create a File-like object for upload
        const imageFile = {
          uri: asset.uri,
          type: asset.type || asset.mimeType || 'image/jpeg',
          name: `profile_${user.uid}_${Date.now()}.jpg`,
          size: asset.fileSize || asset.size || 0,
          width: asset.width,
          height: asset.height
        };

        console.log('Created image file object:', imageFile);

        // Simple validation for React Native assets
        if (!imageFile.uri) {
          console.error('No URI found in image file');
          Alert.alert('Invalid Image', 'No image selected');
          return;
        }

        // Note: Large images will be automatically compressed to fit Firestore limits
        if (imageFile.size && imageFile.size > 2 * 1024 * 1024) {
          console.log('Large image detected, will be compressed:', imageFile.size);
        }

        console.log('Starting upload process...');
        // Upload to Firebase Storage
        const uploadResult = await uploadImage(imageFile, user.uid, 'profile_photos/');
        
        console.log('Upload result:', uploadResult);
        
        if (uploadResult.success) {
          console.log('Upload successful, updating profile...');
          setPhotoURL(uploadResult.url);
          
          // Auto-save the profile with new photo
          try {
            const authUpdateResult = await updateProfile({
              displayName: displayName.trim(),
              photoURL: uploadResult.url
            });

            console.log('Auth update result:', authUpdateResult);

            if (authUpdateResult.success) {
              const firestoreUpdateResult = await updateUserProfile(user.uid, {
                displayName: displayName.trim(),
                phoneNumber: phone.trim(),
                photoURL: uploadResult.url
              });

              console.log('Firestore update result:', firestoreUpdateResult);

              if (firestoreUpdateResult.success) {
                setOriginalData({ 
                  displayName: displayName.trim(), 
                  phone: phone.trim(),
                  photoURL: uploadResult.url
                });
                setHasChanges(false);
                Alert.alert('Success', 'Profile photo updated successfully!');
              } else {
                Alert.alert('Partial Success', 'Photo uploaded but profile sync failed. Your photo is saved.');
              }
            } else {
              Alert.alert('Partial Success', 'Photo uploaded but auth update failed. Your photo is saved.');
            }
          } catch (autoSaveError) {
            console.warn('Auto-save failed, but photo was uploaded:', autoSaveError);
            Alert.alert('Photo Uploaded', 'Photo uploaded successfully! Remember to save your changes.');
          }
        } else {
          console.error('Upload failed:', uploadResult.error);
          Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload image. Please try again.');
        }
      } else {
        console.log('No image selected or operation was canceled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });
      Alert.alert('Error', `Failed to select image: ${error.message}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };



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
            style={[
              styles.editButton, 
              (isSaving || loading) && styles.editButtonDisabled,
              hasChanges && isEditing && styles.editButtonWithChanges
            ]} 
            onPress={isEditing ? handleCancel : () => setIsEditing(true)}
            disabled={isSaving || loading}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.colors.primary.main} />
            ) : (
              <View style={styles.editButtonContent}>
                <Text style={[
                  styles.editButtonText, 
                  (isSaving || loading) && styles.editButtonTextDisabled
                ]}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Text>
                {hasChanges && isEditing && (
                  <View style={styles.changesIndicator} />
                )}
              </View>
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
              {isEditing ? (
                <TouchableOpacity 
                  style={styles.avatarWrapper}
                  onPress={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                >
                  <View style={styles.avatar}>
                    {isUploadingPhoto ? (
                      <ActivityIndicator size="small" color={theme.colors.primary.main} />
                    ) : isLoadingPhoto ? (
                      <ActivityIndicator size="small" color={theme.colors.primary.main} />
                    ) : actualPhotoData ? (
                      <Image 
                        source={{ uri: actualPhotoData }} 
                        style={styles.avatarImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {displayName?.charAt(0)?.toUpperCase() || 
                           user?.email?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                        <View style={styles.avatarPlaceholderHint}>
                          <Ionicons name="camera-outline" size={12} color={theme.colors.primary.main} />
                        </View>
                      </View>
                    )}
                    <View style={styles.avatarOverlay}>
                      {isUploadingPhoto ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name="camera" size={20} color="white" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
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
                      {displayName?.charAt(0)?.toUpperCase() || 
                       user?.email?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  )}
                </View>
              )}
              {isEditing && (
                <TouchableOpacity 
                  style={styles.changePhotoButton}
                  onPress={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                >
                  <Ionicons 
                    name="camera" 
                    size={16} 
                    color={isUploadingPhoto ? theme.colors.text.disabled : theme.colors.primary.main} 
                  />
                  <Text style={[
                    styles.changePhotoText,
                    isUploadingPhoto && styles.changePhotoTextDisabled
                  ]}>
                    {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Fields */}
            <AccountField
              label="Full Name"
              value={displayName}
              onChangeText={handleDisplayNameChange}
              editable={true}
              placeholder="Enter your full name"
              error={validationErrors.displayName}
              isEditing={isEditing}
            />
            
            <AccountField
              label="Email Address"
              value={email}
              editable={false}
              isEditing={isEditing}
            />
            
            <AccountField
              label="Phone Number"
              value={phone}
              onChangeText={handlePhoneChange}
              editable={true}
              keyboardType="phone-pad"
              placeholder="Enter your phone number"
              error={validationErrors.phone}
              isEditing={isEditing}
            />

            <AccountField
              label="Account Type"
              value="Standard Account"
              editable={false}
              isEditing={isEditing}
            />

            <AccountField
              label="Member Since"
              value="January 2024"
              editable={false}
              isLast={true}
              isEditing={isEditing}
            />
          </View>

          {/* Save Changes Button */}
          {isEditing && (
            <TouchableOpacity 
              style={[
                styles.saveButton, 
                isSaving && styles.saveButtonDisabled,
                !hasChanges && styles.saveButtonInactive
              ]} 
              onPress={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View style={styles.saveButtonContent}>
                  <Text style={[
                    styles.saveButtonText,
                    !hasChanges && styles.saveButtonTextInactive
                  ]}>
                    {hasChanges ? 'Save Changes' : 'No Changes'}
                  </Text>
                  {hasChanges && (
                    <Ionicons name="checkmark" size={20} color="white" style={styles.saveIcon} />
                  )}
                </View>
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
    position: 'relative',
  },
  editButtonDisabled: {
    opacity: 0.5,
  },
  editButtonWithChanges: {
    backgroundColor: theme.colors.primary.main + '20',
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
  editButtonTextDisabled: {
    color: theme.colors.text.disabled,
  },
  changesIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.main,
    marginLeft: 6,
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
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  avatarPlaceholderHint: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
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
  changePhotoTextDisabled: {
    color: theme.colors.text.disabled,
  },
  fieldContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 48,
  },
  fieldValueText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    flex: 1,
  },
  fieldValueEmpty: {
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  editIcon: {
    marginLeft: 8,
    opacity: 0.5,
  },
  lastFieldContainer: {
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  fieldInput: {
    fontSize: 16,
    color: theme.colors.text.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary.main + '40',
  },
  fieldInputError: {
    borderColor: theme.colors.error.main,
    backgroundColor: theme.colors.error.main + '10',
  },
  fieldError: {
    fontSize: 12,
    color: theme.colors.error.main,
    marginTop: 4,
    marginLeft: 4,
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
  saveButtonInactive: {
    backgroundColor: theme.colors.text.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  saveButtonTextInactive: {
    color: 'white',
    opacity: 0.8,
  },
  saveIcon: {
    marginLeft: 8,
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
