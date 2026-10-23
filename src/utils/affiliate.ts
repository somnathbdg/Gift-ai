/**
 * Affiliate URL Utilities for Amazon India (amazon.in) & Amazon US (amazon.com)
 * Active Partner Tags:
 * - Amazon.in: digitalrani01-21
 * - Amazon.com: digital04b9-20
 */

export const DEFAULT_AMAZON_IN_PARTNER_TAG = 'digitalrani01-21';
export const DEFAULT_AMAZON_COM_PARTNER_TAG = 'digital04b9-20';
export const DEFAULT_AMAZON_PARTNER_TAG = DEFAULT_AMAZON_IN_PARTNER_TAG;

/**
 * Resolves the appropriate Amazon partner tag based on the domain (amazon.com vs amazon.in)
 */
export function getAmazonPartnerTag(domainOrUrl?: string, customTag?: string): string {
  if (customTag && customTag.trim()) return customTag.trim();
  if (domainOrUrl && /amazon\.com/i.test(domainOrUrl)) {
    return DEFAULT_AMAZON_COM_PARTNER_TAG; // digital04b9-20
  }
  return DEFAULT_AMAZON_IN_PARTNER_TAG; // digitalrani01-21
}

/**
 * Extracts a 10-character Amazon ASIN from a URL or raw string
 * Handles formats like:
 * - /dp/B08N5WRWNW
 * - /gp/product/B08N5WRWNW
 * - /gp/aw/d/B08N5WRWNW (mobile)
 * - /d/B08N5WRWNW
 * - /gp/offer-listing/B08N5WRWNW
 * - B08N5WRWNW or numeric 10-digit ISBNs (e.g. 0399579951, 9354400507)
 */
export function extractAmazonAsin(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // 1. Direct ASIN pattern (10 chars, starting with B or digit)
  if (/^[B0-9][A-Z0-9]{9}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // 2. Standard and mobile URL paths: /dp/, /gp/product/, /product/, /gp/aw/d/, /d/, /gp/offer-listing/
  const urlMatch = trimmed.match(/(?:\/dp\/|\/gp\/product\/|\/product\/|\/gp\/aw\/d\/|\/d\/|\/gp\/offer-listing\/)([B0-9][A-Z0-9]{9})/i);
  if (urlMatch) {
    return urlMatch[1].toUpperCase();
  }

  // 3. Fallback: Any 10-char ASIN token preceded by a slash or equal sign
  const looseMatch = trimmed.match(/[\/=]([B0-9][A-Z0-9]{9})(?:[?\/&#]|$)/i);
  if (looseMatch) {
    return looseMatch[1].toUpperCase();
  }

  return null;
}

/**
 * Detects whether an Amazon link is from amazon.com or amazon.in
 */
export function detectAmazonDomain(urlOrInput: string): 'amazon.com' | 'amazon.in' {
  if (/amazon\.com/i.test(urlOrInput)) return 'amazon.com';
  return 'amazon.in';
}

export interface ParsedAmazonUrl {
  asin: string | null;
  domain: 'amazon.com' | 'amazon.in';
  merchant: 'Amazon.com' | 'Amazon.in';
  canonicalUrl: string;
  affiliateUrl: string;
  currency: 'USD' | 'INR';
}

/**
 * Parses any Amazon link (amazon.in, amazon.com, amzn.to) and extracts
 * ASIN, marketplace, canonical URL, currency, and partner tag link.
 */
export function parseAmazonUrl(input: string, partnerTag?: string): ParsedAmazonUrl {
  const trimmed = (input || '').trim();
  const asin = extractAmazonAsin(trimmed);
  const domain = detectAmazonDomain(trimmed);
  const activeTag = partnerTag || getAmazonPartnerTag(domain);
  const merchant = domain === 'amazon.com' ? 'Amazon.com' : 'Amazon.in';
  const currency: 'USD' | 'INR' = domain === 'amazon.com' ? 'USD' : 'INR';

  let canonicalUrl = '';
  if (asin) {
    canonicalUrl = `https://www.${domain}/dp/${asin}`;
  } else if (/^https?:\/\//i.test(trimmed)) {
    canonicalUrl = trimmed;
  } else if (trimmed) {
    canonicalUrl = `https://www.${domain}/s?k=${encodeURIComponent(trimmed)}`;
  } else {
    canonicalUrl = `https://www.${domain}`;
  }

  const affiliateUrl = asin
    ? `https://www.${domain}/dp/${asin}?tag=${activeTag}`
    : buildAmazonAffiliateUrl(canonicalUrl, activeTag);

  return {
    asin,
    domain,
    merchant,
    canonicalUrl,
    affiliateUrl,
    currency
  };
}

/**
 * Ensures an Amazon URL (Amazon India or Amazon.com) has the partner tag attached
 */
export function buildAmazonAffiliateUrl(
  urlOrAsin: string,
  partnerTag?: string
): string {
  if (!urlOrAsin) return '';
  const trimmed = urlOrAsin.trim();
  const domain = detectAmazonDomain(trimmed);
  const activeTag = (partnerTag && partnerTag !== DEFAULT_AMAZON_PARTNER_TAG)
    ? partnerTag
    : getAmazonPartnerTag(domain, partnerTag);

  // If input is simply an ASIN
  const asin = extractAmazonAsin(trimmed);
  if (trimmed.length === 10 && !trimmed.includes('/') && !trimmed.includes('.')) {
    return `https://www.${domain}/dp/${trimmed.toUpperCase()}?tag=${activeTag}`;
  }

  // Check if it's an Amazon URL
  const isAmazonUrl = /amazon\.(in|com|co\.uk|de)|amzn\.to/i.test(trimmed);

  if (!isAmazonUrl) {
    if (asin) {
      return `https://www.${domain}/dp/${asin}?tag=${activeTag}`;
    }
    return trimmed;
  }

  // If it's an Amazon URL, normalize with clean ASIN path if possible
  if (asin) {
    return `https://www.${domain}/dp/${asin}?tag=${activeTag}`;
  }

  // Otherwise replace or append the tag query param
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    url.searchParams.set('tag', activeTag);
    return url.toString();
  } catch {
    if (trimmed.includes('tag=')) {
      return trimmed.replace(/tag=[^&]+/i, `tag=${activeTag}`);
    }
    const sep = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${sep}tag=${activeTag}`;
  }
}

/**
 * Resolves the outbound click URL for any product, preserving Amazon.com vs Amazon.in
 */
export function resolveProductOutboundUrl(
  product: {
    affiliateUrl?: string;
    productUrl?: string;
    asin?: string;
    merchant?: string;
    source?: string;
  },
  partnerTag?: string
): string {
  const isAmazon =
    product.source === 'amazon' ||
    Boolean(product.asin) ||
    (product.merchant && product.merchant.toLowerCase().includes('amazon')) ||
    (product.productUrl && /amazon\.(in|com)|amzn\.to/i.test(product.productUrl)) ||
    (product.affiliateUrl && /amazon\.(in|com)|amzn\.to/i.test(product.affiliateUrl));

  if (isAmazon) {
    const domain = (product.merchant && /amazon\.com/i.test(product.merchant)) ||
      (product.productUrl && /amazon\.com/i.test(product.productUrl)) ||
      (product.affiliateUrl && /amazon\.com/i.test(product.affiliateUrl))
      ? 'amazon.com'
      : 'amazon.in';
    const activeTag = (partnerTag && partnerTag !== DEFAULT_AMAZON_PARTNER_TAG)
      ? partnerTag
      : getAmazonPartnerTag(domain, partnerTag);

    if (product.affiliateUrl && product.affiliateUrl.trim()) {
      return buildAmazonAffiliateUrl(product.affiliateUrl, activeTag);
    }
    if (product.productUrl && product.productUrl.trim()) {
      return buildAmazonAffiliateUrl(product.productUrl, activeTag);
    }
    if (product.asin && product.asin.trim()) {
      return `https://www.${domain}/dp/${product.asin.trim().toUpperCase()}?tag=${activeTag}`;
    }
  }

  return product.affiliateUrl || product.productUrl || '#';
}

