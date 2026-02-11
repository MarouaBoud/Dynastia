/**
 * Wealth Controller
 *
 * Endpoints for country-specific wealth guidance and currency exchange rates.
 * Provides personalized account recommendations based on user's country settings.
 *
 * Endpoints:
 * - GET /api/wealth/guidance - Get country-specific wealth account recommendations
 * - GET /api/wealth/exchange-rate - Get exchange rate between currencies
 * - POST /api/wealth/convert - Convert amount between currencies
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getWealthAccounts, SUPPORTED_COUNTRIES } from '../constants/wealth-accounts';
import {
  getExchangeRate,
  convertCurrency,
  SUPPORTED_CURRENCIES,
} from '../services/currency.service';

const prisma = new PrismaClient();

/**
 * GET /api/wealth/guidance
 *
 * Get country-specific wealth account recommendations based on user's country settings.
 * Returns accounts for primary country and secondary country (for expats).
 *
 * Response:
 * {
 *   primaryCountry: 'US',
 *   secondaryCountry: 'FR' | null,
 *   primaryAccounts: WealthAccount[],
 *   secondaryAccounts: WealthAccount[],
 *   isExpat: boolean,
 *   supportedCountries: string[]
 * }
 */
export const getWealthGuidance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        country: true,
        secondaryCountry: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const primaryCountry = user.country || 'US';
    const secondaryCountry = user.secondaryCountry;

    // Get accounts for primary country
    const primaryAccounts = getWealthAccounts(primaryCountry);

    // Get accounts for secondary country (expat support)
    const secondaryAccounts = secondaryCountry ? getWealthAccounts(secondaryCountry) : [];

    res.json({
      primaryCountry,
      secondaryCountry,
      primaryAccounts,
      secondaryAccounts,
      isExpat: !!secondaryCountry,
      supportedCountries: [...SUPPORTED_COUNTRIES],
    });
  } catch (error) {
    console.error('Get wealth guidance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/wealth/exchange-rate
 *
 * Get exchange rate between two currencies.
 *
 * Query params:
 * - from: Source currency code (e.g., 'USD')
 * - to: Target currency code (e.g., 'EUR')
 *
 * Response:
 * {
 *   from: 'USD',
 *   to: 'EUR',
 *   rate: 0.92,
 *   timestamp: '2026-02-07T12:00:00Z'
 * }
 */
export const getExchangeRates = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { from, to } = req.query;

    if (!from || !to || typeof from !== 'string' || typeof to !== 'string') {
      res.status(400).json({ message: 'Missing from or to currency query parameters' });
      return;
    }

    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    if (
      !SUPPORTED_CURRENCIES.includes(fromUpper as typeof SUPPORTED_CURRENCIES[number]) ||
      !SUPPORTED_CURRENCIES.includes(toUpper as typeof SUPPORTED_CURRENCIES[number])
    ) {
      res.status(400).json({
        message: 'Unsupported currency',
        supportedCurrencies: [...SUPPORTED_CURRENCIES],
      });
      return;
    }

    const rate = await getExchangeRate(fromUpper, toUpper);

    res.json({
      from: fromUpper,
      to: toUpper,
      rate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/wealth/convert
 *
 * Convert an amount from one currency to another.
 *
 * Request body:
 * {
 *   amount: 100,
 *   from: 'USD',
 *   to: 'EUR'
 * }
 *
 * Response:
 * {
 *   originalAmount: 100,
 *   from: 'USD',
 *   to: 'EUR',
 *   convertedAmount: 92,
 *   rate: 0.92
 * }
 */
export const convertAmount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { amount, from, to } = req.body;

    if (typeof amount !== 'number' || !from || !to) {
      res.status(400).json({ message: 'Missing amount, from, or to in request body' });
      return;
    }

    if (amount < 0) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }

    const fromUpper = String(from).toUpperCase();
    const toUpper = String(to).toUpperCase();

    if (
      !SUPPORTED_CURRENCIES.includes(fromUpper as typeof SUPPORTED_CURRENCIES[number]) ||
      !SUPPORTED_CURRENCIES.includes(toUpper as typeof SUPPORTED_CURRENCIES[number])
    ) {
      res.status(400).json({
        message: 'Unsupported currency',
        supportedCurrencies: [...SUPPORTED_CURRENCIES],
      });
      return;
    }

    const converted = await convertCurrency(amount, fromUpper, toUpper);
    const rate = await getExchangeRate(fromUpper, toUpper);

    res.json({
      originalAmount: amount,
      from: fromUpper,
      to: toUpper,
      convertedAmount: converted,
      rate,
    });
  } catch (error) {
    console.error('Convert amount error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
