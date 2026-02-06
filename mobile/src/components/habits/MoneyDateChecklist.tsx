/**
 * Money Date Checklist
 *
 * A guided checklist for the weekly Money Date ritual.
 * Items are suggestions, not requirements - completing any amount is progress.
 * Uses emotionally safe language (RICHHABIT-06).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  category: 'review' | 'plan' | 'celebrate';
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Review section
  {
    id: 'review_transactions',
    label: 'Review recent transactions',
    description: "Glance through what you spent. No judgment, just awareness.",
    category: 'review',
  },
  {
    id: 'check_bills',
    label: 'Check upcoming bills',
    description: "See what's coming up so nothing catches you off guard.",
    category: 'review',
  },
  {
    id: 'review_budget',
    label: 'Check budget progress',
    description: "How are your buckets looking? Adjust if needed.",
    category: 'review',
  },
  // Plan section
  {
    id: 'savings_transfer',
    label: 'Confirm savings transfer',
    description: 'Make sure your pay-yourself-first transfer happened.',
    category: 'plan',
  },
  {
    id: 'sinking_funds',
    label: 'Review sinking funds',
    description: 'Are you on track for your upcoming goals?',
    category: 'plan',
  },
  // Celebrate section
  {
    id: 'acknowledge_progress',
    label: 'Acknowledge one win',
    description: 'What went well this week? Even small wins count.',
    category: 'celebrate',
  },
];

interface MoneyDateChecklistProps {
  onComplete: (checkedItems: string[], notes?: string) => void;
  isLoading?: boolean;
}

export function MoneyDateChecklist({
  onComplete,
  isLoading = false,
}: MoneyDateChecklistProps) {
  const colors = useColors();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleComplete = () => {
    onComplete(Array.from(checkedItems));
  };

  const progress = checkedItems.size / CHECKLIST_ITEMS.length;

  const renderSection = (category: 'review' | 'plan' | 'celebrate', title: string) => {
    const items = CHECKLIST_ITEMS.filter(item => item.category === category);

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {title}
        </Text>
        {items.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.checklistItem,
              { backgroundColor: colors.card },
              checkedItems.has(item.id) && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => toggleItem(item.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: colors.border },
                checkedItems.has(item.id) && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              {checkedItems.has(item.id) && (
                <Feather name="check" size={14} color="#fff" />
              )}
            </View>
            <View style={styles.itemContent}>
              <Text
                style={[
                  styles.itemLabel,
                  { color: colors.text },
                  checkedItems.has(item.id) && styles.itemLabelChecked,
                ]}
              >
                {item.label}
              </Text>
              <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${progress * 100}%` },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {checkedItems.size} of {CHECKLIST_ITEMS.length} items
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSection('review', 'Review')}
        {renderSection('plan', 'Plan')}
        {renderSection('celebrate', 'Celebrate')}

        {/* Encouragement message */}
        <Text style={[styles.encouragement, { color: colors.textSecondary }]}>
          You don't need to check everything. Just showing up is the win.
        </Text>
      </ScrollView>

      {/* Complete button */}
      <TouchableOpacity
        style={[
          styles.completeButton,
          { backgroundColor: colors.primary },
          isLoading && { opacity: 0.7 },
        ]}
        onPress={handleComplete}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.completeButtonText}>
          {isLoading ? 'Saving...' : 'Complete Money Date'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemLabelChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  encouragement: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  completeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default MoneyDateChecklist;
