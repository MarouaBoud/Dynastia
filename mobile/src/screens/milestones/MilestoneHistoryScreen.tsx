/**
 * Milestone History Screen
 *
 * Shows chronological list of achieved milestones.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';
import milestoneService, {
  Milestone,
  getMilestoneDefinition,
} from '../../services/milestone.service';

export function MilestoneHistoryScreen() {
  const colors = useColors();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMilestones = useCallback(async () => {
    try {
      const data = await milestoneService.getMilestones();
      // Sort by achievedAt descending (newest first)
      data.sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime());
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

  const renderMilestone = ({ item }: { item: Milestone }) => {
    const definition = getMilestoneDefinition(item.type);
    if (!definition) return null;

    return (
      <View style={[styles.milestoneCard, { backgroundColor: colors.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Feather name={definition.icon as any} size={24} color={colors.primary} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.name, { color: colors.text }]}>
              {definition.name}
            </Text>
            <View style={[styles.tierBadge, { backgroundColor: colors.border }]}>
              <Text style={[styles.tierText, { color: colors.textSecondary }]}>
                Tier {definition.tier}
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {definition.description}
          </Text>

          <Text style={[styles.date, { color: colors.textMuted }]}>
            Achieved {format(new Date(item.achievedAt), 'MMMM d, yyyy')}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="award" size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No milestones yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Keep going! Your first milestone is closer than you think.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={milestones}
        renderItem={renderMilestone}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  milestoneCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MilestoneHistoryScreen;
