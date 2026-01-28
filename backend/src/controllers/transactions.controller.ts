/**
 * Transactions Controller
 *
 * CRUD operations for financial transactions
 * Features auto-categorization on create if category not provided
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { autoCategorizeMerchant } from '../services/categorization.service';

const prisma = new PrismaClient();

/**
 * Create a new transaction
 * POST /api/transactions
 *
 * Body: { amount: number, merchant: string, date: string (ISO), category?: string, description?: string, notes?: string, receiptUrl?: string }
 */
export async function createTransaction(req: Request, res: Response): Promise<void> {
  try {
    const { amount, merchant, date, category, description, notes, receiptUrl } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Validate required fields
    if (!amount || typeof amount !== 'number') {
      res.status(400).json({ error: 'Amount is required and must be a number' });
      return;
    }

    if (!merchant || typeof merchant !== 'string') {
      res.status(400).json({ error: 'Merchant is required and must be a string' });
      return;
    }

    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'Date is required and must be an ISO string' });
      return;
    }

    // Auto-categorize if category not provided
    const finalCategory = category || autoCategorizeMerchant(merchant);

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        merchant,
        date: new Date(date),
        category: finalCategory,
        description: description || null,
        notes: notes || null,
        receiptUrl: receiptUrl || null,
        userId,
      },
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      error: "We couldn't save that transaction. Let's try again.",
    });
  }
}

/**
 * Get all transactions for current user
 * GET /api/transactions
 *
 * Query params: startDate?, endDate?, category?, limit?, offset?
 */
export async function getTransactions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const { startDate, endDate, category, limit, offset } = req.query;

    // Build where clause
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    if (category) {
      where.category = category as string;
    }

    // Query transactions
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit as string) : 50,
      skip: offset ? parseInt(offset as string) : 0,
    });

    res.status(200).json(transactions);
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      error: "We couldn't load your transactions. Let's try again.",
    });
  }
}

/**
 * Get a single transaction by id
 * GET /api/transactions/:id
 */
export async function getTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) {
      res.status(404).json({ error: "We couldn't find that transaction. It may have been deleted." });
      return;
    }

    res.status(200).json(transaction);
  } catch (error: any) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      error: "We couldn't load that transaction. Let's try again.",
    });
  }
}

/**
 * Update a transaction
 * PUT /api/transactions/:id
 *
 * Body: { amount?, merchant?, date?, category?, description?, notes?, receiptUrl? }
 */
export async function updateTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { amount, merchant, date, category, description, notes, receiptUrl } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify transaction belongs to user
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that transaction. It may have been deleted." });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (amount !== undefined) updateData.amount = amount;
    if (merchant !== undefined) updateData.merchant = merchant;
    if (date !== undefined) updateData.date = new Date(date);
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(transaction);
  } catch (error: any) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      error: "We couldn't save your changes. Let's try again.",
    });
  }
}

/**
 * Delete a transaction
 * DELETE /api/transactions/:id
 */
export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify transaction belongs to user
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that transaction. It may have been deleted." });
      return;
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      error: "We couldn't delete that transaction. Let's try again.",
    });
  }
}
