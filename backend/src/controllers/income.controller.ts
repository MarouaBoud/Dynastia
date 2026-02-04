/**
 * Income Controller
 *
 * CRUD operations for income sources.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new income source
 * POST /api/incomes
 *
 * Body: { source: string, amount: number, frequency?: string, budgetId?: string }
 */
export async function createIncome(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { source, amount, frequency, budgetId } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Validate required fields
    if (!source || typeof source !== 'string') {
      res.status(400).json({ error: 'Income source name is required' });
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Amount must be greater than 0' });
      return;
    }

    // Validate frequency if provided
    const validFrequencies = ['monthly', 'bi-weekly', 'weekly', 'one-time'];
    if (frequency && !validFrequencies.includes(frequency)) {
      res.status(400).json({ error: 'Frequency must be monthly, bi-weekly, weekly, or one-time' });
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

    const income = await prisma.income.create({
      data: {
        userId,
        source,
        amount,
        frequency: frequency || 'monthly',
        budgetId: budgetId || null,
      },
    });

    res.status(201).json(income);
  } catch (error: any) {
    console.error('Create income error:', error);
    res.status(500).json({
      error: "We couldn't save that income source. Let's try again.",
    });
  }
}

/**
 * Get all income sources for current user
 * GET /api/incomes
 *
 * Query: budgetId? - filter by budget
 */
export async function getIncomes(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { budgetId } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const where: any = { userId };
    if (budgetId) {
      where.budgetId = budgetId as string;
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total monthly income
    let totalMonthly = 0;
    for (const income of incomes) {
      const amount = Number(income.amount);
      switch (income.frequency) {
        case 'monthly':
          totalMonthly += amount;
          break;
        case 'bi-weekly':
          totalMonthly += amount * 2.17; // Average bi-weekly payments per month
          break;
        case 'weekly':
          totalMonthly += amount * 4.33; // Average weekly payments per month
          break;
        case 'one-time':
          // One-time payments not included in monthly total
          break;
      }
    }

    res.status(200).json({
      incomes,
      totalMonthly: Math.round(totalMonthly * 100) / 100,
    });
  } catch (error: any) {
    console.error('Get incomes error:', error);
    res.status(500).json({
      error: "We couldn't load your income sources. Let's try again.",
    });
  }
}

/**
 * Get a single income source by ID
 * GET /api/incomes/:id
 */
export async function getIncome(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const income = await prisma.income.findFirst({
      where: { id, userId },
    });

    if (!income) {
      res.status(404).json({ error: "We couldn't find that income source" });
      return;
    }

    res.status(200).json(income);
  } catch (error: any) {
    console.error('Get income error:', error);
    res.status(500).json({
      error: "We couldn't load that income source. Let's try again.",
    });
  }
}

/**
 * Update an income source
 * PATCH /api/incomes/:id
 *
 * Body: { source?, amount?, frequency? }
 */
export async function updateIncome(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    const { source, amount, frequency } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify income belongs to user
    const existing = await prisma.income.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that income source" });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (source !== undefined) updateData.source = source;
    if (amount !== undefined) {
      if (amount <= 0) {
        res.status(400).json({ error: 'Amount must be greater than 0' });
        return;
      }
      updateData.amount = amount;
    }
    if (frequency !== undefined) {
      const validFrequencies = ['monthly', 'bi-weekly', 'weekly', 'one-time'];
      if (!validFrequencies.includes(frequency)) {
        res.status(400).json({ error: 'Frequency must be monthly, bi-weekly, weekly, or one-time' });
        return;
      }
      updateData.frequency = frequency;
    }

    const income = await prisma.income.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(income);
  } catch (error: any) {
    console.error('Update income error:', error);
    res.status(500).json({
      error: "We couldn't save your changes. Let's try again.",
    });
  }
}

/**
 * Delete an income source
 * DELETE /api/incomes/:id
 */
export async function deleteIncome(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify income belongs to user
    const existing = await prisma.income.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that income source" });
      return;
    }

    await prisma.income.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete income error:', error);
    res.status(500).json({
      error: "We couldn't delete that income source. Let's try again.",
    });
  }
}
