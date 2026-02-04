/**
 * Budget Controller
 *
 * CRUD operations for monthly budgets with Pay Yourself First allocations.
 * Handles budget creation, progress tracking, and allocation adjustments.
 */

import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { getCategoryBucket } from '../utils/categoryMapping';

const prisma = new PrismaClient();

// Allocation presets
const ALLOCATION_PRESETS = {
  conservative: { savings: 10, bills: 60, lifestyle: 30 },
  balanced: { savings: 20, bills: 50, lifestyle: 30 },
  growth: { savings: 30, bills: 50, lifestyle: 20 },
};

/**
 * Create a new monthly budget
 * POST /api/budgets
 *
 * Body: { month: number, year: number, totalIncome: number, preset?: string, savingsPercent?: number, billsPercent?: number, lifestylePercent?: number }
 */
export async function createBudget(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { month, year, totalIncome, preset, savingsPercent, billsPercent, lifestylePercent } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Validate required fields
    if (!month || month < 1 || month > 12) {
      res.status(400).json({ error: 'Month must be between 1 and 12' });
      return;
    }

    if (!year || year < 2020 || year > 2100) {
      res.status(400).json({ error: 'Please provide a valid year' });
      return;
    }

    if (!totalIncome || totalIncome <= 0) {
      res.status(400).json({ error: 'Total income must be greater than 0' });
      return;
    }

    // Check if budget already exists for this month/year
    const existing = await prisma.budget.findUnique({
      where: {
        userId_month_year: { userId, month, year },
      },
    });

    if (existing) {
      res.status(409).json({ error: 'A budget already exists for this month. You can update it instead.' });
      return;
    }

    // Determine allocation percentages
    let allocations = ALLOCATION_PRESETS.balanced; // default

    if (preset && ALLOCATION_PRESETS[preset as keyof typeof ALLOCATION_PRESETS]) {
      allocations = ALLOCATION_PRESETS[preset as keyof typeof ALLOCATION_PRESETS];
    } else if (savingsPercent !== undefined && billsPercent !== undefined && lifestylePercent !== undefined) {
      // Validate custom percentages sum to 100
      const total = savingsPercent + billsPercent + lifestylePercent;
      if (Math.abs(total - 100) > 0.01) {
        res.status(400).json({ error: 'Allocation percentages must add up to 100%' });
        return;
      }
      allocations = { savings: savingsPercent, bills: billsPercent, lifestyle: lifestylePercent };
    }

    // Calculate bucket amounts
    const savingsAmount = (totalIncome * allocations.savings) / 100;
    const billsAmount = (totalIncome * allocations.bills) / 100;
    const lifestyleAmount = (totalIncome * allocations.lifestyle) / 100;

    // Create budget
    const budget = await prisma.budget.create({
      data: {
        userId,
        month,
        year,
        totalIncome,
        savingsPercent: allocations.savings,
        billsPercent: allocations.bills,
        lifestylePercent: allocations.lifestyle,
        savingsAmount,
        billsAmount,
        lifestyleAmount,
      },
    });

    res.status(201).json(budget);
  } catch (error: any) {
    console.error('Create budget error:', error);
    res.status(500).json({
      error: "We couldn't create your budget. Let's try again.",
    });
  }
}

/**
 * Get current month's budget
 * GET /api/budgets/current
 */
export async function getCurrentBudget(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    const year = now.getFullYear();

    const budget = await prisma.budget.findUnique({
      where: {
        userId_month_year: { userId, month, year },
      },
      include: {
        incomes: true,
        sinkingFunds: {
          where: { isCompleted: false },
        },
      },
    });

    if (!budget) {
      res.status(404).json({
        error: 'No budget found for this month',
        needsSetup: true,
        month,
        year,
      });
      return;
    }

    res.status(200).json(budget);
  } catch (error: any) {
    console.error('Get current budget error:', error);
    res.status(500).json({
      error: "We couldn't load your budget. Let's try again.",
    });
  }
}

/**
 * Get budget by ID
 * GET /api/budgets/:id
 */
export async function getBudget(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const budget = await prisma.budget.findFirst({
      where: { id, userId },
      include: {
        incomes: true,
        sinkingFunds: true,
      },
    });

    if (!budget) {
      res.status(404).json({ error: "We couldn't find that budget." });
      return;
    }

    res.status(200).json(budget);
  } catch (error: any) {
    console.error('Get budget error:', error);
    res.status(500).json({
      error: "We couldn't load that budget. Let's try again.",
    });
  }
}

/**
 * Update budget allocations
 * PATCH /api/budgets/:id
 *
 * Body: { totalIncome?, savingsPercent?, billsPercent?, lifestylePercent? }
 */
export async function updateBudget(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    const { totalIncome, savingsPercent, billsPercent, lifestylePercent } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify budget belongs to user
    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that budget." });
      return;
    }

    // Build update data
    const updateData: any = {};

    // Update income if provided
    const newIncome = totalIncome !== undefined ? totalIncome : Number(existing.totalIncome);
    if (totalIncome !== undefined) {
      updateData.totalIncome = totalIncome;
    }

    // Update percentages if all three provided
    if (savingsPercent !== undefined && billsPercent !== undefined && lifestylePercent !== undefined) {
      const total = savingsPercent + billsPercent + lifestylePercent;
      if (Math.abs(total - 100) > 0.01) {
        res.status(400).json({ error: 'Allocation percentages must add up to 100%' });
        return;
      }
      updateData.savingsPercent = savingsPercent;
      updateData.billsPercent = billsPercent;
      updateData.lifestylePercent = lifestylePercent;

      // Recalculate amounts
      updateData.savingsAmount = (newIncome * savingsPercent) / 100;
      updateData.billsAmount = (newIncome * billsPercent) / 100;
      updateData.lifestyleAmount = (newIncome * lifestylePercent) / 100;
    } else if (totalIncome !== undefined) {
      // Recalculate amounts with existing percentages
      updateData.savingsAmount = (newIncome * Number(existing.savingsPercent)) / 100;
      updateData.billsAmount = (newIncome * Number(existing.billsPercent)) / 100;
      updateData.lifestyleAmount = (newIncome * Number(existing.lifestylePercent)) / 100;
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(budget);
  } catch (error: any) {
    console.error('Update budget error:', error);
    res.status(500).json({
      error: "We couldn't save your changes. Let's try again.",
    });
  }
}

/**
 * Get spending progress for a budget
 * GET /api/budgets/:id/progress
 *
 * Calculates actual spending per bucket from transactions
 */
export async function getBudgetProgress(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Get budget
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      res.status(404).json({ error: "We couldn't find that budget." });
      return;
    }

    // Get start and end of budget month
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

    // Get all transactions for this month
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Aggregate spending by bucket
    const spending = {
      savings: new Prisma.Decimal(0),
      bills: new Prisma.Decimal(0),
      lifestyle: new Prisma.Decimal(0),
    };

    for (const tx of transactions) {
      const bucket = getCategoryBucket(tx.category);
      spending[bucket] = spending[bucket].add(tx.amount);
    }

    // Calculate progress percentages
    const savingsSpent = Number(spending.savings);
    const billsSpent = Number(spending.bills);
    const lifestyleSpent = Number(spending.lifestyle);

    const savingsAllocated = Number(budget.savingsAmount);
    const billsAllocated = Number(budget.billsAmount);
    const lifestyleAllocated = Number(budget.lifestyleAmount);

    const progress = {
      budget: {
        id: budget.id,
        month: budget.month,
        year: budget.year,
        totalIncome: Number(budget.totalIncome),
      },
      buckets: {
        savings: {
          allocated: savingsAllocated,
          spent: savingsSpent,
          remaining: savingsAllocated - savingsSpent,
          percentUsed: savingsAllocated > 0 ? (savingsSpent / savingsAllocated) * 100 : 0,
          status: getProgressStatus(savingsSpent, savingsAllocated),
        },
        bills: {
          allocated: billsAllocated,
          spent: billsSpent,
          remaining: billsAllocated - billsSpent,
          percentUsed: billsAllocated > 0 ? (billsSpent / billsAllocated) * 100 : 0,
          status: getProgressStatus(billsSpent, billsAllocated),
        },
        lifestyle: {
          allocated: lifestyleAllocated,
          spent: lifestyleSpent,
          remaining: lifestyleAllocated - lifestyleSpent,
          percentUsed: lifestyleAllocated > 0 ? (lifestyleSpent / lifestyleAllocated) * 100 : 0,
          status: getProgressStatus(lifestyleSpent, lifestyleAllocated),
        },
      },
      total: {
        allocated: savingsAllocated + billsAllocated + lifestyleAllocated,
        spent: savingsSpent + billsSpent + lifestyleSpent,
        remaining: (savingsAllocated + billsAllocated + lifestyleAllocated) - (savingsSpent + billsSpent + lifestyleSpent),
      },
    };

    res.status(200).json(progress);
  } catch (error: any) {
    console.error('Get budget progress error:', error);
    res.status(500).json({
      error: "We couldn't calculate your progress. Let's try again.",
    });
  }
}

/**
 * Get allocation presets
 * GET /api/budgets/presets
 */
export async function getPresets(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    presets: [
      {
        id: 'conservative',
        name: 'Conservative',
        description: 'Build stability first',
        savings: 10,
        bills: 60,
        lifestyle: 30,
      },
      {
        id: 'balanced',
        name: 'Balanced',
        description: 'Recommended for most',
        savings: 20,
        bills: 50,
        lifestyle: 30,
        isRecommended: true,
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'Accelerate wealth building',
        savings: 30,
        bills: 50,
        lifestyle: 20,
      },
    ],
  });
}

/**
 * Check if income changed significantly from previous month
 * GET /api/budgets/check-rebalance
 */
export async function checkRebalance(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get previous month
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = currentYear - 1;
    }

    // Get both budgets
    const [currentBudget, previousBudget] = await Promise.all([
      prisma.budget.findUnique({
        where: { userId_month_year: { userId, month: currentMonth, year: currentYear } },
      }),
      prisma.budget.findUnique({
        where: { userId_month_year: { userId, month: prevMonth, year: prevYear } },
      }),
    ]);

    if (!currentBudget || !previousBudget) {
      res.status(200).json({ needsRebalance: false, reason: 'Not enough data' });
      return;
    }

    const currentIncome = Number(currentBudget.totalIncome);
    const previousIncome = Number(previousBudget.totalIncome);

    const changePercent = Math.abs((currentIncome - previousIncome) / previousIncome) * 100;

    res.status(200).json({
      needsRebalance: changePercent > 10,
      changePercent: Math.round(changePercent * 100) / 100,
      currentIncome,
      previousIncome,
      direction: currentIncome > previousIncome ? 'increased' : 'decreased',
    });
  } catch (error: any) {
    console.error('Check rebalance error:', error);
    res.status(500).json({
      error: "We couldn't check your income changes. Let's try again.",
    });
  }
}

// Helper function to determine progress status
function getProgressStatus(spent: number, allocated: number): string {
  if (allocated === 0) return 'on-track';
  const percent = (spent / allocated) * 100;
  if (percent < 90) return 'on-track';
  if (percent < 100) return 'warning';
  return 'over';
}
