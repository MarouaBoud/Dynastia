/**
 * AddSinkingFundScreen
 *
 * Form for creating a new savings goal with name, target amount,
 * and deadline. Shows calculated monthly contribution.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { differenceInMonths, format } from 'date-fns';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { MoneyText } from '../../components/ui/MoneyText';
import { CurrencyInput } from '../../components/forms/CurrencyInput';
import { DatePicker } from '../../components/forms/DatePicker';
import {
  createSinkingFund,
  getSuggestedGoalNames,
} from '../../services/sinkingFund.service';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { hapticSuccess, hapticError, hapticLight } from '../../utils/haptics';

// =============================================================================
// Types
// =============================================================================

type AddSinkingFundNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddSinkingFund'>;

// =============================================================================
// Component
// =============================================================================

export function AddSinkingFundScreen() {
  const colors = useColors();
  const navigation = useNavigation<AddSinkingFundNavigationProp>();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const suggestedNames = getSuggestedGoalNames();

  // Calculate monthly contribution
  const monthlyContribution = useMemo(() => {
    if (!targetAmount || !deadline) return 0;
    const months = differenceInMonths(deadline, new Date());
    if (months <= 0) return targetAmount;
    return Math.ceil(targetAmount / months);
  }, [targetAmount, deadline]);

  const monthsRemaining = useMemo(() => {
    if (!deadline) return 0;
    return Math.max(0, differenceInMonths(deadline, new Date()));
  }, [deadline]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Please give your goal a name';
    }

    if (targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    if (!deadline) {
      newErrors.deadline = 'Please select a deadline';
    } else if (deadline <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSuggestionPress = (suggestion: string) => {
    hapticLight();
    setName(suggestion);
  };

  const handleSave = async () => {
    if (!validate()) {
      hapticError();
      return;
    }

    setLoading(true);
    try {
      await createSinkingFund({
        name: name.trim(),
        targetAmount,
        deadline: deadline!.toISOString(),
      });

      hapticSuccess();
      navigation.goBack();
    } catch (error: any) {
      hapticError();
      Alert.alert(
        'Could not create goal',
        error.response?.data?.error || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Name */}
        <Input
          label="What are you saving for?"
          placeholder="e.g., Emergency Fund, Travel, New Car"
          value={name}
          onChangeText={setName}
          errorText={errors.name}
          autoCapitalize="words"
        />

        {/* Suggestions */}
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionsLabel, { color: colors.textMuted }]}>
            Popular goals:
          </Text>
          <View style={styles.suggestions}>
            {suggestedNames.slice(0, 5).map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={[
                  styles.suggestionChip,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={[styles.suggestionText, { color: colors.text }]}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Target Amount */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Target Amount
          </Text>
          <CurrencyInput
            value={targetAmount}
            onChange={setTargetAmount}
            placeholder="0.00"
          />
          {errors.targetAmount && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.targetAmount}
            </Text>
          )}
        </View>

        {/* Deadline */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            When do you need it by?
          </Text>
          <DatePicker
            value={deadline || new Date()}
            onChange={setDeadline}
            maxDate={new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)} // 10 years from now
          />
          {errors.deadline && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.deadline}
            </Text>
          )}
        </View>

        {/* Monthly Contribution Preview */}
        {targetAmount > 0 && deadline && monthsRemaining > 0 && (
          <Card style={styles.previewCard}>
            <Text style={[styles.previewTitle, { color: colors.textSecondary }]}>
              To reach your goal:
            </Text>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.text }]}>
                Save approximately
              </Text>
              <MoneyText value={monthlyContribution} size="lg" variant="positive" />
            </View>
            <Text style={[styles.previewSubtext, { color: colors.textMuted }]}>
              per month for {monthsRemaining} {monthsRemaining === 1 ? 'month' : 'months'}
            </Text>

            {monthlyContribution > targetAmount * 0.25 && (
              <Text style={[styles.helperText, { color: colors.textMuted }]}>
                💡 If that's too much, try extending your deadline
              </Text>
            )}
          </Card>
        )}

        {/* Save Button */}
        <Button
          onPress={handleSave}
          loading={loading}
          fullWidth
          style={styles.saveButton}
        >
          Create Savings Goal
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl * 2,
  },
  fieldContainer: {
    marginBottom: tokens.spacing.lg,
  },
  label: {
    fontSize: tokens.typography.sizes.label.fontSize,
    fontWeight: tokens.typography.weights.medium,
    marginBottom: tokens.spacing.sm,
  },
  suggestionsContainer: {
    marginTop: -tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  suggestionsLabel: {
    fontSize: tokens.typography.sizes.caption.fontSize,
    marginBottom: tokens.spacing.sm,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
  suggestionChip: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.full,
  },
  suggestionText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  errorText: {
    fontSize: tokens.typography.sizes.caption.fontSize,
    marginTop: tokens.spacing.xs,
  },
  previewCard: {
    marginBottom: tokens.spacing.lg,
    alignItems: 'center',
    padding: tokens.spacing.xl,
  },
  previewTitle: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    marginBottom: tokens.spacing.md,
  },
  previewRow: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  previewLabel: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    marginBottom: tokens.spacing.xs,
  },
  previewSubtext: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    marginBottom: tokens.spacing.md,
  },
  helperText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  saveButton: {
    marginTop: tokens.spacing.lg,
  },
});

export default AddSinkingFundScreen;
