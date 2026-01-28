import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { CurrencyInput } from '../../components/forms/CurrencyInput';
import { createLiability } from '../../services/liabilities.service';

const LIABILITY_TYPES = [
  { value: 'CreditCard', label: 'Credit Card (credit card balances)' },
  { value: 'Loan', label: 'Loan (student, personal, car loans)' },
  { value: 'Mortgage', label: 'Mortgage (home loan)' },
  { value: 'Other', label: 'Other (medical debt, etc.)' },
];

export function AddLiabilityScreen() {
  const navigation = useNavigation();
  const [type, setType] = useState<string>('CreditCard');
  const [name, setName] = useState('');
  const [balance, setBalance] = useState(0); // in cents
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a liability name');
      return;
    }

    if (balance <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid balance');
      return;
    }

    try {
      setLoading(true);
      await createLiability({
        type: type as any,
        name: name.trim(),
        balance: balance,
      });

      // Navigate back on success
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to create liability'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Liability Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={type}
            onValueChange={(itemValue) => setType(itemValue)}
            style={styles.picker}
          >
            {LIABILITY_TYPES.map((liabilityType) => (
              <Picker.Item
                key={liabilityType.value}
                label={liabilityType.label}
                value={liabilityType.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Visa Card, Student Loan"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Current Balance *</Text>
        <CurrencyInput
          value={balance}
          onChange={setBalance}
          placeholder="0.00"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Liability</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
