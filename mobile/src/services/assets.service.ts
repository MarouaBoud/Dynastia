import { api } from './api';

export interface Asset {
  id: string;
  type: 'Cash' | 'Investments' | 'Property' | 'Vehicles' | 'Other';
  name: string;
  value: number; // in cents
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetInput {
  type: 'Cash' | 'Investments' | 'Property' | 'Vehicles' | 'Other';
  name: string;
  value: number; // in cents
}

export interface UpdateAssetInput {
  type?: 'Cash' | 'Investments' | 'Property' | 'Vehicles' | 'Other';
  name?: string;
  value?: number; // in cents
}

/**
 * Create a new asset
 */
export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const response = await api.post<Asset>('/assets', input);
  return response.data;
}

/**
 * Get all assets for the authenticated user
 */
export async function getAssets(): Promise<Asset[]> {
  const response = await api.get<Asset[]>('/assets');
  return response.data;
}

/**
 * Update an existing asset
 */
export async function updateAsset(
  id: string,
  input: UpdateAssetInput
): Promise<Asset> {
  const response = await api.put<Asset>(`/assets/${id}`, input);
  return response.data;
}

/**
 * Delete an asset
 */
export async function deleteAsset(id: string): Promise<void> {
  await api.delete(`/assets/${id}`);
}
