/**
 * ScenarioSlider Component
 *
 * Single-variable adjustment slider for "What if?" scenarios.
 * Per CONTEXT.md: One variable at a time.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../theme/ThemeProvider';

export type ScenarioVariable = 'savings_rate' | 'income' | 'expenses';

interface ScenarioSliderProps {
  variable: ScenarioVariable;
  currentValue: number;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
}

const VARIABLE_CONFIG: Record<ScenarioVariable, {
  label: string;
  description: string;
  icon: string;
  unit: string;
}> = {
  savings_rate: {
    label: 'Savings Rate',
    description: 'What if you saved more each month?',
    icon: 'percent',
    unit: '%'
  },
  income: {
    label: 'Monthly Income',
    description: 'What if your income increased?',
    icon: 'dollar-sign',
    unit: ''
  },
  expenses: {
    label: 'Monthly Expenses',
    description: 'What if you reduced spending?',
    icon: 'shopping-cart',
    unit: ''
  }
};

export function ScenarioSlider({
  variable,
  currentValue,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue
}: ScenarioSliderProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const spacing = theme.tokens.spacing;
  const borderRadius = theme.tokens.radius;

  const config = VARIABLE_CONFIG[variable];

  const displayValue = formatValue
    ? formatValue(value)
    : variable === 'savings_rate'
    ? `${value}%`
    : value.toLocaleString();

  const displayCurrent = formatValue
    ? formatValue(currentValue)
    : variable === 'savings_rate'
    ? `${currentValue}%`
    : currentValue.toLocaleString();

  const changeAmount = value - currentValue;
  const changePercent = currentValue > 0
    ? Math.round((changeAmount / currentValue) * 100)
    : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          padding: spacing.md
        }
      ]}
    >
      {/* Header */}
      <Text style={[styles.label, { color: colors.text }]}>
        {config.label}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {config.description}
      </Text>

      {/* Value display */}
      <View style={[styles.valueRow, { marginTop: spacing.md }]}>
        <View>
          <Text style={[styles.valueLabel, { color: colors.textMuted }]}>
            Current
          </Text>
          <Text style={[styles.value, { color: colors.textSecondary }]}>
            {displayCurrent}
          </Text>
        </View>
        <View style={styles.arrow}>
          <Text style={{ color: colors.textMuted }}>→</Text>
        </View>
        <View>
          <Text style={[styles.valueLabel, { color: colors.textMuted }]}>
            New
          </Text>
          <Text
            style={[
              styles.value,
              {
                color: changeAmount > 0 ? colors.success : colors.text
              }
            ]}
          >
            {displayValue}
          </Text>
        </View>
        {changeAmount !== 0 && (
          <View
            style={[
              styles.changeBadge,
              {
                backgroundColor: changeAmount > 0
                  ? `${colors.success}20`
                  : `${colors.warning}20`
              }
            ]}
          >
            <Text
              style={[
                styles.changeText,
                {
                  color: changeAmount > 0 ? colors.success : colors.warning
                }
              ]}
            >
              {changeAmount > 0 ? '+' : ''}{changePercent}%
            </Text>
          </View>
        )}
      </View>

      {/* Slider */}
      <Slider
        style={[styles.slider, { marginTop: spacing.sm }]}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />

      {/* Min/Max labels */}
      <View style={styles.rangeLabels}>
        <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>
          {formatValue ? formatValue(min) : min}
        </Text>
        <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>
          {formatValue ? formatValue(max) : max}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  label: {
    fontSize: 16,
    fontWeight: '600'
  },
  description: {
    fontSize: 13,
    marginTop: 4
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  valueLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  value: {
    fontSize: 24,
    fontWeight: '700'
  },
  arrow: {
    marginHorizontal: 16
  },
  changeBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600'
  },
  slider: {
    width: '100%',
    height: 40
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rangeLabel: {
    fontSize: 11
  }
});

export default ScenarioSlider;
