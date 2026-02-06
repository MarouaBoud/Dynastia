/**
 * Milestone Detection Service
 *
 * Event-driven detection for all 16 Sovereignty Ladder milestones.
 * Each check is idempotent - existing milestones won't be duplicated.
 */

import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';
import { MILESTONE_TYPES, MilestoneDefinition } from '../constants/milestones';

const prisma = new PrismaClient();

interface DetectedMilestone {
  type: string;
  definition: MilestoneDefinition;
  metadata?: Record<string, any>;
}

/**
 * Check for net worth-based milestones (1k, 10k, 50k)
 */
export async function checkNetWorthMilestones(userId: string): Promise<DetectedMilestone[]> {
  const detected: DetectedMilestone[] = [];

  // Get latest net worth
  const latestSnapshot = await prisma.netWorthSnapshot.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  if (!latestSnapshot) return detected;

  const netWorth = latestSnapshot.netWorth.toNumber();

  // Check thresholds
  const thresholds = [
    { type: 'first_1000_saved', amount: 1000 },
    { type: '10k_club', amount: 10000 },
    { type: '50k_club', amount: 50000 },
  ];

  for (const { type, amount } of thresholds) {
    if (netWorth >= amount) {
      const exists = await prisma.milestone.findFirst({
        where: { userId, type },
      });

      if (!exists) {
        detected.push({
          type,
          definition: MILESTONE_TYPES[type],
          metadata: { netWorth, threshold: amount },
        });
      }
    }
  }

  return detected;
}

/**
 * Check for habit-based milestones (Money Date, pay yourself first)
 */
export async function checkHabitMilestones(userId: string): Promise<DetectedMilestone[]> {
  const detected: DetectedMilestone[] = [];

  // Check first Money Date
  const firstCheckIn = await prisma.habitCheckIn.findFirst({
    where: { userId, type: 'money_date', completed: true },
  });

  if (firstCheckIn) {
    const exists = await prisma.milestone.findFirst({
      where: { userId, type: 'first_money_date' },
    });

    if (!exists) {
      detected.push({
        type: 'first_money_date',
        definition: MILESTONE_TYPES['first_money_date'],
        metadata: { firstCheckInDate: firstCheckIn.date },
      });
    }
  }

  // Check 30-day pay yourself first streak
  const thirtyDaysAgo = subDays(new Date(), 30);
  const payYourselfCheckIns = await prisma.habitCheckIn.count({
    where: {
      userId,
      type: 'pay_yourself_first',
      completed: true,
      date: { gte: thirtyDaysAgo },
    },
  });

  if (payYourselfCheckIns >= 30) {
    const exists = await prisma.milestone.findFirst({
      where: { userId, type: 'pay_yourself_first_30_days' },
    });

    if (!exists) {
      detected.push({
        type: 'pay_yourself_first_30_days',
        definition: MILESTONE_TYPES['pay_yourself_first_30_days'],
        metadata: { consecutiveDays: payYourselfCheckIns },
      });
    }
  }

  return detected;
}

/**
 * Check for credit card milestones (debt-free)
 */
export async function checkCreditCardMilestones(userId: string): Promise<DetectedMilestone[]> {
  const detected: DetectedMilestone[] = [];

  // Check for 2+ months paid in full (MILE-04 is 2 months, DEBT-04 is 3 months)
  const creditCards = await prisma.bill.findMany({
    where: {
      userId,
      isCreditCard: true,
      consecutivePaidInFull: { gte: 2 },
    },
  });

  if (creditCards.length > 0) {
    const exists = await prisma.milestone.findFirst({
      where: { userId, type: 'debt_free_start' },
    });

    if (!exists) {
      detected.push({
        type: 'debt_free_start',
        definition: MILESTONE_TYPES['debt_free_start'],
        metadata: {
          creditCardsCount: creditCards.length,
          maxConsecutiveMonths: Math.max(...creditCards.map(c => c.consecutivePaidInFull)),
        },
      });
    }
  }

  return detected;
}

/**
 * Check for emergency fund milestones (3 months, 6 months)
 */
export async function checkEmergencyFundMilestones(userId: string): Promise<DetectedMilestone[]> {
  const detected: DetectedMilestone[] = [];

  // Get latest budget for monthly expenses
  const budget = await prisma.budget.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!budget) return detected;

  const monthlyExpenses = budget.billsAmount.toNumber() + budget.lifestyleAmount.toNumber();

  // Get savings assets
  const savingsAssets = await prisma.asset.findMany({
    where: { userId, type: 'savings' },
  });

  const totalSavings = savingsAssets.reduce((sum, a) => sum + a.value.toNumber(), 0);
  const monthsCovered = monthlyExpenses > 0 ? totalSavings / monthlyExpenses : 0;

  // Check 3 months (MILE-05)
  if (monthsCovered >= 3) {
    const exists = await prisma.milestone.findFirst({
      where: { userId, type: 'emergency_fund_3_months' },
    });

    if (!exists) {
      detected.push({
        type: 'emergency_fund_3_months',
        definition: MILESTONE_TYPES['emergency_fund_3_months'],
        metadata: { monthsCovered, totalSavings, monthlyExpenses },
      });
    }
  }

  // Check 6 months (MILE-09)
  if (monthsCovered >= 6) {
    const exists = await prisma.milestone.findFirst({
      where: { userId, type: 'emergency_fund_complete' },
    });

    if (!exists) {
      detected.push({
        type: 'emergency_fund_complete',
        definition: MILESTONE_TYPES['emergency_fund_complete'],
        metadata: { monthsCovered, totalSavings, monthlyExpenses },
      });
    }
  }

  // Check 12 months - sovereign (MILE-16)
  if (monthsCovered >= 12) {
    const exists = await prisma.milestone.findFirst({
      where: { userId, type: 'sovereign' },
    });

    if (!exists) {
      detected.push({
        type: 'sovereign',
        definition: MILESTONE_TYPES['sovereign'],
        metadata: { monthsCovered, totalSavings, monthlyExpenses },
      });
    }
  }

  return detected;
}

/**
 * Check for sinking fund milestones
 */
export async function checkSinkingFundMilestones(userId: string): Promise<DetectedMilestone[]> {
  const detected: DetectedMilestone[] = [];

  // Check if any sinking fund is completed
  const completedFund = await prisma.sinkingFund.findFirst({
    where: { userId, isCompleted: true },
  });

  if (completedFund) {
    const exists = await prisma.milestone.findFirst({
      where: { userId, type: 'first_sinking_fund_funded' },
    });

    if (!exists) {
      detected.push({
        type: 'first_sinking_fund_funded',
        definition: MILESTONE_TYPES['first_sinking_fund_funded'],
        metadata: { fundName: completedFund.name, targetAmount: completedFund.targetAmount.toNumber() },
      });
    }
  }

  return detected;
}

/**
 * Check for investment milestones
 */
export async function checkInvestmentMilestones(userId: string): Promise<DetectedMilestone[]> {
  const detected: DetectedMilestone[] = [];

  // Check for first investment asset
  const investmentAsset = await prisma.asset.findFirst({
    where: { userId, type: 'investments' },
  });

  if (investmentAsset) {
    const exists = await prisma.milestone.findFirst({
      where: { userId, type: 'first_investment' },
    });

    if (!exists) {
      detected.push({
        type: 'first_investment',
        definition: MILESTONE_TYPES['first_investment'],
        metadata: { assetName: investmentAsset.name, value: investmentAsset.value.toNumber() },
      });
    }
  }

  return detected;
}

/**
 * Check all milestones and return newly detected ones
 */
export async function checkAllMilestones(userId: string): Promise<DetectedMilestone[]> {
  const allDetected: DetectedMilestone[] = [];

  // Run all checks in parallel
  const [
    netWorthMilestones,
    habitMilestones,
    creditCardMilestones,
    emergencyFundMilestones,
    sinkingFundMilestones,
    investmentMilestones,
  ] = await Promise.all([
    checkNetWorthMilestones(userId),
    checkHabitMilestones(userId),
    checkCreditCardMilestones(userId),
    checkEmergencyFundMilestones(userId),
    checkSinkingFundMilestones(userId),
    checkInvestmentMilestones(userId),
  ]);

  allDetected.push(
    ...netWorthMilestones,
    ...habitMilestones,
    ...creditCardMilestones,
    ...emergencyFundMilestones,
    ...sinkingFundMilestones,
    ...investmentMilestones,
  );

  return allDetected;
}

/**
 * Award detected milestones (create records)
 */
export async function awardMilestones(
  userId: string,
  milestones: DetectedMilestone[]
): Promise<void> {
  for (const milestone of milestones) {
    await prisma.milestone.create({
      data: {
        userId,
        type: milestone.type,
        metadata: milestone.metadata,
      },
    });
  }
}

/**
 * Check and award all milestones in one operation
 */
export async function checkAndAwardMilestones(userId: string): Promise<DetectedMilestone[]> {
  const detected = await checkAllMilestones(userId);

  if (detected.length > 0) {
    await awardMilestones(userId, detected);
  }

  return detected;
}

export default {
  checkNetWorthMilestones,
  checkHabitMilestones,
  checkCreditCardMilestones,
  checkEmergencyFundMilestones,
  checkSinkingFundMilestones,
  checkInvestmentMilestones,
  checkAllMilestones,
  awardMilestones,
  checkAndAwardMilestones,
};
