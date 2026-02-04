/**
 * BillsListScreen
 *
 * Lists all recurring bills with filter tabs (All, Upcoming, Credit Cards).
 * Bills are grouped by due date proximity.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SkeletonListItem } from '../../components/ui/Skeleton';
import { BillItem } from '../../components/budget/BillItem';
import {
  getBills,
  markBillPaid,
  Bill,
} from '../../services/bill.service';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { hapticSuccess, hapticLight } from '../../utils/haptics';

// =============================================================================
// Types
// =============================================================================

type FilterTab = 'all' | 'upcoming' | 'credit-cards';
type BillsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BillsList'>;

interface GroupedBills {
  thisWeek: Bill[];
  nextWeek: Bill[];
  later: Bill[];
  paid: Bill[];
}

// =============================================================================
// Component
// =============================================================================

export function BillsListScreen() {
  const colors = useColors();
  const navigation = useNavigation<BillsNavigationProp>();

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const fetchBills = useCallback(async () => {
    try {
      const filter = activeTab === 'all' ? undefined : activeTab;
      const data = await getBills(filter);
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBills();
  }, [fetchBills]);

  const handleTabChange = (tab: FilterTab) => {
    hapticLight();
    setActiveTab(tab);
    setLoading(true);
  };

  const handleBillPress = (bill: Bill) => {
    hapticLight();
    navigation.navigate('BillDetail', { billId: bill.id });
  };

  const handleMarkPaid = async (bill: Bill) => {
    try {
      await markBillPaid(bill.id, bill.isCreditCard ? true : undefined);
      hapticSuccess();
      fetchBills();
    } catch (error) {
      console.error('Error marking bill paid:', error);
    }
  };

  const handleAddBill = () => {
    hapticLight();
    navigation.navigate('AddBill');
  };

  // Group bills by due date
  const groupedBills: GroupedBills = {
    thisWeek: [],
    nextWeek: [],
    later: [],
    paid: [],
  };

  bills.forEach((bill) => {
    if (bill.status === 'paid') {
      groupedBills.paid.push(bill);
    } else if (bill.daysUntilDue !== undefined) {
      if (bill.daysUntilDue <= 7) {
        groupedBills.thisWeek.push(bill);
      } else if (bill.daysUntilDue <= 14) {
        groupedBills.nextWeek.push(bill);
      } else {
        groupedBills.later.push(bill);
      }
    } else {
      groupedBills.later.push(bill);
    }
  });

  const renderSectionHeader = (title: string, count: number) => {
    if (count === 0) return null;
    return (
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {title}
        </Text>
        <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
          {count}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No bills yet
      </Text>
      <Text style={[styles.emptyText, { color: colors.textMuted }]}>
        Add your first recurring bill to start tracking your expenses.
      </Text>
      <Button onPress={handleAddBill} style={styles.emptyButton}>
        Add Your First Bill
      </Button>
    </View>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
        </View>
      );
    }

    if (bills.length === 0) {
      return renderEmptyState();
    }

    return (
      <>
        {/* This Week */}
        {renderSectionHeader('This Week', groupedBills.thisWeek.length)}
        {groupedBills.thisWeek.map((bill) => (
          <BillItem
            key={bill.id}
            bill={bill}
            onPress={() => handleBillPress(bill)}
            onMarkPaid={() => handleMarkPaid(bill)}
          />
        ))}

        {/* Next Week */}
        {renderSectionHeader('Next Week', groupedBills.nextWeek.length)}
        {groupedBills.nextWeek.map((bill) => (
          <BillItem
            key={bill.id}
            bill={bill}
            onPress={() => handleBillPress(bill)}
            onMarkPaid={() => handleMarkPaid(bill)}
          />
        ))}

        {/* Later */}
        {renderSectionHeader('Later', groupedBills.later.length)}
        {groupedBills.later.map((bill) => (
          <BillItem
            key={bill.id}
            bill={bill}
            onPress={() => handleBillPress(bill)}
            onMarkPaid={() => handleMarkPaid(bill)}
          />
        ))}

        {/* Paid (collapsed) */}
        {groupedBills.paid.length > 0 && (
          <>
            {renderSectionHeader('Paid This Period', groupedBills.paid.length)}
            {groupedBills.paid.map((bill) => (
              <BillItem
                key={bill.id}
                bill={bill}
                onPress={() => handleBillPress(bill)}
                onMarkPaid={() => handleMarkPaid(bill)}
              />
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        {(['all', 'upcoming', 'credit-cards'] as FilterTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: colors.primary + '20' },
            ]}
            onPress={() => handleTabChange(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? colors.primary : colors.textMuted },
              ]}
            >
              {tab === 'all' ? 'All' : tab === 'upcoming' ? 'Upcoming' : 'Credit Cards'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bills List */}
      <FlatList
        data={[1]} // Single item to render all content
        renderItem={() => renderContent()}
        keyExtractor={() => 'bills-content'}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      {bills.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAddBill}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </GestureHandlerRootView>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: tokens.spacing.sm,
    marginHorizontal: tokens.spacing.lg,
    marginTop: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    gap: tokens.spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  listContent: {
    paddingTop: tokens.spacing.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  sectionTitle: {
    fontSize: tokens.typography.sizes.label.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  loadingContainer: {
    paddingTop: tokens.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: tokens.spacing.lg,
  },
  emptyTitle: {
    fontSize: tokens.typography.sizes.headingMd.fontSize,
    fontWeight: tokens.typography.weights.bold,
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
    lineHeight: tokens.typography.sizes.bodyMd.lineHeight,
  },
  emptyButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    right: tokens.spacing.lg,
    bottom: tokens.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.lg,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: tokens.typography.weights.medium,
    marginTop: -2,
  },
});

export default BillsListScreen;
