/**
 * Auto-categorization service for transactions
 * Uses keyword matching to suggest categories based on merchant names
 * v1 approach - defer ML categorization until we have training data
 */

export interface CategoryRule {
  category: string;
  keywords: string[];
  priority: number;
}

export const DEFAULT_RULES: CategoryRule[] = [
  {
    category: 'Housing',
    priority: 10,
    keywords: [
      'rent',
      'mortgage',
      'lease',
      'property management',
      'electric',
      'gas',
      'water',
      'internet',
      'utility',
      'landlord',
      'apartment',
      'condo',
    ],
  },
  {
    category: 'Health',
    priority: 9,
    keywords: [
      'pharmacy',
      'cvs',
      'walgreens',
      'doctor',
      'hospital',
      'medical',
      'dentist',
      'dental',
      'gym',
      'fitness',
      'health',
      'clinic',
      'therapist',
    ],
  },
  {
    category: 'Transport',
    priority: 8,
    keywords: [
      'uber',
      'lyft',
      'transit',
      'metro',
      'mta',
      'bart',
      'gas',
      'shell',
      'chevron',
      'bp',
      'exxon',
      'parking',
      'subway',
      'train',
      'bus',
      'taxi',
      'car',
      'vehicle',
    ],
  },
  {
    category: 'Food',
    priority: 7,
    keywords: [
      'restaurant',
      'cafe',
      'coffee',
      'grocery',
      'supermarket',
      'market',
      'doordash',
      'ubereats',
      'grubhub',
      'starbucks',
      'mcdonalds',
      'chipotle',
      'wholefood',
      'whole foods',
      'trader joe',
      'safeway',
      'kroger',
      'food',
      'dining',
      'pizza',
      'burger',
    ],
  },
  {
    category: 'Entertainment',
    priority: 6,
    keywords: [
      'netflix',
      'spotify',
      'hulu',
      'disney',
      'hbo',
      'movie',
      'cinema',
      'theater',
      'concert',
      'game',
      'steam',
      'playstation',
      'xbox',
      'entertainment',
      'ticket',
    ],
  },
  {
    category: 'Shopping',
    priority: 5,
    keywords: [
      'amazon',
      'target',
      'walmart',
      'clothing',
      'shoes',
      'electronics',
      'best buy',
      'apple store',
      'mall',
      'shop',
      'store',
      'retail',
    ],
  },
];

/**
 * Auto-categorize a transaction based on merchant name
 * @param merchant - The merchant/vendor name
 * @returns Category string or 'Other' if no match
 */
export function autoCategorizeMerchant(merchant: string): string {
  if (!merchant) {
    return 'Other';
  }

  const normalizedMerchant = merchant.toLowerCase().trim();

  // Sort rules by priority (highest first)
  const sortedRules = [...DEFAULT_RULES].sort((a, b) => b.priority - a.priority);

  // Find first matching category
  for (const rule of sortedRules) {
    for (const keyword of rule.keywords) {
      if (normalizedMerchant.includes(keyword.toLowerCase())) {
        return rule.category;
      }
    }
  }

  // Default to Other if no match
  return 'Other';
}
