/**
 * Language Screen - Language selection with demo functionality
 * Shows different language options but doesn't actually change the app language
 * @author Ibraheem Ganayim
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen } from '../components';
import { useAuthUser } from '../hooks';
import { updateLanguagePreference, getLanguagePreference } from '../services/userPreferences';
import { theme } from '../theme';

const LanguageScreen = ({ navigation }) => {
  const { user } = useAuthUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const languages = [
    {
      id: 'english',
      name: 'English',
      flag: '🇺🇸',
      code: 'en',
      isSelected: true
    },
    {
      id: 'indonesian',
      name: 'Indonesian',
      flag: '🇮🇩',
      code: 'id',
      isSelected: false
    },
    {
      id: 'french',
      name: 'French',
      flag: '🇫🇷',
      code: 'fr',
      isSelected: false
    },
    {
      id: 'chinese',
      name: 'Chinese',
      flag: '🇨🇳',
      code: 'zh',
      isSelected: false
    },
    {
      id: 'japanese',
      name: 'Japanese',
      flag: '🇯🇵',
      code: 'ja',
      isSelected: false
    },
    {
      id: 'spanish',
      name: 'Spanish',
      flag: '🇪🇸',
      code: 'es',
      isSelected: false
    },
    {
      id: 'german',
      name: 'German',
      flag: '🇩🇪',
      code: 'de',
      isSelected: false
    },
    {
      id: 'arabic',
      name: 'Arabic',
      flag: '🇸🇦',
      code: 'ar',
      isSelected: false
    },
    {
      id: 'portuguese',
      name: 'Portuguese',
      flag: '🇧🇷',
      code: 'pt',
      isSelected: false
    },
    {
      id: 'russian',
      name: 'Russian',
      flag: '🇷🇺',
      code: 'ru',
      isSelected: false
    }
  ];

  // Load saved language preference on mount
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await getLanguagePreference();
      setSelectedLanguage(savedLanguage);
    } catch (error) {
      console.error('Error loading saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLanguages = languages.filter(language =>
    language.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = (languageId) => {
    setSelectedLanguage(languageId);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Update language preference using the preferences service
      const result = await updateLanguagePreference(user?.uid, selectedLanguage);
      
      if (result.success) {
        const selectedLang = languages.find(lang => lang.id === selectedLanguage);
        
        // Demo functionality - show alert but don't actually change language
        Alert.alert(
          'Demo Mode',
          `Language preference saved as ${selectedLang?.name}. In a real app, this would change the interface language, but for this demonstration, the app will remain in English.${user?.uid ? ' Your preference has been synced to your account.' : ''}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
      Alert.alert('Error', error.message || 'Failed to save language preference. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const LanguageItem = ({ language }) => {
    const isSelected = selectedLanguage === language.id;
    const isDisabled = language.id !== 'english'; // Only English is "enabled" in demo
    
    return (
      <TouchableOpacity 
        style={[
          styles.languageItem,
          isSelected && styles.languageItemSelected,
          isDisabled && styles.languageItemDisabled
        ]}
        onPress={() => handleLanguageSelect(language.id)}
        activeOpacity={isDisabled ? 0.6 : 0.7}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.flagText}>{language.flag}</Text>
          <Text style={[
            styles.languageName,
            isDisabled && styles.languageNameDisabled
          ]}>
            {language.name}
          </Text>
        </View>
        
        <View style={styles.languageRight}>
          {isDisabled && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          )}
          {isSelected ? (
            <View style={styles.selectedIcon}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          ) : (
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDisabled ? theme.colors.text.disabled : theme.colors.text.tertiary} 
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Loading language preferences...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top + 8 : 8 }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          disabled={isSaving}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Language List */}
        <View style={styles.languageList}>
          {filteredLanguages.map(language => (
            <LanguageItem key={language.id} language={language} />
          ))}
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <View style={styles.demoIcon}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary.main} />
          </View>
          <Text style={styles.demoText}>
            This is a demo version. Only English is fully supported. Other languages will be available in future updates.
          </Text>
        </View>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
            onPress={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  languageList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  languageItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  languageItemSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.main + '08',
  },
  languageItemDisabled: {
    opacity: 0.6,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagText: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  languageNameDisabled: {
    color: theme.colors.text.secondary,
  },
  languageRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.text.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  selectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primary.main + '10',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary.main,
  },
  demoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  demoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text.secondary,
  },
  saveContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
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
});

export default LanguageScreen;
