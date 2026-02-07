/**
 * CoachPrompt Component
 *
 * Contextual coach message card that appears in relevant screens.
 * Per CONTEXT.md: Coach appears contextually, not as dedicated chat.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import {
  CoachingMessage,
  getCoachingIcon,
  getCoachingColor
} from '../../services/coaching.service';

interface CoachPromptProps {
  coaching: CoachingMessage;
  onDismiss?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  style?: ViewStyle;
}

export function CoachPrompt({
  coaching,
  onDismiss,
  onAction,
  actionLabel = 'Got it',
  style
}: CoachPromptProps) {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme.tokens;

  // Don't render if no message
  if (!coaching.hasMessage || !coaching.message) {
    return null;
  }

  const accentColor = getCoachingColor(coaching.type);
  const iconName = getCoachingIcon(coaching.type);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderRadius: radius.lg,
          padding: spacing.md,
          borderLeftWidth: 4,
          borderLeftColor: accentColor
        },
        style
      ]}
    >
      {/* Header with icon */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${accentColor}20` }
          ]}
        >
          <Feather
            name={iconName as any}
            size={20}
            color={accentColor}
          />
        </View>
        <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
          Your coach says
        </Text>
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Message */}
      <Text
        style={[
          styles.message,
          {
            color: theme.colors.text,
            marginTop: spacing.sm,
            lineHeight: 22
          }
        ]}
      >
        {coaching.message}
      </Text>

      {/* Action button (optional) */}
      {onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={[
            styles.actionButton,
            {
              backgroundColor: accentColor,
              marginTop: spacing.md,
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md
            }
          ]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  dismissButton: {
    padding: 4
  },
  message: {
    fontSize: 15,
    fontWeight: '400'
  },
  actionButton: {
    alignSelf: 'flex-start'
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default CoachPrompt;
