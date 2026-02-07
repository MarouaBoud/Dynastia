/**
 * Coaching Controller
 *
 * Handles AI coaching requests using hybrid rule + LLM approach.
 * Rate-limited to protect LLM API costs.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ruleEngine, CoachingContext } from '../services/coaching/rule-engine';
import { createPromptBuilder } from '../services/coaching/prompt-builder';
import { ClaudeClient } from '../services/llm/claude-client';

const prisma = new PrismaClient();

// Initialize LLM client (only if API key present)
const claudeClient = process.env.ANTHROPIC_API_KEY
  ? new ClaudeClient(process.env.ANTHROPIC_API_KEY)
  : null;

const promptBuilder = claudeClient ? createPromptBuilder(claudeClient) : null;

/**
 * POST /api/coaching/prompt
 * Get contextual coaching message based on user's current state.
 */
export async function getCoachingPrompt(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    // Gather user context from database
    const context = await gatherCoachingContext(userId);

    // Determine what to coach about (rules-based)
    const decision = ruleEngine.getTopDecision(context);

    if (!decision) {
      return res.json({
        hasMessage: false,
        message: null,
        type: null
      });
    }

    // Generate message using LLM (if available) or fallback
    let message: string;
    if (promptBuilder) {
      message = await promptBuilder.generateMessage(decision);
    } else {
      // Fallback for development without API key
      message = getFallbackMessage(decision.type);
    }

    res.json({
      hasMessage: true,
      message,
      type: decision.type,
      priority: decision.priority,
      data: decision.data
    });
  } catch (error) {
    console.error('Coaching prompt error:', error);
    res.status(500).json({
      error: "We couldn't load coaching guidance right now. Let's try again.",
      hasMessage: false
    });
  }
}

/**
 * Gather all context needed for coaching decisions.
 */
async function gatherCoachingContext(userId: string): Promise<CoachingContext> {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get spending data
  const [thisMonthSpending, lastMonthSpending] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, date: { gte: thisMonth } },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { userId, date: { gte: lastMonth, lt: thisMonth } },
      _sum: { amount: true }
    })
  ]);

  // Get spending by category
  const [thisMonthByCategory, lastMonthByCategory] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['category'],
      where: { userId, date: { gte: thisMonth } },
      _sum: { amount: true }
    }),
    prisma.transaction.groupBy({
      by: ['category'],
      where: { userId, date: { gte: lastMonth, lt: thisMonth } },
      _sum: { amount: true }
    })
  ]);

  // Get milestone progress
  const milestones = await prisma.milestone.findMany({
    where: { userId }
  });
  const tier1Complete = ['first_1000_saved', 'first_money_date', 'autopilot_begins', 'debt_free_start']
    .filter(m => milestones.some(um => um.type === m)).length;
  const milestoneProgress = (tier1Complete / 4) * 100;

  // Get habit data
  const lastMoneyDate = await prisma.habitCheckIn.findFirst({
    where: { userId, type: 'money_date' },
    orderBy: { date: 'desc' }
  });

  const streakCheckIns = await prisma.habitCheckIn.findMany({
    where: { userId, type: 'money_date', completed: true },
    orderBy: { date: 'desc' },
    take: 52 // Max 1 year of weeks
  });

  // Get financial state
  const [assets, liabilities, budget] = await Promise.all([
    prisma.asset.aggregate({ where: { userId }, _sum: { value: true } }),
    prisma.liability.aggregate({ where: { userId }, _sum: { balance: true } }),
    prisma.budget.findFirst({ where: { userId }, orderBy: { year: 'desc', month: 'desc' } })
  ]);

  const totalAssets = Number(assets._sum.value || 0);
  const totalLiabilities = Number(liabilities._sum.balance || 0);
  const netWorth = totalAssets - totalLiabilities;
  const monthlyExpenses = Number(budget?.billsAmount || 0) + Number(budget?.lifestyleAmount || 0);
  const monthlyIncome = Number(budget?.totalIncome || 0);
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  const monthsOfRunway = monthlyExpenses > 0 ? netWorth / monthlyExpenses : 0;

  // Calculate days since last Money Date
  const lastMoneyDateDaysAgo = lastMoneyDate
    ? Math.floor((now.getTime() - new Date(lastMoneyDate.date).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  return {
    userId,
    spendingThisMonth: Number(thisMonthSpending._sum.amount || 0),
    spendingLastMonth: Number(lastMonthSpending._sum.amount || 0),
    spendingByCategory: Object.fromEntries(
      thisMonthByCategory.map(c => [c.category, Number(c._sum.amount || 0)])
    ),
    lastMonthByCategory: Object.fromEntries(
      lastMonthByCategory.map(c => [c.category, Number(c._sum.amount || 0)])
    ),
    milestoneProgress,
    lastMoneyDateDaysAgo,
    currentStreak: streakCheckIns.length,
    monthsOfRunway,
    savingsRate
  };
}

/**
 * Fallback messages when LLM is not available.
 */
function getFallbackMessage(type: string): string {
  const fallbacks: Record<string, string> = {
    spending_insight: "Your spending patterns are shifting. Let's review your recent transactions during your next Money Date.",
    milestone_approaching: "You're getting close to your next milestone. Keep going - you've got this!",
    check_in_reminder: "Ready for your Money Date? A few minutes of financial check-in builds lasting wealth.",
    streak_at_risk: "Your Money Date streak is waiting for you. Even a quick check-in counts.",
    streak_celebration: "Look at that streak! Consistency is the secret to financial success.",
    runway_low: "Building your safety cushion is your next priority. Every small step counts.",
    savings_rate_improvement: "Small increases to your savings rate compound dramatically over time.",
    general_encouragement: "You're showing up for your financial future. That's what matters."
  };
  return fallbacks[type] || fallbacks.general_encouragement;
}

export const coachingController = {
  getCoachingPrompt
};
