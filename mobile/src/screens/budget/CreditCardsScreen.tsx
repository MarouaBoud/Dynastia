/**
 * CreditCardsScreen
 *
 * Displays all credit cards with tracking for paid-in-full streaks.
 * Celebrates 3-month milestone.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CreditCardItem } from '../../components/budget/CreditCardItem';
import { InterestEducation } from '../../components/budget/InterestEducation';
import { CreditCardMilestoneModal } from '../../components/budget/CreditCardMilestoneModal';
import { SkeletonCard, SkeletonGroup } from '../../components/ui/Skeleton';
import { getBills, markBillPaid, Bill } from '../../services/bill.service';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { hapticSuccess, hapticError } from '../../utils/haptics';

type CreditCardsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function CreditCardsScreen() {
  const colors = useColors();
  const navigation = useNavigation<CreditCardsNavigationProp>();

  const [creditCards, setCreditCards] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneCard, setMilestoneCard] = useState<Bill | null>(null);

  const loadCreditCards = async () => {
    try {
      const bills = await getBills();
      const cards = bills.filter((b) => b.isCreditCard);
      setCreditCards(cards);
    } catch (error) {
      console.error('Error loading credit cards:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCreditCards();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCreditCards();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCreditCards();
  }, []);

  const handleCardPress = (cardId: string) => {
    navigation.navigate('BillDetail', { billId: cardId });
  };

  const handleMarkPaid = async (card: Bill, paidInFull: boolean) => {
    try {
      const updatedBill = await markBillPaid(card.id, paidInFull);

      // Check if milestone achieved (3 months paid in full)
      if (paidInFull && updatedBill.consecutivePaidInFull === 3) {
        setMilestoneCard(card);
        setShowMilestone(true);
        hapticSuccess();
      } else {
        hapticSuccess();
      }

      // Refresh the list
      loadCreditCards();
    } catch (error: any) {
      hapticError();
      Alert.alert(
        'Could not update payment',
        error.response?.data?.error || 'Something went wrong. Please try again.'
      );
    }
  };

  const handleAddCreditCard = () => {
    // Navigate to AddBill with credit card pre-selected
    // For now, just navigate to AddBill
    navigation.navigate('AddBill');
  };

  const handleDismissMilestone = () => {
    setShowMilestone(false);
    setMilestoneCard(null);
  };

  // Calculate total interest cost
  const totalMonthlyInterest = creditCards.reduce((sum, card) => {
    if (card.creditCardApr) {
      return sum + Math.round((card.amount * (card.creditCardApr / 100)) / 12);
    }
    return sum;
  }, 0);

  // Get card with highest balance for education component
  const highestBalanceCard = creditCards.reduce(
    (max, card) => (card.amount > (max?.amount || 0) ? card : max),
    null as Bill | null
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💳</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No credit cards tracked
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Add your credit cards to track payments{'\n'}and build a paid-in-full streak.
      </Text>
      <Button onPress={handleAddCreditCard} style={styles.addButton}>
        Add Credit Card
      </Button>
    </View>
  );

  const renderLoadingState = () => (
    <SkeletonGroup>
      <SkeletonCard height={180} />
      <SkeletonCard height={180} />
    </SkeletonGroup>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {loading ? (
        renderLoadingState()
      ) : creditCards.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Summary Card */}
          {totalMonthlyInterest > 0 && (
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                  Total monthly interest
                </Text>
                <Text style={[styles.summaryValue, { color: colors.error }]}>
                  ~${(totalMonthlyInterest / 100).toFixed(0)}/mo
                </Text>
              </View>
              <Text style={[styles.summaryHint, { color: colors.textMuted }]}>
                Pay in full each month to keep this at $0
              </Text>
            </Card>
          )}

          {/* Credit Card List */}
          {creditCards.map((card) => (
            <CreditCardItem
              key={card.id}
              bill={card}
              onPress={() => handleCardPress(card.id)}
              onMarkPaid={(paidInFull) => handleMarkPaid(card, paidInFull)}
            />
          ))}

          {/* Interest Education */}
          {highestBalanceCard && highestBalanceCard.creditCardApr && (
            <InterestEducation
              balance={highestBalanceCard.amount}
              apr={highestBalanceCard.creditCardApr}
            />
          )}

          {/* Add Another Button */}
          <Button
            variant="secondary"
            onPress={handleAddCreditCard}
            fullWidth
            style={styles.addAnotherButton}
          >
            Add Another Credit Card
          </Button>
        </>
      )}

      {/* Milestone Celebration Modal */}
      <CreditCardMilestoneModal
        visible={showMilestone}
        cardName={milestoneCard?.name || ''}
        interestSaved={
          milestoneCard?.creditCardApr
            ? Math.round((milestoneCard.amount * (milestoneCard.creditCardApr / 100)) / 12) * 3
            : 0
        }
        onDismiss={handleDismissMilestone}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl * 2,
  },
  summaryCard: {
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  summaryLabel: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
  },
  summaryValue: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.bold,
  },
  summaryHint: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: tokens.spacing.lg,
  },
  emptyTitle: {
    fontSize: tokens.typography.sizes.headingMd.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    marginBottom: tokens.spacing.sm,
  },
  emptyText: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: tokens.spacing.xl,
  },
  addButton: {
    minWidth: 200,
  },
  addAnotherButton: {
    marginTop: tokens.spacing.lg,
  },
});

export default CreditCardsScreen;
