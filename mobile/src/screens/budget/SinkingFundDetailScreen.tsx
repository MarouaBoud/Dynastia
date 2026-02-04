/**
 * SinkingFundDetailScreen
 *
 * Shows savings goal details, progress, and allows contributions.
 * Displays celebration modal when goal is reached.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MoneyText } from '../../components/ui/MoneyText';
import { CurrencyInput } from '../../components/forms/CurrencyInput';
import {
  getSinkingFund,
  contributeTo,
  deleteSinkingFund,
  SinkingFund,
  formatMonthsRemaining,
  previewProgress,
} from '../../services/sinkingFund.service';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { hapticSuccess, hapticError, hapticWarning, hapticHeavy } from '../../utils/haptics';

// =============================================================================
// Types
// =============================================================================

type SinkingFundDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SinkingFundDetail'>;
type SinkingFundDetailRouteProp = RouteProp<RootStackParamList, 'SinkingFundDetail'>;

// =============================================================================
// Component
// =============================================================================

export function SinkingFundDetailScreen() {
  const colors = useColors();
  const navigation = useNavigation<SinkingFundDetailNavigationProp>();
  const route = useRoute<SinkingFundDetailRouteProp>();
  const { fundId } = route.params;

  const [fund, setFund] = useState<SinkingFund | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(0);
  const [contributing, setContributing] = useState(false);

  const fetchFund = useCallback(async () => {
    try {
      const data = await getSinkingFund(fundId);
      setFund(data);
    } catch (error) {
      console.error('Error fetching fund:', error);
      Alert.alert('Error', 'Could not load goal details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [fundId, navigation]);

  useEffect(() => {
    fetchFund();
  }, [fetchFund]);

  const handleContribute = async () => {
    if (!fund || contributionAmount <= 0) return;

    setContributing(true);
    try {
      const result = await contributeTo(fundId, contributionAmount);
      hapticSuccess();
      setShowContributeModal(false);
      setContributionAmount(0);
      setFund(result);

      if (result.justCompleted) {
        hapticHeavy();
        setShowCelebrationModal(true);
      }
    } catch (error) {
      hapticError();
      Alert.alert('Error', 'Could not add contribution');
    } finally {
      setContributing(false);
    }
  };

  const handleDelete = () => {
    hapticWarning();
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this savings goal? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSinkingFund(fundId);
              hapticSuccess();
              navigation.goBack();
            } catch (error) {
              hapticError();
              Alert.alert('Error', 'Could not delete goal');
            }
          },
        },
      ]
    );
  };

  const previewNewProgress = fund && contributionAmount > 0
    ? previewProgress(fund, contributionAmount)
    : null;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!fund) return null;

  const progress = fund.progress || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressCircleContainer}>
            <View style={[styles.progressCircle, { borderColor: colors.primary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: fund.isCompleted ? colors.success : colors.primary,
                    height: `${Math.min(100, progress)}%`,
                  },
                ]}
              />
              <View style={styles.progressTextContainer}>
                <Text style={[styles.progressPercent, { color: colors.text }]}>
                  {Math.round(progress)}%
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.fundName, { color: colors.text }]}>{fund.name}</Text>

          <View style={styles.amountDisplay}>
            <MoneyText value={fund.currentAmount} size="xl" />
            <Text style={[styles.ofText, { color: colors.textMuted }]}> of </Text>
            <MoneyText value={fund.targetAmount} size="lg" variant="muted" />
          </View>

          {!fund.isCompleted && fund.monthsRemaining !== undefined && (
            <Text style={[styles.deadline, { color: colors.textMuted }]}>
              {formatMonthsRemaining(fund.monthsRemaining)}
            </Text>
          )}

          {fund.isCompleted && (
            <View style={[styles.completedBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.completedText, { color: colors.success }]}>
                🎉 Goal Reached!
              </Text>
            </View>
          )}
        </Card>

        {/* Monthly Contribution */}
        {!fund.isCompleted && fund.monthlyContribution && fund.monthlyContribution > 0 && (
          <Card style={styles.infoCard}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Recommended Monthly Contribution
            </Text>
            <MoneyText value={fund.monthlyContribution} size="lg" />
          </Card>
        )}

        {/* Details */}
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
              Target Date
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {format(new Date(fund.deadline), 'MMMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
              Remaining to Save
            </Text>
            <MoneyText
              value={Math.max(0, fund.targetAmount - fund.currentAmount)}
              size="sm"
            />
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
              Created
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {format(new Date(fund.createdAt), 'MMM d, yyyy')}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          {!fund.isCompleted && (
            <Button
              onPress={() => setShowContributeModal(true)}
              fullWidth
            >
              Add Contribution
            </Button>
          )}

          <Button
            onPress={handleDelete}
            variant="danger"
            fullWidth
            style={styles.deleteButton}
          >
            Delete Goal
          </Button>
        </View>
      </ScrollView>

      {/* Contribution Modal */}
      <Modal
        visible={showContributeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowContributeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add to {fund.name}
            </Text>

            <View style={styles.modalAmountSection}>
              <CurrencyInput
                value={contributionAmount}
                onChange={setContributionAmount}
                placeholder="0.00"
              />
            </View>

            {/* Quick amounts */}
            <View style={styles.quickAmounts}>
              {[5000, 10000, 20000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.quickAmountButton, { borderColor: colors.border }]}
                  onPress={() => setContributionAmount(amount)}
                >
                  <Text style={[styles.quickAmountText, { color: colors.text }]}>
                    ${amount / 100}
                  </Text>
                </TouchableOpacity>
              ))}
              {fund.monthlyContribution && fund.monthlyContribution > 0 && (
                <TouchableOpacity
                  style={[styles.quickAmountButton, { borderColor: colors.primary }]}
                  onPress={() => setContributionAmount(fund.monthlyContribution!)}
                >
                  <Text style={[styles.quickAmountText, { color: colors.primary }]}>
                    Monthly
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Preview */}
            {previewNewProgress !== null && (
              <View style={styles.previewSection}>
                <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
                  New Progress
                </Text>
                <Text style={[styles.previewValue, { color: colors.success }]}>
                  {Math.round(previewNewProgress)}%
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <Button
                variant="ghost"
                onPress={() => {
                  setShowContributeModal(false);
                  setContributionAmount(0);
                }}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                onPress={handleContribute}
                loading={contributing}
                disabled={contributionAmount <= 0}
                style={styles.modalButton}
              >
                Add
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Celebration Modal */}
      <Modal
        visible={showCelebrationModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCelebrationModal(false)}
      >
        <View style={[styles.celebrationOverlay, { backgroundColor: colors.primary }]}>
          <View style={styles.celebrationContent}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>You did it!</Text>
            <Text style={styles.celebrationName}>{fund.name}</Text>
            <MoneyText
              value={fund.targetAmount}
              size="hero"
              style={styles.celebrationAmount}
            />
            <Text style={styles.celebrationMessage}>
              You saved {formatCurrency(fund.targetAmount)} for {fund.name}.{'\n'}
              That's the power of planning ahead.
            </Text>

            <View style={styles.celebrationActions}>
              <Button
                variant="secondary"
                onPress={() => {
                  setShowCelebrationModal(false);
                  navigation.navigate('AddSinkingFund');
                }}
                style={styles.celebrationButton}
              >
                Create Another Goal
              </Button>
              <Button
                variant="ghost"
                onPress={() => setShowCelebrationModal(false)}
                textStyle={{ color: '#FFFFFF' }}
              >
                Close
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
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
  progressCard: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
  },
  progressCircleContainer: {
    marginBottom: tokens.spacing.lg,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: tokens.typography.sizes.headingLg.fontSize,
    fontWeight: tokens.typography.weights.bold,
  },
  fundName: {
    fontSize: tokens.typography.sizes.headingLg.fontSize,
    fontWeight: tokens.typography.weights.bold,
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: tokens.spacing.sm,
  },
  ofText: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
  },
  deadline: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  completedBadge: {
    marginTop: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
  },
  completedText: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.semibold,
  },
  infoCard: {
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  infoLabel: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    marginBottom: tokens.spacing.xs,
  },
  detailsCard: {
    marginBottom: tokens.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
  },
  detailValue: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  actions: {
    marginTop: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  deleteButton: {
    marginTop: tokens.spacing.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    padding: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxl,
  },
  modalTitle: {
    fontSize: tokens.typography.sizes.headingMd.fontSize,
    fontWeight: tokens.typography.weights.bold,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
  },
  modalAmountSection: {
    marginBottom: tokens.spacing.lg,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  },
  quickAmountButton: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  previewLabel: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    marginBottom: tokens.spacing.xs,
  },
  previewValue: {
    fontSize: tokens.typography.sizes.headingMd.fontSize,
    fontWeight: tokens.typography.weights.bold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  // Celebration modal
  celebrationOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.xl,
  },
  celebrationContent: {
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: tokens.spacing.lg,
  },
  celebrationTitle: {
    fontSize: tokens.typography.sizes.displayMd.fontSize,
    fontWeight: tokens.typography.weights.bold,
    color: '#FFFFFF',
    marginBottom: tokens.spacing.sm,
  },
  celebrationName: {
    fontSize: tokens.typography.sizes.headingMd.fontSize,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: tokens.spacing.lg,
  },
  celebrationAmount: {
    color: '#FFFFFF',
    marginBottom: tokens.spacing.xl,
  },
  celebrationMessage: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: tokens.spacing.xxl,
  },
  celebrationActions: {
    gap: tokens.spacing.md,
    width: '100%',
  },
  celebrationButton: {
    borderColor: '#FFFFFF',
  },
});

export default SinkingFundDetailScreen;
