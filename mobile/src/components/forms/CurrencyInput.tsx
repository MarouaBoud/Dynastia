import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { formatForDisplay, parseCurrencyInput, getCurrencySymbol } from '../../utils/currency';

interface CurrencyInputProps {
  value: number; // in cents
  onChange: (valueInCents: number) => void;
  currency?: string;
  error?: string;
  placeholder?: string;
  autoFocus?: boolean;
  label?: string;
}

export function CurrencyInput({
  value,
  onChange,
  currency = 'USD',
  error,
  placeholder = '0.00',
  autoFocus = false,
  label,
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const currencySymbol = getCurrencySymbol(currency);

  const handleTextChange = (text: string) => {
    // Parse the input to cents
    const cents = parseCurrencyInput(text);
    onChange(cents);
  };

  // Display value in dollars with 2 decimal places
  const displayValue = value > 0 ? formatForDisplay(value) : '';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused, error && styles.inputContainerError]}>
        <Text style={styles.currencySymbol}>{currencySymbol}</Text>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleTextChange}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor="#999"
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    backgroundColor: '#FFF',
    borderColor: '#6366F1',
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },
});
