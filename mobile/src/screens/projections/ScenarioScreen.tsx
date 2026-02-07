/**
 * ScenarioScreen
 *
 * "What if?" scenario simulations.
 * FREE-02: Run scenario simulations.
 * FREE-03: Runway visualization.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { ScenarioSlider, ScenarioVariable } from '../../components/projections/ScenarioSlider';
import { AnimatedCounterFallback as AnimatedCounter } from '../../components/projections/AnimatedCounter';
import { Card, Button } from '../../components/ui';
import {
  runScenario,
  ScenarioResult,
  formatMonthsToFI
} from '../../services/projections.service';
import { useBudget } from '../../contexts/BudgetContext';

// Simple debounce implementation
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export function ScenarioScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const spacing = theme.tokens.spacing;
  const borderRadius = theme.tokens.radius;

  const { state: budgetState } = useBudget();
  const budget = budgetState.currentBudget;

  const [selectedVariable, setSelectedVariable] = useState<ScenarioVariable>('savings_rate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  // Current values from budget
  const monthlyIncome = Number(budget?.totalIncome || 5000);
  const monthlyExpenses = Number(budget?.billsAmount || 0) + Number(budget?.lifestyleAmount || 3000);
  const monthlySavings = Number(budget?.savingsAmount || 500);
  const currentSavingsRate = monthlyIncome > 0
    ? Math.round((monthlySavings / monthlyIncome) * 100)
    : 10;

  // Slider values
  const [savingsRate, setSavingsRate] = useState(currentSavingsRate);
  const [income, setIncome] = useState(monthlyIncome);
  const [expenses, setExpenses] = useState(monthlyExpenses);

  // Get current slider value based on selected variable
  const getCurrentValue = () => {
    switch (selectedVariable) {
      case 'savings_rate': return currentSavingsRate;
      case 'income': return monthlyIncome;
      case 'expenses': return monthlyExpenses;
    }
  };

  const getSliderValue = () => {
    switch (selectedVariable) {
      case 'savings_rate': return savingsRate;
      case 'income': return income;
      case 'expenses': return expenses;
    }
  };

  const setSliderValue = (value: number) => {
    switch (selectedVariable) {
      case 'savings_rate': setSavingsRate(value); break;
      case 'income': setIncome(value); break;
      case 'expenses': setExpenses(value); break;
    }
  };

  // Run scenario (debounced)
  const runScenarioAPI = async (variable: ScenarioVariable, newValue: number) => {
    try {
      setLoading(true);
      const scenarioResult = await runScenario(
        {
          monthlyExpenses,
          currentSavings: 0,
          currentInvestments: 10000, // Placeholder
          monthlySavingsRate: monthlySavings
        },
        variable,
        newValue,
        10
      );
      setResult(scenarioResult);
    } catch (error) {
      console.error('Scenario error:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedRunScenario = useDebounce(runScenarioAPI, 500);

  useEffect(() => {
    debouncedRunScenario(selectedVariable, getSliderValue());
  }, [selectedVariable, savingsRate, income, expenses]);

  const getSliderConfig = () => {
    switch (selectedVariable) {
      case 'savings_rate':
        return { min: 0, max: 50, step: 1, format: (v: number) => `${v}%` };
      case 'income':
        return {
          min: Math.max(1000, monthlyIncome - 2000),
          max: monthlyIncome + 5000,
          step: 100,
          format: (v: number) => `$${v.toLocaleString()}`
        };
      case 'expenses':
        return {
          min: Math.max(500, monthlyExpenses - 2000),
          max: monthlyExpenses + 1000,
          step: 50,
          format: (v: number) => `$${v.toLocaleString()}`
        };
    }
  };

  const config = getSliderConfig();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          What If?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          See how changes affect your financial future
        </Text>

        {/* Variable selector */}
        <View style={[styles.variableSelector, { marginVertical: spacing.lg }]}>
          {(['savings_rate', 'income', 'expenses'] as ScenarioVariable[]).map(v => (
            <Button
              key={v}
              variant={selectedVariable === v ? 'primary' : 'secondary'}
              onPress={() => setSelectedVariable(v)}
              style={{ flex: 1, marginHorizontal: 4 }}
            >
              {v === 'savings_rate' ? 'Savings' : v === 'income' ? 'Income' : 'Expenses'}
            </Button>
          ))}
        </View>

        {/* Slider */}
        <ScenarioSlider
          variable={selectedVariable}
          currentValue={getCurrentValue()}
          value={getSliderValue()}
          onChange={setSliderValue}
          min={config.min}
          max={config.max}
          step={config.step}
          formatValue={config.format}
        />

        {/* Results */}
        {loading ? (
          <View style={[styles.loadingContainer, { marginTop: spacing.xl }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : result ? (
          <View style={{ marginTop: spacing.xl }}>
            {/* Months saved */}
            {result.monthsSaved > 0 && (
              <Card
                style={{
                  ...styles.resultCard,
                  backgroundColor: `${colors.success}15`,
                  padding: spacing.lg
                }}
              >
                <Text style={[styles.resultLabel, { color: colors.success }]}>
                  YOU WOULD REACH FI
                </Text>
                <View style={styles.resultRow}>
                  <AnimatedCounter
                    value={result.monthsSaved}
                    style={{ fontSize: 40, color: colors.success }}
                  />
                  <Text style={[styles.resultUnit, { color: colors.success }]}>
                    months sooner
                  </Text>
                </View>
              </Card>
            )}

            {/* Year by year projection */}
            <Card style={{ padding: spacing.lg, marginTop: spacing.md }}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                10-YEAR PROJECTION
              </Text>
              <AnimatedCounter
                value={result.finalBalance}
                prefix="$"
                style={{ fontSize: 32, color: colors.text }}
              />
              <Text style={[styles.projectionNote, { color: colors.textMuted }]}>
                Assuming 7% annual returns
              </Text>
            </Card>

            {/* Comparison */}
            <Card style={{ padding: spacing.lg, marginTop: spacing.md }}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                TIME TO FINANCIAL INDEPENDENCE
              </Text>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                  <Text style={[styles.comparisonLabel, { color: colors.textMuted }]}>
                    Current Path
                  </Text>
                  <Text style={[styles.comparisonValue, { color: colors.textSecondary }]}>
                    {formatMonthsToFI(result.originalFI.monthsToFI)}
                  </Text>
                </View>
                <View style={styles.comparisonItem}>
                  <Text style={[styles.comparisonLabel, { color: colors.textMuted }]}>
                    New Path
                  </Text>
                  <Text style={[styles.comparisonValue, { color: colors.primary }]}>
                    {formatMonthsToFI(result.newFI.monthsToFI)}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        ) : null}
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
  variableSelector: {
    flexDirection: 'row'
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20
  },
  resultCard: {
    borderRadius: 16
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8
  },
  resultUnit: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  projectionNote: {
    fontSize: 12,
    marginTop: 4
  },
  comparisonRow: {
    flexDirection: 'row',
    marginTop: 8
  },
  comparisonItem: {
    flex: 1
  },
  comparisonLabel: {
    fontSize: 12
  },
  comparisonValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4
  }
});

export default ScenarioScreen;
