import { api } from './api';

/**
 * Income interface matching backend schema
 */
export interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: 'monthly' | 'bi-weekly' | 'weekly' | 'one-time';
  budgetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeInput {
  source: string;
  amount: number;
  frequency?: 'monthly' | 'bi-weekly' | 'weekly' | 'one-time';
  budgetId?: string;
}

export interface IncomesResponse {
  incomes: Income[];
  totalMonthly: number;
}

/**
 * Create a new income source
 */
export async function createIncome(input: CreateIncomeInput): Promise<Income> {
  const response = await api.post<Income>('/incomes', input);
  return response.data;
}

/**
 * Get all income sources
 */
export async function getIncomes(budgetId?: string): Promise<IncomesResponse> {
  const params = budgetId ? { budgetId } : undefined;
  const response = await api.get<IncomesResponse>('/incomes', { params });
  return response.data;
}

/**
 * Get a single income source by ID
 */
export async function getIncome(id: string): Promise<Income> {
  const response = await api.get<Income>(`/incomes/${id}`);
  return response.data;
}

/**
 * Update an income source
 */
export async function updateIncome(
  id: string,
  input: Partial<CreateIncomeInput>
): Promise<Income> {
  const response = await api.patch<Income>(`/incomes/${id}`, input);
  return response.data;
}

/**
 * Delete an income source
 */
export async function deleteIncome(id: string): Promise<void> {
  await api.delete(`/incomes/${id}`);
}
