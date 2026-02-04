/**
 * TransactionListScreen
 *
 * List of all transactions with category colors and pull-to-refresh.
 * Uses design system components for consistent styling.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getTransactions, Transaction } from '../../services/transactions.service';
import { formatCurrency } from '../../utils/currency';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { SkeletonListItem, SkeletonGroup } from '../../components/ui/Skeleton';
import { hapticLight } from '../../utils/haptics';

type RootStackParamList = {
  TransactionList: undefined;
  AddTransaction: undefined;
  TransactionDetail: { transactionId: string };
};

type TransactionListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TransactionList'>;
};

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
  const colors = useColors();
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
    hapticLight();
    navigation.navigate('AddTransaction');
  };

  const handleTransactionPress = (transactionId: string) => {
    hapticLight();
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
        style={[styles.transactionCard, { backgroundColor: colors.card }]}
        onPress={() => handleTransactionPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
        <View style={styles.transactionInfo}>
          <Text style={[styles.merchantText, { color: colors.text }]}>{item.merchant}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {item.category}
            </Text>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>
              {' '}• {formattedDate}
            </Text>
          </View>
        </View>
        <Text style={[styles.amountText, { color: colors.text }]}>{formattedAmount}</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💸</Text>
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        No transactions yet
      </Text>
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        Tap the + button to add your first transaction
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <SkeletonGroup>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonListItem key={i} />
        ))}
      </SkeletonGroup>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transactions</Text>
          <View style={[styles.addButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.addButtonText}>+</Text>
          </View>
        </View>
        {renderLoadingState()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transactions</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddTransaction}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          transactions.length === 0 ? styles.listContentEmpty : {},
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: tokens.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: 60,
    paddingBottom: tokens.spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: tokens.typography.sizes.headingLg.fontSize,
    fontWeight: tokens.typography.weights.bold,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: tokens.typography.weights.regular,
    color: '#FFF',
  },
  listContent: {
    padding: tokens.spacing.lg,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
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
    marginRight: tokens.spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  merchantText: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    marginBottom: tokens.spacing.xxs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  dateText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  amountText: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xxl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: tokens.spacing.md,
  },
  emptyStateTitle: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    marginBottom: tokens.spacing.xs,
  },
  emptyStateText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing.xxl,
  },
});
