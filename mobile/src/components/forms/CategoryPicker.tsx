import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

// Default 7 categories from Phase 2 requirements
export const DEFAULT_CATEGORIES = [
  'Housing',
  'Food',
  'Transport',
  'Shopping',
  'Health',
  'Entertainment',
  'Other',
] as const;

interface CategoryPickerProps {
  value: string;
  onChange: (category: string) => void;
  suggestedCategory?: string;
  label?: string;
}

export function CategoryPicker({
  value,
  onChange,
  suggestedCategory,
  label,
}: CategoryPickerProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      {suggestedCategory && (
        <Text style={styles.suggestionText}>
          Suggested: {suggestedCategory}
        </Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DEFAULT_CATEGORIES.map((category) => {
          const isSelected = value === category;
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
              onPress={() => onChange(category)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  suggestionText: {
    fontSize: 12,
    color: '#6366F1',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  chipTextSelected: {
    color: '#FFF',
  },
});
