/**
 * Next Step Card
 *
 * Shows ONE personalized next step recommendation based on user's financial state.
 * This is the "decision removal" core feature - user always knows their single next action.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';

// Next step types based on financial state
export type NextStepType =
  | 'create_budget'
  | 'complete_money_date'
  | 'pay_credit_card'
  | 'build_emergency_fund'
  | 'create_sinking_fund'
  | 'automate_savings'
  | 'review_spending'
  | 'celebrate_progress';

interface NextStep {
  type: NextStepType;
  title: string;
  description: string;
  action: string;
  icon: string;
  priority: number; // Lower = higher priority
}

const NEXT_STEPS: Record<NextStepType, Omit<NextStep, 'type' | 'priority'>> = {
  create_budget: {
    title: 'Set up your budget',
    description: "Let's create your Pay Yourself First budget. It takes about 5 minutes.",
    action: 'Get Started',
    icon: 'pie-chart',
  },
  complete_money_date: {
    title: 'Complete your Money Date',
    description: 'Take 10 minutes to check in with your finances this week.',
    action: 'Start Check-in',
    icon: 'calendar',
  },
  pay_credit_card: {
    title: 'Pay your credit card',
    description: 'Your card is due soon. Paying in full builds your debt-free streak.',
    action: 'View Cards',
    icon: 'credit-card',
  },
  build_emergency_fund: {
    title: 'Build your safety net',
    description: "You're making progress! Let's add to your emergency fund.",
    action: 'Add Savings',
    icon: 'shield',
  },
  create_sinking_fund: {
    title: 'Plan for something big',
    description: 'Create a sinking fund for an upcoming expense or goal.',
    action: 'Create Fund',
    icon: 'target',
  },
  automate_savings: {
    title: 'Automate your savings',
    description: 'Set up automatic transfers so wealth builds while you sleep.',
    action: 'Set Up',
    icon: 'refresh-cw',
  },
  review_spending: {
    title: 'Review your spending',
    description: "See where your money went this month. Knowledge is power.",
    action: 'View Charts',
    icon: 'bar-chart-2',
  },
  celebrate_progress: {
    title: "You're doing great!",
    description: 'Your finances are on track. Keep up the good work!',
    action: 'View Progress',
    icon: 'star',
  },
};

interface NextStepCardProps {
  stepType: NextStepType;
  onAction: () => void;
  onDismiss?: () => void;
}

export function NextStepCard({ stepType, onAction, onDismiss }: NextStepCardProps) {
  const colors = useColors();
  const step = NEXT_STEPS[stepType];

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryLight }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.primary }]}>YOUR NEXT STEP</Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Feather name={step.icon as any} size={24} color="#fff" />
        </View>

        <View style={styles.textContent}>
          <Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {step.description}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.primary }]}
        onPress={onAction}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>{step.action}</Text>
        <Feather name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/**
 * Determine the next step based on user's financial state
 */
export function determineNextStep(state: {
  hasBudget: boolean;
  completedMoneyDateThisWeek: boolean;
  hasPendingCreditCard: boolean;
  emergencyFundProgress: number; // 0-1
  hasSinkingFund: boolean;
  hasAutomatedSavings: boolean;
}): NextStepType {
  // Priority order (first match wins)

  // 1. No budget = must create budget first
  if (!state.hasBudget) {
    return 'create_budget';
  }

  // 2. Money Date not completed this week
  if (!state.completedMoneyDateThisWeek) {
    return 'complete_money_date';
  }

  // 3. Credit card due soon
  if (state.hasPendingCreditCard) {
    return 'pay_credit_card';
  }

  // 4. Emergency fund not started or below 3 months
  if (state.emergencyFundProgress < 1) {
    return 'build_emergency_fund';
  }

  // 5. No sinking fund
  if (!state.hasSinkingFund) {
    return 'create_sinking_fund';
  }

  // 6. Savings not automated
  if (!state.hasAutomatedSavings) {
    return 'automate_savings';
  }

  // 7. Default: celebrate progress
  return 'celebrate_progress';
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NextStepCard;
