/**
 * Currency Service
 *
 * Client-side currency conversion with AsyncStorage caching.
 * Uses Frankfurter API for exchange rates with 1-hour cache TTL.
 * Provides graceful degradation (1:1 fallback) on API failures.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// Constants
// =============================================================================

const FRANKFURTER_API = 'https://api.frankfurter.app';
const CACHE_KEY = '@dynastia:exchange_rates';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Currency symbols for common currencies
 * Used for display when Intl.NumberFormat is not available or for simple formatting
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CHF: 'CHF',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
};

// =============================================================================
// Types
// =============================================================================

interface CachedRates {
  timestamp: number;
  base: string;
  rates: Record<string, number>;
}

// =============================================================================
// Exchange Rate Functions
// =============================================================================

/**
 * Get exchange rate between two currencies
 *
 * Checks AsyncStorage cache first, fetches from Frankfurter API if stale.
 * Returns 1 for same currency or on any error (graceful degradation).
 *
 * @param from - Source currency code (ISO 4217)
 * @param to - Target currency code (ISO 4217)
 * @returns Exchange rate (multiply source amount by this to get target amount)
 */
export async function getExchangeRate(from: string, to: string): Promise<number> {
  // Same currency = no conversion needed
  if (from === to) return 1;

  try {
    // Check AsyncStorage cache
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: CachedRates = JSON.parse(cached);
      const age = Date.now() - data.timestamp;

      // Use cache if fresh and has the right base currency and target rate
      if (age < CACHE_DURATION_MS && data.base === from && data.rates[to]) {
        console.log('Using cached exchange rate');
        return data.rates[to];
      }
    }

    // Fetch fresh rates from Frankfurter API
    console.log('Fetching fresh exchange rates from Frankfurter');
    const response = await fetch(`${FRANKFURTER_API}/latest?from=${from}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.status}`);
    }

    const freshData = await response.json();

    // Cache for next time
    const cacheData: CachedRates = {
      timestamp: Date.now(),
      base: from,
      rates: freshData.rates,
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    // Return rate or 1 if target not found
    return freshData.rates[to] || 1;
  } catch (error) {
    console.error('Exchange rate fetch failed:', error);
    // Fallback to 1:1 rate on any error - never crash the app
    return 1;
  }
}

/**
 * Convert amount from one currency to another
 *
 * @param amount - Amount in source currency
 * @param from - Source currency code (ISO 4217)
 * @param to - Target currency code (ISO 4217)
 * @returns Converted amount in target currency
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  if (from === to) return amount;
  const rate = await getExchangeRate(from, to);
  return amount * rate;
}

/**
 * Clear the exchange rate cache
 *
 * Useful for testing or when forcing a refresh is needed.
 */
export async function clearExchangeRateCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('Exchange rate cache cleared');
  } catch (error) {
    console.error('Failed to clear exchange rate cache:', error);
  }
}

/**
 * Get currency symbol for a currency code
 *
 * @param currency - ISO 4217 currency code
 * @returns Currency symbol or the code itself if not found
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}
