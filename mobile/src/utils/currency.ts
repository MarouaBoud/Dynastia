/**
 * Currency utility functions for precise currency handling
 *
 * CRITICAL: All amounts stored as cents (integers) to avoid floating-point precision issues
 */

/**
 * Format amount in cents as currency string
 * @param amountInCents - Amount in cents (integer)
 * @param currency - Currency code (ISO 4217)
 * @param locale - Locale for formatting
 * @returns Formatted currency string (e.g., "$15.00", "15,00 €")
 */
export function formatCurrency(
  amountInCents: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const amountInDollars = amountInCents / 100;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInDollars);
}

/**
 * Parse user input string to cents (integer)
 * Removes all non-numeric characters except decimal point
 * @param input - User input string (e.g., "$15.00", "1,500.00", "15.00")
 * @returns Amount in cents (integer)
 */
export function parseCurrencyInput(input: string): number {
  // Remove all characters except digits and decimal point
  const cleaned = input.replace(/[^\d.]/g, '');

  // Parse as float
  const amountInDollars = parseFloat(cleaned) || 0;

  // Convert to cents and round to handle floating point precision
  const amountInCents = Math.round(amountInDollars * 100);

  return amountInCents;
}

/**
 * Format amount in cents for display in input field (no currency symbol)
 * @param amountInCents - Amount in cents (integer)
 * @returns Formatted amount string with 2 decimal places (e.g., "15.00")
 */
export function formatForDisplay(amountInCents: number): string {
  const amountInDollars = amountInCents / 100;
  return amountInDollars.toFixed(2);
}

/**
 * Get currency symbol for a given currency code
 * @param currency - Currency code (ISO 4217)
 * @param locale - Locale for formatting
 * @returns Currency symbol (e.g., "$", "€", "£")
 */
export function getCurrencySymbol(
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(0);

  // Extract symbol by removing the number
  return formatted.replace(/[\d,.\s]/g, '');
}
