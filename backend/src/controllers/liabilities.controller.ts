/**
 * Liabilities Controller
 *
 * CRUD operations for user liabilities (CreditCard, Loan, Mortgage, Other)
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VALID_LIABILITY_TYPES = ['CreditCard', 'Loan', 'Mortgage', 'Other'];

/**
 * Create a new liability
 * POST /api/liabilities
 *
 * Body: { type: string, name: string, balance: number }
 */
export async function createLiability(req: Request, res: Response): Promise<void> {
  try {
    const { type, name, balance } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Validate required fields
    if (!type || typeof type !== 'string') {
      res.status(400).json({ error: 'Type is required and must be a string' });
      return;
    }

    if (!VALID_LIABILITY_TYPES.includes(type)) {
      res.status(400).json({
        error: `Type must be one of: ${VALID_LIABILITY_TYPES.join(', ')}`,
      });
      return;
    }

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Name is required and must be a string' });
      return;
    }

    if (balance === undefined || typeof balance !== 'number') {
      res.status(400).json({ error: 'Balance is required and must be a number' });
      return;
    }

    // Create liability
    const liability = await prisma.liability.create({
      data: {
        type,
        name,
        balance,
        userId,
      },
    });

    res.status(201).json(liability);
  } catch (error: any) {
    console.error('Create liability error:', error);
    res.status(500).json({
      error: "We couldn't save that liability. Let's try again.",
    });
  }
}

/**
 * Get all liabilities for current user
 * GET /api/liabilities
 */
export async function getLiabilities(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const liabilities = await prisma.liability.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(liabilities);
  } catch (error: any) {
    console.error('Get liabilities error:', error);
    res.status(500).json({
      error: "We couldn't load your liabilities. Let's try again.",
    });
  }
}

/**
 * Update a liability
 * PUT /api/liabilities/:id
 *
 * Body: { type?, name?, balance? }
 */
export async function updateLiability(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    const { type, name, balance } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify liability belongs to user
    const existing = await prisma.liability.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that liability. It may have been deleted." });
      return;
    }

    // Validate type if provided
    if (type !== undefined && !VALID_LIABILITY_TYPES.includes(type)) {
      res.status(400).json({
        error: `Type must be one of: ${VALID_LIABILITY_TYPES.join(', ')}`,
      });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (name !== undefined) updateData.name = name;
    if (balance !== undefined) updateData.balance = balance;

    // Update liability
    const liability = await prisma.liability.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(liability);
  } catch (error: any) {
    console.error('Update liability error:', error);
    res.status(500).json({
      error: "We couldn't save your changes. Let's try again.",
    });
  }
}

/**
 * Delete a liability
 * DELETE /api/liabilities/:id
 */
export async function deleteLiability(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify liability belongs to user
    const existing = await prisma.liability.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that liability. It may have been deleted." });
      return;
    }

    // Delete liability
    await prisma.liability.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete liability error:', error);
    res.status(500).json({
      error: "We couldn't delete that liability. Let's try again.",
    });
  }
}
