import { GiftFinderInputs, Product } from '../src/types';
import { searchAmazonProducts, isAmazonConfigured } from './amazonCreatorsApi';

export interface GeneratedQueriesResult {
  primaryQuery: string;
  alternativeQueries: string[];
  minBudget?: number;
  maxBudget?: number;
}

/**
 * Parse budget strings into numeric INR min/max
 * Examples:
 * - "Under ₹1,000" => max: 1000
 * - "₹1,000 - ₹2,500" => min: 1000, max: 2500
 * - "₹2,500 - ₹5,000" => min: 2500, max: 5000
 * - "₹5,000 - ₹10,000" => min: 5000, max: 10000
 * - "₹10,000+" => min: 10000
 * - "under 2000" => max: 2000
 */
export function parseBudgetRange(budgetStr?: string, customBudgetStr?: string): { min?: number; max?: number } {
  const str = (customBudgetStr || budgetStr || '').toLowerCase().replace(/,/g, '');

  if (!str) return {};

  // Check for custom numeric input
  const numMatch = str.match(/\d+/g);
  if (numMatch) {
    const nums = numMatch.map(Number);
    if (str.includes('-') || str.includes('to')) {
      return { min: nums[0], max: nums[1] || nums[0] * 2 };
    }
    if (str.includes('under') || str.includes('less') || str.includes('below') || str.includes('max')) {
      return { min: 0, max: nums[0] };
    }
    if (str.includes('+') || str.includes('above') || str.includes('over') || str.includes('min')) {
      return { min: nums[0] };
    }
    // Single number provided
    return { min: 0, max: nums[0] };
  }

  return {};
}

/**
 * AI & Rule-based Query Generator:
 * Translates gift quiz inputs (e.g. "Anniversary gift for wife under ₹2000")
 * into high-intent Amazon India search queries.
 */
export function generateAmazonSearchQueries(inputs: GiftFinderInputs): GeneratedQueriesResult {
  const recipient = inputs.customRecipient || inputs.recipient || 'loved one';
  const occasion = inputs.customOccasion || inputs.occasion || 'occasion';
  const { min, max } = parseBudgetRange(inputs.budget, inputs.customBudget);

  const cleanRecipient = recipient.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const cleanOccasion = occasion.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

  // Query 1: Direct target query (e.g. "anniversary gift for wife")
  const primaryQuery = `${cleanOccasion} gift for ${cleanRecipient}`;

  // Query 2: Personality / Sentiment driven (e.g. "romantic personalized gift for wife")
  const personality = inputs.personalities?.[0] || 'thoughtful';
  const interest = inputs.interests?.[0] || '';
  const alt1 = interest
    ? `${interest} gift for ${cleanRecipient} ${cleanOccasion}`
    : `${personality} gift for ${cleanRecipient}`;

  // Query 3: Budget or Keepsake specific
  const alt2 = max ? `${cleanOccasion} gift under ${max}` : `unique ${cleanOccasion} gift ideas`;

  const alternativeQueries = [alt1, alt2].filter(q => q !== primaryQuery);

  return {
    primaryQuery,
    alternativeQueries,
    minBudget: min,
    maxBudget: max
  };
}

/**
 * Execute Amazon product discovery for the gift recommendation flow
 */
export async function executeAmazonGiftSearch(inputs: GiftFinderInputs): Promise<{
  products: Product[];
  isLive: boolean;
  queriesUsed: string[];
  notice?: string;
}> {
  const { primaryQuery, alternativeQueries, minBudget, maxBudget } = generateAmazonSearchQueries(inputs);
  const allQueries = [primaryQuery, ...alternativeQueries];

  if (!isAmazonConfigured()) {
    return {
      products: [],
      isLive: false,
      queriesUsed: allQueries,
      notice: 'Amazon integration is not connected. Showing demo gift recommendations.'
    };
  }

  try {
    const res = await searchAmazonProducts({
      keywords: primaryQuery,
      minPrice: minBudget,
      maxPrice: maxBudget,
      occasion: inputs.customOccasion || inputs.occasion,
      recipient: inputs.customRecipient || inputs.recipient,
      personality: inputs.personalities?.[0],
      interest: inputs.interests?.[0],
      limit: 12
    });

    let products = res.products || [];

    // If primary query returned few items, query first alternative
    if (products.length < 4 && alternativeQueries.length > 0) {
      const altRes = await searchAmazonProducts({
        keywords: alternativeQueries[0],
        minPrice: minBudget,
        maxPrice: maxBudget,
        limit: 8
      });
      if (altRes.products && altRes.products.length > 0) {
        const seenAsins = new Set(products.map(p => p.asin));
        for (const p of altRes.products) {
          if (!seenAsins.has(p.asin)) {
            products.push(p);
            seenAsins.add(p.asin);
          }
        }
      }
    }

    // Filter by budget if budget available
    if (maxBudget && maxBudget > 0) {
      const withinBudget = products.filter(p => !p.isPriceAvailable || p.price <= maxBudget * 1.15);
      if (withinBudget.length >= 3) {
        products = withinBudget;
      }
    }

    return {
      products,
      isLive: true,
      queriesUsed: allQueries
    };
  } catch (err: any) {
    console.warn('Amazon gift search execution error:', err.message);
    return {
      products: [],
      isLive: false,
      queriesUsed: allQueries,
      notice: 'Amazon Creators API unavailable. Falling back to demo gift recommendations.'
    };
  }
}
