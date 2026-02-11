/**
 * Currency Conversion Service
 *
 * Provides exchange rate lookups and currency conversion using the Frankfurter API.
 * Features:
 * - 1-hour cache to minimize API calls
 * - Silent fallback on errors (returns 1.0 rate)
 * - Support for major currencies
 *
 * API: https://api.frankfurter.app (European Central Bank data source)
 * - Free, unlimited, no API key required
 */

/**
 * Supported currencies for exchange rate lookups
 */
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Cached exchange rates structure
 */
interface CachedRates {
  timestamp: number;
  base: string;
  rates: Record<string, number>;
}

// In-memory cache (1 hour TTL)
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
let ratesCache: CachedRates | null = null;

/**
 * Frankfurter API base URL
 */
const FRANKFURTER_API_BASE = 'https://api.frankfurter.app';

/**
 * Get exchange rate between two currencies
 *
 * @param from - Source currency code (e.g., 'USD')
 * @param to - Target currency code (e.g., 'EUR')
 * @returns Exchange rate (1 unit of 'from' = rate units of 'to')
 *
 * @example
 * const rate = await getExchangeRate('USD', 'EUR');
 * // rate = 0.92 means $1 = EUR 0.92
 */
export async function getExchangeRate(from: string, to: string): Promise<number> {
  // Same currency - no conversion needed
  if (from.toUpperCase() === to.toUpperCase()) {
    return 1.0;
  }

  const fromUpper = from.toUpperCase();
  const toUpper = to.toUpperCase();

  try {
    // Check cache validity
    const now = Date.now();
    if (
      ratesCache &&
      ratesCache.base === fromUpper &&
      now - ratesCache.timestamp < CACHE_DURATION_MS
    ) {
      // Cache hit
      return ratesCache.rates[toUpper] ?? 1.0;
    }

    // Fetch fresh rates from Frankfurter API
    const response = await fetch(`${FRANKFURTER_API_BASE}/latest?from=${fromUpper}`);

    if (!response.ok) {
      console.error(`[CurrencyService] API error: ${response.status} ${response.statusText}`);
      return 1.0; // Silent fallback
    }

    const data = await response.json() as {
      base: string;
      date: string;
      rates: Record<string, number>;
    };

    // Update cache
    ratesCache = {
      timestamp: now,
      base: fromUpper,
      rates: data.rates,
    };

    return data.rates[toUpper] ?? 1.0;
  } catch (error) {
    console.error('[CurrencyService] Failed to fetch exchange rates:', error);
    return 1.0; // Silent fallback on network errors
  }
}

/**
 * Convert an amount from one currency to another
 *
 * @param amount - Amount in source currency
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Converted amount in target currency
 *
 * @example
 * const eurAmount = await convertCurrency(100, 'USD', 'EUR');
 * // If rate is 0.92, returns 92
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  // Same currency - no conversion needed
  if (from.toUpperCase() === to.toUpperCase()) {
    return amount;
  }

  const rate = await getExchangeRate(from, to);
  return amount * rate;
}

/**
 * Clear the rates cache (for testing purposes)
 */
export function clearRatesCache(): void {
  ratesCache = null;
}

/**
 * Get the current cache state (for debugging/testing)
 */
export function getCacheInfo(): { isCached: boolean; age?: number; base?: string } {
  if (!ratesCache) {
    return { isCached: false };
  }

  return {
    isCached: true,
    age: Date.now() - ratesCache.timestamp,
    base: ratesCache.base,
  };
}

/**
 * Check if a currency is supported
 */
export function isCurrencySupported(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency.toUpperCase() as SupportedCurrency);
}
