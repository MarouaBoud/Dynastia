/**
 * Tier Progress Card
 *
 * Shows milestone progress within a tier with locked/unlocked state.
 * Uses progressive disclosure (locked tiers show blurred content).
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';
import {
  MilestoneDefinition,
  TIER_NAMES,
  TIER_MILESTONES,
} from '../../services/milestone.service';

interface TierProgressCardProps {
  tier: 1 | 2 | 3 | 4;
  achievedMilestones: string[];
  isLocked: boolean;
  isCurrent: boolean;
  onMilestonePress?: (milestone: MilestoneDefinition) => void;
}

export function TierProgressCard({
  tier,
  achievedMilestones,
  isLocked,
  isCurrent,
  onMilestonePress,
}: TierProgressCardProps) {
  const colors = useColors();
  const milestones = TIER_MILESTONES[tier];
  const completed = milestones.filter(m => achievedMilestones.includes(m.id)).length;
  const progress = completed / milestones.length;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card },
        isLocked && styles.lockedContainer,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.tierBadge,
              {
                backgroundColor: isCurrent ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tierNumber,
                { color: isCurrent ? '#fff' : colors.textSecondary },
              ]}
            >
              {tier}
            </Text>
          </View>
          <View>
            <Text style={[styles.tierName, { color: colors.text }]}>
              {TIER_NAMES[tier]}
            </Text>
            <Text style={[styles.tierProgress, { color: colors.textSecondary }]}>
              {completed} of {milestones.length} complete
            </Text>
          </View>
        </View>

        {isLocked && (
          <View style={[styles.lockBadge, { backgroundColor: colors.border }]}>
            <Feather name="lock" size={14} color={colors.textSecondary} />
            <Text style={[styles.lockText, { color: colors.textSecondary }]}>
              Complete Tier {tier - 1}
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: isCurrent ? colors.primary : colors.success,
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>

      {/* Milestones list */}
      <View style={[styles.milestonesList, isLocked && styles.lockedList]}>
        {milestones.map((milestone) => {
          const isAchieved = achievedMilestones.includes(milestone.id);

          return (
            <TouchableOpacity
              key={milestone.id}
              style={[
                styles.milestoneItem,
                isAchieved && { backgroundColor: colors.primaryLight },
              ]}
              onPress={() => !isLocked && onMilestonePress?.(milestone)}
              disabled={isLocked}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.milestoneIcon,
                  {
                    backgroundColor: isAchieved ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather
                  name={isAchieved ? 'check' : (milestone.icon as any)}
                  size={16}
                  color={isAchieved ? '#fff' : colors.textSecondary}
                />
              </View>
              <View style={styles.milestoneContent}>
                <Text
                  style={[
                    styles.milestoneName,
                    { color: isLocked ? colors.textSecondary : colors.text },
                    isAchieved && { color: colors.primary },
                  ]}
                >
                  {milestone.name}
                </Text>
                <Text
                  style={[
                    styles.milestoneDescription,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {milestone.description}
                </Text>
              </View>
              {isAchieved && (
                <Feather name="check-circle" size={20} color={colors.success} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  lockedContainer: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tierNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  tierName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  tierProgress: {
    fontSize: 13,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  lockText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestonesList: {},
  lockedList: {
    opacity: 0.5,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  milestoneDescription: {
    fontSize: 13,
  },
});

export default TierProgressCard;
