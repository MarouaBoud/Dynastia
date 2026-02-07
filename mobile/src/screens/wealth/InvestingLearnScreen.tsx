/**
 * Investing Learn Screen
 *
 * Investment education screen with 8 expandable modules covering ETF-first philosophy.
 * Implements WEALTH-01 (investment education), WEALTH-02 (compounding calculator),
 * WEALTH-04 (builds confidence, not trading behavior), WEALTH-06 (anti-features).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/ui';
import { CompoundingCalculator } from '../../components/wealth/CompoundingCalculator';
import { EDUCATION_MODULES, EducationModule } from '../../constants/education-content';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function InvestingLearnScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const spacing = theme.tokens.spacing;

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderModule = (module: EducationModule) => {
    const isExpanded = expandedModules.has(module.id);

    return (
      <Card key={module.id} style={styles.moduleCard}>
        <TouchableOpacity
          onPress={() => toggleModule(module.id)}
          style={styles.moduleHeader}
          activeOpacity={0.7}
        >
          <View style={styles.moduleHeaderText}>
            <Text style={[styles.moduleTitle, { color: colors.text }]}>
              {module.title}
            </Text>
            <Text style={[styles.moduleDuration, { color: colors.textMuted }]}>
              {module.duration}
              {module.hasInteractive && ' • Interactive'}
            </Text>
          </View>
          <Text style={[styles.expandIcon, { color: colors.textSecondary }]}>
            {isExpanded ? '-' : '+'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.moduleContent}>
            <Text style={[styles.content, { color: colors.text }]}>
              {module.content}
            </Text>

            {/* Interactive calculator for compound_growth module */}
            {module.hasInteractive && module.id === 'compound_growth' && (
              <View style={styles.calculatorContainer}>
                <CompoundingCalculator />
              </View>
            )}

            {/* Key takeaway */}
            <View style={[
              styles.takeawayBox,
              { backgroundColor: colors.primaryLight || colors.backgroundSecondary }
            ]}>
              <Text style={[styles.takeawayLabel, { color: colors.primary }]}>
                KEY TAKEAWAY
              </Text>
              <Text style={[styles.takeaway, { color: colors.text }]}>
                {module.keyTakeaway}
              </Text>
            </View>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          Learn to Invest
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Build wealth with confidence—no trading required
        </Text>

        {/* Progress */}
        <Card style={{ ...styles.progressCard, marginVertical: spacing.md }}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            YOUR PROGRESS
          </Text>
          <Text style={[styles.progressValue, { color: colors.text }]}>
            {expandedModules.size} / {EDUCATION_MODULES.length} modules explored
          </Text>
        </Card>

        {/* Education Modules */}
        {EDUCATION_MODULES.map(renderModule)}

        {/* Anti-features box - WEALTH-06 */}
        <Card style={{
          ...styles.antiFeatures,
          backgroundColor: colors.error ? `${colors.error}15` : '#FEE2E2'
        }}>
          <Text style={[styles.antiTitle, { color: colors.error || '#DC2626' }]}>
            What we won't teach you:
          </Text>
          <Text style={[styles.antiItem, { color: colors.text }]}>
            {'\u2022'} Day trading (speculation, not investing)
          </Text>
          <Text style={[styles.antiItem, { color: colors.text }]}>
            {'\u2022'} Stock picking (unnecessary risk)
          </Text>
          <Text style={[styles.antiItem, { color: colors.text }]}>
            {'\u2022'} Market timing (statistically loses money)
          </Text>
          <Text style={[styles.antiReason, { color: colors.textSecondary }]}>
            These behaviors destroy wealth. We focus on what actually works: diversification, low fees, time in the market.
          </Text>
        </Card>

        {/* Bottom spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    fontSize: 28,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4
  },
  progressCard: {
    padding: 16
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4
  },
  moduleCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden'
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  moduleHeaderText: {
    flex: 1
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  moduleDuration: {
    fontSize: 12,
    marginTop: 2
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: '300',
    width: 24,
    textAlign: 'center'
  },
  moduleContent: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  content: {
    fontSize: 14,
    lineHeight: 22
  },
  calculatorContainer: {
    marginTop: 16
  },
  takeawayBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8
  },
  takeawayLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1
  },
  takeaway: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4
  },
  antiFeatures: {
    marginTop: 8,
    padding: 16
  },
  antiTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  antiItem: {
    fontSize: 14,
    marginBottom: 4
  },
  antiReason: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic'
  }
});

export default InvestingLearnScreen;
