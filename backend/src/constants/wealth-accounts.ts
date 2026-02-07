/**
 * Wealth Accounts Constants
 *
 * Defines tax-advantaged account types with 2026 contribution limits
 * for supported countries (US, France).
 *
 * Source: IRS Publication 590-A (2026), URSSAF (France 2026)
 */

export interface WealthAccount {
  id: string;
  name: string;
  priority: number; // Order of operations (1 = first)
  limit2026: number; // Annual contribution limit in local currency
  description: string; // Benefit explanation
  eligibilityNote?: string; // Income/age requirements
  country: string; // ISO 3166-1 alpha-2 country code
}

/**
 * US Wealth Accounts - Order of Operations
 *
 * 1. 401(k) match - Free money first
 * 2. Roth IRA - Tax-free growth
 * 3. HSA - Triple tax advantage
 * 4. 401(k) max - Fill remaining tax-advantaged space
 * 5. Taxable brokerage - After maxing tax-advantaged
 */
export const US_ACCOUNTS: WealthAccount[] = [
  {
    id: 'us_401k_match',
    name: '401(k) Match',
    priority: 1,
    limit2026: 24500, // 2026 limit: $23,500 (employee) + catch-up
    description: 'Contribute up to employer match (free money)',
    eligibilityNote: 'If employer offers matching',
    country: 'US',
  },
  {
    id: 'us_roth_ira',
    name: 'Roth IRA',
    priority: 2,
    limit2026: 7500, // 2026 limit: $7,000 + $1,000 catch-up (50+)
    description: 'Tax-free growth and withdrawals in retirement',
    eligibilityNote: 'Income < $153k (single) or $242k (married)',
    country: 'US',
  },
  {
    id: 'us_hsa',
    name: 'HSA',
    priority: 3,
    limit2026: 4400, // 2026 limit: $4,150 (self) + catch-up
    description: 'Triple tax advantage for healthcare costs',
    eligibilityNote: 'Requires HDHP (deductible >= $1,700)',
    country: 'US',
  },
  {
    id: 'us_401k_max',
    name: '401(k) Max',
    priority: 4,
    limit2026: 24500,
    description: 'Max out 401k after match and IRA',
    country: 'US',
  },
  {
    id: 'us_taxable',
    name: 'Taxable Brokerage',
    priority: 5,
    limit2026: Infinity,
    description: 'Standard brokerage account, no tax advantages',
    country: 'US',
  },
];

/**
 * France (EU) Wealth Accounts - Order of Operations
 *
 * 1. Livret A - Tax-free savings, guaranteed rate
 * 2. PEA - Tax-advantaged equity (5-year hold)
 * 3. Assurance-vie - Tax-efficient after 8 years
 * 4. UCITS ETFs - EU-compliant funds in taxable
 */
export const EU_FR_ACCOUNTS: WealthAccount[] = [
  {
    id: 'fr_livret_a',
    name: 'Livret A',
    priority: 1,
    limit2026: 22950, // EUR 22,950 ceiling
    description: 'Tax-free savings (3% rate as of 2026)',
    eligibilityNote: 'One per person',
    country: 'FR',
  },
  {
    id: 'fr_pea',
    name: 'PEA',
    priority: 2,
    limit2026: 150000, // EUR 150,000 ceiling
    description: 'Tax-advantaged equity investing (after 5 years)',
    eligibilityNote: 'EU stocks/ETFs only',
    country: 'FR',
  },
  {
    id: 'fr_assurance_vie',
    name: 'Assurance-vie',
    priority: 3,
    limit2026: Infinity, // No ceiling, but annual allowance matters
    description: 'Tax-efficient after 8 years',
    eligibilityNote: 'EUR 4,600 annual allowance (single)',
    country: 'FR',
  },
  {
    id: 'fr_ucits_etfs',
    name: 'UCITS ETFs',
    priority: 4,
    limit2026: Infinity,
    description: 'UCITS-compliant ETFs in taxable account',
    country: 'FR',
  },
];

/**
 * Supported countries for wealth account guidance
 * ISO 3166-1 alpha-2 codes
 */
export const SUPPORTED_COUNTRIES = ['US', 'FR'] as const;

export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

/**
 * Get wealth accounts for a given country
 *
 * @param country - ISO 3166-1 alpha-2 country code
 * @returns Array of wealth accounts sorted by priority, or empty array if unsupported
 */
export function getWealthAccounts(country: string): WealthAccount[] {
  switch (country) {
    case 'US':
      return US_ACCOUNTS;
    case 'FR':
      return EU_FR_ACCOUNTS;
    default:
      return [];
  }
}

/**
 * Check if a country is supported for wealth guidance
 */
export function isCountrySupported(
  country: string
): country is SupportedCountry {
  return SUPPORTED_COUNTRIES.includes(country as SupportedCountry);
}
