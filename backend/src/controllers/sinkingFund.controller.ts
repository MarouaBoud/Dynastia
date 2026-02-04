/**
 * Sinking Fund Controller
 *
 * CRUD operations for savings goals with target amounts and deadlines.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { differenceInMonths } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Create a new sinking fund
 * POST /api/sinking-funds
 *
 * Body: { name, targetAmount, deadline, budgetId? }
 */
export async function createSinkingFund(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { name, targetAmount, deadline, budgetId } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Validate required fields
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Goal name is required' });
      return;
    }

    if (!targetAmount || targetAmount <= 0) {
      res.status(400).json({ error: 'Target amount must be greater than 0' });
      return;
    }

    if (!deadline) {
      res.status(400).json({ error: 'Deadline is required' });
      return;
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      res.status(400).json({ error: 'Deadline must be in the future' });
      return;
    }

    // Validate budgetId if provided
    if (budgetId) {
      const budget = await prisma.budget.findFirst({
        where: { id: budgetId, userId },
      });
      if (!budget) {
        res.status(404).json({ error: "We couldn't find that budget" });
        return;
      }
    }

    const sinkingFund = await prisma.sinkingFund.create({
      data: {
        userId,
        name,
        targetAmount,
        deadline: deadlineDate,
        budgetId: budgetId || null,
      },
    });

    // Calculate monthly contribution
    const monthlyContribution = calculateMonthlyContribution(
      Number(sinkingFund.targetAmount),
      Number(sinkingFund.currentAmount),
      sinkingFund.deadline
    );

    res.status(201).json({
      ...sinkingFund,
      monthlyContribution,
      progress: 0,
    });
  } catch (error: any) {
    console.error('Create sinking fund error:', error);
    res.status(500).json({
      error: "We couldn't create that savings goal. Let's try again.",
    });
  }
}

/**
 * Get all sinking funds for current user
 * GET /api/sinking-funds
 *
 * Query: includeCompleted? - include completed funds (default false)
 */
export async function getSinkingFunds(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { includeCompleted } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const where: any = { userId };
    if (includeCompleted !== 'true') {
      where.isCompleted = false;
    }

    const funds = await prisma.sinkingFund.findMany({
      where,
      orderBy: { deadline: 'asc' },
    });

    // Add computed fields
    const enrichedFunds = funds.map((fund) => {
      const target = Number(fund.targetAmount);
      const current = Number(fund.currentAmount);
      const progress = target > 0 ? (current / target) * 100 : 0;

      const monthlyContribution = fund.isCompleted
        ? 0
        : calculateMonthlyContribution(target, current, fund.deadline);

      const monthsRemaining = differenceInMonths(fund.deadline, new Date());

      return {
        ...fund,
        progress: Math.round(progress * 100) / 100,
        monthlyContribution,
        monthsRemaining: Math.max(0, monthsRemaining),
      };
    });

    res.status(200).json(enrichedFunds);
  } catch (error: any) {
    console.error('Get sinking funds error:', error);
    res.status(500).json({
      error: "We couldn't load your savings goals. Let's try again.",
    });
  }
}

/**
 * Get a single sinking fund by ID
 * GET /api/sinking-funds/:id
 */
export async function getSinkingFund(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const fund = await prisma.sinkingFund.findFirst({
      where: { id, userId },
    });

    if (!fund) {
      res.status(404).json({ error: "We couldn't find that savings goal" });
      return;
    }

    const target = Number(fund.targetAmount);
    const current = Number(fund.currentAmount);
    const progress = target > 0 ? (current / target) * 100 : 0;
    const monthlyContribution = fund.isCompleted
      ? 0
      : calculateMonthlyContribution(target, current, fund.deadline);

    res.status(200).json({
      ...fund,
      progress: Math.round(progress * 100) / 100,
      monthlyContribution,
      monthsRemaining: Math.max(0, differenceInMonths(fund.deadline, new Date())),
    });
  } catch (error: any) {
    console.error('Get sinking fund error:', error);
    res.status(500).json({
      error: "We couldn't load that savings goal. Let's try again.",
    });
  }
}

/**
 * Update a sinking fund
 * PATCH /api/sinking-funds/:id
 *
 * Body: { name?, targetAmount?, deadline? }
 */
export async function updateSinkingFund(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    const { name, targetAmount, deadline } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify fund belongs to user
    const existing = await prisma.sinkingFund.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that savings goal" });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (targetAmount !== undefined) {
      if (targetAmount <= 0) {
        res.status(400).json({ error: 'Target amount must be greater than 0' });
        return;
      }
      updateData.targetAmount = targetAmount;
    }
    if (deadline !== undefined) {
      const deadlineDate = new Date(deadline);
      if (deadlineDate <= new Date()) {
        res.status(400).json({ error: 'Deadline must be in the future' });
        return;
      }
      updateData.deadline = deadlineDate;
    }

    const fund = await prisma.sinkingFund.update({
      where: { id },
      data: updateData,
    });

    const target = Number(fund.targetAmount);
    const current = Number(fund.currentAmount);

    res.status(200).json({
      ...fund,
      progress: target > 0 ? Math.round((current / target) * 100 * 100) / 100 : 0,
      monthlyContribution: calculateMonthlyContribution(target, current, fund.deadline),
    });
  } catch (error: any) {
    console.error('Update sinking fund error:', error);
    res.status(500).json({
      error: "We couldn't save your changes. Let's try again.",
    });
  }
}

/**
 * Add a contribution to a sinking fund
 * POST /api/sinking-funds/:id/contribute
 *
 * Body: { amount }
 */
export async function contributeTo(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    const { amount } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Contribution amount must be greater than 0' });
      return;
    }

    // Get the fund
    const fund = await prisma.sinkingFund.findFirst({
      where: { id, userId },
    });

    if (!fund) {
      res.status(404).json({ error: "We couldn't find that savings goal" });
      return;
    }

    if (fund.isCompleted) {
      res.status(400).json({ error: 'This goal has already been completed' });
      return;
    }

    // Calculate new amount
    const newAmount = Number(fund.currentAmount) + amount;
    const target = Number(fund.targetAmount);
    const isNowCompleted = newAmount >= target;

    // Update fund
    const updatedFund = await prisma.sinkingFund.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        isCompleted: isNowCompleted,
        completedAt: isNowCompleted ? new Date() : null,
      },
    });

    const progress = target > 0 ? (newAmount / target) * 100 : 0;

    res.status(200).json({
      ...updatedFund,
      progress: Math.round(progress * 100) / 100,
      monthlyContribution: isNowCompleted
        ? 0
        : calculateMonthlyContribution(target, newAmount, updatedFund.deadline),
      justCompleted: isNowCompleted,
    });
  } catch (error: any) {
    console.error('Contribute to sinking fund error:', error);
    res.status(500).json({
      error: "We couldn't add that contribution. Let's try again.",
    });
  }
}

/**
 * Delete a sinking fund
 * DELETE /api/sinking-funds/:id
 */
export async function deleteSinkingFund(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify fund belongs to user
    const existing = await prisma.sinkingFund.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that savings goal" });
      return;
    }

    await prisma.sinkingFund.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete sinking fund error:', error);
    res.status(500).json({
      error: "We couldn't delete that savings goal. Let's try again.",
    });
  }
}

// Helper function to calculate monthly contribution
function calculateMonthlyContribution(target: number, current: number, deadline: Date): number {
  const remaining = target - current;
  if (remaining <= 0) return 0;

  const monthsRemaining = differenceInMonths(deadline, new Date());
  if (monthsRemaining <= 0) return remaining; // All at once if deadline passed

  return Math.round((remaining / monthsRemaining) * 100) / 100;
}
