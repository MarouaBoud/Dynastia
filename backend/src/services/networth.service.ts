/**
 * Net Worth Service
 *
 * Calculates net worth from assets and liabilities
 * Tracks monthly deltas using snapshots
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface NetWorthResult {
  totalAssets: Prisma.Decimal;
  totalLiabilities: Prisma.Decimal;
  netWorth: Prisma.Decimal;
  date: Date;
}

/**
 * Calculate current net worth for a user
 * Formula: totalAssets - totalLiabilities = netWorth
 *
 * @param userId - User ID
 * @returns Net worth calculation result
 */
export async function calculateNetWorth(userId: string): Promise<NetWorthResult> {
  // Fetch all assets
  const assets = await prisma.asset.findMany({
    where: { userId },
  });

  // Sum asset values
  const totalAssets = assets.reduce(
    (sum, asset) => sum.add(asset.value),
    new Prisma.Decimal(0)
  );

  // Fetch all liabilities
  const liabilities = await prisma.liability.findMany({
    where: { userId },
  });

  // Sum liability balances
  const totalLiabilities = liabilities.reduce(
    (sum, liability) => sum.add(liability.balance),
    new Prisma.Decimal(0)
  );

  // Calculate net worth
  const netWorth = totalAssets.minus(totalLiabilities);

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    date: new Date(),
  };
}

/**
 * Get monthly delta (change) in net worth
 * Compares current net worth to snapshot from 30+ days ago
 *
 * @param userId - User ID
 * @returns Monthly delta value or 0 if no previous snapshot
 */
export async function getMonthlyDelta(userId: string): Promise<Prisma.Decimal> {
  // Calculate current net worth
  const current = await calculateNetWorth(userId);

  // Get most recent snapshot from 30+ days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const previousSnapshot = await prisma.netWorthSnapshot.findFirst({
    where: {
      userId,
      date: {
        lte: thirtyDaysAgo,
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  if (!previousSnapshot) {
    // No previous snapshot, return 0
    return new Prisma.Decimal(0);
  }

  // Calculate delta
  const delta = current.netWorth.minus(previousSnapshot.netWorth);
  return delta;
}

/**
 * Save a net worth snapshot for trend tracking
 *
 * @param userId - User ID
 * @param snapshot - Net worth result to save
 */
export async function saveSnapshot(
  userId: string,
  snapshot: NetWorthResult
): Promise<void> {
  // Check if snapshot already exists for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.netWorthSnapshot.findFirst({
    where: {
      userId,
      date: {
        gte: today,
      },
    },
  });

  if (existing) {
    // Update existing snapshot
    await prisma.netWorthSnapshot.update({
      where: { id: existing.id },
      data: {
        totalAssets: snapshot.totalAssets,
        totalLiabilities: snapshot.totalLiabilities,
        netWorth: snapshot.netWorth,
      },
    });
  } else {
    // Create new snapshot
    await prisma.netWorthSnapshot.create({
      data: {
        userId,
        date: snapshot.date,
        totalAssets: snapshot.totalAssets,
        totalLiabilities: snapshot.totalLiabilities,
        netWorth: snapshot.netWorth,
      },
    });
  }
}
