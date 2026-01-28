/**
 * Locale and Country Detection Utilities
 *
 * Handles country detection, currency mapping, and locale formatting
 * for country-specific features throughout the app.
 */

import * as RNLocalize from 'react-native-localize';

// Supported countries for the app
export const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', currency: 'JPY', flag: '🇯🇵' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', flag: '🇨🇭' },
  { code: 'ES', name: 'Spain', currency: 'EUR', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', currency: 'EUR', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', currency: 'EUR', flag: '🇧🇪' },
  { code: 'AT', name: 'Austria', currency: 'EUR', flag: '🇦🇹' },
  { code: 'IE', name: 'Ireland', currency: 'EUR', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal', currency: 'EUR', flag: '🇵🇹' },
  { code: 'FI', name: 'Finland', currency: 'EUR', flag: '🇫🇮' },
  { code: 'GR', name: 'Greece', currency: 'EUR', flag: '🇬🇷' },
];

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: 'USD',
  FR: 'EUR',
  DE: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  PT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  JP: 'JPY',
  CH: 'CHF',
};

// Country to locale mapping for formatting
const COUNTRY_LOCALE_MAP: Record<string, string> = {
  US: 'en-US',
  FR: 'fr-FR',
  DE: 'de-DE',
  GB: 'en-GB',
  CA: 'en-CA',
  AU: 'en-AU',
  JP: 'ja-JP',
  CH: 'de-CH',
  ES: 'es-ES',
  IT: 'it-IT',
  NL: 'nl-NL',
  BE: 'nl-BE',
  AT: 'de-AT',
  IE: 'en-IE',
  PT: 'pt-PT',
  FI: 'fi-FI',
  GR: 'el-GR',
};

/**
 * Detect user's country from device locale
 *
 * Uses react-native-localize to get device locale settings.
 * Falls back to US if detection fails or country not supported.
 *
 * @returns ISO 3166-1 alpha-2 country code (e.g., "US", "FR")
 */
export function detectCountry(): string {
  try {
    const locales = RNLocalize.getLocales();

    if (locales && locales.length > 0) {
      const countryCode = locales[0].countryCode;

      // Check if detected country is supported
      if (countryCode && SUPPORTED_COUNTRIES.some((c) => c.code === countryCode)) {
        return countryCode;
      }

      // If not supported, check if it's in Europe (default to EUR)
      if (countryCode && COUNTRY_CURRENCY_MAP[countryCode] === 'EUR') {
        return countryCode;
      }
    }
  } catch (error) {
    console.error('Country detection failed:', error);
  }

  // Fallback to US
  return 'US';
}

/**
 * Get currency code for a country
 *
 * Maps ISO 3166-1 alpha-2 country codes to ISO 4217 currency codes.
 * Defaults to USD for unknown countries.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US")
 * @returns ISO 4217 currency code (e.g., "USD")
 */
export function getCurrencyForCountry(countryCode: string): string {
  return COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
}

/**
 * Get locale string for a country
 *
 * Maps country codes to locale strings for number/currency formatting.
 * Defaults to en-US for unknown countries.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US")
 * @returns Locale string (e.g., "en-US")
 */
export function getLocaleForCountry(countryCode: string): string {
  return COUNTRY_LOCALE_MAP[countryCode] || 'en-US';
}

/**
 * Format currency value for display
 *
 * Formats a number as currency using the appropriate locale and currency code.
 *
 * @param amount - Amount in cents (integer)
 * @param currency - ISO 4217 currency code (e.g., "USD")
 * @param countryCode - ISO 3166-1 alpha-2 country code for locale
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number, currency: string, countryCode: string): string {
  const locale = getLocaleForCountry(countryCode);
  const amountInMajorUnits = amount / 100;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amountInMajorUnits);
}

/**
 * Get country name from code
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Country name or code if not found
 */
export function getCountryName(countryCode: string): string {
  const country = SUPPORTED_COUNTRIES.find((c) => c.code === countryCode);
  return country?.name || countryCode;
}

/**
 * Check if a country is supported
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns true if country is explicitly supported
 */
export function isCountrySupported(countryCode: string): boolean {
  return SUPPORTED_COUNTRIES.some((c) => c.code === countryCode);
}
