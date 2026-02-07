/**
 * AnimatedCounter Component
 *
 * Smooth number animations for financial projections.
 * Uses state-based animation with interval updates for smooth transitions.
 */

import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: TextStyle;
  locale?: string;
}

export function AnimatedCounter({
  value,
  duration = 1500,
  prefix = '',
  suffix = '',
  decimals = 0,
  style,
  locale = 'en-US'
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();
    const endTime = startTime + duration;

    const interval = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Ease-out cubic function
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(currentValue);

      if (progress >= 1) {
        clearInterval(interval);
        setDisplayValue(endValue);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [value, duration]);

  const formatted = displayValue.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <Text style={[styles.counter, style]}>
      {prefix}{formatted}{suffix}
    </Text>
  );
}

// Alternative fallback implementation (alias for compatibility)
export const AnimatedCounterFallback = AnimatedCounter;

const styles = StyleSheet.create({
  counter: {
    fontSize: 32,
    fontWeight: '700'
  }
});

export default AnimatedCounter;
