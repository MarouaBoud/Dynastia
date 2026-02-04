import { api } from './api';

/**
 * Budget interface matching backend schema
 */
export interface Budget {
  id: string;
  month: number;
  year: number;
  totalIncome: number;
  savingsPercent: number;
  billsPercent: number;
  lifestylePercent: number;
  savingsAmount: number;
  billsAmount: number;
  lifestyleAmount: number;
  createdAt: string;
  updatedAt: string;
  incomes?: Income[];
  sinkingFunds?: SinkingFund[];
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: 'monthly' | 'bi-weekly' | 'weekly' | 'one-time';
  budgetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SinkingFund {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  isCompleted: boolean;
  completedAt?: string;
  progress?: number;
  monthlyContribution?: number;
  monthsRemaining?: number;
}

export interface AllocationPreset {
  id: string;
  name: string;
  description: string;
  savings: number;
  bills: number;
  lifestyle: number;
  isRecommended?: boolean;
}

export interface BudgetProgress {
  budget: {
    id: string;
    month: number;
    year: number;
    totalIncome: number;
  };
  buckets: {
    savings: BucketProgress;
    bills: BucketProgress;
    lifestyle: BucketProgress;
  };
  total: {
    allocated: number;
    spent: number;
    remaining: number;
  };
}

export interface BucketProgress {
  allocated: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'on-track' | 'warning' | 'over';
}

export interface CreateBudgetInput {
  month: number;
  year: number;
  totalIncome: number;
  preset?: 'conservative' | 'balanced' | 'growth';
  savingsPercent?: number;
  billsPercent?: number;
  lifestylePercent?: number;
}

export interface RebalanceCheck {
  needsRebalance: boolean;
  changePercent?: number;
  currentIncome?: number;
  previousIncome?: number;
  direction?: 'increased' | 'decreased';
  reason?: string;
}

/**
 * Get allocation presets
 */
export async function getPresets(): Promise<{ presets: AllocationPreset[] }> {
  const response = await api.get<{ presets: AllocationPreset[] }>('/budgets/presets');
  return response.data;
}

/**
 * Get current month's budget
 */
export async function getCurrentBudget(): Promise<Budget> {
  const response = await api.get<Budget>('/budgets/current');
  return response.data;
}

/**
 * Create a new monthly budget
 */
export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  const response = await api.post<Budget>('/budgets', input);
  return response.data;
}

/**
 * Get budget by ID
 */
export async function getBudget(id: string): Promise<Budget> {
  const response = await api.get<Budget>(`/budgets/${id}`);
  return response.data;
}

/**
 * Update budget allocations
 */
export async function updateBudget(
  id: string,
  input: Partial<{
    totalIncome: number;
    savingsPercent: number;
    billsPercent: number;
    lifestylePercent: number;
  }>
): Promise<Budget> {
  const response = await api.patch<Budget>(`/budgets/${id}`, input);
  return response.data;
}

/**
 * Get spending progress for a budget
 */
export async function getBudgetProgress(id: string): Promise<BudgetProgress> {
  const response = await api.get<BudgetProgress>(`/budgets/${id}/progress`);
  return response.data;
}

/**
 * Check if income changed significantly (for rebalance suggestion)
 */
export async function checkRebalance(): Promise<RebalanceCheck> {
  const response = await api.get<RebalanceCheck>('/budgets/check-rebalance');
  return response.data;
}
