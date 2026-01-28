import { api } from './api';

/**
 * Transaction interface matching backend schema
 */
export interface Transaction {
  id: string;
  amount: number; // in cents
  merchant: string;
  description?: string;
  date: string; // ISO string
  category: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new transaction
 */
export interface CreateTransactionInput {
  amount: number; // in cents
  merchant: string;
  date: string; // ISO string
  category?: string; // optional - server will auto-categorize if missing
  notes?: string;
}

/**
 * Parameters for fetching transactions
 */
export interface GetTransactionsParams {
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  category?: string;
  limit?: number;
}

/**
 * Create a new transaction
 * @param input - Transaction data
 * @returns Created transaction
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  const response = await api.post<Transaction>('/transactions', input);
  return response.data;
}

/**
 * Get list of transactions with optional filters
 * @param params - Query parameters (startDate, endDate, category, limit)
 * @returns Array of transactions
 */
export async function getTransactions(
  params?: GetTransactionsParams
): Promise<Transaction[]> {
  const response = await api.get<Transaction[]>('/transactions', { params });
  return response.data;
}

/**
 * Get a single transaction by ID
 * @param id - Transaction ID
 * @returns Transaction details
 */
export async function getTransaction(id: string): Promise<Transaction> {
  const response = await api.get<Transaction>(`/transactions/${id}`);
  return response.data;
}

/**
 * Update an existing transaction
 * @param id - Transaction ID
 * @param input - Updated transaction data
 * @returns Updated transaction
 */
export async function updateTransaction(
  id: string,
  input: Partial<CreateTransactionInput>
): Promise<Transaction> {
  const response = await api.put<Transaction>(`/transactions/${id}`, input);
  return response.data;
}

/**
 * Delete a transaction
 * @param id - Transaction ID
 */
export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}
