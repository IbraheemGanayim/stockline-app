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
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as ImageManipulator from 'expo-image-manipulator';
import { storage, db } from './firebase';

/**
 * Upload an image file to Firestore as base64 and return a Firestore reference URL
 * @param {Object} file - Image file object with uri, type, name, size
 * @param {string} userId - ID of the user uploading the file
 * @param {string} path - Storage path (optional, not used for Firestore)
 * @returns {Promise<Object>} Upload result with Firestore reference URL or error
 */
export const uploadImage = async (file, userId, path = 'images/') => {
  try {
    if (!file || !file.uri) {
      return {
        success: false,
        error: 'No file provided for upload.'
      };
    }

    console.log('Starting image upload to Firestore...', { uri: file.uri, type: file.type, size: file.size });

    // Progressively resize and compress until it fits Firestore limits
    let attempt = 0;
    const maxAttempts = 5;
    const compressionSettings = [
      { width: 400, compress: 0.8 },
      { width: 300, compress: 0.7 },
      { width: 200, compress: 0.6 },
      { width: 150, compress: 0.5 },
      { width: 100, compress: 0.4 }
    ];
    
    let currentUri = file.uri;
    
    while (attempt < maxAttempts) {
      const settings = compressionSettings[attempt];
      console.log(`Compression attempt ${attempt + 1}: ${settings.width}px @ ${settings.compress} quality`);
      
      try {
        // Use expo-image-manipulator to resize and compress
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          currentUri,
          [
            { resize: { width: settings.width } } // This maintains aspect ratio
          ],
          {
            compress: settings.compress,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true
          }
        );
        
        console.log('Manipulated image size info:', {
          width: manipulatedImage.width,
          height: manipulatedImage.height,
          base64Length: manipulatedImage.base64?.length
        });
        
        if (!manipulatedImage.base64) {
          throw new Error('Failed to get base64 from manipulated image');
        }
        
        // Create data URL
        const base64DataUrl = `data:image/jpeg;base64,${manipulatedImage.base64}`;
        console.log('Base64 data URL length:', base64DataUrl.length);
        
        // Check if it fits (Firestore 1MB limit)
        const sizeInMB = base64DataUrl.length * 0.75 / (1024 * 1024);
        console.log('Estimated size:', sizeInMB.toFixed(2), 'MB');
        
        if (sizeInMB <= 0.8) { // Leave room for other document fields
          console.log('Image compressed successfully! Final size:', sizeInMB.toFixed(2), 'MB');
          
          // Store image in Firestore under user's profile images collection
          const imageId = `profile_${Date.now()}`;
          const imageDocRef = doc(db, 'users', userId, 'images', imageId);
          
          await setDoc(imageDocRef, {
            base64: base64DataUrl,
            filename: file.name || `profile_${Date.now()}.jpg`,
            size: sizeInMB,
            createdAt: new Date(),
            type: 'profile'
          });
          
          console.log('Image stored in Firestore successfully');
          
          // Return a Firestore reference URL (much shorter than base64)
          const firestoreUrl = `firestore://users/${userId}/images/${imageId}`;
          
          return {
            success: true,
            url: firestoreUrl,
            path: `profile_photos/${userId}`,
            filename: file.name || `profile_${Date.now()}.jpg`,
            size: sizeInMB
          };
        }
        
        currentUri = manipulatedImage.uri; // Use compressed image for next attempt
        attempt++;
        
      } catch (manipulationError) {
        console.error('Image manipulation error:', manipulationError);
        attempt++;
        continue;
      }
    }
    
    // If we get here, even maximum compression didn't work
    return {
      success: false,
      error: 'Unable to compress image enough for storage. Please try a different image.'
    };
    
  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload image. Please try again.';
    
    if (error.message?.includes('fetch')) {
      errorMessage = 'Failed to read the selected image. Please try selecting a different image.';
    } else if (error.message?.includes('FileReader')) {
      errorMessage = 'Failed to process the image. Please try a different image.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Get image data from Firestore reference URL
 * @param {string} firestoreUrl - Firestore reference URL (e.g., firestore://users/userId/images/imageId)
 * @returns {Promise<string|null>} Base64 data URL or null if not found
 */
export const getImageFromFirestore = async (firestoreUrl) => {
  try {
    if (!firestoreUrl || !firestoreUrl.startsWith('firestore://')) {
      return firestoreUrl; // Return as-is if it's not a Firestore URL (could be regular URL)
    }
    
    // Parse the Firestore URL: firestore://users/userId/images/imageId
    const path = firestoreUrl.replace('firestore://', '');
    const pathParts = path.split('/');
    
    if (pathParts.length !== 4 || pathParts[0] !== 'users' || pathParts[2] !== 'images') {
      console.error('Invalid Firestore URL format:', firestoreUrl);
      return null;
    }
    
    const [, userId, , imageId] = pathParts;
    const imageDocRef = doc(db, 'users', userId, 'images', imageId);
    const imageDoc = await getDoc(imageDocRef);
    
    if (imageDoc.exists()) {
      const imageData = imageDoc.data();
      return imageData.base64;
    }
    
    console.log('Image not found in Firestore:', firestoreUrl);
    return null;
  } catch (error) {
    console.error('Error getting image from Firestore:', error);
    return null;
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
 * @param {Object} file - File object to validate (React Native format)
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns {Object} Validation result
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  // Check if file exists
  if (!file || !file.uri) {
    return {
      isValid: false,
      error: 'No file selected.'
    };
  }

  // Check file type (React Native format)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (file.type && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP).'
    };
  }

  // Check file size if available
  if (file.size) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeMB}MB.`
      };
    }
  }

  return {
    isValid: true,
    error: null
  };
};
