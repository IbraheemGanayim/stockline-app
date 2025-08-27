/**
 * Portfolio Screen - Shows detailed portfolio breakdown
 * Displays charts, stock holdings, and performance metrics
 * @author Ibraheem Ganayim
 */

import React from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Screen, StockCard, SectionHeader } from '../components';
import { usePortfolio } from '../hooks';
import { theme } from '../theme';

const PortfolioScreen = ({ navigation }) => {
  // Use Firebase hooks for real-time data
  const { portfolio, holdings, loading, error } = usePortfolio();

  const handleStockPress = (stock) => {
    navigation.navigate('StockDetails', { stock });
  };

  if (loading) {
    return (
      <Screen padding={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Loading portfolio...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen padding={true}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load portfolio</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padding={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader 
          title="My Holdings" 
          style={styles.sectionHeader}
          showIndicator={true}
        />
        
        {holdings.length > 0 ? (
          holdings.map((stock, index) => (
            <StockCard
              key={stock.id || index}
              ticker={stock.ticker}
              companyName={stock.companyName}
              price={stock.currentPrice || stock.avgPrice || 0}
              change={stock.gain || 0}
              changePercent={stock.gainPercent || 0}
              onPress={() => handleStockPress(stock)}
              showChart={true}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No holdings yet</Text>
            <Text style={styles.emptySubtext}>
              Add some transactions to see your portfolio
            </Text>
          </View>
        )}
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Investment</Text>
            <Text style={styles.summaryValue}>
              ${portfolio.totalInvestment?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Current Value</Text>
            <Text style={[
              styles.summaryValue, 
              portfolio.totalValue > portfolio.totalInvestment ? styles.positiveValue : styles.negativeValue
            ]}>
              ${portfolio.totalValue?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
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
  summaryTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  positiveValue: {
    color: theme.colors.stock.gain,
  },
  negativeValue: {
    color: theme.colors.stock.loss,
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
});

export default PortfolioScreen;
