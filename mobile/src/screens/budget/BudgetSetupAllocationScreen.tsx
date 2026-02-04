import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useBudget } from '../../contexts/BudgetContext';
import { useAuth } from '../../contexts/AuthContext';
import { AllocationPreset } from '../../services/budget.service';

interface BudgetSetupAllocationScreenProps {
  navigation: any;
  route: any;
}

const BUCKET_COLORS = {
  savings: '#10B981',
  bills: '#3B82F6',
  lifestyle: '#8B5CF6',
};

/**
 * Budget setup screen - Allocation selection
 * Second step of budget creation flow
 */
export function BudgetSetupAllocationScreen({
  navigation,
  route,
}: BudgetSetupAllocationScreenProps) {
  const { totalIncome } = route.params;
  const { loadPresets, setupBudget, state } = useBudget();
  const { user } = useAuth();
  const currency = user?.currency === 'USD' ? '$' : '€';

  const [presets, setPresets] = useState<AllocationPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('balanced');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPresetsData();
  }, []);

  const loadPresetsData = async () => {
    try {
      const loadedPresets = await loadPresets();
      setPresets(loadedPresets);
    } catch (error) {
      console.error('Failed to load presets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedPresetData = (): AllocationPreset | undefined => {
    return presets.find(p => p.id === selectedPreset);
  };

  const calculateAmount = (percent: number): number => {
    return (totalIncome * percent) / 100;
  };

  const formatCurrency = (amount: number): string => {
    return `${currency}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const handleCreateBudget = async () => {
    setIsSaving(true);
    try {
      await setupBudget(totalIncome, selectedPreset);
      navigation.navigate('BudgetDashboard');
    } catch (error) {
      console.error('Failed to create budget:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const preset = getSelectedPresetData();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>How would you like to allocate?</Text>
          <Text style={styles.subtitle}>
            Choose a preset that matches your goals. You can always adjust later.
          </Text>
        </View>

        {/* Preset Cards */}
        <View style={styles.presetsContainer}>
          {presets.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.presetCard,
                selectedPreset === p.id && styles.presetCardSelected,
              ]}
              onPress={() => setSelectedPreset(p.id)}
            >
              {p.isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
              <Text style={styles.presetName}>{p.name}</Text>
              <Text style={styles.presetDescription}>{p.description}</Text>
              <View style={styles.presetAllocation}>
                <View style={styles.allocationItem}>
                  <View style={[styles.allocationDot, { backgroundColor: BUCKET_COLORS.savings }]} />
                  <Text style={styles.allocationText}>{p.savings}% Savings</Text>
                </View>
                <View style={styles.allocationItem}>
                  <View style={[styles.allocationDot, { backgroundColor: BUCKET_COLORS.bills }]} />
                  <Text style={styles.allocationText}>{p.bills}% Bills</Text>
                </View>
                <View style={styles.allocationItem}>
                  <View style={[styles.allocationDot, { backgroundColor: BUCKET_COLORS.lifestyle }]} />
                  <Text style={styles.allocationText}>{p.lifestyle}% Lifestyle</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preview */}
        {preset && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Your budget preview</Text>
            <View style={styles.previewBuckets}>
              <View style={styles.previewBucket}>
                <View style={[styles.previewBar, { backgroundColor: BUCKET_COLORS.savings }]} />
                <Text style={styles.previewLabel}>Pay Yourself First</Text>
                <Text style={styles.previewAmount}>
                  {formatCurrency(calculateAmount(preset.savings))}
                </Text>
              </View>
              <View style={styles.previewBucket}>
                <View style={[styles.previewBar, { backgroundColor: BUCKET_COLORS.bills }]} />
                <Text style={styles.previewLabel}>Fixed Expenses</Text>
                <Text style={styles.previewAmount}>
                  {formatCurrency(calculateAmount(preset.bills))}
                </Text>
              </View>
              <View style={styles.previewBucket}>
                <View style={[styles.previewBar, { backgroundColor: BUCKET_COLORS.lifestyle }]} />
                <Text style={styles.previewLabel}>Enjoy Life</Text>
                <Text style={styles.previewAmount}>
                  {formatCurrency(calculateAmount(preset.lifestyle))}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.createButton, isSaving && styles.createButtonDisabled]}
          onPress={handleCreateBudget}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Budget</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
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
  presetsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  presetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  presetCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -1,
    right: 12,
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  presetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  presetDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  presetAllocation: {
    flexDirection: 'row',
    gap: 16,
  },
  allocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  allocationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewBuckets: {
    gap: 16,
  },
  previewBucket: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  previewLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  previewAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  backButton: {
    height: 56,
    paddingHorizontal: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  createButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
