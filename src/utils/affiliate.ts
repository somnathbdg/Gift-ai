/**
 * Affiliate URL Utilities for Amazon India & Multi-Merchant Links
 * Active Partner Tag: digitalrani01-21
 */

export const DEFAULT_AMAZON_PARTNER_TAG = 'digitalrani01-21';

/**
 * Extracts a 10-character Amazon ASIN from a URL or raw string
 * Handles formats like:
 * - /dp/B08N5WRWNW
 * - /gp/product/B08N5WRWNW
 * - B08N5WRWNW
 */
export function extractAmazonAsin(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Check direct ASIN pattern (10 chars, typically starts with B or digits)
  const directMatch = trimmed.match(/\b([B0-9][A-Z0-9]{9})\b/i);
  if (directMatch && trimmed.length <= 15) {
    return directMatch[1].toUpperCase();
  }

  // Check URL paths /dp/ASIN or /gp/product/ASIN
  const urlMatch = trimmed.match(/(?:\/dp\/|\/gp\/product\/|\/product\/)([B0-9][A-Z0-9]{9})/i);
  if (urlMatch) {
    return urlMatch[1].toUpperCase();
  }

  return null;
}

/**
 * Ensures an Amazon India URL has the partner tag digitalrani01-21 attached
 */
export function buildAmazonAffiliateUrl(
  urlOrAsin: string,
  partnerTag: string = DEFAULT_AMAZON_PARTNER_TAG
): string {
  if (!urlOrAsin) return '';
  const trimmed = urlOrAsin.trim();

  // If input is simply an ASIN
  const asin = extractAmazonAsin(trimmed);
  if (trimmed.length === 10 && !trimmed.includes('/') && !trimmed.includes('.')) {
    return `https://www.amazon.in/dp/${trimmed.toUpperCase()}?tag=${partnerTag}`;
  }

  // Check if it's an Amazon URL
  const isAmazonUrl = /amazon\.(in|com|co\.uk|de)|amzn\.to/i.test(trimmed);

  if (!isAmazonUrl) {
    // If it's an ASIN found inside the text, build a clean amazon.in URL
    if (asin) {
      return `https://www.amazon.in/dp/${asin}?tag=${partnerTag}`;
    }
    return trimmed;
  }

  // If it's an Amazon URL, normalize with clean ASIN path if possible
  if (asin) {
    return `https://www.amazon.in/dp/${asin}?tag=${partnerTag}`;
  }

  // Otherwise replace or append the tag query param
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    url.searchParams.set('tag', partnerTag);
    return url.toString();
  } catch {
    // Fallback regex replacement or appending
    if (trimmed.includes('tag=')) {
      return trimmed.replace(/tag=[^&]+/i, `tag=${partnerTag}`);
    }
    const sep = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${sep}tag=${partnerTag}`;
  }
}

/**
 * Resolves the outbound click URL for any product, ensuring Amazon products
 * are attributed to digitalrani01-21 even if entered manually as a raw link.
 */
export function resolveProductOutboundUrl(
  product: {
    affiliateUrl?: string;
    productUrl?: string;
    asin?: string;
    merchant?: string;
    source?: string;
  },
  partnerTag: string = DEFAULT_AMAZON_PARTNER_TAG
): string {
  const isAmazon =
    product.source === 'amazon' ||
    Boolean(product.asin) ||
    (product.merchant && product.merchant.toLowerCase().includes('amazon')) ||
    (product.productUrl && /amazon\.(in|com)|amzn\.to/i.test(product.productUrl)) ||
    (product.affiliateUrl && /amazon\.(in|com)|amzn\.to/i.test(product.affiliateUrl));

  if (isAmazon) {
    if (product.affiliateUrl && product.affiliateUrl.trim()) {
      return buildAmazonAffiliateUrl(product.affiliateUrl, partnerTag);
    }
    if (product.productUrl && product.productUrl.trim()) {
      return buildAmazonAffiliateUrl(product.productUrl, partnerTag);
    }
    if (product.asin && product.asin.trim()) {
      return `https://www.amazon.in/dp/${product.asin.trim().toUpperCase()}?tag=${partnerTag}`;
    }
  }

  return product.affiliateUrl || product.productUrl || '#';
}
