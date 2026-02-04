/**
 * Bill Service
 *
 * API client for recurring bills and credit card management.
 * Handles CRUD operations and payment tracking.
 */

import { api } from './api';

// =============================================================================
// Types
// =============================================================================

export type BillFrequency = 'weekly' | 'monthly' | 'quarterly';
export type BillCategory = 'housing' | 'utilities' | 'subscription' | 'insurance' | 'other';
export type BillStatus = 'paid' | 'due-soon' | 'overdue' | 'upcoming';

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number; // in cents
  frequency: BillFrequency;
  dueDay: number;
  nextDueDate: string;
  category: BillCategory;
  isCreditCard: boolean;
  creditCardApr: number | null;
  isPaid: boolean;
  lastPaidAt: string | null;
  consecutivePaidInFull: number;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  daysUntilDue?: number;
  status?: BillStatus;
  monthlyInterestCost?: number | null;
}

export interface CreateBillInput {
  name: string;
  amount: number; // in cents
  frequency: BillFrequency;
  dueDay: number;
  category: BillCategory;
  isCreditCard?: boolean;
  creditCardApr?: number;
}

export interface UpdateBillInput {
  name?: string;
  amount?: number;
  frequency?: BillFrequency;
  dueDay?: number;
  category?: BillCategory;
  creditCardApr?: number;
}

export interface MarkPaidResult extends Bill {
  milestoneAchieved: boolean;
  milestoneType: string | null;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Create a new recurring bill
 */
export async function createBill(data: CreateBillInput): Promise<Bill> {
  const response = await api.post<Bill>('/bills', data);
  return response.data;
}

/**
 * Get all bills for the current user
 * @param filter - Optional filter: 'upcoming' | 'credit-cards'
 * @param days - Days ahead for upcoming filter (default: 7)
 */
export async function getBills(filter?: string, days?: number): Promise<Bill[]> {
  const params = new URLSearchParams();
  if (filter) params.append('filter', filter);
  if (days) params.append('days', days.toString());

  const response = await api.get<Bill[]>(`/bills?${params.toString()}`);
  return response.data;
}

/**
 * Get upcoming bills (next 7 days by default)
 */
export async function getUpcomingBills(days: number = 7): Promise<Bill[]> {
  return getBills('upcoming', days);
}

/**
 * Get all credit card bills
 */
export async function getCreditCards(): Promise<Bill[]> {
  return getBills('credit-cards');
}

/**
 * Get a single bill by ID
 */
export async function getBill(id: string): Promise<Bill> {
  const response = await api.get<Bill>(`/bills/${id}`);
  return response.data;
}

/**
 * Update a bill
 */
export async function updateBill(id: string, data: UpdateBillInput): Promise<Bill> {
  const response = await api.patch<Bill>(`/bills/${id}`, data);
  return response.data;
}

/**
 * Delete a bill
 */
export async function deleteBill(id: string): Promise<void> {
  await api.delete(`/bills/${id}`);
}

/**
 * Mark a bill as paid
 * @param id - Bill ID
 * @param paidInFull - For credit cards: whether the full balance was paid
 */
export async function markBillPaid(id: string, paidInFull?: boolean): Promise<MarkPaidResult> {
  const response = await api.post<MarkPaidResult>(`/bills/${id}/mark-paid`, {
    paidInFull,
  });
  return response.data;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get the category icon name based on bill category
 */
export function getBillCategoryIcon(category: BillCategory): string {
  const icons: Record<BillCategory, string> = {
    housing: 'home',
    utilities: 'zap',
    subscription: 'repeat',
    insurance: 'shield',
    other: 'file-text',
  };
  return icons[category] || 'file-text';
}

/**
 * Get status color based on bill status
 */
export function getBillStatusColor(status: BillStatus): string {
  const colors: Record<BillStatus, string> = {
    paid: '#4A9D7C',     // Success green
    'due-soon': '#F59E0B', // Warning amber
    overdue: '#EF4444',    // Error red
    upcoming: '#6B7280',   // Neutral gray
  };
  return colors[status] || '#6B7280';
}

/**
 * Format due date as relative string
 */
export function formatDueDate(daysUntilDue: number): string {
  if (daysUntilDue < 0) {
    const daysOverdue = Math.abs(daysUntilDue);
    return daysOverdue === 1 ? 'Overdue by 1 day' : `Overdue by ${daysOverdue} days`;
  } else if (daysUntilDue === 0) {
    return 'Due today';
  } else if (daysUntilDue === 1) {
    return 'Due tomorrow';
  } else if (daysUntilDue <= 7) {
    return `Due in ${daysUntilDue} days`;
  } else {
    return `Due in ${Math.ceil(daysUntilDue / 7)} weeks`;
  }
}
