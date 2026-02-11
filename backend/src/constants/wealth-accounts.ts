/**
 * Wealth Accounts Constants
 *
 * Country-specific tax-advantaged account definitions with 2026 contribution limits.
 * Used for wealth guidance to recommend optimal account priority order.
 *
 * Priority order follows "Order of Operations" for wealth building:
 * - US: 401k match -> Roth IRA -> HSA -> 401k max -> Taxable
 * - FR: Livret A -> PEA -> Assurance-vie -> UCITS ETFs
 */

export interface WealthAccount {
  id: string;
  name: string;
  priority: number;       // Order of operations (1 = first)
  limit2026: number;      // Annual contribution limit in local currency
  description: string;    // Benefit explanation
  eligibilityNote?: string; // Income/age requirements
  country: string;        // ISO country code
}

/**
 * US Tax-Advantaged Accounts (2026 limits)
 * Priority based on The Money Guy's Financial Order of Operations
 */
export const US_ACCOUNTS: WealthAccount[] = [
  {
    id: 'us_401k_match',
    name: '401(k) Match',
    priority: 1,
    limit2026: 24500,  // 2026 limit: $24,500 (employee contribution)
    description: 'Contribute up to employer match (free money)',
    eligibilityNote: 'If employer offers matching',
    country: 'US',
  },
  {
    id: 'us_roth_ira',
    name: 'Roth IRA',
    priority: 2,
    limit2026: 7500,   // 2026 limit: $7,500
    description: 'Tax-free growth and withdrawals in retirement',
    eligibilityNote: 'Income < $153k (single) or $242k (married)',
    country: 'US',
  },
  {
    id: 'us_hsa',
    name: 'HSA',
    priority: 3,
    limit2026: 4400,   // 2026 limit: $4,400 (self-only coverage)
    description: 'Triple tax advantage for healthcare costs',
    eligibilityNote: 'Requires HDHP (deductible >= $1,700)',
    country: 'US',
  },
  {
    id: 'us_401k_max',
    name: '401(k) Max',
    priority: 4,
    limit2026: 24500,  // Same limit, but after match contribution
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
 * France Tax-Advantaged Accounts (2026 limits)
 * Priority based on French wealth building best practices
 */
export const EU_FR_ACCOUNTS: WealthAccount[] = [
  {
    id: 'fr_livret_a',
    name: 'Livret A',
    priority: 1,
    limit2026: 22950,  // 2026 limit: EUR 22,950
    description: 'Tax-free savings (3% rate as of 2026)',
    eligibilityNote: 'One per person',
    country: 'FR',
  },
  {
    id: 'fr_pea',
    name: 'PEA (Plan Epargne Actions)',
    priority: 2,
    limit2026: 150000,  // 2026 limit: EUR 150,000
    description: 'Tax-advantaged equity investing (after 5 years)',
    eligibilityNote: 'EU stocks/ETFs only',
    country: 'FR',
  },
  {
    id: 'fr_assurance_vie',
    name: 'Assurance-vie',
    priority: 3,
    limit2026: Infinity,
    description: 'Tax-efficient after 8 years',
    eligibilityNote: 'EUR 4,600 annual allowance (single)',
    country: 'FR',
  },
  {
    id: 'fr_ucits_etfs',
    name: 'UCITS ETFs (Taxable)',
    priority: 4,
    limit2026: Infinity,
    description: 'UCITS-compliant ETFs in taxable account',
    country: 'FR',
  },
];

/**
 * Supported countries for wealth guidance
 * Can be expanded in future versions
 */
export const SUPPORTED_COUNTRIES = ['US', 'FR'] as const;
export type SupportedCountry = typeof SUPPORTED_COUNTRIES[number];

/**
 * Get wealth accounts for a specific country
 *
 * @param country - ISO 3166-1 alpha-2 country code (e.g., 'US', 'FR')
 * @returns Array of WealthAccount objects sorted by priority, or empty array for unsupported countries
 */
export function getWealthAccounts(country: string): WealthAccount[] {
  switch (country.toUpperCase()) {
    case 'US':
      return [...US_ACCOUNTS].sort((a, b) => a.priority - b.priority);
    case 'FR':
      return [...EU_FR_ACCOUNTS].sort((a, b) => a.priority - b.priority);
    default:
      // Unsupported country - return empty array
      return [];
  }
}

/**
 * Check if a country is supported for wealth guidance
 */
export function isCountrySupported(country: string): country is SupportedCountry {
  return SUPPORTED_COUNTRIES.includes(country.toUpperCase() as SupportedCountry);
}
