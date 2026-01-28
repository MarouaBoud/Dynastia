import { api } from './api';

export interface Liability {
  id: string;
  type: 'CreditCard' | 'Loan' | 'Mortgage' | 'Other';
  name: string;
  balance: number; // in cents
  createdAt: string;
  updatedAt: string;
}

export interface CreateLiabilityInput {
  type: 'CreditCard' | 'Loan' | 'Mortgage' | 'Other';
  name: string;
  balance: number; // in cents
}

export interface UpdateLiabilityInput {
  type?: 'CreditCard' | 'Loan' | 'Mortgage' | 'Other';
  name?: string;
  balance?: number; // in cents
}

/**
 * Create a new liability
 */
export async function createLiability(
  input: CreateLiabilityInput
): Promise<Liability> {
  const response = await api.post<Liability>('/liabilities', input);
  return response.data;
}

/**
 * Get all liabilities for the authenticated user
 */
export async function getLiabilities(): Promise<Liability[]> {
  const response = await api.get<Liability[]>('/liabilities');
  return response.data;
}

/**
 * Update an existing liability
 */
export async function updateLiability(
  id: string,
  input: UpdateLiabilityInput
): Promise<Liability> {
  const response = await api.put<Liability>(`/liabilities/${id}`, input);
  return response.data;
}

/**
 * Delete a liability
 */
export async function deleteLiability(id: string): Promise<void> {
  await api.delete(`/liabilities/${id}`);
}
