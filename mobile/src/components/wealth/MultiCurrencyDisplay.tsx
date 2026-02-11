/**
 * Multi-Currency Display Component
 *
 * Displays an amount in primary currency with optional secondary currency conversion.
 * Used for expat users to see their net worth in both their primary and secondary currencies.
 * Fetches live exchange rates with loading indicator.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { convertCurrency, CURRENCY_SYMBOLS } from '../../services/currency.service';

// =============================================================================
// Types
// =============================================================================

export interface MultiCurrencyDisplayProps {
  /** Amount in primary currency (can be cents or whole units depending on use case) */
  amount: number;
  /** Primary currency code (ISO 4217) */
  primaryCurrency: string;
  /** Optional secondary currency code for expat users */
  secondaryCurrency?: string | null;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom primary amount text style */
  primaryStyle?: TextStyle;
  /** Custom secondary amount text style */
  secondaryStyle?: TextStyle;
  /** If true, amount is in cents and will be converted to display units */
  amountInCents?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function MultiCurrencyDisplay({
  amount,
  primaryCurrency,
  secondaryCurrency,
  style,
  primaryStyle,
  secondaryStyle,
  amountInCents = false,
}: MultiCurrencyDisplayProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Convert to display units if in cents
  const displayAmount = amountInCents ? amount / 100 : amount;

  // Fetch conversion when secondary currency is set and different from primary
  useEffect(() => {
    let isMounted = true;

    if (secondaryCurrency && secondaryCurrency !== primaryCurrency) {
      setLoading(true);
      convertCurrency(displayAmount, primaryCurrency, secondaryCurrency)
        .then((converted) => {
          if (isMounted) {
            setConvertedAmount(converted);
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    } else {
      setConvertedAmount(null);
    }

    return () => {
      isMounted = false;
    };
  }, [displayAmount, primaryCurrency, secondaryCurrency]);

  /**
   * Format amount for display with currency symbol
   */
  const formatAmount = (value: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formattedValue = value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${symbol}${formattedValue}`;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Primary amount */}
      <Text style={[styles.primaryAmount, { color: colors.text }, primaryStyle]}>
        {formatAmount(displayAmount, primaryCurrency)}
      </Text>

      {/* Secondary amount with approximately symbol */}
      {secondaryCurrency && secondaryCurrency !== primaryCurrency && (
        <Text style={[styles.secondaryAmount, { color: colors.textMuted }, secondaryStyle]}>
          {loading ? '...' : convertedAmount !== null ? `≈ ${formatAmount(convertedAmount, secondaryCurrency)}` : ''}
        </Text>
      )}
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  primaryAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  secondaryAmount: {
    fontSize: 16,
    marginTop: 4,
  },
});

export default MultiCurrencyDisplay;
