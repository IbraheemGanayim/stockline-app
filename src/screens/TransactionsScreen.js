/**
 * Transactions Screen - Shows buy/sell transaction history
 * Allows users to add new transactions and view past activity
 * @author Ibraheem Ganayim
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, SectionHeader, PrimaryButton, FormInput } from '../components';
import { useTransactions } from '../hooks';
import { theme } from '../theme';

const TransactionsScreen = ({ navigation }) => {
  // Use Firebase hooks for real-time data
  const { transactions, loading, error, createTransaction } = useTransactions();
  
  // Modal state for adding transactions
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'buy',
    ticker: '',
    companyName: '',
    shares: '',
    price: '',
  });

  const handleAddTransaction = () => {
    setShowAddModal(true);
  };

  const handleSaveTransaction = async () => {
    const { ticker, companyName, shares, price, type } = newTransaction;
    
    // Validation
    if (!ticker || !companyName || !shares || !price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(price);
    
    if (isNaN(sharesNum) || isNaN(priceNum) || sharesNum <= 0 || priceNum <= 0) {
      Alert.alert('Error', 'Please enter valid numbers for shares and price');
      return;
    }

    const transactionData = {
      type,
      ticker: ticker.toUpperCase(),
      companyName,
      shares: sharesNum,
      price: priceNum,
      total: sharesNum * priceNum
    };

    try {
      const result = await createTransaction(transactionData);
      
      if (result.success) {
        Alert.alert('Success', 'Transaction added successfully');
        setShowAddModal(false);
        setNewTransaction({
          type: 'buy',
          ticker: '',
          companyName: '',
          shares: '',
          price: '',
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to add transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setNewTransaction({
      type: 'buy',
      ticker: '',
      companyName: '',
      shares: '',
      price: '',
    });
  };

  const TransactionItem = ({ transaction }) => {
    const isBuy = transaction.type === 'buy';
    
    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <View style={[styles.typeIndicator, isBuy ? styles.buyIndicator : styles.sellIndicator]}>
            <Ionicons 
              name={isBuy ? 'arrow-down' : 'arrow-up'} 
              size={16} 
              color="white" 
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.tickerText}>{transaction.ticker}</Text>
            <Text style={styles.companyText}>{transaction.companyName}</Text>
            <Text style={styles.dateText}>{new Date(transaction.date).toLocaleDateString()}</Text>
          </View>
        </View>
        
        <View style={styles.transactionRight}>
          <Text style={styles.sharesText}>{transaction.shares} shares</Text>
          <Text style={styles.priceText}>${transaction.price?.toFixed(2) || '0.00'}</Text>
          <Text style={[styles.totalText, isBuy ? styles.buyTotal : styles.sellTotal]}>
            {isBuy ? '-' : '+'}${transaction.total?.toFixed(2) || '0.00'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <Screen padding={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen padding={true}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load transactions</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padding={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <SectionHeader 
            title="Recent Transactions" 
            showIndicator={true}
          />
          <PrimaryButton
            title="Add Transaction"
            onPress={handleAddTransaction}
            style={styles.addButton}
          />
        </View>
        
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first buy or sell transaction
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelAdd}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelAdd}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <TouchableOpacity onPress={handleSaveTransaction}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Transaction Type */}
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newTransaction.type === 'buy' && styles.typeButtonActive
                ]}
                onPress={() => setNewTransaction(prev => ({ ...prev, type: 'buy' }))}
              >
                <Text style={[
                  styles.typeButtonText,
                  newTransaction.type === 'buy' && styles.typeButtonTextActive
                ]}>
                  Buy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newTransaction.type === 'sell' && styles.typeButtonActive
                ]}
                onPress={() => setNewTransaction(prev => ({ ...prev, type: 'sell' }))}
              >
                <Text style={[
                  styles.typeButtonText,
                  newTransaction.type === 'sell' && styles.typeButtonTextActive
                ]}>
                  Sell
                </Text>
              </TouchableOpacity>
            </View>

            <FormInput
              label="Stock Ticker"
              value={newTransaction.ticker}
              onChangeText={(text) => setNewTransaction(prev => ({ ...prev, ticker: text }))}
              placeholder="e.g., AAPL"
              autoCapitalize="characters"
            />

            <FormInput
              label="Company Name"
              value={newTransaction.companyName}
              onChangeText={(text) => setNewTransaction(prev => ({ ...prev, companyName: text }))}
              placeholder="e.g., Apple Inc."
            />

            <FormInput
              label="Number of Shares"
              value={newTransaction.shares}
              onChangeText={(text) => setNewTransaction(prev => ({ ...prev, shares: text }))}
              placeholder="0"
              keyboardType="numeric"
            />

            <FormInput
              label="Price per Share"
              value={newTransaction.price}
              onChangeText={(text) => setNewTransaction(prev => ({ ...prev, price: text }))}
              placeholder="0.00"
              keyboardType="numeric"
            />

            {newTransaction.shares && newTransaction.price && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>
                  ${(parseFloat(newTransaction.shares || 0) * parseFloat(newTransaction.price || 0)).toFixed(2)}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  addButton: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buyIndicator: {
    backgroundColor: theme.colors.stock.loss,
  },
  sellIndicator: {
    backgroundColor: theme.colors.stock.gain,
  },
  transactionInfo: {
    flex: 1,
  },
  tickerText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  companyText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sharesText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
  },
  buyTotal: {
    color: theme.colors.stock.loss,
  },
  sellTotal: {
    color: theme.colors.stock.gain,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  cancelButton: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary.main,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  totalContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary.main,
  },
});

export default TransactionsScreen;
