/**
 * Wealth Service
 *
 * API client for country-specific wealth guidance endpoints.
 * Provides wealth account recommendations, exchange rates, and currency formatting.
 */

import { api } from './api';

// =============================================================================
// Types
// =============================================================================

export interface WealthAccount {
  id: string;
  name: string;
  priority: number;
  limit2026: number;
  description: string;
  eligibilityNote?: string;
  country: string;
}

export interface WealthGuidanceResponse {
  primaryCountry: string;
  secondaryCountry: string | null;
  primaryAccounts: WealthAccount[];
  secondaryAccounts: WealthAccount[];
  isExpat: boolean;
  supportedCountries: string[];
}

export interface ExchangeRateResponse {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get country-specific wealth account guidance.
 * Returns accounts for primary and secondary countries (expat support).
 */
export async function getWealthGuidance(): Promise<WealthGuidanceResponse> {
  const response = await api.get('/wealth/guidance');
  return response.data;
}

/**
 * Get exchange rate between two currencies.
 */
export async function getExchangeRate(
  from: string,
  to: string
): Promise<ExchangeRateResponse> {
  const response = await api.get('/wealth/exchange-rate', {
    params: { from, to },
  });
  return response.data;
}

// =============================================================================
// Formatting Utilities
// =============================================================================

/**
 * Format currency limit for display.
 * Examples: $24,500 for USD, EUR 22,950 for EUR
 * Handles Infinity as "No limit"
 */
export function formatCurrencyLimit(amount: number, currency: string): string {
  if (!Number.isFinite(amount)) {
    return 'No limit';
  }

  const currencyUpper = currency.toUpperCase();

  if (currencyUpper === 'USD') {
    return `$${amount.toLocaleString('en-US')}`;
  }

  if (currencyUpper === 'EUR') {
    return `EUR ${amount.toLocaleString('de-DE')}`;
  }

  if (currencyUpper === 'GBP') {
    return `GBP ${amount.toLocaleString('en-GB')}`;
  }

  // Default format
  return `${currencyUpper} ${amount.toLocaleString()}`;
}

/**
 * Get currency code for a country.
 */
export function getCurrencyForCountry(country: string): string {
  const countryToCurrency: Record<string, string> = {
    US: 'USD',
    FR: 'EUR',
    DE: 'EUR',
    ES: 'EUR',
    IT: 'EUR',
    NL: 'EUR',
    BE: 'EUR',
    AT: 'EUR',
    PT: 'EUR',
    IE: 'EUR',
    FI: 'EUR',
    GR: 'EUR',
    GB: 'GBP',
    CA: 'CAD',
    AU: 'AUD',
    JP: 'JPY',
    CH: 'CHF',
  };
  return countryToCurrency[country.toUpperCase()] || 'USD';
}

export default {
  getWealthGuidance,
  getExchangeRate,
  formatCurrencyLimit,
  getCurrencyForCountry,
};
