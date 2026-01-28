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
import { RouteProp } from '@react-navigation/native';
import { CurrencyInput } from '../../components/forms/CurrencyInput';
import { CategoryPicker } from '../../components/forms/CategoryPicker';
import { DatePicker } from '../../components/forms/DatePicker';
import {
  getTransaction,
  updateTransaction,
  deleteTransaction,
  Transaction,
  CreateTransactionInput,
} from '../../services/transactions.service';

type RootStackParamList = {
  TransactionList: undefined;
  AddTransaction: undefined;
  TransactionDetail: { transactionId: string };
};

type TransactionDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TransactionDetail'>;
  route: RouteProp<RootStackParamList, 'TransactionDetail'>;
};

interface TransactionFormData {
  amount: number; // in cents
  merchant: string;
  date: Date;
  category: string;
  notes: string;
}

export function TransactionDetailScreen({
  navigation,
  route,
}: TransactionDetailScreenProps) {
  const { transactionId } = route.params;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const {
    control,
    handleSubmit,
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

  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      const data = await getTransaction(transactionId);
      setTransaction(data);

      // Pre-fill form with existing data
      setValue('amount', data.amount);
      setValue('merchant', data.merchant);
      setValue('date', new Date(data.date));
      setValue('category', data.category);
      setValue('notes', data.notes || '');
    } catch (error) {
      console.error('Fetch transaction error:', error);
      Alert.alert('Error', 'Failed to load transaction');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

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
      const input: Partial<CreateTransactionInput> = {
        amount: data.amount,
        merchant: data.merchant.trim(),
        date: data.date.toISOString(),
        category: data.category,
        notes: data.notes.trim() || undefined,
      };

      await updateTransaction(transactionId, input);

      // Navigate back to list
      navigation.goBack();
    } catch (error: any) {
      console.error('Update transaction error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update transaction. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);

    try {
      await deleteTransaction(transactionId);
      navigation.goBack();
    } catch (error: any) {
      console.error('Delete transaction error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to delete transaction. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Edit Transaction</Text>

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
            <CategoryPicker label="Category" value={value} onChange={onChange} />
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
            <Text style={styles.submitButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteButton, isSubmitting && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>Delete Transaction</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  deleteButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
});
