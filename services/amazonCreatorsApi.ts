import { Product, AmazonIntegrationStatus } from '../src/types';

/**
 * Amazon India Creators API Service
 * Target marketplace: www.amazon.in
 *
 * Handles OAuth 2.0 client credentials authentication, token caching,
 * error mitigation (401, 403, 404, 429, 500), and modular operations:
 * - SearchItems
 * - GetItems
 * - GetVariations
 * - GetBrowseNodes
 *
 * Adheres strictly to security mandates:
 * - Never exposes AMAZON_CLIENT_SECRET to the client.
 * - Operates safely in Demo Mode when credentials are not configured.
 */

const AMAZON_HOST = 'creatorsapi.amazon.com';
const MARKETPLACE = 'www.amazon.in';
const OAUTH_ENDPOINT = 'https://api.amazon.com/auth/o2/token';

// In-memory token cache
interface TokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
}

let cachedToken: TokenCache | null = null;
let lastApiRequestTimestamp: string | null = null;
let lastApiError: string | null = null;
let productsImportedCount = 0;

export function incrementProductsImportedCount(count: number): void {
  productsImportedCount += count;
}

export interface AmazonSearchParams {
  keywords?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  occasion?: string;
  recipient?: string;
  personality?: string;
  interest?: string;
  limit?: number;
  itemPage?: number;
}

export interface AmazonSearchResponse {
  products: Product[];
  totalResults: number;
  isLive: boolean;
  searchQueriesUsed: string[];
  notice?: string;
}

export const DEFAULT_PARTNER_TAG = 'digitalrani-20';
export const DEFAULT_PARTNER_TAG_IN = '';
export const DEFAULT_PARTNER_TAG_US = 'digitalrani-20';

/**
 * Check if the server has live Amazon Creators API credentials configured
 * Credentials are completely optional. Without them, the app runs in full Demo Mode.
 */
export function isAmazonConfigured(): boolean {
  const clientId = process.env.AMAZON_CLIENT_ID;
  const clientSecret = process.env.AMAZON_CLIENT_SECRET;

  return Boolean(
    clientId &&
    clientSecret &&
    clientId.trim() !== '' &&
    clientSecret.trim() !== '' &&
    !clientId.includes('placeholder')
  );
}

/**
 * Get active partner tag for affiliate links (defaults to digitalrani-20 for US, configurable via AMAZON_PARTNER_TAG for IN)
 */
export function getPartnerTag(domain: 'amazon.com' | 'amazon.in' = 'amazon.in'): string {
  if (domain === 'amazon.com') {
    return process.env.AMAZON_COM_PARTNER_TAG || DEFAULT_PARTNER_TAG_US;
  }
  return process.env.AMAZON_PARTNER_TAG || DEFAULT_PARTNER_TAG_IN;
}

/**
 * Get display partner tag for admin display
 */
export function getMaskedPartnerTag(): string {
  return getPartnerTag();
}

/**
 * Get current Amazon integration status for Admin Console
 */
export function getAmazonStatus(productsNeedingReviewCount: number = 0): AmazonIntegrationStatus {
  const configured = isAmazonConfigured();
  const activeTag = getPartnerTag('amazon.in');
  const usTag = process.env.AMAZON_COM_PARTNER_TAG || DEFAULT_PARTNER_TAG_US;
  return {
    marketplace: MARKETPLACE,
    connectionStatus: configured ? 'CONNECTED' : 'DEMO_MODE',
    mode: configured ? 'live' : 'demo',
    partnerTagMasked: activeTag,
    partnerTag: activeTag,
    partnerTagIn: activeTag,
    partnerTagUs: usTag,
    creatorsApiStatus: configured ? 'Connected' : 'Not Connected',
    lastSuccessfulRequest: lastApiRequestTimestamp,
    lastError: lastApiError,
    productsImportedCount,
    productsNeedingReviewCount,
    credentialVersion: process.env.AMAZON_CREDENTIAL_VERSION || '2.1',
    hasClientId: Boolean(process.env.AMAZON_CLIENT_ID && process.env.AMAZON_CLIENT_ID.trim() !== ''),
    hasClientSecret: Boolean(process.env.AMAZON_CLIENT_SECRET && process.env.AMAZON_CLIENT_SECRET.trim() !== '')
  };
}

/**
 * Acquire OAuth 2.0 access token with caching until expiry (with 60s safety buffer)
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.AMAZON_CLIENT_ID;
  const clientSecret = process.env.AMAZON_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Amazon Creators API credentials not configured.');
  }

  // Use cached token if valid
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.accessToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('scope', 'creators::api');

    const res = await fetch(OAUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: params.toString()
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      const status = res.status;
      lastApiError = `OAuth token request failed (${status}): ${errBody.slice(0, 100)}`;
      if (status === 401 || status === 403) {
        throw new Error('Amazon connection failed. Please check your Creators API credentials.');
      } else if (status === 429) {
        throw new Error('Amazon Creators API rate limit reached. Please retry shortly.');
      } else {
        throw new Error('Unable to authenticate with Amazon Creators API.');
      }
    }

    const data = await res.json();
    const expiresIn = data.expires_in || 3600;

    cachedToken = {
      accessToken: data.access_token,
      expiresAt: now + expiresIn * 1000
    };

    lastApiRequestTimestamp = new Date().toISOString();
    lastApiError = null;
    return cachedToken.accessToken;
  } catch (err: any) {
    lastApiError = err.message || 'Token generation failed';
    throw err;
  }
}

/**
 * Execute an authorized call to Amazon Creators API
 */
async function callCreatorsApi(operation: string, payload: any): Promise<any> {
  const token = await getAccessToken();
  const version = process.env.AMAZON_CREDENTIAL_VERSION || '2.1';
  const partnerTag = process.env.AMAZON_PARTNER_TAG || 'perfectgift-21';

  const endpoint = `https://${AMAZON_HOST}/catalog/v1/${operation.toLowerCase()}`;

  const requestBody = {
    ...payload,
    Marketplace: MARKETPLACE,
    PartnerTag: partnerTag,
    PartnerType: 'Associates',
    CredentialVersion: version
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${token}`,
      'x-amz-target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`,
      'x-amz-date': new Date().toISOString()
    },
    body: JSON.stringify(requestBody)
  });

  lastApiRequestTimestamp = new Date().toISOString();

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const status = response.status;
    lastApiError = `Amazon API ${operation} failed with status ${status}`;

    if (status === 401 || status === 403) {
      cachedToken = null; // Invalidate cached token
      throw new Error('Amazon connection failed. Please check your Creators API credentials.');
    } else if (status === 404) {
      return null;
    } else if (status === 429) {
      throw new Error('Amazon Creators API rate limit reached. Please retry shortly.');
    } else if (status >= 500) {
      throw new Error('Amazon Creators API temporary service error. Falling back to verified catalog.');
    } else {
      throw new Error(`Amazon API request error: ${errorText.slice(0, 100)}`);
    }
  }

  const json = await response.json();
  lastApiError = null;
  return json;
}

/**
 * Map raw Amazon Item object to application's Product schema
 */
export function mapAmazonItemToProduct(
  item: any,
  context?: { occasion?: string; category?: string; recipient?: string }
): Product {
  const partnerTag = getPartnerTag();
  const asin = item.ASIN || item.asin || item.id || `B0${Math.floor(10000000 + Math.random() * 90000000)}`;

  // Title
  const name =
    item.ItemInfo?.Title?.DisplayValue ||
    item.title ||
    item.name ||
    'Amazon India Curated Gift Selection';

  // Description & Features
  const features = item.ItemInfo?.Features?.DisplayValues || [];
  const description =
    features.join('. ') ||
    item.description ||
    item.ItemInfo?.Classifications?.ProductGroup?.DisplayValue ||
    'Authentic Amazon India selection delivered across India.';

  // Price calculation
  const listingPrice = item.Offers?.Listings?.[0]?.Price?.Amount;
  const isPriceAvailable = listingPrice !== undefined && listingPrice !== null && listingPrice > 0;
  const price = isPriceAvailable ? Math.round(Number(listingPrice)) : item.price || 0;

  // Rating & Reviews
  const ratingVal = item.CustomerReviews?.StarRating || item.rating;
  const isRatingAvailable = ratingVal !== undefined && ratingVal !== null;
  const rating = isRatingAvailable ? Number(Number(ratingVal).toFixed(1)) : 0;

  const reviewCountVal = item.CustomerReviews?.Count || item.reviewCount;
  const isReviewCountAvailable = reviewCountVal !== undefined && reviewCountVal !== null;
  const reviewCount = isReviewCountAvailable ? Number(reviewCountVal) : 0;

  // Availability
  const rawAvail = item.Offers?.Listings?.[0]?.Availability?.Type;
  const isAvailabilityAvailable = rawAvail !== undefined;
  const availability: 'in_stock' | 'limited_stock' | 'out_of_stock' =
    rawAvail === 'Now' || rawAvail === 'InStock' ? 'in_stock' : 'in_stock';

  // Images
  const imageUrl =
    item.Images?.Primary?.Large?.URL ||
    item.Images?.Primary?.Medium?.URL ||
    item.imageUrl ||
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80';

  // URL & Affiliate attribution
  const rawProductUrl = item.DetailPageURL || `https://www.amazon.in/dp/${asin}`;
  let affiliateUrl = rawProductUrl;
  if (!affiliateUrl.includes('tag=')) {
    const separator = affiliateUrl.includes('?') ? '&' : '?';
    affiliateUrl = `${affiliateUrl}${separator}tag=${partnerTag}`;
  }

  // Categories & Tags
  const categoryName =
    context?.category ||
    item.ItemInfo?.Classifications?.ProductGroup?.DisplayValue ||
    'Lifestyle';

  const subcategory =
    item.ItemInfo?.Classifications?.Binding?.DisplayValue ||
    'Amazon Gift Ideas';

  return {
    id: `amzn-${asin}`,
    asin,
    name,
    description,
    category: categoryName,
    subcategory,
    price,
    currency: 'INR',
    imageUrl,
    productUrl: rawProductUrl,
    affiliateUrl,
    merchant: 'Amazon.in',
    rating,
    reviewCount,
    availability,
    tags: [
      'amazon.in',
      'verified_seller',
      context?.occasion?.toLowerCase() || 'special_occasion',
      categoryName.toLowerCase()
    ],
    occasions: context?.occasion ? [context.occasion] : ['Birthday', 'Anniversary', 'Any Occasion'],
    relationships: context?.recipient ? [context.recipient] : ['Friend', 'Partner', 'Family'],
    personalityTags: ['Thoughtful', 'Modern', 'Practical'],
    interestTags: [categoryName, 'Gifting'],
    emotionalTags: ['Thoughtful', 'Delighted'],
    genderPreference: 'unisex',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'needs_review',
    source: 'amazon',
    lastCheckedAt: new Date().toISOString(),
    isPriceAvailable,
    isRatingAvailable,
    isReviewCountAvailable,
    isAvailabilityAvailable,
    isDemo: !isAmazonConfigured()
  };
}

/**
 * 1. SearchItems - Prepared modular operation
 */
export async function executeSearchItems(params: {
  Keywords: string;
  SearchIndex?: string;
  ItemCount?: number;
  ItemPage?: number;
  MinPrice?: number;
  MaxPrice?: number;
  BrowseNodeId?: string;
}): Promise<any> {
  const payload: any = {
    Keywords: params.Keywords,
    SearchIndex: params.SearchIndex || 'All',
    ItemCount: params.ItemCount || 10,
    ItemPage: params.ItemPage || 1,
    Resources: [
      'ItemInfo.Title',
      'ItemInfo.Features',
      'ItemInfo.Classifications',
      'Images.Primary.Large',
      'Offers.Listings.Price',
      'Offers.Listings.Availability.Type',
      'CustomerReviews.StarRating',
      'CustomerReviews.Count'
    ]
  };

  if (params.MinPrice !== undefined && params.MinPrice > 0) {
    payload.MinPrice = Math.round(params.MinPrice * 100); // Price in cents/paise
  }
  if (params.MaxPrice !== undefined && params.MaxPrice > 0) {
    payload.MaxPrice = Math.round(params.MaxPrice * 100);
  }
  if (params.BrowseNodeId) {
    payload.BrowseNodeId = params.BrowseNodeId;
  }

  return await callCreatorsApi('SearchItems', payload);
}

/**
 * 2. GetItems - Prepared modular operation
 */
export async function executeGetItems(itemIds: string[]): Promise<any> {
  const payload = {
    ItemIds: itemIds,
    ItemIdType: 'ASIN',
    Resources: [
      'ItemInfo.Title',
      'ItemInfo.Features',
      'ItemInfo.Classifications',
      'Images.Primary.Large',
      'Offers.Listings.Price',
      'Offers.Listings.Availability.Type',
      'CustomerReviews.StarRating',
      'CustomerReviews.Count'
    ]
  };

  return await callCreatorsApi('GetItems', payload);
}

/**
 * 3. GetVariations - Prepared modular operation
 */
export async function executeGetVariations(asin: string): Promise<any> {
  const payload = {
    ASIN: asin,
    Resources: [
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Images.Primary.Large',
      'VariationSummary.VariationDimension'
    ]
  };

  return await callCreatorsApi('GetVariations', payload);
}

/**
 * 4. GetBrowseNodes - Prepared modular operation
 */
export async function executeGetBrowseNodes(browseNodeIds: string[]): Promise<any> {
  const payload = {
    BrowseNodeIds: browseNodeIds,
    Resources: ['BrowseNodes.Ancestor', 'BrowseNodes.Children']
  };

  return await callCreatorsApi('GetBrowseNodes', payload);
}

/**
 * Modular Search: searchAmazonProducts
 */
export async function searchAmazonProducts(params: AmazonSearchParams): Promise<AmazonSearchResponse> {
  const isConfigured = isAmazonConfigured();

  // Convert inputs into focused Amazon search queries
  const queries: string[] = [];
  if (params.keywords && params.keywords.trim()) {
    queries.push(params.keywords.trim());
  } else {
    const parts: string[] = [];
    if (params.occasion) parts.push(params.occasion);
    parts.push('gift for');
    if (params.recipient) parts.push(params.recipient);
    if (params.category) parts.push(params.category);
    queries.push(parts.join(' '));

    if (params.personality) {
      queries.push(`${params.personality} gift for ${params.recipient || 'loved one'}`);
    }
    if (params.interest) {
      queries.push(`${params.interest} gifts amazon india`);
    }
  }

  const primaryQuery = queries[0] || 'gifts on amazon india';

  if (!isConfigured) {
    // In Demo Mode, return clean status without crashing
    return {
      products: [],
      totalResults: 0,
      isLive: false,
      searchQueriesUsed: queries,
      notice: 'Amazon integration is not connected. Showing demo gift recommendations.'
    };
  }

  try {
    const apiResult = await executeSearchItems({
      Keywords: primaryQuery,
      MinPrice: params.minPrice,
      MaxPrice: params.maxPrice,
      ItemCount: params.limit || 10,
      ItemPage: params.itemPage || 1
    });

    const rawItems = apiResult?.SearchResult?.Items || [];
    const products: Product[] = rawItems.map((item: any) =>
      mapAmazonItemToProduct(item, {
        occasion: params.occasion,
        category: params.category,
        recipient: params.recipient
      })
    );

    return {
      products,
      totalResults: apiResult?.SearchResult?.TotalResultCount || products.length,
      isLive: true,
      searchQueriesUsed: queries
    };
  } catch (err: any) {
    console.warn('Amazon Creators API search error, falling back:', err.message);
    lastApiError = err.message;
    return {
      products: [],
      totalResults: 0,
      isLive: false,
      searchQueriesUsed: queries,
      notice: 'Amazon Creators API unavailable. Falling back to demo catalog.'
    };
  }
}

/**
 * Modular: getAmazonProduct (Single item by ASIN)
 */
export async function getAmazonProduct(asin: string): Promise<Product | null> {
  if (!isAmazonConfigured()) return null;

  try {
    const res = await executeGetItems([asin]);
    const item = res?.ItemsResult?.Items?.[0];
    if (!item) return null;
    return mapAmazonItemToProduct(item);
  } catch (err: any) {
    console.warn(`Error fetching Amazon product ${asin}:`, err.message);
    return null;
  }
}

/**
 * Modular: getAmazonProducts (Multiple items by ASINs)
 */
export async function getAmazonProducts(asins: string[]): Promise<Product[]> {
  if (!isAmazonConfigured() || asins.length === 0) return [];

  try {
    const res = await executeGetItems(asins);
    const items = res?.ItemsResult?.Items || [];
    return items.map((i: any) => mapAmazonItemToProduct(i));
  } catch (err: any) {
    console.warn('Error fetching Amazon products list:', err.message);
    return [];
  }
}

/**
 * Modular: getAmazonCategories (Standard Amazon India gift browse nodes)
 */
export async function getAmazonCategories(): Promise<Array<{ id: string; name: string; contextName?: string }>> {
  return [
    { id: '1375424031', name: 'Jewellery & Accessories', contextName: 'Fashion' },
    { id: '976419031', name: 'Home & Kitchen Gifts', contextName: 'Home' },
    { id: '976442031', name: 'Gourmet & Chocolates', contextName: 'Food' },
    { id: '976416031', name: 'Electronics & Smart Gadgets', contextName: 'Tech' },
    { id: '1350380031', name: 'Beauty & Fragrances', contextName: 'Beauty' },
    { id: '1318428031', name: 'Handcrafted & Personalized', contextName: 'Artisanal' },
    { id: '976420031', name: 'Watches & Keepsakes', contextName: 'Luxury' }
  ];
}

/**
 * Admin Test Connection function
 */
export async function testAmazonConnection(): Promise<{
  success: boolean;
  message: string;
  marketplace: string;
  partnerTagMasked: string;
  creatorsApiStatus: string;
}> {
  const configured = isAmazonConfigured();
  if (!configured) {
    return {
      success: false,
      message: 'Amazon connection failed. Please check your Creators API credentials in .env.',
      marketplace: MARKETPLACE,
      partnerTagMasked: getMaskedPartnerTag(),
      creatorsApiStatus: 'Not Connected'
    };
  }

  try {
    // Attempt token acquisition and light search
    const token = await getAccessToken();
    if (!token) throw new Error('Token generation returned empty token');

    return {
      success: true,
      message: 'Amazon India Creators API connected successfully! Token active and authenticated.',
      marketplace: MARKETPLACE,
      partnerTagMasked: getMaskedPartnerTag(),
      creatorsApiStatus: 'Connected'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Amazon connection failed: ${err.message || 'Please check your Creators API credentials.'}`,
      marketplace: MARKETPLACE,
      partnerTagMasked: getMaskedPartnerTag(),
      creatorsApiStatus: 'Not Connected'
    };
  }
}

/**
 * Track simulated or real imported products count
 */
export function incrementImportedCount(count: number = 1): void {
  productsImportedCount += count;
}
