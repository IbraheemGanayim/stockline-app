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
  Image,
  Modal,
  PanResponder,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PrimaryButton, SuccessAnimation } from '../components';
import { usePortfolio, useAuthUser, useTransactions } from '../hooks';
import { useTheme } from '../contexts/ThemeProvider';
import { executeTransaction } from '../services/transactions';
import { theme } from '../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Company icons mapping with fallback support
 */
const COMPANY_ICONS = {
  AAPL: {
    type: 'image',
    source: 'https://logo.clearbit.com/apple.com',
    fallback: { type: 'icon', name: 'apple', library: 'FontAwesome5' },
    color: '#000000',
    backgroundColor: '#F5F5F7'
  },
  MSFT: {
    type: 'image',
    source: 'https://logo.clearbit.com/microsoft.com',
    fallback: { type: 'icon', name: 'microsoft', library: 'FontAwesome5' },
    color: '#00A1F1',
    backgroundColor: '#F3F2F1'
  },
  GOOGL: {
    type: 'image',
    source: 'https://logo.clearbit.com/google.com',
    fallback: { type: 'icon', name: 'google', library: 'FontAwesome5' },
    color: '#4285F4',
    backgroundColor: '#F8F9FA'
  },
  NFLX: {
    type: 'image',
    source: 'https://logo.clearbit.com/netflix.com',
    fallback: { type: 'text', text: 'N', font: 'bold' },
    color: '#E50914',
    backgroundColor: '#000000'
  },
  TSLA: {
    type: 'image',
    source: 'https://logo.clearbit.com/tesla.com',
    fallback: { type: 'text', text: 'T', font: 'bold' },
    color: '#CC0000',
    backgroundColor: '#FFFFFF'
  },
  AMZN: {
    type: 'image',
    source: 'https://logo.clearbit.com/amazon.com',
    fallback: { type: 'icon', name: 'amazon', library: 'FontAwesome5' },
    color: '#FF9900',
    backgroundColor: '#232F3E'
  },
};

/**
 * Predefined amount options for quick selection
 */
const AMOUNT_OPTIONS = [10, 25, 50, 100, 250, 500, 1000, 2500];

/**
 * Available stocks for trading
 */
const AVAILABLE_STOCKS = [
  {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    price: 175.84,
    change: 2.45,
    changePercent: 1.41
  },
  {
    ticker: 'NFLX',
    companyName: 'Netflix, Inc',
    price: 388.91,
    change: -5.21,
    changePercent: -1.32
  },
  {
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    price: 56.01,
    change: 1.45,
    changePercent: 2.66
  },
  {
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    price: 2845.32,
    change: 15.67,
    changePercent: 0.55
  },
  {
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    price: 248.87,
    change: -8.34,
    changePercent: -3.24
  }
];

/**
 * Company Icon component with image and fallback support
 */
const CompanyIcon = ({ ticker, size = 40 }) => {
  const [imageError, setImageError] = useState(false);
  const iconConfig = COMPANY_ICONS[ticker];
  
  if (!iconConfig || imageError) {
    const fallback = iconConfig?.fallback || { type: 'text', text: ticker[0] };
    
    return (
      <View style={[
        styles.stockIcon,
        { 
          width: size, 
          height: size,
          backgroundColor: iconConfig?.backgroundColor || theme.colors.primary.light 
        }
      ]}>
        {fallback.type === 'icon' ? (
          <FontAwesome5 
            name={fallback.name} 
            size={size * 0.5} 
            color={iconConfig?.color || theme.colors.primary.main} 
          />
        ) : (
          <Text style={[
            styles.stockIconText,
            { 
              fontSize: size * 0.4,
              color: iconConfig?.color || '#FFFFFF',
              fontWeight: fallback.font === 'bold' ? '700' : '600'
            }
          ]}>
            {fallback.text || ticker[0]}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[
      styles.stockIcon,
      { 
        width: size, 
        height: size,
        backgroundColor: iconConfig.backgroundColor 
      }
    ]}>
      <Image
        source={{ uri: iconConfig.source }}
        style={[styles.stockIconImage, { width: size * 0.7, height: size * 0.7 }]}
        onError={() => setImageError(true)}
        resizeMode="contain"
      />
    </View>
  );
};

const ExchangeScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { user } = useAuthUser();
  const { portfolio, refreshPortfolio } = usePortfolio();
  const { addTransaction } = useTransactions();
  
  // Get stock from route params if navigated from stock details
  const selectedStock = route?.params?.stock;
  
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'
  const [selectedStockData, setSelectedStockData] = useState(
    selectedStock || AVAILABLE_STOCKS[0]
  );
  const [amount, setAmount] = useState('0');
  const [shares, setShares] = useState('1');
  const [activeField, setActiveField] = useState('amount'); // 'amount' or 'shares'
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAmountSelector, setShowAmountSelector] = useState(false);
  const [showStockSelector, setShowStockSelector] = useState(false);
  const [sliderValue, setSliderValue] = useState(15); // For amount selector slider

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
      style={[
        styles.stockInput, 
        { backgroundColor: colors.cardBackground },
        isActive && styles.stockInputActive
      ]}
      onPress={onPress}
    >
      <TouchableOpacity 
        style={styles.stockLeft}
        onPress={() => {
          if (label === 'Amount') {
            setShowAmountSelector(true);
          }
        }}
        activeOpacity={label === 'Amount' ? 0.7 : 1}
        disabled={label !== 'Amount'}
      >
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.amountText, { color: colors.textPrimary }]}>
          {label === 'Amount' ? `$${value}` : `${value} shares`}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.stockRight}>
        <CompanyIcon ticker={selectedStockData.ticker} size={40} />
        <View style={styles.stockInfo}>
          <Text style={[styles.stockSymbol, { color: colors.textPrimary }]}>{selectedStockData.ticker}</Text>
          <Text style={[styles.stockPrice, { color: colors.textSecondary }]}>${selectedStockData.price?.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => {
            setShowStockSelector(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons name="chevron-down" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  const NumpadButton = ({ value, onPress, style, textStyle }) => (
    <TouchableOpacity
      style={[styles.numpadButton, style]}
      onPress={() => onPress(value)}
      activeOpacity={0.3}
    >
      <Text style={[styles.numpadButtonText, { color: colors.textPrimary }, textStyle]}>{value}</Text>
    </TouchableOpacity>
  );



  return (
    <View style={[styles.outerContainer, { 
      paddingTop: insets.top,
    }]}>
        <LinearGradient
          colors={isDark ? [colors.background, colors.cardBackground, colors.background] : ['#FFFFFF', '#F8F9FA', '#F1F3F4']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.inputBackground }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Exchange</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom + 80, 100) }]}>
          {/* Buy/Sell Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.inputBackground }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'buy' && styles.activeTab]}
            onPress={() => handleTabChange('buy')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'buy' ? '#FFFFFF' : colors.textSecondary },
              activeTab === 'buy' && styles.activeTabText
            ]}>
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sell' && styles.activeTab]}
            onPress={() => handleTabChange('sell')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'sell' ? '#FFFFFF' : colors.textSecondary },
              activeTab === 'sell' && styles.activeTabText
            ]}>
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
            {/* Row 1: 1, 2, 3 */}
            <View style={styles.numpadRow}>
              <NumpadButton value="1" onPress={handleNumberInput} />
              <NumpadButton value="2" onPress={handleNumberInput} />
              <NumpadButton value="3" onPress={handleNumberInput} />
            </View>
            
            {/* Row 2: 4, 5, 6 */}
            <View style={styles.numpadRow}>
              <NumpadButton value="4" onPress={handleNumberInput} />
              <NumpadButton value="5" onPress={handleNumberInput} />
              <NumpadButton value="6" onPress={handleNumberInput} />
            </View>
            
            {/* Row 3: 7, 8, 9 */}
            <View style={styles.numpadRow}>
              <NumpadButton value="7" onPress={handleNumberInput} />
              <NumpadButton value="8" onPress={handleNumberInput} />
              <NumpadButton value="9" onPress={handleNumberInput} />
            </View>
            
            {/* Row 4: ., 0, delete */}
            <View style={styles.numpadRow}>
              <NumpadButton value="." onPress={handleNumberInput} />
              <NumpadButton value="0" onPress={handleNumberInput} />
              <TouchableOpacity
                style={[styles.numpadButton, styles.deleteButton]}
                onPress={handleDelete}
                onLongPress={handleClear}
                activeOpacity={0.3}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
          </View>
        </View>

        {/* Action Button - Fixed at bottom */}
        <View style={[styles.actionContainer, { 
          backgroundColor: colors.cardBackground,
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
        <SuccessAnimation 
          visible={showSuccess}
          title={`${activeTab === 'buy' ? 'Purchase' : 'Sale'} Successful!`}
          message={`${shares} shares of ${selectedStockData.ticker}`}
          onComplete={() => setShowSuccess(false)}
        />

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={[styles.loadingContainer, { backgroundColor: colors.cardBackground }]}>
              <ActivityIndicator size="large" color={theme.colors.primary.main} />
              <Text style={styles.loadingText}>Processing trade...</Text>
            </View>
          </View>
        )}

        {/* Amount Selector Modal */}
        {showAmountSelector && (
          <Modal
            visible={true}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowAmountSelector(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowAmountSelector(false)}>
                    <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Buy</Text>
                  <View style={{ width: 24 }} />
                </View>

                {/* Stock Info */}
                <View style={styles.modalStockInfo}>
                  <CompanyIcon ticker={selectedStockData.ticker} size={48} />
                  <View style={styles.modalStockDetails}>
                    <Text style={styles.modalStockSymbol}>{selectedStockData.ticker}</Text>
                    <Text style={styles.modalStockName}>{selectedStockData.companyName}</Text>
                  </View>
                  <Text style={styles.modalStockPrice}>${selectedStockData.price?.toFixed(2)}</Text>
                </View>

                {/* Enter Stock Amount Section */}
                <View style={styles.amountSection}>
                  <Text style={styles.amountSectionTitle}>Enter a Stock Amount</Text>
                  <Text style={styles.amountSectionSubtitle}>
                    Choose the amount of stocks{'\n'}you want to buy
                  </Text>
                  
                  {/* Large Amount Display */}
                  <View style={styles.largeAmountContainer}>
                    <Text style={styles.largeAmountNumber}>{sliderValue}</Text>
                    <Text style={styles.largeAmountValue}>${(sliderValue * selectedStockData.price).toFixed(2)}</Text>
                  </View>

                  {/* Amount Range Selector */}
                  <View style={styles.rangeContainer}>
                    <TouchableOpacity 
                      style={styles.decrementButton}
                      onPress={() => {
                        if (sliderValue > 10) {
                          setSliderValue(sliderValue - 1);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.buttonText}>-</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.sliderValueContainer}>
                      <Text style={styles.sliderValueText}>{sliderValue}</Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.incrementButton}
                      onPress={() => {
                        if (sliderValue < 20) {
                          setSliderValue(sliderValue + 1);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Continue Button */}
                <View style={styles.modalFooter}>
                  <PrimaryButton
                    title="Continue"
                    onPress={() => {
                      setAmount(sliderValue.toString());
                      setShowAmountSelector(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    fullWidth
                    style={styles.continueButton}
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Stock Selector Modal */}
        <Modal
          visible={showStockSelector}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowStockSelector(false)}
        >
                      <View style={styles.modalOverlay}>
              <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowStockSelector(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Stock</Text>
                <View style={{ width: 24 }} />
              </View>

              <View style={styles.stockListContainer}>
                {AVAILABLE_STOCKS.map((stock) => {
                  const isPositive = stock.change >= 0;
                  return (
                    <TouchableOpacity
                      key={stock.ticker}
                      style={[
                        styles.stockListItem,
                        selectedStockData.ticker === stock.ticker && styles.selectedStockItem
                      ]}
                      onPress={() => {
                        setSelectedStockData(stock);
                        setShowStockSelector(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }}
                    >
                      <CompanyIcon ticker={stock.ticker} size={44} />
                      <View style={styles.stockListInfo}>
                        <Text style={styles.stockListTicker}>{stock.ticker}</Text>
                        <Text style={styles.stockListName}>{stock.companyName}</Text>
                      </View>
                      <View style={styles.stockListPriceContainer}>
                        <Text style={styles.stockListPrice}>${stock.price.toFixed(2)}</Text>
                        <Text style={[
                          styles.stockListChange,
                          isPositive ? styles.positiveChange : styles.negativeChange
                        ]}>
                          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>
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
    // backgroundColor is now dynamic from theme
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
    // backgroundColor is now dynamic from theme
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
    // backgroundColor is now dynamic from theme
    minHeight: 0, // Prevent overflow
  },
  tabContainer: {
    flexDirection: 'row',
    // backgroundColor is now dynamic from theme
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
    // color is now dynamic from theme
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputsContainer: {
    paddingHorizontal: 24,
    marginBottom: 50,
    flexShrink: 0,
  },
  stockInput: {
    // backgroundColor is now dynamic from theme
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    marginVertical: 6,
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    minHeight: 75,
  },
  stockInputActive: {
    borderColor: theme.colors.primary.main,
    shadowColor: theme.colors.primary.main,
    shadowOpacity: 0.4,
    elevation: 12,
    transform: [{ scale: 1.02 }],
  },
  stockLeft: {
    flex: 3,
    marginRight: 12,
    minWidth: 0, // Allow shrinking
    overflow: 'hidden',
    paddingVertical: 4,
  },

  amountText: {
    fontSize: 18,
    fontWeight: '700',
    // color is now dynamic from theme
    letterSpacing: -0.2,
    flexShrink: 1,
    numberOfLines: 1,
    flexWrap: 'wrap',
  },
  stockRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    maxWidth: '50%',
  },

  stockIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stockLogoEmoji: {
    fontSize: 20,
  },
  stockIcon: {
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
  stockIconImage: {
    borderRadius: 8,
  },
  stockIconText: {
    fontWeight: '700',
    textAlign: 'center',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    // color is now dynamic from theme
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
    flex: 1,
    minWidth: 0,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '700',
    // color is now dynamic from theme
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
    paddingHorizontal: 30,
    paddingVertical: 20,
    justifyContent: 'center',
    minHeight: 0,
    marginTop: 25,
    marginBottom: 80,
  },
  numpadGrid: {
    width: '100%',
    alignItems: 'center',
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 35,
    marginBottom: 15,
  },
  numpadButton: {
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 37.5,
    backgroundColor: 'transparent',
  },
  numpadButtonText: {
    fontSize: Math.min(screenWidth * 0.08, 32),
    fontWeight: '300',
    // color is now dynamic from theme
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
    // backgroundColor is now dynamic from theme
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
    // backgroundColor is now dynamic from theme
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    // backgroundColor is now dynamic from theme
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  modalStockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  modalStockDetails: {
    flex: 1,
    marginLeft: 16,
  },
  modalStockSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  modalStockName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  modalStockPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  amountSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 40,
  },
  amountSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  amountSectionSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  largeAmountContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  largeAmountNumber: {
    fontSize: 80,
    fontWeight: '800',
    color: theme.colors.primary.main,
    lineHeight: 80,
    marginBottom: 8,
  },
  largeAmountValue: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  decrementButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  incrementButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  sliderValueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderValueText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary.main,
  },
  modalFooter: {
    paddingHorizontal: 24,
  },
  continueButton: {
    borderRadius: 16,
    paddingVertical: 16,
  },
  // Stock Selector Styles
  stockListContainer: {
    paddingHorizontal: 24,
    maxHeight: 400,
  },
  stockListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
  },
  selectedStockItem: {
    backgroundColor: theme.colors.primary.light,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
  },
  stockListInfo: {
    flex: 1,
    marginLeft: 16,
  },
  stockListTicker: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  stockListName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  stockListPriceContainer: {
    alignItems: 'flex-end',
  },
  stockListPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  stockListChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  positiveChange: {
    color: theme.colors.stock.gain,
  },
  negativeChange: {
    color: theme.colors.stock.loss,
  },
});

export default ExchangeScreen;
