import {
  Product,
  GiftFinderInputs,
  RecommendationResponse,
  GiftMessageRequest,
  GiftBundle,
  SurpriseIdea,
  AmazonIntegrationStatus,
  AmazonImportParams
} from '../types';

export async function checkServerHealth(): Promise<{ demoMode: boolean; geminiConfigured: boolean; productCount: number }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('API health check error, defaulting to local demo mode:', err);
    return { demoMode: true, geminiConfigured: false, productCount: 32 };
  }
}

export async function fetchProducts(params?: {
  category?: string;
  occasion?: string;
  budget?: string;
  status?: string;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.occasion) query.set('occasion', params.occasion);
    if (params?.budget) query.set('budget', params.budget);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.warn('Fetch products failed:', err);
    return [];
  }
}

export async function getRecommendations(inputs: GiftFinderInputs): Promise<RecommendationResponse> {
  const res = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gift AI is temporarily unavailable. Please try again.');
  }

  return await res.json();
}

export async function generateGiftMessage(req: GiftMessageRequest): Promise<{ message: string; isAiGenerated: boolean }> {
  const res = await fetch('/api/gift-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });

  if (!res.ok) {
    throw new Error('Gift message generator is temporarily unavailable.');
  }

  return await res.json();
}

export async function generateSurpriseIdea(params: {
  occasion: string;
  recipient: string;
  giftName: string;
  personality?: string;
}): Promise<{ idea: SurpriseIdea; isAiGenerated: boolean }> {
  const res = await fetch('/api/surprise-idea', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    throw new Error('Surprise planner is temporarily unavailable.');
  }

  return await res.json();
}

export async function fetchGiftBundle(mainProductId: string): Promise<{ bundle: GiftBundle }> {
  const res = await fetch('/api/bundle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mainProductId })
  });

  if (!res.ok) {
    throw new Error('Bundle service is temporarily unavailable.');
  }

  return await res.json();
}

export async function trackClick(payload: {
  type: 'product_click' | 'affiliate_click' | 'amazon_outbound_click' | 'amazon_product_view';
  productId: string;
  asin?: string;
  source: string;
  occasion?: string;
  budget?: string;
}): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Non-blocking telemetry
    console.debug('Analytics click track error:', err);
  }
}

// ==========================================
// AMAZON INDIA CREATORS API CLIENT
// ==========================================

export async function fetchAmazonStatus(): Promise<AmazonIntegrationStatus> {
  const res = await fetch('/api/amazon/status');
  if (!res.ok) throw new Error('Failed to fetch Amazon integration status');
  return await res.json();
}

export async function testAmazonConnectionApi(): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
  timestamp: string;
}> {
  const res = await fetch('/api/amazon/test-connection', {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Amazon connection test failed');
  return await res.json();
}

export async function importAmazonProductsApi(params: AmazonImportParams): Promise<{
  success: boolean;
  count: number;
  products: Product[];
  message: string;
  demoMode: boolean;
}> {
  const res = await fetch('/api/amazon/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to import Amazon products');
  }
  return await res.json();
}

export async function searchAmazonProductsApi(params: {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  occasion?: string;
  limit?: number;
}): Promise<{ products: Product[]; total: number }> {
  const query = new URLSearchParams();
  if (params.keyword) query.set('keyword', params.keyword);
  if (params.minPrice) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice) query.set('maxPrice', String(params.maxPrice));
  if (params.category) query.set('category', params.category);
  if (params.occasion) query.set('occasion', params.occasion);
  if (params.limit) query.set('limit', String(params.limit));

  const res = await fetch(`/api/amazon/search?${query.toString()}`);
  if (!res.ok) throw new Error('Amazon search query failed');
  return await res.json();
}

export async function fetchAnalyticsSummary(): Promise<any> {
  const res = await fetch('/api/analytics/summary');
  if (!res.ok) throw new Error('Failed to load analytics summary');
  return await res.json();
}

export async function queryAdminAssistant(query: string): Promise<{ reply: string; isAiGenerated: boolean }> {
  const res = await fetch('/api/admin/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  if (!res.ok) throw new Error('Admin assistant is temporarily unavailable');
  return await res.json();
}

export async function adminSaveProduct(product: Partial<Product>, isEditing: boolean): Promise<Product> {
  const url = isEditing && product.id ? `/api/admin/products/${product.id}` : '/api/admin/products';
  const method = isEditing ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  if (!res.ok) throw new Error('Failed to save product');
  const data = await res.json();
  return data.product;
}

export async function adminDeleteProduct(id: string): Promise<boolean> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE'
  });
  return res.ok;
}

export async function adminApproveProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/admin/products/${id}/approve`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to approve product');
  const data = await res.json();
  return data.product;
}

export async function adminApproveAllProducts(): Promise<{ count: number; totalActive: number }> {
  const res = await fetch('/api/admin/products/approve-all', {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to approve all products');
  return await res.json();
}

export async function adminResetProducts(): Promise<boolean> {
  const res = await fetch('/api/admin/products/reset', {
    method: 'POST'
  });
  return res.ok;
}

export async function testMatchingEngineApi(inputs: GiftFinderInputs): Promise<{
  results: RecommendationResponse;
  allScoredCandidates: Array<{
    product: Product;
    score: number;
    breakdown: any;
    matchLabel: string;
    rejectionReason?: string;
    matchHighlights: string[];
  }>;
  rejectedProducts: Array<{
    product: Product;
    reason: string;
  }>;
  queries: string[];
}> {
  const res = await fetch('/api/matching/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to run matching test');
  }

  return await res.json();
}

export async function aiSuggestTagsApi(product: Partial<Product>): Promise<{
  category: string;
  subcategory: string;
  recipientTags: string[];
  relationshipTags: string[];
  occasionTags: string[];
  personalityTags: string[];
  interestTags: string[];
  emotionTags: string[];
  budgetMin: number;
  budgetMax: number;
  confidenceNotes?: string;
  isAiGenerated: boolean;
}> {
  const res = await fetch('/api/products/ai-tag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate AI tags');
  }

  return await res.json();
}

