import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  maxDate?: Date;
  label?: string;
}

export function DatePicker({
  value,
  onChange,
  maxDate = new Date(), // Default to today
  label,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android, picker closes automatically
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };

  const handlePress = () => {
    setShowPicker(true);
  };

  const handleDismiss = () => {
    setShowPicker(false);
  };

  // Format date as "Jan 28, 2026"
  const formattedDate = value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>

      {showPicker && (
        <>
          {Platform.OS === 'ios' && (
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={handleDismiss}>
                  <Text style={styles.iosPickerButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={maxDate}
              />
            </View>
          )}
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={value}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={maxDate}
            />
          )}
        </>
      )}
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  calendarIcon: {
    fontSize: 20,
  },
  iosPickerContainer: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: 8,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  iosPickerButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
});
