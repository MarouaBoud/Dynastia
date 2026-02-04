/**
 * CreditCardMilestoneModal
 *
 * Celebration modal for achieving 3 months of paying credit card in full.
 * Emotionally positive, celebrates breaking the interest cycle.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/currency';
import { hapticSuccess } from '../../utils/haptics';

const { width } = Dimensions.get('window');

interface CreditCardMilestoneModalProps {
  visible: boolean;
  cardName: string;
  interestSaved: number;
  onDismiss: () => void;
}

export function CreditCardMilestoneModal({
  visible,
  cardName,
  interestSaved,
  onDismiss,
}: CreditCardMilestoneModalProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      hapticSuccess();

      // Scale up animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Confetti animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(confettiAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      confettiAnim.setValue(0);
    }
  }, [visible]);

  const confettiStyle = {
    opacity: confettiAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.8, 0],
    }),
    transform: [
      {
        translateY: confettiAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 200],
        }),
      },
    ],
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        {/* Confetti */}
        <Animated.View style={[styles.confettiContainer, confettiStyle]}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.confetti,
                {
                  left: Math.random() * width,
                  backgroundColor: [
                    colors.success,
                    colors.primary,
                    colors.warning,
                    '#FFD700',
                    '#FF69B4',
                  ][i % 5],
                  transform: [{ rotate: `${Math.random() * 360}deg` }],
                },
              ]}
            />
          ))}
        </Animated.View>

        <Animated.View
          style={[
            styles.modal,
            { backgroundColor: colors.card, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Celebration Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.celebrationIcon}>🎉</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            You've broken the interest cycle!
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            3 months of paying your credit card in full.{'\n'}
            Your money is working for you now.
          </Text>

          {/* Card Name */}
          <View style={[styles.cardBadge, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={styles.cardIcon}>💳</Text>
            <Text style={[styles.cardName, { color: colors.text }]}>{cardName}</Text>
          </View>

          {/* Interest Saved */}
          {interestSaved > 0 && (
            <View style={[styles.savingsSection, { backgroundColor: colors.success + '15' }]}>
              <Text style={[styles.savingsLabel, { color: colors.textMuted }]}>
                Interest saved
              </Text>
              <Text style={[styles.savingsAmount, { color: colors.success }]}>
                {formatCurrency(interestSaved)}
              </Text>
              <Text style={[styles.savingsSubtext, { color: colors.textMuted }]}>
                over 3 months
              </Text>
            </View>
          )}

          {/* CTA Button */}
          <Button onPress={onDismiss} fullWidth style={styles.button}>
            Keep it going!
          </Button>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.lg,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  modal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.xl,
    alignItems: 'center',
    ...tokens.shadows.lg,
  },
  iconContainer: {
    marginBottom: tokens.spacing.lg,
  },
  celebrationIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: tokens.typography.sizes.headingLg.fontSize,
    fontWeight: tokens.typography.weights.bold,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: tokens.spacing.lg,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
    marginBottom: tokens.spacing.lg,
  },
  cardIcon: {
    fontSize: 16,
    marginRight: tokens.spacing.xs,
  },
  cardName: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  savingsSection: {
    width: '100%',
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  savingsLabel: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    marginBottom: tokens.spacing.xxs,
  },
  savingsAmount: {
    fontSize: tokens.typography.sizes.displayMd.fontSize,
    fontWeight: tokens.typography.weights.bold,
  },
  savingsSubtext: {
    fontSize: tokens.typography.sizes.caption.fontSize,
    marginTop: tokens.spacing.xxs,
  },
  button: {
    marginTop: tokens.spacing.sm,
  },
});

export default CreditCardMilestoneModal;
