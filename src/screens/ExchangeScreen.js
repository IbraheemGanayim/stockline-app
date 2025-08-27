/**
 * Exchange Screen - Modern trading interface for buying/selling stocks
 * Integrated with Firestore for real portfolio updates and transaction recording
 * @author Ibraheem Ganayim
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  Vibration,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PrimaryButton, SuccessAnimation } from '../components';
import { usePortfolio, useAuthUser, useTransactions } from '../hooks';
import { executeTransaction } from '../services/transactions';
import { theme } from '../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ExchangeScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthUser();
  const { portfolio, refreshPortfolio } = usePortfolio();
  const { addTransaction } = useTransactions();
  
  // Get stock from route params if navigated from stock details
  const selectedStock = route?.params?.stock;
  
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'
  const [selectedStockData, setSelectedStockData] = useState(
    selectedStock || {
      ticker: 'AAPL',
      companyName: 'Apple Inc.',
      price: 175.84,
      logo: '🍎',
      color: '#000000'
    }
  );
  const [amount, setAmount] = useState('0');
  const [shares, setShares] = useState('1');
  const [activeField, setActiveField] = useState('amount'); // 'amount' or 'shares'
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    Vibration.vibrate(50);
  };

  const handleFieldSwap = () => {
    setActiveField(activeField === 'amount' ? 'shares' : 'amount');
    Vibration.vibrate(50);
  };

  const handleNumberInput = (number) => {
    const currentValue = activeField === 'amount' ? amount : shares;
    const setter = activeField === 'amount' ? setAmount : setShares;
    
    let newValue = currentValue === '0' ? number : currentValue + number;
    
    // Prevent multiple decimal points
    if (number === '.' && currentValue.includes('.')) return;
    
    setter(newValue);
    Vibration.vibrate(25);
  };

  const handleDelete = () => {
    const currentValue = activeField === 'amount' ? amount : shares;
    const setter = activeField === 'amount' ? setAmount : setShares;
    
    let newValue = currentValue.slice(0, -1);
    if (newValue === '' || newValue === '0') newValue = '0';
    
    setter(newValue);
    Vibration.vibrate(25);
  };

  const handleClear = () => {
    const setter = activeField === 'amount' ? setAmount : setShares;
    setter('0');
    Vibration.vibrate(50);
  };

  /**
   * Calculate total value based on shares and price
   */
  const calculateTotal = useCallback(() => {
    const numShares = parseFloat(shares) || 0;
    const stockPrice = selectedStockData.price || 0;
    return (numShares * stockPrice).toFixed(2);
  }, [shares, selectedStockData.price]);

  /**
   * Update amount when shares change
   */
  useEffect(() => {
    if (activeField === 'shares') {
      setAmount(calculateTotal());
    }
  }, [shares, selectedStockData.price, activeField, calculateTotal]);

  /**
   * Update shares when amount changes
   */
  useEffect(() => {
    if (activeField === 'amount') {
      const numAmount = parseFloat(amount) || 0;
      const stockPrice = selectedStockData.price || 1;
      const calculatedShares = (numAmount / stockPrice).toFixed(4);
      setShares(calculatedShares);
    }
  }, [amount, selectedStockData.price, activeField]);

  /**
   * Execute buy/sell trade with Firestore integration
   */
  const handleExecuteTrade = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'Please log in to trade stocks.');
      return;
    }

    const action = activeTab === 'buy' ? 'Buy' : 'Sell';
    const tradeAmount = parseFloat(amount);
    const tradeShares = parseFloat(shares);
    
    if (tradeAmount <= 0 || tradeShares <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to trade.');
      return;
    }

    // Validation for sell orders
    if (activeTab === 'sell') {
      // In a real app, you'd check if user has enough shares
      // For demo purposes, we'll allow it
    }

    Alert.alert(
      'Confirm Trade',
      `${action} ${tradeShares} shares of ${selectedStockData.ticker} for $${tradeAmount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            
            try {
              // Haptic feedback
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              // Create transaction data
              const transactionData = {
                type: activeTab,
                ticker: selectedStockData.ticker,
                companyName: selectedStockData.companyName,
                shares: tradeShares,
                price: selectedStockData.price,
                total: tradeAmount,
                timestamp: new Date(),
                status: 'completed'
              };

              // Execute transaction
              const result = await executeTransaction(user.uid, transactionData);
              
              if (result.success) {
                // Add to transaction history
                await addTransaction(transactionData);
                
                // Refresh portfolio
                await refreshPortfolio();
                
                // Show success animation
                setShowSuccess(true);
                
                // Reset form
                setAmount('0');
                setShares('1');
                
                // Hide success animation after 2 seconds
                setTimeout(() => {
                  setShowSuccess(false);
                  navigation.goBack();
                }, 2000);
                
              } else {
                Alert.alert('Error', result.error || 'Failed to execute trade. Please try again.');
              }
            } catch (error) {
              console.error('Trade execution error:', error);
              Alert.alert('Error', 'Failed to execute trade. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const TradingInput = ({ label, value, isActive, onPress }) => (
    <Pressable
      style={[styles.stockInput, isActive && styles.stockInputActive]}
      onPress={onPress}
    >
      <View style={styles.stockLeft}>
        <Text style={styles.inputLabel}>{label}</Text>
        <Text style={styles.amountText}>
          {label === 'Amount' ? `$${value}` : `${value} shares`}
        </Text>
      </View>
      <View style={styles.stockRight}>
        <View style={[styles.stockIcon, { backgroundColor: selectedStockData.color || theme.colors.primary.main }]}>
          <Text style={styles.stockLogoEmoji}>{selectedStockData.ticker?.[0] || 'S'}</Text>
        </View>
        <View style={styles.stockInfo}>
          <Text style={styles.stockSymbol}>{selectedStockData.ticker}</Text>
          <Text style={styles.stockPrice}>${selectedStockData.price?.toFixed(2)}</Text>
        </View>
      </View>
    </Pressable>
  );

  const NumpadButton = ({ value, onPress, style, textStyle }) => (
    <TouchableOpacity
      style={[styles.numpadButton, style]}
      onPress={() => onPress(value)}
      activeOpacity={0.3}
    >
      <Text style={[styles.numpadButtonText, textStyle]}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.outerContainer, { 
      paddingTop: insets.top,
    }]}>
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA', '#F1F3F4']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Exchange</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom + 80, 100) }]}>
          {/* Buy/Sell Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'buy' && styles.activeTab]}
            onPress={() => handleTabChange('buy')}
          >
            <Text style={[styles.tabText, activeTab === 'buy' && styles.activeTabText]}>
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sell' && styles.activeTab]}
            onPress={() => handleTabChange('sell')}
          >
            <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>
              Sell
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trading Inputs */}
        <View style={styles.inputsContainer}>
          <TradingInput
            label="Amount"
            value={amount}
            isActive={activeField === 'amount'}
            onPress={() => setActiveField('amount')}
          />

          {/* Swap Button */}
          <TouchableOpacity style={styles.swapButton} onPress={handleFieldSwap}>
            <LinearGradient
              colors={[theme.colors.primary.light, theme.colors.primary.main]}
              style={styles.swapButtonGradient}
            >
              <MaterialIcons name="swap-vert" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TradingInput
            label="Shares"
            value={shares}
            isActive={activeField === 'shares'}
            onPress={() => setActiveField('shares')}
          />
        </View>

        {/* Numpad */}
        <View style={styles.numpadContainer}>
          <View style={styles.numpadGrid}>
            <NumpadButton value="1" onPress={handleNumberInput} />
            <NumpadButton value="2" onPress={handleNumberInput} />
            <NumpadButton value="3" onPress={handleNumberInput} />
            <NumpadButton value="4" onPress={handleNumberInput} />
            <NumpadButton value="5" onPress={handleNumberInput} />
            <NumpadButton value="6" onPress={handleNumberInput} />
            <NumpadButton value="7" onPress={handleNumberInput} />
            <NumpadButton value="8" onPress={handleNumberInput} />
            <NumpadButton value="9" onPress={handleNumberInput} />
            <NumpadButton value="." onPress={handleNumberInput} />
            <NumpadButton value="0" onPress={handleNumberInput} />
            <TouchableOpacity
              style={[styles.numpadButton, styles.deleteButton]}
              onPress={handleDelete}
              onLongPress={handleClear}
              activeOpacity={0.3}
            >
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          </View>
        </View>

        {/* Action Button - Fixed at bottom */}
        <View style={[styles.actionContainer, { 
          paddingBottom: Math.max(insets.bottom + 12, 24),
          bottom: 0
        }]}>
          <PrimaryButton
            title={loading ? 'Processing...' : `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${selectedStockData.ticker}`}
            onPress={handleExecuteTrade}
            fullWidth
            style={styles.actionButton}
            disabled={loading}
          />
        </View>

        {/* Success Animation Overlay */}
        {showSuccess && (
          <View style={styles.successOverlay}>
            <SuccessAnimation 
              message={`${activeTab === 'buy' ? 'Purchase' : 'Sale'} Successful!`}
              subMessage={`${shares} shares of ${selectedStockData.ticker}`}
            />
          </View>
        )}

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary.main} />
              <Text style={styles.loadingText}>Processing trade...</Text>
            </View>
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: screenHeight,
    maxHeight: screenHeight,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    minHeight: 0, // Prevent overflow
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F4',
    marginHorizontal: 28,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 14,
    padding: 4,
    elevation: 0,
    shadowOpacity: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: theme.colors.primary.main,
    shadowColor: theme.colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  tabText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#8A8A8E',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputsContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexShrink: 0,
  },
  stockInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    marginVertical: 6,
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 80,
  },
  stockInputActive: {
    borderColor: theme.colors.primary.main,
    shadowColor: theme.colors.primary.main,
    shadowOpacity: 0.4,
    elevation: 12,
    transform: [{ scale: 1.02 }],
  },
  stockLeft: {
    flex: 1,
    marginRight: 16,
  },
  amountText: {
    fontSize: Math.min(screenWidth * 0.08, 32),
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.6,
  },
  stockRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  stockIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stockIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stockLogoEmoji: {
    fontSize: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  stockPrice: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  stockInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginRight: 6,
    letterSpacing: -0.3,
  },
  dropdownButton: {
    padding: 6,
    borderRadius: 6,
  },
  swapButton: {
    alignSelf: 'center',
    marginVertical: 10,
    zIndex: 10,
    flexShrink: 0,
  },
  swapButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  numpadContainer: {
    flex: 1,
    paddingHorizontal: Math.max(screenWidth * 0.08, 32),
    justifyContent: 'center',
    paddingTop: 12,
    minHeight: 0,
  },
  numpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  numpadButton: {
    width: (screenWidth - 64 - 32) / 3, // Account for padding and gaps
    maxWidth: 76,
    aspectRatio: 1,
    maxHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  numpadButtonText: {
    fontSize: Math.min(screenWidth * 0.07, 28),
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  deleteButton: {
    backgroundColor: 'transparent',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 12,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: theme.colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginTop: 16,
  },
});

export default ExchangeScreen;
