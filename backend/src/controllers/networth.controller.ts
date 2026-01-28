/**
 * Net Worth Controller
 *
 * Provides on-demand net worth calculation with breakdown
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  calculateNetWorth,
  getMonthlyDelta,
  saveSnapshot,
} from '../services/networth.service';

const prisma = new PrismaClient();

/**
 * Get current net worth with breakdown
 * GET /api/networth
 *
 * Returns:
 * {
 *   netWorth: number,
 *   totalAssets: number,
 *   totalLiabilities: number,
 *   monthlyDelta: number,
 *   assetBreakdown: Array<{id, type, name, value}>,
 *   liabilityBreakdown: Array<{id, type, name, balance}>
 * }
 */
export async function getNetWorth(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Calculate current net worth
    const netWorthResult = await calculateNetWorth(userId);

    // Get monthly delta
    const monthlyDelta = await getMonthlyDelta(userId);

    // Get asset breakdown
    const assets = await prisma.asset.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        name: true,
        value: true,
      },
    });

    // Get liability breakdown
    const liabilities = await prisma.liability.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        name: true,
        balance: true,
      },
    });

    // Save snapshot for trend tracking
    await saveSnapshot(userId, netWorthResult);

    // Convert Decimal to number for JSON response
    res.status(200).json({
      netWorth: parseFloat(netWorthResult.netWorth.toString()),
      totalAssets: parseFloat(netWorthResult.totalAssets.toString()),
      totalLiabilities: parseFloat(netWorthResult.totalLiabilities.toString()),
      monthlyDelta: parseFloat(monthlyDelta.toString()),
      assetBreakdown: assets.map((asset) => ({
        id: asset.id,
        type: asset.type,
        name: asset.name,
        value: parseFloat(asset.value.toString()),
      })),
      liabilityBreakdown: liabilities.map((liability) => ({
        id: liability.id,
        type: liability.type,
        name: liability.name,
        balance: parseFloat(liability.balance.toString()),
      })),
    });
  } catch (error: any) {
    console.error('Get net worth error:', error);
    res.status(500).json({
      error: "We couldn't calculate your net worth. Let's try again.",
    });
  }
}
