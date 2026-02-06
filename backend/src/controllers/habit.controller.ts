/**
 * Habit Controller
 *
 * Handles Money Date check-ins, streak tracking, and notification preferences.
 * Uses emotionally safe language in all responses.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfDay, differenceInDays, subDays, format } from 'date-fns';
import { checkAndAwardMilestones } from '../services/milestoneDetection.service';

const prisma = new PrismaClient();

/**
 * Create or update a habit check-in
 * POST /api/habits/check-in
 */
export async function createCheckIn(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const { type = 'money_date', notes, metadata } = req.body;
    const checkInDate = startOfDay(new Date());

    // Upsert check-in (idempotent)
    const checkIn = await prisma.habitCheckIn.upsert({
      where: {
        userId_date_type: { userId, date: checkInDate, type },
      },
      update: {
        completed: true,
        notes,
        metadata,
      },
      create: {
        userId,
        date: checkInDate,
        type,
        completed: true,
        notes,
        metadata,
      },
    });

    // Check for new milestones after check-in
    const newMilestones = await checkAndAwardMilestones(userId);

    // Enrich milestones with definitions
    const enrichedMilestones = newMilestones.map(m => ({
      type: m.type,
      ...m.definition,
    }));

    res.status(201).json({
      checkIn,
      message: "Great job showing up for yourself today!",
      newMilestones: enrichedMilestones,
    });
  } catch (error: any) {
    console.error('Create check-in error:', error);
    res.status(500).json({
      error: "We couldn't save your check-in. Let's try again.",
    });
  }
}

/**
 * Get check-in history
 * GET /api/habits/check-ins
 */
export async function getCheckIns(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const { type = 'money_date', days = 90 } = req.query;
    const startDate = subDays(new Date(), Number(days));

    const checkIns = await prisma.habitCheckIn.findMany({
      where: {
        userId,
        type: type as string,
        date: { gte: startDate },
      },
      orderBy: { date: 'desc' },
    });

    // Format for contribution grid
    const gridData = checkIns.map(c => ({
      date: format(c.date, 'yyyy-MM-dd'),
      count: c.completed ? 1 : 0,
    }));

    res.status(200).json({
      checkIns,
      gridData,
      totalCheckIns: checkIns.filter(c => c.completed).length,
    });
  } catch (error: any) {
    console.error('Get check-ins error:', error);
    res.status(500).json({
      error: "We couldn't load your history. Let's try again.",
    });
  }
}

/**
 * Calculate current streak with 3-day grace period
 * GET /api/habits/streak
 */
export async function getStreak(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const { type = 'money_date' } = req.query;

    // Get all check-ins sorted by date descending
    const checkIns = await prisma.habitCheckIn.findMany({
      where: {
        userId,
        type: type as string,
        completed: true,
      },
      orderBy: { date: 'desc' },
    });

    if (checkIns.length === 0) {
      res.status(200).json({
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
        streakActive: false,
        message: "Start your streak by completing your first Money Date!",
      });
      return;
    }

    // Calculate current streak with 7-day grace period (for weekly check-ins)
    // A streak continues if check-in within 10 days (7-day week + 3-day grace)
    const today = startOfDay(new Date());
    const lastCheckIn = startOfDay(checkIns[0].date);
    const daysSinceLastCheckIn = differenceInDays(today, lastCheckIn);

    let currentStreak = 0;
    let streakActive = daysSinceLastCheckIn <= 10; // 7-day week + 3-day grace

    if (streakActive) {
      currentStreak = 1;
      let previousDate = lastCheckIn;

      for (let i = 1; i < checkIns.length; i++) {
        const checkInDate = startOfDay(checkIns[i].date);
        const daysBetween = differenceInDays(previousDate, checkInDate);

        // Allow 4-10 days between weekly check-ins (7 days +/- grace)
        if (daysBetween >= 4 && daysBetween <= 10) {
          currentStreak++;
          previousDate = checkInDate;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    for (let i = 1; i < checkIns.length; i++) {
      const current = startOfDay(checkIns[i - 1].date);
      const previous = startOfDay(checkIns[i].date);
      const daysBetween = differenceInDays(current, previous);

      if (daysBetween >= 4 && daysBetween <= 10) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Emotionally safe messaging
    let message = '';
    if (currentStreak >= 4) {
      message = `${currentStreak} weeks strong! You're building real habits.`;
    } else if (currentStreak >= 2) {
      message = `${currentStreak} weeks! Keep the momentum going.`;
    } else if (streakActive) {
      message = "Great start! See you next week.";
    } else {
      message = "Welcome back! Let's pick up where you left off.";
    }

    res.status(200).json({
      currentStreak,
      longestStreak,
      lastCheckIn: checkIns[0].date,
      streakActive,
      daysSinceLastCheckIn,
      message,
    });
  } catch (error: any) {
    console.error('Get streak error:', error);
    res.status(500).json({
      error: "We couldn't calculate your streak. Let's try again.",
    });
  }
}

/**
 * Get notification preferences
 * GET /api/habits/notifications
 */
export async function getNotificationPreferences(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Get or create default preferences
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    res.status(200).json(prefs);
  } catch (error: any) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      error: "We couldn't load your notification settings. Let's try again.",
    });
  }
}

/**
 * Update notification preferences
 * PUT /api/habits/notifications
 */
export async function updateNotificationPreferences(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const {
      moneyDateReminder,
      streakProtection,
      billReminders,
      milestoneAlerts,
      reminderDay,
      reminderHour,
      marketingUpdates,
    } = req.body;

    const prefs = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        moneyDateReminder,
        streakProtection,
        billReminders,
        milestoneAlerts,
        reminderDay,
        reminderHour,
        marketingUpdates,
      },
      create: {
        userId,
        moneyDateReminder,
        streakProtection,
        billReminders,
        milestoneAlerts,
        reminderDay,
        reminderHour,
        marketingUpdates,
      },
    });

    res.status(200).json({
      preferences: prefs,
      message: "Your notification settings have been saved.",
    });
  } catch (error: any) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      error: "We couldn't save your settings. Let's try again.",
    });
  }
}

export default {
  createCheckIn,
  getCheckIns,
  getStreak,
  getNotificationPreferences,
  updateNotificationPreferences,
};
