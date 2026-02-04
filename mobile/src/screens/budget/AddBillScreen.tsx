/**
 * AddBillScreen
 *
 * Form for creating a new recurring bill.
 * Supports regular bills and credit cards with APR tracking.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { CurrencyInput } from '../../components/forms/CurrencyInput';
import {
  createBill,
  BillFrequency,
  BillCategory,
} from '../../services/bill.service';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { hapticSuccess, hapticError } from '../../utils/haptics';

// =============================================================================
// Types
// =============================================================================

type AddBillNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddBill'>;

// =============================================================================
// Constants
// =============================================================================

const CATEGORIES: { value: BillCategory; label: string; emoji: string }[] = [
  { value: 'housing', label: 'Housing', emoji: '🏠' },
  { value: 'utilities', label: 'Utilities', emoji: '⚡' },
  { value: 'subscription', label: 'Subscription', emoji: '🔄' },
  { value: 'insurance', label: 'Insurance', emoji: '🛡️' },
  { value: 'other', label: 'Other', emoji: '📄' },
];

const FREQUENCIES: { value: BillFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

// =============================================================================
// Component
// =============================================================================

export function AddBillScreen() {
  const colors = useColors();
  const navigation = useNavigation<AddBillNavigationProp>();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<BillCategory>('other');
  const [frequency, setFrequency] = useState<BillFrequency>('monthly');
  const [dueDay, setDueDay] = useState('1');
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [apr, setApr] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Bill name is required';
    }

    if (amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    const dueDayNum = parseInt(dueDay, 10);
    if (isNaN(dueDayNum)) {
      newErrors.dueDay = 'Please enter a valid day';
    } else if (frequency === 'weekly' && (dueDayNum < 1 || dueDayNum > 7)) {
      newErrors.dueDay = 'For weekly bills, enter 1-7 (Sun-Sat)';
    } else if (frequency !== 'weekly' && (dueDayNum < 1 || dueDayNum > 31)) {
      newErrors.dueDay = 'Enter a day between 1 and 31';
    }

    if (isCreditCard && apr) {
      const aprNum = parseFloat(apr);
      if (isNaN(aprNum) || aprNum < 0 || aprNum > 50) {
        newErrors.apr = 'APR must be between 0% and 50%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      hapticError();
      return;
    }

    setLoading(true);
    try {
      await createBill({
        name: name.trim(),
        amount,
        category,
        frequency,
        dueDay: parseInt(dueDay, 10),
        isCreditCard,
        creditCardApr: isCreditCard && apr ? parseFloat(apr) : undefined,
      });

      hapticSuccess();
      navigation.goBack();
    } catch (error: any) {
      hapticError();
      Alert.alert(
        'Could not save bill',
        error.response?.data?.error || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getDueDayLabel = (): string => {
    if (frequency === 'weekly') {
      return 'Due Day (1=Sun, 7=Sat)';
    }
    return 'Due Day of Month';
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
        {/* Bill Name */}
        <Input
          label="Bill Name"
          placeholder="e.g., Netflix, Rent, Electricity"
          value={name}
          onChangeText={setName}
          errorText={errors.name}
          autoCapitalize="words"
        />

        {/* Amount */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Amount
          </Text>
          <CurrencyInput
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
          />
          {errors.amount && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.amount}
            </Text>
          )}
        </View>

        {/* Category */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Category
          </Text>
          <View style={styles.optionGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.optionButton,
                  { borderColor: colors.border },
                  category === cat.value && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + '10',
                  },
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={styles.optionEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    { color: category === cat.value ? colors.primary : colors.text },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Frequency */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Frequency
          </Text>
          <View style={styles.frequencyRow}>
            {FREQUENCIES.map((freq) => (
              <TouchableOpacity
                key={freq.value}
                style={[
                  styles.frequencyButton,
                  { borderColor: colors.border },
                  frequency === freq.value && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + '10',
                  },
                ]}
                onPress={() => setFrequency(freq.value)}
              >
                <Text
                  style={[
                    styles.frequencyLabel,
                    { color: frequency === freq.value ? colors.primary : colors.text },
                  ]}
                >
                  {freq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Day */}
        <Input
          label={getDueDayLabel()}
          placeholder={frequency === 'weekly' ? '1-7' : '1-31'}
          value={dueDay}
          onChangeText={setDueDay}
          keyboardType="number-pad"
          errorText={errors.dueDay}
        />

        {/* Credit Card Toggle */}
        <Card variant="flat" style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                This is a credit card
              </Text>
              <Text style={[styles.toggleHint, { color: colors.textMuted }]}>
                Track interest and payment streaks
              </Text>
            </View>
            <Switch
              value={isCreditCard}
              onValueChange={setIsCreditCard}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={isCreditCard ? colors.primary : colors.textMuted}
            />
          </View>
        </Card>

        {/* APR Input (if credit card) */}
        {isCreditCard && (
          <Input
            label="APR (%)"
            placeholder="e.g., 22.99"
            value={apr}
            onChangeText={setApr}
            keyboardType="decimal-pad"
            errorText={errors.apr}
            helperText="We'll calculate your monthly interest cost"
          />
        )}

        {/* Save Button */}
        <Button
          onPress={handleSave}
          loading={loading}
          fullWidth
          style={styles.saveButton}
        >
          Save Bill
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
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.xs,
  },
  optionEmoji: {
    fontSize: 16,
  },
  optionLabel: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  frequencyLabel: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  toggleCard: {
    marginBottom: tokens.spacing.lg,
    padding: tokens.spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  toggleHint: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    marginTop: tokens.spacing.xxs,
  },
  errorText: {
    fontSize: tokens.typography.sizes.caption.fontSize,
    marginTop: tokens.spacing.xs,
  },
  saveButton: {
    marginTop: tokens.spacing.lg,
  },
});

export default AddBillScreen;
