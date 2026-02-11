/**
 * Home Screen (The Hero's Dashboard)
 *
 * Journey-first design with Money Date as THE hero feature.
 * One clear action. Progress visible. Calm, not overwhelming.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { useHabits } from '../contexts/HabitContext';
import { useCoaching } from '../contexts/CoachingContext';
import { CoachPrompt } from '../components/coaching/CoachPrompt';
import { tokens } from '../theme/tokens';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const {
    currentStreak,
    completedThisWeek,
    refreshStreak,
    refreshCheckIns,
  } = useHabits();
  const { coaching, dismissCoaching } = useCoaching();

  // Animation for the Hero Card
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    refreshStreak();
    refreshCheckIns();

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStartMoneyDate = () => {
    navigation.navigate('MoneyDate');
  };

  const handleViewJourney = () => {
    navigation.navigate('SovereigntyLadder');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Mock data - replace with real user journey data
  const journeyProgress = {
    tier: 2,
    tierName: 'Secure',
    progress: 0.65,
    currentGoal: '€1,000 emergency fund',
    saved: 650,
    target: 1000,
  };

  // One clear next action based on where user is in their journey
  const getWeeklyFocus = () => {
    if (!completedThisWeek) {
      return {
        action: 'Complete your Money Date',
        description: 'Take 10 minutes to review, plan, and feel in control.',
        ctaText: 'Start now',
        onPress: handleStartMoneyDate,
      };
    }

    // Based on tier, suggest next action
    return {
      action: 'Move €50 to your emergency fund',
      description: "You're building something real. Every transfer counts.",
      ctaText: 'I did it',
      onPress: () => {}, // Would open confirmation modal
    };
  };

  const weeklyFocus = getWeeklyFocus();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER - Simple greeting */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.firstName || 'Empire Builder'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <Feather name="bell" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* COACH PROMPT - Contextual guidance */}
        {coaching && (
          <View style={{ marginBottom: 24 }}>
            <CoachPrompt coaching={coaching} onDismiss={dismissCoaching} />
          </View>
        )}

        {/* HERO CARD - MONEY DATE */}
        <Animated.View
          style={[
            styles.heroCardContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleStartMoneyDate}
            style={[
              styles.heroCard,
              {
                backgroundColor: completedThisWeek ? colors.success : colors.primary,
                shadowColor: completedThisWeek ? colors.success : colors.primary,
              },
            ]}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconCircle}>
                <Feather
                  name={completedThisWeek ? 'check' : 'calendar'}
                  size={36}
                  color={completedThisWeek ? colors.success : colors.primary}
                />
              </View>

              <View style={styles.heroTextContainer}>
                <Text style={styles.heroLabel}>
                  {completedThisWeek ? 'RITUAL COMPLETE' : 'YOUR MONEY DATE'}
                </Text>
                <Text style={styles.heroTitle}>
                  {completedThisWeek ? 'See you next week' : 'Start your ritual'}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {completedThisWeek
                    ? `${currentStreak} week streak. Keep building.`
                    : '10 minutes to feel in control.'}
                </Text>
              </View>

              <View style={styles.heroArrowContainer}>
                <Feather
                  name={completedThisWeek ? 'check-circle' : 'arrow-right'}
                  size={28}
                  color="#fff"
                />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* JOURNEY PROGRESS */}
        <TouchableOpacity
          style={[styles.journeyCard, { backgroundColor: colors.card }]}
          onPress={handleViewJourney}
          activeOpacity={0.8}
        >
          <View style={styles.journeyHeader}>
            <Text style={[styles.journeyTitle, { color: colors.text }]}>
              Your Journey
            </Text>
            <View style={styles.journeyBadge}>
              <Text style={[styles.journeyTier, { color: colors.primary }]}>
                Tier {journeyProgress.tier}: {journeyProgress.tierName}
              </Text>
            </View>
          </View>

          <View style={styles.journeyProgressContainer}>
            <View style={[styles.journeyProgressBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.journeyProgressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${journeyProgress.progress * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.journeyDetails}>
            <Text style={[styles.journeyGoal, { color: colors.textSecondary }]}>
              {journeyProgress.currentGoal}
            </Text>
            <Text style={[styles.journeySaved, { color: colors.text }]}>
              €{journeyProgress.saved} / €{journeyProgress.target}
            </Text>
          </View>

          <View style={styles.journeyArrow}>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* THIS WEEK'S FOCUS - One clear action */}
        <View style={[styles.focusCard, { backgroundColor: colors.card }]}>
          <View style={styles.focusHeader}>
            <Feather name="target" size={18} color={colors.primary} />
            <Text style={[styles.focusLabel, { color: colors.primary }]}>
              This Week's Focus
            </Text>
          </View>

          <Text style={[styles.focusAction, { color: colors.text }]}>
            {weeklyFocus.action}
          </Text>

          <Text style={[styles.focusDescription, { color: colors.textSecondary }]}>
            {weeklyFocus.description}
          </Text>

          {!completedThisWeek && (
            <TouchableOpacity
              style={[styles.focusCta, { backgroundColor: colors.primary }]}
              onPress={weeklyFocus.onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.focusCtaText}>{weeklyFocus.ctaText}</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* INSIGHT / QUOTE */}
        <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
          <Feather name="zap" size={18} color={colors.warning} style={styles.insightIcon} />
          <Text style={[styles.insightText, { color: colors.text }]}>
            "Wealth consists not in having great possessions, but in having few wants."
          </Text>
          <Text style={[styles.insightAuthor, { color: colors.textSecondary }]}>
            - Epictetus
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 10,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero Card - Money Date
  heroCardContainer: {
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  heroArrowContainer: {
    marginLeft: 12,
    opacity: 0.9,
  },

  // Journey Card
  journeyCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    position: 'relative',
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  journeyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  journeyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  journeyTier: {
    fontSize: 12,
    fontWeight: '600',
  },
  journeyProgressContainer: {
    marginBottom: 14,
  },
  journeyProgressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  journeyProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  journeyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journeyGoal: {
    fontSize: 14,
    flex: 1,
  },
  journeySaved: {
    fontSize: 15,
    fontWeight: '600',
  },
  journeyArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },

  // Focus Card
  focusCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  focusLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  focusAction: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  focusDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  focusCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  focusCtaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Insight Card
  insightCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  insightIcon: {
    marginBottom: 12,
  },
  insightText: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  insightAuthor: {
    fontSize: 13,
    fontWeight: '500',
  },
});
