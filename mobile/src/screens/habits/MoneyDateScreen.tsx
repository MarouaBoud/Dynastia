/**
 * Money Date Screen
 *
 * Weekly check-in ritual screen (HABIT-02, RICHHABIT-01).
 * Guides users through their Money Date with checklist and celebrates completion.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { useHabits } from '../../contexts/HabitContext';
import { MoneyDateChecklist } from '../../components/habits/MoneyDateChecklist';

export function MoneyDateScreen() {
  const colors = useColors();
  const navigation = useNavigation();
  const {
    checkIn,
    isCheckingIn,
    currentStreak,
    completedThisWeek,
  } = useHabits();

  const [completed, setCompleted] = useState(false);

  const handleComplete = useCallback(async (checkedItems: string[]) => {
    try {
      await checkIn(undefined, { checkedItems });
      setCompleted(true);
    } catch (error) {
      Alert.alert(
        'Oops!',
        "We couldn't save your check-in. Let's try again.",
        [{ text: 'OK' }]
      );
    }
  }, [checkIn]);

  const handleDone = () => {
    navigation.goBack();
  };

  // Already completed this week
  if (completedThisWeek && !completed) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.completedContainer}>
          <View style={[styles.checkCircle, { backgroundColor: colors.success }]}>
            <Feather name="check" size={48} color="#fff" />
          </View>
          <Text style={[styles.completedTitle, { color: colors.text }]}>
            You're all set!
          </Text>
          <Text style={[styles.completedSubtitle, { color: colors.textSecondary }]}>
            You've completed your Money Date this week.{'\n'}
            See you next week!
          </Text>

          {currentStreak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: colors.primaryLight }]}>
              <Feather name="zap" size={16} color={colors.primary} />
              <Text style={[styles.streakText, { color: colors.primary }]}>
                {currentStreak} week streak
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={handleDone}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Just completed
  if (completed) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.celebrationContainer}>
          <View style={[styles.checkCircle, { backgroundColor: colors.success }]}>
            <Feather name="check" size={48} color="#fff" />
          </View>
          <Text style={[styles.celebrationTitle, { color: colors.text }]}>
            Money Date Complete!
          </Text>
          <Text style={[styles.celebrationSubtitle, { color: colors.textSecondary }]}>
            Great job showing up for yourself today.{'\n'}
            This is how wealth gets built.
          </Text>

          {currentStreak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: colors.primaryLight }]}>
              <Feather name="zap" size={16} color={colors.primary} />
              <Text style={[styles.streakText, { color: colors.primary }]}>
                {currentStreak} week streak!
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={handleDone}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Check-in flow
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Money Date</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.intro}>
        <Text style={[styles.introTitle, { color: colors.text }]}>
          Let's check in with your money
        </Text>
        <Text style={[styles.introSubtitle, { color: colors.textSecondary }]}>
          Take 10 minutes to review, plan, and celebrate.{'\n'}
          No judgment. Just awareness.
        </Text>
      </View>

      <View style={styles.checklistContainer}>
        <MoneyDateChecklist onComplete={handleComplete} isLoading={isCheckingIn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  intro: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  checklistContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  celebrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  completedSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  celebrationSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
    gap: 6,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '600',
  },
  doneButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default MoneyDateScreen;
