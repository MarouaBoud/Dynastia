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
  getAssets,
  updateAsset,
  deleteAsset,
  Asset,
} from '../../services/assets.service';

const ASSET_TYPES = [
  { value: 'Cash', label: 'Cash (checking, savings, emergency fund)' },
  { value: 'Investments', label: 'Investments (brokerage, retirement, crypto)' },
  { value: 'Property', label: 'Property (home equity, real estate)' },
  { value: 'Vehicles', label: 'Vehicles (car, motorcycle)' },
  { value: 'Other', label: 'Other (valuables, collectibles)' },
];

export function AssetDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { assetId } = route.params as { assetId: string };

  const [asset, setAsset] = useState<Asset | null>(null);
  const [type, setType] = useState<string>('Cash');
  const [name, setName] = useState('');
  const [value, setValue] = useState(0); // in cents
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAsset();
  }, [assetId]);

  const fetchAsset = async () => {
    try {
      const assets = await getAssets();
      const foundAsset = assets.find((a) => a.id === assetId);

      if (foundAsset) {
        setAsset(foundAsset);
        setType(foundAsset.type);
        setName(foundAsset.name);
        setValue(foundAsset.value);
      } else {
        Alert.alert('Error', 'Asset not found');
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load asset');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter an asset name');
      return;
    }

    if (value <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid asset value');
      return;
    }

    try {
      setSaving(true);
      await updateAsset(assetId, {
        type: type as any,
        name: name.trim(),
        value: value,
      });

      // Navigate back on success
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to update asset'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Asset',
      'Are you sure you want to delete this asset? This action cannot be undone.',
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
              await deleteAsset(assetId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete asset');
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
        <Text style={styles.label}>Asset Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={type}
            onValueChange={(itemValue) => setType(itemValue)}
            style={styles.picker}
          >
            {ASSET_TYPES.map((assetType) => (
              <Picker.Item
                key={assetType.value}
                label={assetType.label}
                value={assetType.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Chase Checking, Vanguard 401k"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Current Value *</Text>
        <CurrencyInput
          value={value}
          onChange={setValue}
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
        <Text style={styles.deleteButtonText}>Delete Asset</Text>
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
