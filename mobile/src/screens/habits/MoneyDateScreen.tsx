/**
 * Money Date Screen (Hero Ritual)
 *
 * This is the sacred weekly ritual for the Aspiring Empire Builder.
 * It is designed to be calm, focusing, and empowering.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { useHabits } from '../../contexts/HabitContext';
import { MoneyDateChecklist } from '../../components/habits/MoneyDateChecklist';
import { tokens } from '../../theme/tokens';

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
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleComplete = useCallback(async (checkedItems: string[]) => {
    try {
      await checkIn(undefined, { checkedItems });
      setCompleted(true);
    } catch (error) {
      Alert.alert(
        'Connection Issue',
        "We couldn't save your ritual. Please check your internet and try again.",
        [{ text: 'OK' }]
      );
    }
  }, [checkIn]);

  const handleDone = () => {
    navigation.goBack();
  };

  // ---------------------------------------------------------------------------
  // RENDER: COMPLETED STATE (The Victory Lap)
  // ---------------------------------------------------------------------------
  if (completedThisWeek && !completed) {
    // If user re-visits the screen after completing
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Re-using the celebration view for consistency */}
        <CelebrationView
          colors={colors}
          currentStreak={currentStreak}
          onDone={handleDone}
          alreadyDone={true}
        />
      </View>
    );
  }

  if (completed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.success + '10' }]}>
        <CelebrationView
          colors={colors}
          currentStreak={currentStreak}
          onDone={handleDone}
          alreadyDone={false}
        />
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: CHECK-IN RITUAL
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={tokens.spacing.sm}
          style={styles.closeButton}
        >
          <Feather name="x" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>
          WEEKLY RITUAL
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* INTRO */}
        <View style={styles.intro}>
          <Text style={[styles.introTitle, { color: colors.text }]}>
            Your Money Date
          </Text>
          <Text style={[styles.introSubtitle, { color: colors.textSecondary }]}>
            Review the past. Plan the future. {'\n'}
            Build your empire, one week at a time.
          </Text>
        </View>

        {/* CHECKLIST */}
        <View style={styles.checklistContainer}>
          <MoneyDateChecklist onComplete={handleComplete} isLoading={isCheckingIn} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

// Sub-component for Celebration to keep main component clean
function CelebrationView({ colors, currentStreak, onDone, alreadyDone }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.celebrationContainer}>
        <View style={[styles.iconCircle, { backgroundColor: colors.success }]}>
          <Feather name="check" size={48} color="#fff" />
        </View>

        <Text style={[styles.celebrationTitle, { color: colors.text }]}>
          {alreadyDone ? "You're All Set" : "Ritual Complete"}
        </Text>

        <Text style={[styles.celebrationSubtitle, { color: colors.textSecondary }]}>
          {alreadyDone
            ? "You've already taken control this week.\nSee you next week."
            : "You just took a concrete step toward financial freedom. Be proud."}
        </Text>

        {currentStreak > 0 && (
          <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <Feather name="zap" size={24} color={colors.primary} />
            <View>
              <Text style={[styles.streakCount, { color: colors.primary }]}>
                {currentStreak} Week Streak
              </Text>
              <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
                Consistency is the key to wealth.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={onDone}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Return to Empire</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -12,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  intro: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  introSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  checklistContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  // Celebration Styles
  celebrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  celebrationTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  celebrationSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 48,
    borderWidth: 1,
    gap: 16,
    width: '100%',
  },
  streakCount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 13,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default MoneyDateScreen;
