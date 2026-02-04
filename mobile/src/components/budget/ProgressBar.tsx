import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100+
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
}

/**
 * Get color based on progress percentage
 */
function getProgressColor(progress: number): string {
  if (progress < 90) return '#10B981'; // Green - on track
  if (progress < 100) return '#F59E0B'; // Amber - warning
  return '#EF4444'; // Red - over budget
}

/**
 * Animated progress bar with color transitions
 */
export function ProgressBar({
  progress,
  height = 8,
  showPercentage = false,
  animated = true,
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  // Clamp progress for display (show overflow indicator separately)
  const displayProgress = Math.min(progress, 100);
  const isOverBudget = progress > 100;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: displayProgress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(displayProgress);
    }
  }, [displayProgress, animated]);

  const width = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const color = getProgressColor(progress);

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width,
              backgroundColor: color,
              height,
            },
          ]}
        />
        {isOverBudget && (
          <View style={[styles.overflowIndicator, { height }]} />
        )}
      </View>
      {showPercentage && (
        <Text style={[styles.percentage, { color }]}>
          {Math.round(progress)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  overflowIndicator: {
    position: 'absolute',
    right: 0,
    width: 4,
    backgroundColor: '#EF4444',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  percentage: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
});
