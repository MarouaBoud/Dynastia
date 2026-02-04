/**
 * AddTransactionScreen
 *
 * Form for adding a new transaction with auto-categorization.
 * Uses design system components for consistent styling.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CurrencyInput } from '../../components/forms/CurrencyInput';
import { CategoryPicker } from '../../components/forms/CategoryPicker';
import { DatePicker } from '../../components/forms/DatePicker';
import { createTransaction, CreateTransactionInput } from '../../services/transactions.service';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { hapticSuccess, hapticError } from '../../utils/haptics';

type RootStackParamList = {
  TransactionList: undefined;
  AddTransaction: undefined;
  TransactionDetail: { transactionId: string };
};

type AddTransactionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;
};

interface TransactionFormData {
  amount: number;
  merchant: string;
  date: Date;
  category: string;
  notes: string;
}

function autoCategorizeMerchant(merchant: string): string {
  const lowerMerchant = merchant.toLowerCase();

  if (
    lowerMerchant.includes('rent') ||
    lowerMerchant.includes('mortgage') ||
    lowerMerchant.includes('utilities') ||
    lowerMerchant.includes('electric') ||
    lowerMerchant.includes('water') ||
    lowerMerchant.includes('gas')
  ) {
    return 'Housing';
  }

  if (
    lowerMerchant.includes('restaurant') ||
    lowerMerchant.includes('cafe') ||
    lowerMerchant.includes('coffee') ||
    lowerMerchant.includes('starbucks') ||
    lowerMerchant.includes('mcdonald') ||
    lowerMerchant.includes('grocery') ||
    lowerMerchant.includes('market') ||
    lowerMerchant.includes('food')
  ) {
    return 'Food';
  }

  if (
    lowerMerchant.includes('uber') ||
    lowerMerchant.includes('lyft') ||
    lowerMerchant.includes('taxi') ||
    lowerMerchant.includes('gas station') ||
    lowerMerchant.includes('parking') ||
    lowerMerchant.includes('transit') ||
    lowerMerchant.includes('metro') ||
    lowerMerchant.includes('bus')
  ) {
    return 'Transport';
  }

  if (
    lowerMerchant.includes('pharmacy') ||
    lowerMerchant.includes('hospital') ||
    lowerMerchant.includes('clinic') ||
    lowerMerchant.includes('doctor') ||
    lowerMerchant.includes('medical') ||
    lowerMerchant.includes('health')
  ) {
    return 'Health';
  }

  if (
    lowerMerchant.includes('cinema') ||
    lowerMerchant.includes('movie') ||
    lowerMerchant.includes('theater') ||
    lowerMerchant.includes('spotify') ||
    lowerMerchant.includes('netflix') ||
    lowerMerchant.includes('game') ||
    lowerMerchant.includes('bar') ||
    lowerMerchant.includes('club')
  ) {
    return 'Entertainment';
  }

  if (
    lowerMerchant.includes('amazon') ||
    lowerMerchant.includes('store') ||
    lowerMerchant.includes('shop') ||
    lowerMerchant.includes('mall')
  ) {
    return 'Shopping';
  }

  return 'Other';
}

export function AddTransactionScreen({ navigation }: AddTransactionScreenProps) {
  const colors = useColors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | undefined>(undefined);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    defaultValues: {
      amount: 0,
      merchant: '',
      date: new Date(),
      category: 'Other',
      notes: '',
    },
  });

  const merchant = watch('merchant');

  useEffect(() => {
    if (merchant && merchant.length > 2) {
      const suggested = autoCategorizeMerchant(merchant);
      setSuggestedCategory(suggested);
      setValue('category', suggested);
    }
  }, [merchant, setValue]);

  const onSubmit = async (data: TransactionFormData) => {
    if (data.amount <= 0) {
      hapticError();
      Alert.alert('Invalid Amount', 'Please enter an amount greater than 0');
      return;
    }

    if (!data.merchant.trim()) {
      hapticError();
      Alert.alert('Missing Merchant', 'Please enter a merchant name');
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateTransactionInput = {
        amount: data.amount,
        merchant: data.merchant.trim(),
        date: data.date.toISOString(),
        category: data.category,
        notes: data.notes.trim() || undefined,
      };

      await createTransaction(input);
      hapticSuccess();
      navigation.goBack();
    } catch (error: any) {
      hapticError();
      console.error('Create transaction error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save transaction. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Add Transaction</Text>

        {/* Amount Input */}
        <Controller
          control={control}
          name="amount"
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <CurrencyInput
              label="Amount"
              value={value}
              onChange={onChange}
              autoFocus={true}
              error={errors.amount ? 'Amount is required' : undefined}
            />
          )}
        />

        {/* Merchant Input */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Merchant</Text>
          <Controller
            control={control}
            name="merchant"
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  },
                ]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g., Starbucks, Amazon"
                placeholderTextColor={colors.textMuted}
              />
            )}
          />
          {errors.merchant && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Merchant is required
            </Text>
          )}
        </View>

        {/* Category Picker */}
        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <CategoryPicker
              label="Category"
              value={value}
              onChange={onChange}
              suggestedCategory={suggestedCategory}
            />
          )}
        />

        {/* Date Picker */}
        <Controller
          control={control}
          name="date"
          render={({ field: { value, onChange } }) => (
            <DatePicker label="Date" value={value} onChange={onChange} />
          )}
        />

        {/* Notes Input */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Notes (optional)</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[
                  styles.textInput,
                  styles.textInputMultiline,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                  },
                ]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Add any notes..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          fullWidth
          style={styles.submitButton}
        >
          Save Transaction
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl * 2,
  },
  title: {
    fontSize: tokens.typography.sizes.headingLg.fontSize,
    fontWeight: tokens.typography.weights.bold,
    marginBottom: tokens.spacing.lg,
  },
  fieldContainer: {
    marginVertical: tokens.spacing.sm,
  },
  label: {
    fontSize: tokens.typography.sizes.label.fontSize,
    fontWeight: tokens.typography.weights.medium,
    marginBottom: tokens.spacing.sm,
  },
  textInput: {
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: tokens.typography.sizes.caption.fontSize,
    marginTop: tokens.spacing.xs,
    marginLeft: tokens.spacing.xs,
  },
  submitButton: {
    marginTop: tokens.spacing.lg,
  },
});
