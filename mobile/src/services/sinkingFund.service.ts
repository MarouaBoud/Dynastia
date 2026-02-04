/**
 * Sinking Fund Service
 *
 * API client for savings goals with target amounts and deadlines.
 * Handles CRUD operations and contribution tracking.
 */

import { api } from './api';

// =============================================================================
// Types
// =============================================================================

export interface SinkingFund {
  id: string;
  userId: string;
  name: string;
  targetAmount: number; // in cents
  currentAmount: number; // in cents
  deadline: string;
  isCompleted: boolean;
  completedAt: string | null;
  budgetId: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  progress?: number; // percentage (0-100)
  monthlyContribution?: number; // in cents
  monthsRemaining?: number;
}

export interface CreateSinkingFundInput {
  name: string;
  targetAmount: number; // in cents
  deadline: string; // ISO date string
  budgetId?: string;
}

export interface UpdateSinkingFundInput {
  name?: string;
  targetAmount?: number;
  deadline?: string;
}

export interface ContributeResult extends SinkingFund {
  justCompleted: boolean;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Create a new sinking fund / savings goal
 */
export async function createSinkingFund(data: CreateSinkingFundInput): Promise<SinkingFund> {
  const response = await api.post<SinkingFund>('/sinking-funds', data);
  return response.data;
}

/**
 * Get all sinking funds for the current user
 * @param includeCompleted - Include completed funds (default: false)
 */
export async function getSinkingFunds(includeCompleted: boolean = false): Promise<SinkingFund[]> {
  const params = includeCompleted ? '?includeCompleted=true' : '';
  const response = await api.get<SinkingFund[]>(`/sinking-funds${params}`);
  return response.data;
}

/**
 * Get active (non-completed) sinking funds
 */
export async function getActiveSinkingFunds(): Promise<SinkingFund[]> {
  return getSinkingFunds(false);
}

/**
 * Get completed sinking funds
 */
export async function getCompletedSinkingFunds(): Promise<SinkingFund[]> {
  const all = await getSinkingFunds(true);
  return all.filter((fund) => fund.isCompleted);
}

/**
 * Get a single sinking fund by ID
 */
export async function getSinkingFund(id: string): Promise<SinkingFund> {
  const response = await api.get<SinkingFund>(`/sinking-funds/${id}`);
  return response.data;
}

/**
 * Update a sinking fund
 */
export async function updateSinkingFund(
  id: string,
  data: UpdateSinkingFundInput
): Promise<SinkingFund> {
  const response = await api.patch<SinkingFund>(`/sinking-funds/${id}`, data);
  return response.data;
}

/**
 * Add a contribution to a sinking fund
 * @param id - Sinking fund ID
 * @param amount - Amount to contribute (in cents)
 */
export async function contributeTo(id: string, amount: number): Promise<ContributeResult> {
  const response = await api.post<ContributeResult>(`/sinking-funds/${id}/contribute`, {
    amount,
  });
  return response.data;
}

/**
 * Delete a sinking fund
 */
export async function deleteSinkingFund(id: string): Promise<void> {
  await api.delete(`/sinking-funds/${id}`);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100 * 100) / 100);
}

/**
 * Format months remaining as human-readable string
 */
export function formatMonthsRemaining(months: number): string {
  if (months <= 0) {
    return 'Deadline passed';
  } else if (months === 1) {
    return '1 month left';
  } else if (months < 12) {
    return `${months} months left`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return years === 1 ? '1 year left' : `${years} years left`;
    }
    return `${years}y ${remainingMonths}m left`;
  }
}

/**
 * Get suggested goal names
 */
export function getSuggestedGoalNames(): string[] {
  return [
    'Emergency Fund',
    'Travel',
    'Taxes',
    'Moving',
    'New Car',
    'Home Down Payment',
    'Wedding',
    'Education',
    'Medical',
    'Holiday Gifts',
  ];
}

/**
 * Calculate what the new progress percentage would be after a contribution
 */
export function previewProgress(fund: SinkingFund, contributionAmount: number): number {
  const newCurrent = fund.currentAmount + contributionAmount;
  return calculateProgress(newCurrent, fund.targetAmount);
}
