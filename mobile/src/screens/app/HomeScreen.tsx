/**
 * HomeScreen
 *
 * Main dashboard with navigation cards to key features.
 * Uses design system components for consistent styling.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCoaching } from '../../contexts/CoachingContext';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { CoachPrompt } from '../../components/coaching';
import { hapticLight } from '../../utils/haptics';

interface HomeScreenProps {
  navigation: any;
}

interface FeatureCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  accentColor: string;
  onPress: () => void;
}

function FeatureCard({ emoji, title, subtitle, accentColor, onPress }: FeatureCardProps) {
  const colors = useColors();

  const handlePress = () => {
    hapticLight();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.featureCard,
        { backgroundColor: accentColor + '15' },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const colors = useColors();
  const { signOut, state } = useAuth();
  const { coaching, dismissCoaching } = useCoaching();

  const handleLogout = async () => {
    await signOut();
  };

  const mainFeatures = [
    {
      emoji: '💰',
      title: 'Budget',
      subtitle: 'Pay Yourself First',
      accentColor: colors.primary,
      screen: 'BudgetDashboard',
    },
    {
      emoji: '📝',
      title: 'Transactions',
      subtitle: 'Track spending',
      accentColor: colors.success,
      screen: 'TransactionList',
    },
    {
      emoji: '📈',
      title: 'Net Worth',
      subtitle: 'Assets & liabilities',
      accentColor: colors.warning,
      screen: 'NetWorthDashboard',
    },
    {
      emoji: '🔒',
      title: 'Security',
      subtitle: '2FA & biometrics',
      accentColor: '#A855F7',
      screen: 'SecuritySettings',
    },
  ];

  const journeyFeatures = [
    {
      icon: 'map' as const,
      title: 'Money Map',
      subtitle: 'See your path to sovereignty',
      screen: 'MoneyMap',
    },
    {
      icon: 'trending-up' as const,
      title: 'What If?',
      subtitle: 'Run scenario simulations',
      screen: 'Scenario',
    },
  ];

  const wealthFeatures = [
    {
      icon: 'target' as const,
      title: 'Your Wealth Path',
      subtitle: 'Tax-advantaged accounts in the right order',
      screen: 'WealthPath',
    },
    {
      icon: 'book-open' as const,
      title: 'Learn to Invest',
      subtitle: 'ETF-first philosophy for long-term wealth',
      screen: 'InvestingLearn',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Dynastia</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {state.user?.firstName
            ? `Hi ${state.user.firstName}!`
            : 'Your wealth journey starts here.'}
        </Text>
      </View>

      {/* Contextual Coach Prompt */}
      {coaching?.hasMessage && (
        <CoachPrompt
          coaching={coaching}
          onDismiss={dismissCoaching}
          style={{ marginBottom: tokens.spacing.md }}
        />
      )}

      {/* Financial Intelligence Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Financial Journey
        </Text>
        <View style={styles.journeyRow}>
          {journeyFeatures.map((feature) => (
            <TouchableOpacity
              key={feature.screen}
              style={[styles.journeyCard, { backgroundColor: colors.card }]}
              onPress={() => {
                hapticLight();
                navigation.navigate(feature.screen as any);
              }}
              activeOpacity={0.7}
            >
              <Feather name={feature.icon} size={24} color={colors.primary} />
              <Text style={[styles.journeyTitle, { color: colors.text }]}>
                {feature.title}
              </Text>
              <Text style={[styles.journeySubtitle, { color: colors.textSecondary }]}>
                {feature.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Build Wealth Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Build Wealth
        </Text>
        <View style={styles.journeyRow}>
          {wealthFeatures.map((feature) => (
            <TouchableOpacity
              key={feature.screen}
              style={[styles.journeyCard, { backgroundColor: colors.card }]}
              onPress={() => {
                hapticLight();
                navigation.navigate(feature.screen as any);
              }}
              activeOpacity={0.7}
            >
              <Feather name={feature.icon} size={24} color={colors.success} />
              <Text style={[styles.journeyTitle, { color: colors.text }]}>
                {feature.title}
              </Text>
              <Text style={[styles.journeySubtitle, { color: colors.textSecondary }]}>
                {feature.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Features */}
      <View style={styles.cardsGrid}>
        {mainFeatures.map((feature) => (
          <FeatureCard
            key={feature.screen}
            emoji={feature.emoji}
            title={feature.title}
            subtitle={feature.subtitle}
            accentColor={feature.accentColor}
            onPress={() => navigation.navigate(feature.screen)}
          />
        ))}
      </View>

      <Button
        variant="secondary"
        onPress={handleLogout}
        fullWidth
        style={styles.logoutButton}
      >
        Log Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: tokens.spacing.xl,
  },
  title: {
    fontSize: tokens.typography.sizes.displayMd.fontSize,
    fontWeight: tokens.typography.weights.bold,
    marginBottom: tokens.spacing.xs,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
  },
  section: {
    marginBottom: tokens.spacing.xl,
  },
  sectionTitle: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    marginBottom: tokens.spacing.md,
  },
  journeyRow: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  journeyCard: {
    flex: 1,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  journeyTitle: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    marginTop: tokens.spacing.sm,
  },
  journeySubtitle: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    textAlign: 'center',
    marginTop: tokens.spacing.xs,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  featureCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.md,
    justifyContent: 'space-between',
  },
  featureEmoji: {
    fontSize: 32,
  },
  featureTitle: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.semibold,
  },
  featureSubtitle: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  logoutButton: {
    marginTop: tokens.spacing.md,
  },
});
