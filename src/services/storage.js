/**
 * Firebase Storage service for image uploads
 * Handles file uploads, downloads, and management
 * @author Ibraheem Ganayim
 */

import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload an image file to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - ID of the user uploading the file
 * @param {string} path - Storage path (optional, defaults to 'images/')
 * @returns {Promise<Object>} Upload result with download URL or error
 */
export const uploadImage = async (file, userId, path = 'images/') => {
  try {
    if (!file) {
      return {
        success: false,
        error: 'No file provided for upload.'
      };
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const fullPath = `${path}${userId}/${filename}`;
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url: downloadURL,
      path: fullPath,
      filename: filename
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: 'Failed to upload image. Please try again.'
    };
  }
};

/**
 * Upload image with progress tracking
 * @param {File} file - Image file to upload
 * @param {string} userId - ID of the user uploading the file
 * @param {Function} onProgress - Progress callback function
 * @param {string} path - Storage path (optional, defaults to 'images/')
 * @returns {Promise<Object>} Upload result with download URL or error
 */
export const uploadImageWithProgress = async (file, userId, onProgress, path = 'images/') => {
  try {
    if (!file) {
      return {
        success: false,
        error: 'No file provided for upload.'
      };
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const fullPath = `${path}${userId}/${filename}`;
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    // Create upload task with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          // Error handling
          console.error('Error uploading image:', error);
          reject({
            success: false,
            error: 'Failed to upload image. Please try again.'
          });
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              url: downloadURL,
              path: fullPath,
              filename: filename
            });
          } catch (error) {
            reject({
              success: false,
              error: 'Failed to get download URL. Please try again.'
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Error setting up image upload:', error);
    return {
      success: false,
      error: 'Failed to start image upload. Please try again.'
    };
  }
};

/**
 * Delete an image from Firebase Storage
 * @param {string} imagePath - Storage path of the image to delete
 * @returns {Promise<Object>} Success status or error
 */
export const deleteImage = async (imagePath) => {
  try {
    if (!imagePath) {
      return {
        success: false,
        error: 'No image path provided for deletion.'
      };
    }

    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: 'Failed to delete image. Please try again.'
    };
  }
};

/**
 * Get download URL for an image
 * @param {string} imagePath - Storage path of the image
 * @returns {Promise<string|null>} Download URL or null
 */
export const getImageUrl = async (imagePath) => {
  try {
    if (!imagePath) {
      return null;
    }

    const imageRef = ref(storage, imagePath);
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return null;
  }
};

/**
 * Validate image file before upload
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns {Object} Validation result
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: 'No file selected.'
    };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP).'
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB.`
    };
  }

  return {
    isValid: true,
    error: null
  };
};
