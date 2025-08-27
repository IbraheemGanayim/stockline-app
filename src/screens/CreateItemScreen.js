/**
 * Create Item Screen - Form for creating new items
 * Includes image upload, form validation, and error handling
 * @author Ibraheem Ganayim
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Screen, FormInput, PrimaryButton } from '../components';
import { useCollection, useAuthUser } from '../hooks';
import { uploadImage, validateImageFile } from '../services/storage';
import { theme } from '../theme';

/**
 * CreateItemScreen component for creating new items
 * @param {Object} navigation - React Navigation object
 */
const CreateItemScreen = ({ navigation }) => {
  const { userId, isAuthenticated } = useAuthUser();
  const { addItem } = useCollection('user');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    imageUri: null
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Predefined categories
  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Automotive',
    'Health & Beauty',
    'Other'
  ];

  /**
   * Update form field value
   * @param {string} field - Field name
   * @param {string} value - New value
   */
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Validate form fields
   * @returns {boolean} True if form is valid
   */
  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Price validation
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Please enter a valid price';
      }
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle image selection from device
   */
  const selectImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to upload images.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validate image
        const validation = validateImageFile({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
          name: asset.fileName || 'image.jpg'
        });

        if (!validation.isValid) {
          Alert.alert('Invalid Image', validation.error);
          return;
        }

        updateField('imageUri', asset.uri);
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  /**
   * Remove selected image
   */
  const removeImage = () => {
    updateField('imageUri', null);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'You must be logged in to create items.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (formData.imageUri) {
        setImageUploading(true);
        
        // Create a file-like object for upload
        const imageFile = {
          uri: formData.imageUri,
          type: 'image/jpeg',
          name: `item_${Date.now()}.jpg`
        };

        const uploadResult = await uploadImage(imageFile, userId, 'items/');
        
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          Alert.alert('Upload Error', uploadResult.error || 'Failed to upload image');
          return;
        }
        
        setImageUploading(false);
      }

      // Create item data
      const itemData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl
      };

      // Add item to Firestore
      const result = await addItem(itemData);

      if (result.success) {
        Alert.alert(
          'Success',
          'Your item has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({
                  title: '',
                  description: '',
                  price: '',
                  category: '',
                  imageUri: null
                });
                // Navigate back to home
                navigation.navigate('Home');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create item');
      }
    } catch (error) {
      console.error('Create item error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };

  /**
   * Render image section
   * @returns {JSX.Element} Image section component
   */
  const renderImageSection = () => (
    <View style={styles.imageSection}>
      <Text style={styles.sectionLabel}>Item Image (Optional)</Text>
      
      {formData.imageUri ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: formData.imageUri }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
            <Ionicons name="close-circle" size={24} color={theme.colors.error.main} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.imagePicker} onPress={selectImage}>
          <Ionicons name="camera-outline" size={48} color={theme.colors.text.tertiary} />
          <Text style={styles.imagePickerText}>Tap to add image</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /**
   * Render category selection
   * @returns {JSX.Element} Category section component
   */
  const renderCategorySection = () => (
    <View style={styles.categorySection}>
      <Text style={styles.sectionLabel}>
        Category <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryItem,
              formData.category === category && styles.categoryItemSelected
            ]}
            onPress={() => updateField('category', category)}
          >
            <Text
              style={[
                styles.categoryText,
                formData.category === category && styles.categoryTextSelected
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.category && (
        <Text style={styles.errorText}>{errors.category}</Text>
      )}
    </View>
  );

  return (
    <Screen scrollable={true} padding={true}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.form}>
          <FormInput
            value={formData.title}
            onChangeText={(value) => updateField('title', value)}
            placeholder="Title"
            error={errors.title}
            maxLength={100}
          />

          <FormInput
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Description"
            error={errors.description}
            maxLength={500}
          />

          <FormInput
            value={formData.price}
            onChangeText={(value) => updateField('price', value)}
            placeholder="Price"
            keyboardType="numeric"
            error={errors.price}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.price}
            required={true}
          />

          {renderCategorySection()}

          {renderImageSection()}

          <PrimaryButton
            title="Create Item"
            onPress={handleSubmit}
            loading={loading || imageUploading}
            loadingText={imageUploading ? "Uploading..." : "Creating..."}
            fullWidth={true}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  form: {
    flex: 1
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8
  },
  required: {
    color: theme.colors.error.main
  },
  imageSection: {
    marginBottom: theme.spacing.lg
  },
  imagePicker: {
    width: '100%',
    height: 150,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  imagePickerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: theme.spacing.radius.md,
    overflow: 'hidden'
  },
  imagePreview: {
    width: '100%',
    height: '100%'
  },
  removeImageButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.spacing.radius.full,
    padding: theme.spacing.xs
  },
  categorySection: {
    marginBottom: theme.spacing.lg
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF'
  },
  categoryItemSelected: {
    borderColor: '#70C7A0',
    backgroundColor: '#F0F9F5'
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280'
  },
  categoryTextSelected: {
    color: '#70C7A0',
    fontWeight: '500'
  },
  submitButton: {
    marginTop: theme.spacing.xl
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error.main,
    marginTop: theme.spacing.xs,
    ...theme.typography.styles.caption
  }
});

export default CreateItemScreen;
