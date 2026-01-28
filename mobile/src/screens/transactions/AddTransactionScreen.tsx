import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CurrencyInput } from '../../components/forms/CurrencyInput';
import { CategoryPicker, DEFAULT_CATEGORIES } from '../../components/forms/CategoryPicker';
import { DatePicker } from '../../components/forms/DatePicker';
import { createTransaction, CreateTransactionInput } from '../../services/transactions.service';

type RootStackParamList = {
  TransactionList: undefined;
  AddTransaction: undefined;
  TransactionDetail: { transactionId: string };
};

type AddTransactionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;
};

interface TransactionFormData {
  amount: number; // in cents
  merchant: string;
  date: Date;
  category: string;
  notes: string;
}

/**
 * Auto-categorize merchant based on keyword matching
 * Simple client-side version - backend will also validate
 */
function autoCategorizeMerchant(merchant: string): string {
  const lowerMerchant = merchant.toLowerCase();

  // Housing keywords
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

  // Food keywords
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

  // Transport keywords
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

  // Health keywords
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

  // Entertainment keywords
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

  // Shopping keywords
  if (
    lowerMerchant.includes('amazon') ||
    lowerMerchant.includes('store') ||
    lowerMerchant.includes('shop') ||
    lowerMerchant.includes('mall')
  ) {
    return 'Shopping';
  }

  // Default to Other
  return 'Other';
}

export function AddTransactionScreen({ navigation }: AddTransactionScreenProps) {
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

  // Watch merchant field for auto-categorization
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
      Alert.alert('Invalid Amount', 'Please enter an amount greater than 0');
      return;
    }

    if (!data.merchant.trim()) {
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

      // Navigate back to list
      navigation.goBack();
    } catch (error: any) {
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add Transaction</Text>

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
          <Text style={styles.label}>Merchant</Text>
          <Controller
            control={control}
            name="merchant"
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={styles.textInput}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g., Starbucks, Amazon"
                placeholderTextColor="#999"
              />
            )}
          />
          {errors.merchant && (
            <Text style={styles.errorText}>Merchant is required</Text>
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

        {/* Notes Input (optional) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Notes (optional)</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Add any notes..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Save Transaction</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  fieldContainer: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
