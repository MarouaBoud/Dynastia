/**
 * SinkingFundsScreen
 *
 * Lists all savings goals with progress indicators.
 * Shows active and completed goals separately.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { SkeletonBudgetCard } from '../../components/ui/Skeleton';
import { SinkingFundCard } from '../../components/budget/SinkingFundCard';
import { getSinkingFunds, SinkingFund } from '../../services/sinkingFund.service';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { hapticLight } from '../../utils/haptics';

// =============================================================================
// Types
// =============================================================================

type SinkingFundsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SinkingFunds'>;

// =============================================================================
// Component
// =============================================================================

export function SinkingFundsScreen() {
  const colors = useColors();
  const navigation = useNavigation<SinkingFundsNavigationProp>();

  const [funds, setFunds] = useState<SinkingFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchFunds = useCallback(async () => {
    try {
      const data = await getSinkingFunds(true); // Include completed
      setFunds(data);
    } catch (error) {
      console.error('Error fetching sinking funds:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFunds();
  }, [fetchFunds]);

  const handleFundPress = (fund: SinkingFund) => {
    hapticLight();
    navigation.navigate('SinkingFundDetail', { fundId: fund.id });
  };

  const handleAddFund = () => {
    hapticLight();
    navigation.navigate('AddSinkingFund');
  };

  const activeFunds = funds.filter((f) => !f.isCompleted);
  const completedFunds = funds.filter((f) => f.isCompleted);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎯</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No savings goals yet
      </Text>
      <Text style={[styles.emptyText, { color: colors.textMuted }]}>
        What are you saving for? Create a goal and we'll help you get there.
      </Text>
      <Button onPress={handleAddFund} style={styles.emptyButton}>
        Create Your First Goal
      </Button>
    </View>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <SkeletonBudgetCard />
          <SkeletonBudgetCard />
        </View>
      );
    }

    if (funds.length === 0) {
      return renderEmptyState();
    }

    return (
      <>
        {/* Active Goals */}
        {activeFunds.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Active Goals
              </Text>
              <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
                {activeFunds.length}
              </Text>
            </View>
            {activeFunds.map((fund) => (
              <SinkingFundCard
                key={fund.id}
                fund={fund}
                onPress={() => handleFundPress(fund)}
              />
            ))}
          </>
        )}

        {/* Completed Goals */}
        {completedFunds.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.completedHeader}
              onPress={() => setShowCompleted(!showCompleted)}
            >
              <View style={styles.completedHeaderLeft}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Completed
                </Text>
                <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
                  {completedFunds.length}
                </Text>
              </View>
              <Text style={[styles.expandIcon, { color: colors.textMuted }]}>
                {showCompleted ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {showCompleted &&
              completedFunds.map((fund) => (
                <SinkingFundCard
                  key={fund.id}
                  fund={fund}
                  onPress={() => handleFundPress(fund)}
                />
              ))}
          </>
        )}
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={[1]}
        renderItem={() => renderContent()}
        keyExtractor={() => 'funds-content'}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      {funds.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAddFund}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  completedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  expandIcon: {
    fontSize: 12,
  },
  loadingContainer: {
    paddingHorizontal: tokens.spacing.lg,
    gap: tokens.spacing.md,
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

export default SinkingFundsScreen;
