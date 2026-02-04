/**
 * BillDetailScreen
 *
 * Shows bill details including amount, due date, payment history,
 * and credit card specific info (APR, interest, streak).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MoneyText } from '../../components/ui/MoneyText';
import {
  getBill,
  deleteBill,
  markBillPaid,
  Bill,
  formatDueDate,
  getBillStatusColor,
} from '../../services/bill.service';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { hapticSuccess, hapticError, hapticWarning } from '../../utils/haptics';

// =============================================================================
// Types
// =============================================================================

type BillDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BillDetail'>;
type BillDetailRouteProp = RouteProp<RootStackParamList, 'BillDetail'>;

// =============================================================================
// Component
// =============================================================================

export function BillDetailScreen() {
  const colors = useColors();
  const navigation = useNavigation<BillDetailNavigationProp>();
  const route = useRoute<BillDetailRouteProp>();
  const { billId } = route.params;

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBill = useCallback(async () => {
    try {
      const data = await getBill(billId);
      setBill(data);
    } catch (error) {
      console.error('Error fetching bill:', error);
      Alert.alert('Error', 'Could not load bill details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [billId, navigation]);

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  const handleMarkPaid = async () => {
    if (!bill) return;

    if (bill.isCreditCard) {
      Alert.alert(
        'Mark as Paid',
        'Did you pay the full balance this month?',
        [
          {
            text: 'Partial Payment',
            onPress: () => markAsPaid(false),
          },
          {
            text: 'Paid in Full',
            style: 'default',
            onPress: () => markAsPaid(true),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      markAsPaid(undefined);
    }
  };

  const markAsPaid = async (paidInFull?: boolean) => {
    setActionLoading(true);
    try {
      const result = await markBillPaid(billId, paidInFull);
      hapticSuccess();

      if (result.milestoneAchieved) {
        Alert.alert(
          '🎉 Milestone Achieved!',
          "You've paid your credit card in full for 3 consecutive months. That's building real financial strength!",
          [{ text: 'Amazing!' }]
        );
      }

      fetchBill();
    } catch (error) {
      hapticError();
      Alert.alert('Error', 'Could not mark bill as paid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    hapticWarning();
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteBill(billId);
              hapticSuccess();
              navigation.goBack();
            } catch (error) {
              hapticError();
              Alert.alert('Error', 'Could not delete bill');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!bill) return null;

  const status = bill.status || 'upcoming';
  const statusColor = getBillStatusColor(status);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={styles.categoryEmoji}>
              {getCategoryEmoji(bill.category)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </Text>
          </View>
        </View>

        <Text style={[styles.billName, { color: colors.text }]}>{bill.name}</Text>

        <MoneyText value={bill.amount} size="hero" style={styles.amount} />

        <View style={styles.dueInfo}>
          <Text style={[styles.dueLabel, { color: colors.textMuted }]}>
            {bill.daysUntilDue !== undefined ? formatDueDate(bill.daysUntilDue) : 'No due date'}
          </Text>
          <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
            {format(new Date(bill.nextDueDate), 'MMMM d, yyyy')}
          </Text>
        </View>
      </Card>

      {/* Credit Card Info */}
      {bill.isCreditCard && (
        <Card style={styles.infoCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Credit Card Details
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>APR</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {bill.creditCardApr ? `${bill.creditCardApr}%` : 'Not set'}
            </Text>
          </View>

          {bill.monthlyInterestCost && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Monthly Interest Cost
              </Text>
              <MoneyText
                value={bill.monthlyInterestCost * 100}
                size="sm"
                variant="negative"
              />
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Paid in Full Streak
            </Text>
            <View style={styles.streakContainer}>
              <Text style={[styles.streakNumber, { color: colors.success }]}>
                {bill.consecutivePaidInFull}
              </Text>
              <Text style={[styles.streakLabel, { color: colors.textMuted }]}>
                {bill.consecutivePaidInFull === 1 ? 'month' : 'months'}
              </Text>
            </View>
          </View>

          {bill.consecutivePaidInFull >= 3 && (
            <View style={[styles.milestoneBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.milestoneText, { color: colors.success }]}>
                🏆 3+ months no interest — you're building wealth!
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* Bill Details */}
      <Card style={styles.infoCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Details</Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Category</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {bill.category.charAt(0).toUpperCase() + bill.category.slice(1)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Frequency</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {bill.frequency.charAt(0).toUpperCase() + bill.frequency.slice(1)}
          </Text>
        </View>

        {bill.lastPaidAt && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Last Paid</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {format(new Date(bill.lastPaidAt), 'MMM d, yyyy')}
            </Text>
          </View>
        )}
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          onPress={handleMarkPaid}
          loading={actionLoading}
          fullWidth
          variant="success"
        >
          Mark as Paid
        </Button>

        <Button
          onPress={handleDelete}
          variant="danger"
          fullWidth
          style={styles.deleteButton}
        >
          Delete Bill
        </Button>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    housing: '🏠',
    utilities: '⚡',
    subscription: '🔄',
    insurance: '🛡️',
    other: '📄',
  };
  return emojis[category] || '📄';
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    marginBottom: tokens.spacing.lg,
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: tokens.spacing.lg,
  },
  categoryBadge: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 28,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.full,
    gap: tokens.spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  billName: {
    fontSize: tokens.typography.sizes.headingLg.fontSize,
    fontWeight: tokens.typography.weights.bold,
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  amount: {
    marginBottom: tokens.spacing.md,
  },
  dueInfo: {
    alignItems: 'center',
  },
  dueLabel: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    marginBottom: tokens.spacing.xxs,
  },
  dueDate: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  infoCard: {
    marginBottom: tokens.spacing.lg,
  },
  cardTitle: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    marginBottom: tokens.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
  },
  infoValue: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: tokens.spacing.xs,
  },
  streakNumber: {
    fontSize: tokens.typography.sizes.headingMd.fontSize,
    fontWeight: tokens.typography.weights.bold,
  },
  streakLabel: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  milestoneBadge: {
    marginTop: tokens.spacing.md,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
  },
  milestoneText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
    textAlign: 'center',
  },
  actions: {
    marginTop: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  deleteButton: {
    marginTop: tokens.spacing.sm,
  },
});

export default BillDetailScreen;
