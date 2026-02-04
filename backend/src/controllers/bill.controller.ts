/**
 * Bill Controller
 *
 * CRUD operations for recurring bills and credit cards.
 * Includes mark-paid functionality with streak tracking.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { addDays, addWeeks, addMonths, addQuarters } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Create a new bill
 * POST /api/bills
 *
 * Body: { name, amount, frequency, dueDay, category, isCreditCard?, creditCardApr? }
 */
export async function createBill(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { name, amount, frequency, dueDay, category, isCreditCard, creditCardApr } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Validate required fields
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Bill name is required' });
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Amount must be greater than 0' });
      return;
    }

    if (!frequency || !['weekly', 'monthly', 'quarterly'].includes(frequency)) {
      res.status(400).json({ error: 'Frequency must be weekly, monthly, or quarterly' });
      return;
    }

    if (!dueDay || typeof dueDay !== 'number') {
      res.status(400).json({ error: 'Due day is required' });
      return;
    }

    // Validate dueDay based on frequency
    if (frequency === 'weekly' && (dueDay < 1 || dueDay > 7)) {
      res.status(400).json({ error: 'For weekly bills, due day must be 1-7 (Sunday-Saturday)' });
      return;
    }

    if ((frequency === 'monthly' || frequency === 'quarterly') && (dueDay < 1 || dueDay > 31)) {
      res.status(400).json({ error: 'For monthly/quarterly bills, due day must be 1-31' });
      return;
    }

    if (!category || typeof category !== 'string') {
      res.status(400).json({ error: 'Category is required' });
      return;
    }

    // Validate credit card APR if it's a credit card
    if (isCreditCard && creditCardApr !== undefined) {
      if (creditCardApr < 0 || creditCardApr > 50) {
        res.status(400).json({ error: 'APR must be between 0% and 50%' });
        return;
      }
    }

    // Calculate next due date
    const nextDueDate = calculateNextDueDate(frequency, dueDay);

    const bill = await prisma.bill.create({
      data: {
        userId,
        name,
        amount,
        frequency,
        dueDay,
        nextDueDate,
        category,
        isCreditCard: isCreditCard || false,
        creditCardApr: isCreditCard && creditCardApr ? creditCardApr : null,
      },
    });

    res.status(201).json(bill);
  } catch (error: any) {
    console.error('Create bill error:', error);
    res.status(500).json({
      error: "We couldn't save that bill. Let's try again.",
    });
  }
}

/**
 * Get all bills for current user
 * GET /api/bills
 *
 * Query: filter? (upcoming, credit-cards), days? (for upcoming filter)
 */
export async function getBills(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { filter, days } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const where: any = { userId };

    if (filter === 'upcoming') {
      const daysAhead = days ? parseInt(days as string) : 7;
      const endDate = addDays(new Date(), daysAhead);
      where.nextDueDate = {
        gte: new Date(),
        lte: endDate,
      };
      where.isPaid = false;
    } else if (filter === 'credit-cards') {
      where.isCreditCard = true;
    }

    const bills = await prisma.bill.findMany({
      where,
      orderBy: { nextDueDate: 'asc' },
    });

    // Add computed fields
    const enrichedBills = bills.map((bill) => {
      const daysUntilDue = Math.ceil(
        (bill.nextDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      let status = 'upcoming';
      if (bill.isPaid) {
        status = 'paid';
      } else if (daysUntilDue < 0) {
        status = 'overdue';
      } else if (daysUntilDue <= 3) {
        status = 'due-soon';
      }

      return {
        ...bill,
        daysUntilDue,
        status,
        monthlyInterestCost: bill.isCreditCard && bill.creditCardApr
          ? calculateMonthlyInterest(Number(bill.amount), Number(bill.creditCardApr))
          : null,
      };
    });

    res.status(200).json(enrichedBills);
  } catch (error: any) {
    console.error('Get bills error:', error);
    res.status(500).json({
      error: "We couldn't load your bills. Let's try again.",
    });
  }
}

/**
 * Get a single bill by ID
 * GET /api/bills/:id
 */
export async function getBill(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const bill = await prisma.bill.findFirst({
      where: { id, userId },
    });

    if (!bill) {
      res.status(404).json({ error: "We couldn't find that bill" });
      return;
    }

    // Add computed fields
    const daysUntilDue = Math.ceil(
      (bill.nextDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    res.status(200).json({
      ...bill,
      daysUntilDue,
      monthlyInterestCost: bill.isCreditCard && bill.creditCardApr
        ? calculateMonthlyInterest(Number(bill.amount), Number(bill.creditCardApr))
        : null,
    });
  } catch (error: any) {
    console.error('Get bill error:', error);
    res.status(500).json({
      error: "We couldn't load that bill. Let's try again.",
    });
  }
}

/**
 * Update a bill
 * PATCH /api/bills/:id
 *
 * Body: { name?, amount?, frequency?, dueDay?, category?, creditCardApr? }
 */
export async function updateBill(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    const { name, amount, frequency, dueDay, category, creditCardApr } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify bill belongs to user
    const existing = await prisma.bill.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that bill" });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (amount !== undefined) updateData.amount = amount;
    if (category !== undefined) updateData.category = category;
    if (creditCardApr !== undefined) updateData.creditCardApr = creditCardApr;

    // If frequency or dueDay changes, recalculate next due date
    if (frequency !== undefined || dueDay !== undefined) {
      const newFrequency = frequency || existing.frequency;
      const newDueDay = dueDay || existing.dueDay;
      updateData.frequency = newFrequency;
      updateData.dueDay = newDueDay;
      updateData.nextDueDate = calculateNextDueDate(newFrequency, newDueDay);
    }

    const bill = await prisma.bill.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(bill);
  } catch (error: any) {
    console.error('Update bill error:', error);
    res.status(500).json({
      error: "We couldn't save your changes. Let's try again.",
    });
  }
}

/**
 * Delete a bill
 * DELETE /api/bills/:id
 */
export async function deleteBill(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify bill belongs to user
    const existing = await prisma.bill.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that bill" });
      return;
    }

    await prisma.bill.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete bill error:', error);
    res.status(500).json({
      error: "We couldn't delete that bill. Let's try again.",
    });
  }
}

/**
 * Mark a bill as paid
 * POST /api/bills/:id/mark-paid
 *
 * Body: { paidInFull?: boolean } - for credit cards only
 */
export async function markBillPaid(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    const { paidInFull } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Get the bill
    const bill = await prisma.bill.findFirst({
      where: { id, userId },
    });

    if (!bill) {
      res.status(404).json({ error: "We couldn't find that bill" });
      return;
    }

    // Calculate next due date
    const nextDueDate = calculateNextDueDate(bill.frequency, bill.dueDay, bill.nextDueDate);

    // Update consecutive paid in full for credit cards
    let newConsecutivePaidInFull = bill.consecutivePaidInFull;
    let milestoneAchieved = false;

    if (bill.isCreditCard) {
      if (paidInFull === true) {
        newConsecutivePaidInFull = bill.consecutivePaidInFull + 1;

        // Check for 3-month milestone
        if (newConsecutivePaidInFull === 3) {
          // Check if milestone already exists
          const existingMilestone = await prisma.milestone.findFirst({
            where: {
              userId,
              type: 'credit_card_3_months_no_interest',
              relatedId: id,
            },
          });

          if (!existingMilestone) {
            await prisma.milestone.create({
              data: {
                userId,
                type: 'credit_card_3_months_no_interest',
                relatedId: id,
                metadata: { billName: bill.name },
              },
            });
            milestoneAchieved = true;
          }
        }
      } else if (paidInFull === false) {
        // Reset streak if not paid in full
        newConsecutivePaidInFull = 0;
      }
    }

    // Update bill
    const updatedBill = await prisma.bill.update({
      where: { id },
      data: {
        isPaid: false, // Reset for next period
        lastPaidAt: new Date(),
        nextDueDate,
        consecutivePaidInFull: newConsecutivePaidInFull,
      },
    });

    res.status(200).json({
      ...updatedBill,
      milestoneAchieved,
      milestoneType: milestoneAchieved ? 'credit_card_3_months_no_interest' : null,
    });
  } catch (error: any) {
    console.error('Mark bill paid error:', error);
    res.status(500).json({
      error: "We couldn't mark that bill as paid. Let's try again.",
    });
  }
}

// Helper function to calculate next due date
function calculateNextDueDate(frequency: string, dueDay: number, fromDate?: Date): Date {
  const now = fromDate || new Date();
  let nextDue: Date;

  switch (frequency) {
    case 'weekly':
      // dueDay is 1-7 (Sunday=1 to Saturday=7)
      const currentDay = now.getDay() + 1; // Convert to 1-7
      const daysUntil = (dueDay - currentDay + 7) % 7 || 7;
      nextDue = addDays(now, daysUntil);
      break;

    case 'monthly':
      // Set to due day of current month, if passed, go to next month
      nextDue = new Date(now.getFullYear(), now.getMonth(), dueDay);
      if (nextDue <= now) {
        nextDue = addMonths(nextDue, 1);
      }
      break;

    case 'quarterly':
      nextDue = new Date(now.getFullYear(), now.getMonth(), dueDay);
      if (nextDue <= now) {
        nextDue = addQuarters(nextDue, 1);
      }
      break;

    default:
      nextDue = addMonths(now, 1);
  }

  return nextDue;
}

// Helper function to calculate monthly interest
function calculateMonthlyInterest(balance: number, apr: number): number {
  return Math.round((balance * (apr / 100) / 12) * 100) / 100;
}
