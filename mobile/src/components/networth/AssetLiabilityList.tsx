import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { formatCurrency } from '../../utils/currency';

interface AssetLiabilityItem {
  id: string;
  type: string;
  name: string;
  value?: number; // for assets (in cents)
  balance?: number; // for liabilities (in cents)
}

interface AssetLiabilityListProps {
  title: string;
  total: number; // in cents
  items: AssetLiabilityItem[];
  onItemPress: (id: string) => void;
  onAddPress: () => void;
  valueKey: 'value' | 'balance';
  currency?: string;
  locale?: string;
}

export function AssetLiabilityList({
  title,
  total,
  items,
  onItemPress,
  onAddPress,
  valueKey,
  currency = 'USD',
  locale = 'en-US',
}: AssetLiabilityListProps) {
  const renderItem = ({ item }: { item: AssetLiabilityItem }) => {
    const amount = item[valueKey] || 0;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => onItemPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemValue}>
            {formatCurrency(amount, currency, locale)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.total}>
          {formatCurrency(total, currency, locale)}
        </Text>
      </View>

      {items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.emptyText}>No {title.toLowerCase()} yet</Text>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddPress}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+ Add {title.slice(0, -1)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  addButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
