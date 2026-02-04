import { api } from './api';

export interface NetWorthData {
  netWorth: number; // in cents
  totalAssets: number; // in cents
  totalLiabilities: number; // in cents
  monthlyDelta: number; // in cents
  assetBreakdown: Array<{
    id: string;
    type: string;
    name: string;
    value: number; // in cents
  }>;
  liabilityBreakdown: Array<{
    id: string;
    type: string;
    name: string;
    balance: number; // in cents
  }>;
}

/**
 * Get net worth data for the authenticated user
 * Includes current net worth, total assets/liabilities, monthly change, and breakdowns
 */
export async function getNetWorth(): Promise<NetWorthData> {
  const response = await api.get<NetWorthData>('/networth');
  return response.data;
}
