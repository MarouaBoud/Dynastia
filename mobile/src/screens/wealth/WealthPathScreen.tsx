/**
 * WealthPathScreen
 *
 * Displays country-specific wealth-building guidance with priority-ordered checklist.
 * US users see 401k -> Roth IRA -> HSA order of operations.
 * EU users see Livret A -> PEA -> Assurance-vie order.
 *
 * COUNTRY-02: US guidance
 * COUNTRY-03: EU guidance
 * COUNTRY-04: Expat dual-country support
 * COUNTRY-06: Never show irrelevant advice
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Card } from '../../components/ui';
import { AccountGuidanceCard } from '../../components/wealth';
import {
  getWealthGuidance,
  WealthGuidanceResponse,
  getCurrencyForCountry,
} from '../../services/wealth.service';

// =============================================================================
// Component
// =============================================================================

export function WealthPathScreen() {
  const colors = useColors();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [guidance, setGuidance] = useState<WealthGuidanceResponse | null>(null);
  const [checkedAccounts, setCheckedAccounts] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Load guidance on mount
  useEffect(() => {
    loadGuidance();
  }, []);

  const loadGuidance = async () => {
    try {
      setError(null);
      const data = await getWealthGuidance();
      setGuidance(data);
    } catch (err) {
      console.error('Failed to load wealth guidance:', err);
      setError('Unable to load guidance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGuidance();
    setRefreshing(false);
  };

  // Toggle account as addressed
  const handleToggle = (accountId: string) => {
    setCheckedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  // Calculate progress
  const totalAccounts = guidance?.primaryAccounts.length || 0;
  const checkedCount = checkedAccounts.size;
  const progressPercent = totalAccounts > 0 ? (checkedCount / totalAccounts) * 100 : 0;

  // Get currency for primary country
  const primaryCurrency = guidance ? getCurrencyForCountry(guidance.primaryCountry) : 'USD';
  const secondaryCurrency = guidance?.secondaryCountry
    ? getCurrencyForCountry(guidance.secondaryCountry)
    : null;

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your wealth path...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !guidance) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Something went wrong'}
          </Text>
          <Text
            style={[styles.retryLink, { color: colors.primary }]}
            onPress={loadGuidance}
          >
            Tap to retry
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get section title based on country
  const getPrimarySectionTitle = () => {
    if (guidance.primaryCountry === 'US') {
      return 'US Tax-Advantaged Accounts';
    }
    if (guidance.primaryCountry === 'FR') {
      return 'French Investment Accounts';
    }
    return `${guidance.primaryCountry} Investment Path`;
  };

  const getSecondarySectionTitle = () => {
    if (guidance.secondaryCountry === 'US') {
      return 'US Tax-Advantaged Accounts';
    }
    if (guidance.secondaryCountry === 'FR') {
      return 'French Investment Accounts';
    }
    return `${guidance.secondaryCountry} Investment Path`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Your Wealth Path
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {guidance.primaryCountry === 'US'
              ? 'Tax-advantaged account order of operations'
              : 'Your country-specific investment priority'}
          </Text>
        </View>

        {/* Progress Summary Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              PROGRESS
            </Text>
            <Text style={[styles.progressCount, { color: colors.text }]}>
              {checkedCount} / {totalAccounts}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBar, { backgroundColor: colors.backgroundSecondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>

          {/* Completion message */}
          {checkedCount === totalAccounts && totalAccounts > 0 ? (
            <View style={styles.completionRow}>
              <Feather name="award" size={16} color={colors.success} />
              <Text style={[styles.completionText, { color: colors.success }]}>
                All accounts addressed!
              </Text>
            </View>
          ) : (
            <Text style={[styles.progressHint, { color: colors.textMuted }]}>
              Tap each account as you address it
            </Text>
          )}
        </Card>

        {/* Primary Country Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {getPrimarySectionTitle()}
        </Text>

        {guidance.primaryAccounts.map(account => (
          <AccountGuidanceCard
            key={account.id}
            account={account}
            isChecked={checkedAccounts.has(account.id)}
            onToggle={handleToggle}
            currency={primaryCurrency}
          />
        ))}

        {/* Secondary Country Section (Expat Support) */}
        {guidance.isExpat && guidance.secondaryAccounts.length > 0 && (
          <>
            <View style={styles.expatDivider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <View style={[styles.expatBadge, { backgroundColor: colors.primaryLight || colors.primary + '20' }]}>
                <Feather name="globe" size={14} color={colors.primary} />
                <Text style={[styles.expatText, { color: colors.primary }]}>
                  Expat Accounts
                </Text>
              </View>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {getSecondarySectionTitle()}
            </Text>

            {guidance.secondaryAccounts.map(account => (
              <AccountGuidanceCard
                key={account.id}
                account={account}
                isChecked={checkedAccounts.has(account.id)}
                onToggle={handleToggle}
                currency={secondaryCurrency || 'EUR'}
              />
            ))}
          </>
        )}

        {/* Order Note Card */}
        <Card style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={[styles.noteTitle, { color: colors.text }]}>
              Why this order?
            </Text>
          </View>
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            This order maximizes your tax advantages and builds wealth most efficiently.
            Work through each step before moving to the next. Take your time - financial
            sovereignty is a marathon, not a sprint.
          </Text>
        </Card>

        {/* Disclaimer */}
        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          This is general guidance, not personalized financial advice. Consult a qualified
          professional for your specific situation.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: tokens.spacing.md,
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.xl,
  },
  errorText: {
    fontSize: 16,
    marginTop: tokens.spacing.md,
    textAlign: 'center',
  },
  retryLink: {
    marginTop: tokens.spacing.md,
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    marginBottom: tokens.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: tokens.spacing.xxs,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  progressCard: {
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  progressCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: tokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: tokens.spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: tokens.spacing.md,
    marginTop: tokens.spacing.sm,
  },
  expatDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: tokens.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  expatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.full,
    marginHorizontal: tokens.spacing.sm,
  },
  expatText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: tokens.spacing.xs,
  },
  noteCard: {
    padding: tokens.spacing.lg,
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: tokens.spacing.sm,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 22,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: tokens.spacing.md,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default WealthPathScreen;
