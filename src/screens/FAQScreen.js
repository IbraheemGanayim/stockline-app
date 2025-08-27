/**
 * FAQ Screen - Frequently Asked Questions
 * @author Ibraheem Ganayim
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Animated,
  Linking,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../components';
import { theme } from '../theme';

const FAQScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [isLoadingSupport, setIsLoadingSupport] = useState(false);
  const insets = useSafeAreaInsets();

  const faqData = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'How do I create my first portfolio?',
      answer: 'To create your first portfolio, go to the Portfolio tab and tap the "+" button. You can then add stocks by searching for them and specifying the quantity you own.'
    },
    {
      id: 2,
      category: 'Getting Started', 
      question: 'How do I add stocks to my watchlist?',
      answer: 'You can add stocks to your watchlist by searching for them in the Market tab and tapping the heart icon, or by tapping "Add to Watchlist" on any stock details page.'
    },
    {
      id: 3,
      category: 'Trading',
      question: 'How do I buy or sell stocks?',
      answer: 'Stockline is a portfolio tracking app. We don\'t facilitate actual trading. You can track your trades by manually adding them to your portfolio through the Portfolio tab.'
    },
    {
      id: 4,
      category: 'Trading',
      question: 'Are there any trading fees?',
      answer: 'Stockline doesn\'t charge any trading fees as we don\'t facilitate actual trading. We\'re a portfolio tracking and market analysis tool.'
    },
    {
      id: 5,
      category: 'Account & Security',
      question: 'How do I reset my password?',
      answer: 'You can reset your password by going to Settings > Account > Change Password, or by using the "Forgot Password" link on the login screen.'
    },
    {
      id: 6,
      category: 'Account & Security',
      question: 'Is my financial data secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your data. We don\'t store any sensitive financial information like bank account details.'
    },
    {
      id: 7,
      category: 'Features',
      question: 'How accurate is the market data?',
      answer: 'Our market data is sourced from reliable financial data providers and is updated in real-time during market hours. However, there may be slight delays.'
    },
    {
      id: 8,
      category: 'Features',
      question: 'Can I export my portfolio data?',
      answer: 'Yes, you can export your portfolio data by going to Profile > Account > Download Data. You\'ll receive a CSV file with all your portfolio information.'
    },
    {
      id: 9,
      category: 'Billing',
      question: 'Is Stockline free to use?',
      answer: 'Stockline offers both free and premium plans. The free plan includes basic portfolio tracking, while premium plans offer advanced analytics and features.'
    },
    {
      id: 10,
      category: 'Billing',
      question: 'How can I upgrade to premium?',
      answer: 'You can upgrade to premium by going to Profile > Billing/Payments and selecting a premium plan that suits your needs.'
    }
  ];

  const filteredFAQs = faqData.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedFAQs = filteredFAQs.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleContactSupport = async () => {
    setIsLoadingSupport(true);
    try {
      await Linking.openURL('mailto:support@stockline.com?subject=Support Request');
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert('Error', 'Unable to open email client. Please contact support@stockline.com manually.');
    } finally {
      setIsLoadingSupport(false);
    }
  };

  const FAQItem = ({ item }) => {
    const isExpanded = expandedItems[item.id];
    
    return (
      <View style={styles.faqItem}>
        <TouchableOpacity 
          style={styles.faqHeader}
          onPress={() => toggleExpanded(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.colors.text.tertiary} 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  const CategorySection = ({ category, items }) => (
    <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{category}</Text>
      {items.map(item => (
        <FAQItem key={item.id} item={item} />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top + 8 : 8 }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
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
              placeholder="Search questions..."
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

        {/* FAQ Content */}
        <View style={styles.content}>
          {Object.keys(groupedFAQs).length > 0 ? (
            Object.entries(groupedFAQs).map(([category, items]) => (
              <CategorySection key={category} category={category} items={items} />
            ))
          ) : (
            <View style={styles.noResults}>
              <Ionicons name="search" size={48} color={theme.colors.text.tertiary} />
              <Text style={styles.noResultsTitle}>No results found</Text>
              <Text style={styles.noResultsText}>
                Try searching with different keywords or contact support for help.
              </Text>
            </View>
          )}

          {/* Contact Support */}
          <View style={styles.supportSection}>
            <Text style={styles.supportTitle}>Still need help?</Text>
            <Text style={styles.supportText}>
              Can't find what you're looking for? Our support team is here to help.
            </Text>
            <TouchableOpacity 
              style={[styles.supportButton, isLoadingSupport && styles.supportButtonDisabled]} 
              onPress={handleContactSupport}
              disabled={isLoadingSupport}
            >
              {isLoadingSupport ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="mail-outline" size={20} color="white" />
                  <Text style={styles.supportButtonText}>Contact Support</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  content: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text.secondary,
    marginTop: 12,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  supportSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginTop: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  supportButton: {
    backgroundColor: theme.colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: theme.colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  supportButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});

export default FAQScreen;
