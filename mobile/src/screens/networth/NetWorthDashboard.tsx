import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NetWorthCard } from '../../components/networth/NetWorthCard';
import { AssetLiabilityList } from '../../components/networth/AssetLiabilityList';
import { getNetWorth, NetWorthData } from '../../services/networth.service';

export function NetWorthDashboard() {
  const navigation = useNavigation();
  const [data, setData] = useState<NetWorthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNetWorth = useCallback(async () => {
    try {
      setError(null);
      const networthData = await getNetWorth();
      setData(networthData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load net worth');
      console.error('Error fetching net worth:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNetWorth();
  }, [fetchNetWorth]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNetWorth();
  }, [fetchNetWorth]);

  const handleAssetPress = useCallback(
    (id: string) => {
      navigation.navigate('AssetDetail' as never, { assetId: id } as never);
    },
    [navigation]
  );

  const handleLiabilityPress = useCallback(
    (id: string) => {
      navigation.navigate('LiabilityDetail' as never, { liabilityId: id } as never);
    },
    [navigation]
  );

  const handleAddAsset = useCallback(() => {
    navigation.navigate('AddAsset' as never);
  }, [navigation]);

  const handleAddLiability = useCallback(() => {
    navigation.navigate('AddLiability' as never);
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchNetWorth}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <NetWorthCard
        netWorth={data.netWorth}
        monthlyDelta={data.monthlyDelta}
      />

      <AssetLiabilityList
        title="Assets"
        total={data.totalAssets}
        items={data.assetBreakdown}
        onItemPress={handleAssetPress}
        onAddPress={handleAddAsset}
        valueKey="value"
      />

      <AssetLiabilityList
        title="Liabilities"
        total={data.totalLiabilities}
        items={data.liabilityBreakdown}
        onItemPress={handleLiabilityPress}
        onAddPress={handleAddLiability}
        valueKey="balance"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    paddingVertical: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
