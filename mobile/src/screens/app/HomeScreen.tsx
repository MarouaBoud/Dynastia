/**
 * HomeScreen
 *
 * Main dashboard with navigation cards to key features.
 * Uses design system components for consistent styling.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
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

  const handleLogout = async () => {
    await signOut();
  };

  const features = [
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

      <View style={styles.cardsGrid}>
        {features.map((feature) => (
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
