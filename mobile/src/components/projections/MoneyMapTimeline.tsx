/**
 * MoneyMapTimeline Component
 *
 * Horizontal scrollable timeline showing Today -> Foundation -> Growth -> Sovereignty.
 * PLAN-02: Money Map visualization.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { TIER_NAMES } from '../../services/milestone.service';

interface MoneyMapStage {
  id: string;
  name: string;
  description: string;
  isComplete: boolean;
  isCurrent: boolean;
  icon: string;
  milestoneCount: { completed: number; total: number };
}

interface MoneyMapTimelineProps {
  currentTier: number;
  tierProgress: Record<number, { completed: number; total: number }>;
  onStagePress?: (stageId: string) => void;
}

const STAGES: Omit<MoneyMapStage, 'isComplete' | 'isCurrent' | 'milestoneCount'>[] = [
  {
    id: 'today',
    name: 'Today',
    description: 'Where your journey begins',
    icon: 'map-pin'
  },
  {
    id: 'foundation',
    name: TIER_NAMES[1],
    description: 'Emergency fund, first habits',
    icon: 'layers'
  },
  {
    id: 'stability',
    name: TIER_NAMES[2],
    description: '3+ months runway, autopilot',
    icon: 'shield'
  },
  {
    id: 'growth',
    name: TIER_NAMES[3],
    description: 'Investments growing',
    icon: 'trending-up'
  },
  {
    id: 'sovereignty',
    name: TIER_NAMES[4],
    description: 'Financial independence',
    icon: 'crown'
  }
];

export function MoneyMapTimeline({
  currentTier,
  tierProgress,
  onStagePress
}: MoneyMapTimelineProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const spacing = theme.tokens.spacing;
  const borderRadius = theme.tokens.radius;

  const getStageData = (stage: typeof STAGES[0], index: number): MoneyMapStage => {
    // "today" is always complete (index 0)
    if (index === 0) {
      return {
        ...stage,
        isComplete: true,
        isCurrent: currentTier === 1,
        milestoneCount: { completed: 0, total: 0 }
      };
    }

    // Map stage index to tier (1-4)
    const tier = index as 1 | 2 | 3 | 4;
    const progress = tierProgress[tier] || { completed: 0, total: 4 };
    const isComplete = progress.completed === progress.total;
    const isCurrent = currentTier === tier;

    return {
      ...stage,
      isComplete,
      isCurrent,
      milestoneCount: progress
    };
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: spacing.md }
      ]}
    >
      {STAGES.map((stage, index) => {
        const stageData = getStageData(stage, index);
        const isLast = index === STAGES.length - 1;

        return (
          <View key={stage.id} style={styles.stageWrapper}>
            {/* Stage node */}
            <TouchableOpacity
              style={[
                styles.stageNode,
                {
                  backgroundColor: stageData.isComplete
                    ? colors.primary
                    : stageData.isCurrent
                    ? colors.primaryLight
                    : colors.backgroundSecondary,
                  borderColor: stageData.isCurrent
                    ? colors.primary
                    : 'transparent',
                  borderWidth: stageData.isCurrent ? 3 : 0
                }
              ]}
              onPress={() => onStagePress?.(stage.id)}
              disabled={!onStagePress}
            >
              <Feather
                name={stage.icon as any}
                size={24}
                color={
                  stageData.isComplete || stageData.isCurrent
                    ? '#FFFFFF'
                    : colors.textMuted
                }
              />
            </TouchableOpacity>

            {/* Stage label */}
            <Text
              style={[
                styles.stageName,
                {
                  color: stageData.isCurrent
                    ? colors.primary
                    : stageData.isComplete
                    ? colors.text
                    : colors.textMuted,
                  fontWeight: stageData.isCurrent ? '700' : '500'
                }
              ]}
            >
              {stage.name}
            </Text>

            {/* Progress indicator (not for 'today') */}
            {index > 0 && (
              <Text
                style={[
                  styles.stageProgress,
                  { color: colors.textSecondary }
                ]}
              >
                {stageData.milestoneCount.completed}/{stageData.milestoneCount.total}
              </Text>
            )}

            {/* Connecting line */}
            {!isLast && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: stageData.isComplete
                      ? colors.primary
                      : colors.border
                  }
                ]}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'flex-start'
  },
  stageWrapper: {
    alignItems: 'center',
    width: 90,
    position: 'relative'
  },
  stageNode: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stageName: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center'
  },
  stageProgress: {
    marginTop: 2,
    fontSize: 11
  },
  connector: {
    position: 'absolute',
    top: 26,
    left: 71,
    width: 38,
    height: 3,
    borderRadius: 1.5
  }
});

export default MoneyMapTimeline;
