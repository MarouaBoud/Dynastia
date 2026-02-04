import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Slider from '@react-native-community/slider';

interface AllocationAdjustModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (savings: number, bills: number, lifestyle: number) => void;
  initialSavings: number;
  initialBills: number;
  initialLifestyle: number;
  totalIncome: number;
  currency?: string;
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string = '€'): string {
  return `${currency}${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Modal for adjusting budget allocation percentages
 */
export function AllocationAdjustModal({
  visible,
  onClose,
  onSave,
  initialSavings,
  initialBills,
  initialLifestyle,
  totalIncome,
  currency = '€',
}: AllocationAdjustModalProps) {
  const [savings, setSavings] = useState(initialSavings);
  const [bills, setBills] = useState(initialBills);
  const [lifestyle, setLifestyle] = useState(initialLifestyle);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setSavings(initialSavings);
      setBills(initialBills);
      setLifestyle(initialLifestyle);
    }
  }, [visible, initialSavings, initialBills, initialLifestyle]);

  const total = savings + bills + lifestyle;
  const isValid = Math.abs(total - 100) < 0.5;

  // Adjust other sliders when one changes
  const handleSavingsChange = (value: number) => {
    const newSavings = Math.round(value);
    const remaining = 100 - newSavings;
    const ratio = bills / (bills + lifestyle) || 0.5;
    setSavings(newSavings);
    setBills(Math.round(remaining * ratio));
    setLifestyle(Math.round(remaining * (1 - ratio)));
  };

  const handleBillsChange = (value: number) => {
    const newBills = Math.round(value);
    const remaining = 100 - newBills;
    const ratio = savings / (savings + lifestyle) || 0.5;
    setBills(newBills);
    setSavings(Math.round(remaining * ratio));
    setLifestyle(Math.round(remaining * (1 - ratio)));
  };

  const handleLifestyleChange = (value: number) => {
    const newLifestyle = Math.round(value);
    const remaining = 100 - newLifestyle;
    const ratio = savings / (savings + bills) || 0.5;
    setLifestyle(newLifestyle);
    setSavings(Math.round(remaining * ratio));
    setBills(Math.round(remaining * (1 - ratio)));
  };

  const handleSave = () => {
    // Ensure they add up to exactly 100
    const diff = 100 - (savings + bills + lifestyle);
    onSave(savings + diff, bills, lifestyle);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.handle} />

              <Text style={styles.title}>Adjust your allocations</Text>
              <Text style={styles.subtitle}>
                Slide to change how you divide your income
              </Text>

              {/* Savings Slider */}
              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <Text style={[styles.bucketName, { color: '#10B981' }]}>
                    Pay Yourself First
                  </Text>
                  <Text style={styles.percentage}>{savings}%</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={60}
                  value={savings}
                  onValueChange={handleSavingsChange}
                  minimumTrackTintColor="#10B981"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#10B981"
                />
                <Text style={styles.amount}>
                  {formatCurrency((totalIncome * savings) / 100, currency)}
                </Text>
              </View>

              {/* Bills Slider */}
              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <Text style={[styles.bucketName, { color: '#3B82F6' }]}>
                    Fixed Expenses
                  </Text>
                  <Text style={styles.percentage}>{bills}%</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={80}
                  value={bills}
                  onValueChange={handleBillsChange}
                  minimumTrackTintColor="#3B82F6"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#3B82F6"
                />
                <Text style={styles.amount}>
                  {formatCurrency((totalIncome * bills) / 100, currency)}
                </Text>
              </View>

              {/* Lifestyle Slider */}
              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <Text style={[styles.bucketName, { color: '#8B5CF6' }]}>
                    Enjoy Life
                  </Text>
                  <Text style={styles.percentage}>{lifestyle}%</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={60}
                  value={lifestyle}
                  onValueChange={handleLifestyleChange}
                  minimumTrackTintColor="#8B5CF6"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#8B5CF6"
                />
                <Text style={styles.amount}>
                  {formatCurrency((totalIncome * lifestyle) / 100, currency)}
                </Text>
              </View>

              {/* Total Indicator */}
              <View style={styles.totalContainer}>
                <Text style={[styles.totalText, !isValid && styles.totalInvalid]}>
                  Total: {total}%
                </Text>
                {!isValid && (
                  <Text style={styles.errorText}>Must equal 100%</Text>
                )}
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={!isValid}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bucketName: {
    fontSize: 16,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  amount: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  totalContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  totalInvalid: {
    color: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
