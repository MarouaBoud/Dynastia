import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface IncomeEntry {
  id: string;
  source: string;
  amount: string;
}

interface BudgetSetupIncomeScreenProps {
  navigation: any;
}

/**
 * Budget setup screen - Income entry
 * First step of budget creation flow
 */
export function BudgetSetupIncomeScreen({ navigation }: BudgetSetupIncomeScreenProps) {
  const { user } = useAuth();
  const currency = user?.currency === 'USD' ? '$' : '€';

  const [incomes, setIncomes] = useState<IncomeEntry[]>([
    { id: '1', source: 'Salary', amount: '' },
  ]);

  const addIncomeSource = () => {
    const newId = String(Date.now());
    setIncomes([...incomes, { id: newId, source: '', amount: '' }]);
  };

  const updateIncome = (id: string, field: 'source' | 'amount', value: string) => {
    setIncomes(incomes.map(inc =>
      inc.id === id ? { ...inc, [field]: value } : inc
    ));
  };

  const removeIncome = (id: string) => {
    if (incomes.length > 1) {
      setIncomes(incomes.filter(inc => inc.id !== id));
    }
  };

  const getTotalIncome = (): number => {
    return incomes.reduce((sum, inc) => {
      const amount = parseFloat(inc.amount.replace(/[^0-9.]/g, '')) || 0;
      return sum + amount;
    }, 0);
  };

  const totalIncome = getTotalIncome();
  const canContinue = totalIncome > 0;

  const handleContinue = () => {
    navigation.navigate('BudgetSetupAllocation', {
      totalIncome,
      incomes: incomes.filter(inc => parseFloat(inc.amount) > 0),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Let's set up your budget</Text>
          <Text style={styles.subtitle}>
            Start with your monthly income. This helps us suggest the right allocation for you.
          </Text>
        </View>

        {incomes.map((income, index) => (
          <View key={income.id} style={styles.incomeCard}>
            <View style={styles.incomeHeader}>
              <Text style={styles.incomeLabel}>Income Source {index + 1}</Text>
              {incomes.length > 1 && (
                <TouchableOpacity onPress={() => removeIncome(income.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={styles.sourceInput}
              placeholder="e.g., Salary, Freelance, Side hustle"
              placeholderTextColor="#9CA3AF"
              value={income.source}
              onChangeText={(text) => updateIncome(income.id, 'source', text)}
            />

            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>{currency}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={income.amount}
                onChangeText={(text) => updateIncome(income.id, 'amount', text.replace(/[^0-9.]/g, ''))}
              />
              <Text style={styles.perMonth}>/month</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addIncomeSource}>
          <Text style={styles.addButtonText}>+ Add another income source</Text>
        </TouchableOpacity>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Monthly Income</Text>
          <Text style={styles.totalAmount}>
            {currency}{totalIncome.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  incomeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  incomeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  removeText: {
    fontSize: 14,
    color: '#EF4444',
  },
  sourceInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  perMonth: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  addButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  totalContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6366F1',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4F46E5',
  },
  footer: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    height: 56,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
