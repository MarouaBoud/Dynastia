import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getTransactions, Transaction } from '../../services/transactions.service';
import { formatCurrency } from '../../utils/currency';

type RootStackParamList = {
  TransactionList: undefined;
  AddTransaction: undefined;
  TransactionDetail: { transactionId: string };
};

type TransactionListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TransactionList'>;
};

// Color mapping for categories
const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#8B5CF6',
  Food: '#10B981',
  Transport: '#3B82F6',
  Shopping: '#F59E0B',
  Health: '#EF4444',
  Entertainment: '#EC4899',
  Other: '#6B7280',
};

export function TransactionListScreen({ navigation }: TransactionListScreenProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions({ limit: 50 });
      setTransactions(data);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Refresh when screen comes back into focus (after adding/editing transaction)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTransactions();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, []);

  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction');
  };

  const handleTransactionPress = (transactionId: string) => {
    navigation.navigate('TransactionDetail', { transactionId });
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const categoryColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const formattedAmount = formatCurrency(item.amount);

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() => handleTransactionPress(item.id)}
        activeOpacity={0.7}
      >
        {/* Category color indicator */}
        <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />

        {/* Transaction info */}
        <View style={styles.transactionInfo}>
          <Text style={styles.merchantText}>{item.merchant}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {item.category}
            </Text>
            <Text style={styles.dateText}> • {formattedDate}</Text>
          </View>
        </View>

        {/* Amount */}
        <Text style={styles.amountText}>{formattedAmount}</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💸</Text>
      <Text style={styles.emptyStateTitle}>No transactions yet</Text>
      <Text style={styles.emptyStateText}>
        Tap the + button to add your first transaction
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddTransaction}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction list */}
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          transactions.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFF',
  },
  listContent: {
    padding: 20,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  merchantText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
