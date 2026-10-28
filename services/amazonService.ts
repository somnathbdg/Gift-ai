import { Product, AmazonIntegrationStatus, AmazonImportParams } from '../src/types';
import {
  isAmazonConfigured,
  getAmazonStatus,
  searchAmazonProducts,
  getAmazonProduct,
  getAmazonProducts,
  getAmazonCategories,
  testAmazonConnection,
  incrementImportedCount
} from './amazonCreatorsApi';
import { generateAmazonSearchQueries, executeAmazonGiftSearch } from './amazonSearch';

export const AMAZON_PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || '';

/**
 * Normalizes Amazon product links and enforces the required Amazon Partner Tag.
 */
export function ensureAmazonAffiliateUrl(rawUrl: string, asin?: string): string {
  if (!rawUrl) {
    if (!asin) return '';
    return AMAZON_PARTNER_TAG ? `https://www.amazon.in/dp/${asin}?tag=${AMAZON_PARTNER_TAG}` : `https://www.amazon.in/dp/${asin}`;
  }

  try {
    const urlObj = new URL(rawUrl);
    if (urlObj.hostname.includes('amazon.')) {
      if (AMAZON_PARTNER_TAG) {
        urlObj.searchParams.set('tag', AMAZON_PARTNER_TAG);
      }
      return urlObj.toString();
    }
  } catch {
    // If not a valid standard URL, fallback
  }
  return rawUrl;
}

export const AmazonService = {
  isConfigured: isAmazonConfigured,
  getStatus: getAmazonStatus,
  search: searchAmazonProducts,
  getProduct: getAmazonProduct,
  getProducts: getAmazonProducts,
  getCategories: getAmazonCategories,
  testConnection: testAmazonConnection,
  incrementImportedCount,
  generateSearchQueries: generateAmazonSearchQueries,
  executeGiftSearch: executeAmazonGiftSearch,
  normalizeAffiliateUrl: ensureAmazonAffiliateUrl
};
