import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { CurrencyInput } from '../../components/forms/CurrencyInput';
import {
  getLiabilities,
  updateLiability,
  deleteLiability,
  Liability,
} from '../../services/liabilities.service';

const LIABILITY_TYPES = [
  { value: 'CreditCard', label: 'Credit Card (credit card balances)' },
  { value: 'Loan', label: 'Loan (student, personal, car loans)' },
  { value: 'Mortgage', label: 'Mortgage (home loan)' },
  { value: 'Other', label: 'Other (medical debt, etc.)' },
];

export function LiabilityDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { liabilityId } = route.params as { liabilityId: string };

  const [liability, setLiability] = useState<Liability | null>(null);
  const [type, setType] = useState<string>('CreditCard');
  const [name, setName] = useState('');
  const [balance, setBalance] = useState(0); // in cents
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLiability();
  }, [liabilityId]);

  const fetchLiability = async () => {
    try {
      const liabilities = await getLiabilities();
      const foundLiability = liabilities.find((l) => l.id === liabilityId);

      if (foundLiability) {
        setLiability(foundLiability);
        setType(foundLiability.type);
        setName(foundLiability.name);
        setBalance(foundLiability.balance);
      } else {
        Alert.alert('Error', 'Liability not found');
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load liability');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

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
      setSaving(true);
      await updateLiability(liabilityId, {
        type: type as any,
        name: name.trim(),
        balance: balance,
      });

      // Navigate back on success
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to update liability'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Liability',
      'Are you sure you want to delete this liability? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLiability(liabilityId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete liability');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

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
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.7}
      >
        {saving ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteButtonText}>Delete Liability</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
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
  deleteButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
