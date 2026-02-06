/**
 * Sovereignty Ladder Screen
 *
 * Full visualization of 4-tier milestone progression (HABIT-01).
 * Uses progressive disclosure: shows current tier + next tier.
 * Locked tiers are visible but grayed out (HABIT-06).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { TierProgressCard } from '../../components/milestones/TierProgressCard';
import { MilestoneModal } from '../../components/milestones/MilestoneModal';
import milestoneService, {
  Milestone,
  MilestoneDefinition,
  getCurrentTier,
  getVisibleTiers,
  TIER_NAMES,
} from '../../services/milestone.service';

export function SovereigntyLadderScreen() {
  const colors = useColors();
  const navigation = useNavigation();

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneDefinition | null>(null);
  const [showModal, setShowModal] = useState(false);

  const achievedTypes = milestones.map(m => m.type);
  const currentTier = getCurrentTier(achievedTypes);
  const visibleTiers = getVisibleTiers(achievedTypes);

  const loadMilestones = useCallback(async () => {
    try {
      const data = await milestoneService.getMilestones();
      setMilestones(data);
    } catch (error) {
      console.error('Failed to load milestones:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMilestones();
    setRefreshing(false);
  };

  const handleMilestonePress = (milestone: MilestoneDefinition) => {
    setSelectedMilestone(milestone);
    setShowModal(true);
  };

  // Calculate overall progress
  const totalMilestones = 16;
  const totalAchieved = achievedTypes.length;
  const overallProgress = totalAchieved / totalMilestones;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Sovereignty Ladder
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Your journey to financial freedom
          </Text>
        </View>

        {/* Overall progress */}
        <View style={[styles.overallCard, { backgroundColor: colors.card }]}>
          <View style={styles.overallHeader}>
            <Text style={[styles.overallTitle, { color: colors.text }]}>
              Overall Progress
            </Text>
            <View style={[styles.currentTierBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.currentTierText, { color: colors.primary }]}>
                Tier {currentTier}: {TIER_NAMES[currentTier as 1 | 2 | 3 | 4]}
              </Text>
            </View>
          </View>

          <View style={styles.overallStats}>
            <Text style={[styles.overallNumber, { color: colors.primary }]}>
              {totalAchieved}
            </Text>
            <Text style={[styles.overallLabel, { color: colors.textSecondary }]}>
              of {totalMilestones} milestones achieved
            </Text>
          </View>

          <View style={[styles.overallBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.overallFill,
                { backgroundColor: colors.primary, width: `${overallProgress * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Tier cards */}
        {[1, 2, 3, 4].map((tier) => {
          const isVisible = visibleTiers.includes(tier);
          const isLocked = tier > currentTier;
          const isCurrent = tier === currentTier;

          // Only show visible tiers (current + next) or already completed
          if (!isVisible && tier > currentTier) {
            return (
              <View
                key={tier}
                style={[styles.lockedTierHint, { backgroundColor: colors.card }]}
              >
                <Feather name="lock" size={16} color={colors.textSecondary} />
                <Text style={[styles.lockedTierText, { color: colors.textSecondary }]}>
                  Tier {tier}: {TIER_NAMES[tier as 1 | 2 | 3 | 4]} - Unlock by completing Tier {tier - 1}
                </Text>
              </View>
            );
          }

          return (
            <TierProgressCard
              key={tier}
              tier={tier as 1 | 2 | 3 | 4}
              achievedMilestones={achievedTypes}
              isLocked={isLocked}
              isCurrent={isCurrent}
              onMilestonePress={handleMilestonePress}
            />
          );
        })}

        {/* View history link */}
        <TouchableOpacity
          style={[styles.historyLink, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('MilestoneHistory' as never)}
          activeOpacity={0.7}
        >
          <Feather name="clock" size={20} color={colors.primary} />
          <Text style={[styles.historyLinkText, { color: colors.primary }]}>
            View Achievement History
          </Text>
          <Feather name="chevron-right" size={20} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Milestone detail modal */}
      <MilestoneModal
        visible={showModal}
        milestone={selectedMilestone}
        onClose={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  overallCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  overallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overallTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  currentTierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentTierText: {
    fontSize: 12,
    fontWeight: '600',
  },
  overallStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  overallNumber: {
    fontSize: 36,
    fontWeight: '700',
    marginRight: 8,
  },
  overallLabel: {
    fontSize: 14,
  },
  overallBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  overallFill: {
    height: '100%',
    borderRadius: 4,
  },
  lockedTierHint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  lockedTierText: {
    fontSize: 14,
    flex: 1,
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  historyLinkText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});

export default SovereigntyLadderScreen;
