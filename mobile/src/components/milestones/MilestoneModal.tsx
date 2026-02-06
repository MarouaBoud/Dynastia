/**
 * Milestone Modal
 *
 * Celebration modal for milestone achievements.
 * Uses emotionally meaningful copy and celebration animation.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { MilestoneDefinition, TIER_NAMES } from '../../services/milestone.service';

interface MilestoneModalProps {
  visible: boolean;
  milestone: MilestoneDefinition | null;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function MilestoneModal({ visible, milestone, onClose }: MilestoneModalProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!milestone) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.content,
            { backgroundColor: colors.card },
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Tier badge */}
          <View style={[styles.tierBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.tierText, { color: colors.primary }]}>
              {TIER_NAMES[milestone.tier]} Milestone
            </Text>
          </View>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Feather name={milestone.icon as any} size={48} color="#fff" />
          </View>

          {/* Name */}
          <Text style={[styles.name, { color: colors.text }]}>
            {milestone.name}
          </Text>

          {/* Celebration message */}
          <Text style={[styles.celebration, { color: colors.textSecondary }]}>
            {milestone.celebration}
          </Text>

          {/* Confetti effect placeholder */}
          <View style={styles.confettiPlaceholder}>
            <Text style={styles.emoji}>&#127881;</Text>
          </View>

          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Keep Going!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  tierText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  celebration: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  confettiPlaceholder: {
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
  },
  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default MilestoneModal;
