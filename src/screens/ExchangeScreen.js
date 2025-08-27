/**
 * Exchange Screen - Modern trading interface for buying/selling stocks
 * Matches the Figma design with buy/sell tabs, stock inputs, numpad, and swap functionality
 * @author Ibraheem Ganayim
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components';
import { theme } from '../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ExchangeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'
  const [fromStock, setFromStock] = useState({
    symbol: 'NFLX',
    name: 'Netflix',
    amount: '126',
    icon: 'N',
    color: '#E50914'
  });
  const [toStock, setToStock] = useState({
    symbol: 'MSFT',
    name: 'Microsoft',
    amount: '56.01',
    icon: 'M',
    color: '#00A1F1'
  });
  const [activeField, setActiveField] = useState('from'); // 'from' or 'to'

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    Vibration.vibrate(50);
  };

  const handleSwap = () => {
    setFromStock(toStock);
    setToStock(fromStock);
    Vibration.vibrate(100);
  };

  const handleNumberInput = (number) => {
    const currentStock = activeField === 'from' ? fromStock : toStock;
    const setter = activeField === 'from' ? setFromStock : setToStock;
    
    let newAmount = currentStock.amount === '0' ? number : currentStock.amount + number;
    
    // Prevent multiple decimal points
    if (number === '.' && currentStock.amount.includes('.')) return;
    
    setter(prev => ({
      ...prev,
      amount: newAmount
    }));
    
    Vibration.vibrate(25);
  };

  const handleDelete = () => {
    const currentStock = activeField === 'from' ? fromStock : toStock;
    const setter = activeField === 'from' ? setFromStock : setToStock;
    
    let newAmount = currentStock.amount.slice(0, -1);
    if (newAmount === '' || newAmount === '0') newAmount = '0';
    
    setter(prev => ({
      ...prev,
      amount: newAmount
    }));
    
    Vibration.vibrate(25);
  };

  const handleClear = () => {
    const setter = activeField === 'from' ? setFromStock : setToStock;
    setter(prev => ({
      ...prev,
      amount: '0'
    }));
    Vibration.vibrate(50);
  };

  const handleExecuteTrade = () => {
    const action = activeTab === 'buy' ? 'Buy' : 'Sell';
    const amount = parseFloat(fromStock.amount);
    
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to trade.');
      return;
    }

    Alert.alert(
      'Confirm Trade',
      `${action} ${fromStock.symbol} for $${fromStock.amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: () => {
            Alert.alert('Success', `${action} order placed successfully!`);
            // Here you would integrate with your trading API
          }
        }
      ]
    );
  };

  const StockInput = ({ stock, isActive, onPress, label }) => (
    <Pressable
      style={[styles.stockInput, isActive && styles.stockInputActive]}
      onPress={onPress}
    >
      <View style={styles.stockLeft}>
        <Text style={styles.amountText}>${stock.amount}</Text>
      </View>
      <View style={styles.stockRight}>
        <View style={[styles.stockIcon, { backgroundColor: stock.color }]}>
          <Text style={styles.stockIconText}>{stock.icon}</Text>
        </View>
        <View style={styles.stockInfo}>
          <Text style={styles.stockSymbol}>{stock.symbol}</Text>
          <TouchableOpacity style={styles.dropdownButton}>
            <Ionicons name="chevron-down" size={16} color={theme.colors.text.secondary} />
          </TouchableOpacity>
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

        {/* Stock Inputs */}
        <View style={styles.inputsContainer}>
          <StockInput
            stock={fromStock}
            isActive={activeField === 'from'}
            onPress={() => setActiveField('from')}
            label="From"
          />

          {/* Swap Button */}
          <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
            <LinearGradient
              colors={[theme.colors.primary.light, theme.colors.primary.main]}
              style={styles.swapButtonGradient}
            >
              <MaterialIcons name="swap-vert" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <StockInput
            stock={toStock}
            isActive={activeField === 'to'}
            onPress={() => setActiveField('to')}
            label="To"
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
            title={`${activeTab === 'buy' ? 'Buy' : 'Sell'} ${fromStock.symbol}`}
            onPress={handleExecuteTrade}
            fullWidth
            style={styles.actionButton}
          />
        </View>
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
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default ExchangeScreen;
