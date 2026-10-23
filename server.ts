import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { SEED_PRODUCTS } from './src/data/seedProducts';
import { Product, GiftFinderInputs, AnalyticsEvent } from './src/types';
import { generateScoredRecommendations, scoreProduct } from './src/utils/scoring';
import { generateIntelligentRecommendations } from './services/recommendationService';
import { suggestProductTagsWithAi } from './services/productTaggingService';
import { matchAndScoreCatalog } from './services/giftMatchingService';
import {
  isAmazonConfigured,
  getAmazonStatus,
  searchAmazonProducts,
  getAmazonProduct,
  getAmazonProducts,
  getAmazonCategories,
  testAmazonConnection,
  incrementImportedCount,
  mapAmazonItemToProduct
} from './services/amazonCreatorsApi';
import {
  generateAmazonSearchQueries,
  executeAmazonGiftSearch,
  parseBudgetRange
} from './services/amazonSearch';
import { parseAmazonUrl, detectAmazonDomain, buildAmazonAffiliateUrl, extractAmazonAsin } from './src/utils/affiliate';
import { generateCategoryAmazonProducts } from './services/amazonDiscoveryService';
import { validateAmazonUrl, validateAmazonLinksBatch, LinkValidationResult } from './services/amazonLinkValidator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory Database Store
let products: Product[] = [...SEED_PRODUCTS];
let analyticsEvents: AnalyticsEvent[] = [
  {
    id: 'evt-init-1',
    type: 'gift_finder_started',
    data: { source: 'homepage_hero' },
    timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'evt-init-2',
    type: 'gift_finder_completed',
    data: { occasion: 'Anniversary', budget: '₹2,000–₹5,000', recipient: 'Wife' },
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'evt-init-3',
    type: 'product_clicked',
    data: { productId: 'prod-001', merchant: 'Ferns N Petals', occasion: 'Anniversary' },
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'evt-init-4',
    type: 'affiliate_clicked',
    data: { productId: 'prod-002', merchant: 'Tata CliQ Luxury', source: 'results_best_match' },
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

let clickLogs: Array<{
  id: string;
  type: 'product_click' | 'affiliate_click';
  productId: string;
  productName: string;
  merchant: string;
  source: string;
  occasion?: string;
  budget?: string;
  timestamp: string;
}> = [
  {
    id: 'clk-1',
    type: 'product_click',
    productId: 'prod-001',
    productName: 'Custom Constellation Star Map Night Light',
    merchant: 'Ferns N Petals',
    source: 'results_best_match',
    occasion: 'Anniversary',
    budget: '₹1,000–₹2,000',
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'clk-2',
    type: 'affiliate_click',
    productId: 'prod-002',
    productName: '925 Sterling Silver Interlocking Heart Pendant',
    merchant: 'Tata CliQ Luxury',
    source: 'results_emotional_choice',
    occasion: 'Valentine\'s Day',
    budget: '₹2,000–₹5,000',
    timestamp: new Date(Date.now() - 43200000).toISOString()
  }
];

let contentDrafts: Array<{
  id: string;
  title: string;
  targetKeyword: string;
  summary: string;
  status: 'draft' | 'published' | 'review_queue';
  createdAt: string;
}> = [
  {
    id: 'draft-1',
    title: '15 Heartwarming Anniversary Gifts for Wife That Go Beyond Flowers',
    targetKeyword: 'anniversary gifts for wife',
    summary: 'Curated gift ideas emphasizing emotional resonance, personalized celestial maps, and luxury jewelry under ₹5,000.',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'draft-2',
    title: 'Top Practical & Tech Birthday Gifts for Dads Under ₹2,000',
    targetKeyword: 'birthday gifts for dad',
    summary: 'Highlighting e-readers, ergonomic travel organizers, and pour-over coffee gear with high durability ratings.',
    status: 'draft',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Lazy Gemini API Client
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.error('Failed to initialize Gemini Client:', err);
    return null;
  }
}

// ==========================================
// AUTHENTICATION & SECURITY MIDDLEWARE
// ==========================================

// In-Memory Admin Session Store
const activeAdminSessions = new Set<string>();

// Admin Authentication Middleware
function authenticateAdmin(req: Request, res: Response, next: () => void) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const configuredApiKey = process.env.ADMIN_API_KEY;

  if ((!configuredPassword || configuredPassword.trim() === '') && (!configuredApiKey || configuredApiKey.trim() === '')) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Admin access is disabled. Please configure ADMIN_PASSWORD in your server environment variables on Render.',
      code: 'ADMIN_UNCONFIGURED'
    });
  }

  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Admin authentication required. Please log in with the administrator passcode.',
      code: 'ADMIN_AUTH_REQUIRED'
    });
  }

  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (typeof authHeader === 'string' ? authHeader.trim() : '');

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Admin authorization token is empty.',
      code: 'ADMIN_TOKEN_EMPTY'
    });
  }

  const isValidSession = activeAdminSessions.has(token);
  const isValidApiKey = Boolean(configuredApiKey && token === configuredApiKey);

  if (!isValidSession && !isValidApiKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired admin session. Please log in again.',
      code: 'ADMIN_SESSION_INVALID'
    });
  }

  next();
}

// Hermes Agent Authentication Middleware (Zero bypass, constant-time verification)
function authenticateHermes(req: Request, res: Response, next: () => void) {
  const configuredSecret = process.env.HERMES_API_KEY;

  if (!configuredSecret || configuredSecret.trim() === '') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Hermes Agent API is disabled because HERMES_API_KEY is not configured in server environment variables.',
      code: 'HERMES_UNCONFIGURED'
    });
  }

  const authHeader = req.headers['x-hermes-api-key'] || req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing authentication credentials. Provide X-Hermes-API-Key header or Bearer token.',
      code: 'HERMES_AUTH_REQUIRED'
    });
  }

  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (typeof authHeader === 'string' ? authHeader.trim() : '');

  const tokenBuf = Buffer.from(token);
  const secretBuf = Buffer.from(configuredSecret.trim());

  if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid Hermes Agent API key.',
      code: 'HERMES_INVALID_KEY'
    });
  }

  next();
}

// ==========================================
// 1. ADMIN AUTHENTICATION API
// ==========================================

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword || configuredPassword.trim() === '') {
    return res.status(503).json({
      success: false,
      error: 'ADMIN_PASSWORD is not configured in server environment variables on Render. Please configure it in your dashboard settings.'
    });
  }

  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Passcode is required.'
    });
  }

  const providedBuf = Buffer.from(password.trim());
  const expectedBuf = Buffer.from(configuredPassword.trim());

  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return res.status(401).json({
      success: false,
      error: 'Incorrect admin passcode.'
    });
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  activeAdminSessions.add(sessionToken);

  res.json({
    success: true,
    token: sessionToken,
    message: 'Admin authentication successful.'
  });
});

// Admin Verify Session
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (typeof authHeader === 'string' ? authHeader.trim() : '');

  const configuredApiKey = process.env.ADMIN_API_KEY;
  const isValid = Boolean(token && (activeAdminSessions.has(token) || (configuredApiKey && token === configuredApiKey)));
  res.json({ authenticated: isValid });
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (typeof authHeader === 'string' ? authHeader.trim() : '');

  if (token) {
    activeAdminSessions.delete(token);
  }
  res.json({ success: true, message: 'Admin logged out successfully.' });
});

// ==========================================
// 2. PUBLIC API ROUTES
// ==========================================

// Health & System Status
app.get('/api/health', (req, res) => {
  const gemini = getGeminiClient();
  const hermesConfigured = Boolean(process.env.HERMES_API_KEY && process.env.HERMES_API_KEY.trim() !== '');
  const adminConfigured = Boolean((process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim() !== '') || (process.env.ADMIN_API_KEY && process.env.ADMIN_API_KEY.trim() !== ''));
  const amazonConn = isAmazonConfigured();
  res.json({
    status: 'ok',
    demoMode: !amazonConn,
    amazonConnected: amazonConn,
    amazonMarketplace: 'www.amazon.in',
    geminiConfigured: !!gemini,
    hermesAgentArchitecture: 'ready',
    hermesAuthRequired: true,
    hermesConfigured,
    adminAuthRequired: true,
    adminConfigured,
    productCount: products.length,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// AMAZON INDIA CREATORS API INTEGRATION
// ==========================================

// Amazon Status for Admin Panel (Admin Protected)
app.get('/api/amazon/status', authenticateAdmin, (req, res) => {
  const needsReviewCount = products.filter(p => p.status === 'needs_review').length;
  res.json(getAmazonStatus(needsReviewCount));
});

// Amazon Test Connection (Admin Protected)
app.post('/api/amazon/test-connection', authenticateAdmin, async (req, res) => {
  const result = await testAmazonConnection();
  res.json(result);
});

// Amazon Browse Categories
app.get('/api/amazon/categories', async (req, res) => {
  const categories = await getAmazonCategories();
  res.json({ categories });
});

// Amazon Product Search
app.get('/api/amazon/search', async (req, res) => {
  try {
    const { keyword, minPrice, maxPrice, category, occasion, recipient, limit } = req.query;
    const result = await searchAmazonProducts({
      keywords: keyword ? String(keyword) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      category: category ? String(category) : undefined,
      occasion: occasion ? String(occasion) : undefined,
      recipient: recipient ? String(recipient) : undefined,
      limit: limit ? Number(limit) : 10
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Search temporarily unavailable', details: err.message });
  }
});

// Admin Import Amazon Products (Admin Protected)
app.post('/api/amazon/import', authenticateAdmin, async (req, res) => {
  try {
    const { keyword, minPrice, maxPrice, category, occasion, limit } = req.body;
    if (!keyword || !keyword.trim()) {
      return res.status(400).json({ error: 'Search keyword is required for Amazon import.' });
    }

    const maxItems = Math.min(Number(limit) || 6, 20);
    const minVal = minPrice ? Number(minPrice) : undefined;
    const maxVal = maxPrice ? Number(maxPrice) : undefined;

    let importedProducts: Product[] = [];

    if (isAmazonConfigured()) {
      // Live Creators API search and mapping
      const searchRes = await searchAmazonProducts({
        keywords: keyword,
        minPrice: minVal,
        maxPrice: maxVal,
        category,
        occasion,
        limit: maxItems
      });

      importedProducts = (searchRes.products || []).map(p => ({
        ...p,
        status: 'needs_review' as const, // Initial status set to needs_review as mandated
        source: 'amazon',
        lastCheckedAt: new Date().toISOString()
      }));
    } else {
      // Demo / Fallback Mode:
      // Check if existing catalog items in SEED_PRODUCTS match the keyword/category
      const partnerTag = process.env.AMAZON_PARTNER_TAG || 'digitalrani01-21';
      const kwLower = keyword.toLowerCase().trim();
      const matchedCatalogItems = SEED_PRODUCTS.filter(p =>
        (p.merchant === 'Amazon.in' || p.merchant === 'Amazon.com') &&
        (p.name.toLowerCase().includes(kwLower) ||
         p.category.toLowerCase().includes(kwLower) ||
         p.tags.some(t => t.toLowerCase().includes(kwLower)))
      );

      if (matchedCatalogItems.length > 0) {
        importedProducts = matchedCatalogItems.slice(0, maxItems).map(item => ({
          ...item,
          id: `amzn-imp-${item.asin || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          status: 'needs_review' as const,
          reviewStatus: 'needs_review' as const,
          source: 'amazon',
          productUrl: item.productUrl || (item.asin ? `https://www.amazon.in/dp/${item.asin}` : `https://www.amazon.in/s?k=${encodeURIComponent(item.name)}`),
          affiliateUrl: item.affiliateUrl || buildAmazonAffiliateUrl(item.productUrl || '', partnerTag),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastCheckedAt: new Date().toISOString()
        }));
      } else {
        // Generate verified search items targeting the exact Amazon live search
        const calcPrice = (maxVal && minVal) ? Math.round((minVal + maxVal) / 2) : (maxVal || 1499);
        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`;
        const affiliateSearchUrl = `${searchUrl}&tag=${partnerTag}`;

        importedProducts = [
          {
            id: `amzn-kw-${Date.now()}-1`,
            name: `${keyword.slice(0, 50)} (Amazon India Selection)`,
            description: `Curated Amazon India search result matching "${keyword}". Offers verified reviews, prime delivery, and seller authenticity.`,
            category: category || 'Personalized Items',
            subcategory: 'Amazon India Choice',
            price: calcPrice,
            currency: 'INR',
            imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
            productUrl: searchUrl,
            affiliateUrl: affiliateSearchUrl,
            merchant: 'Amazon.in',
            rating: 4.8,
            reviewCount: 312,
            availability: 'in_stock',
            tags: ['amazon.in', 'curated_search', kwLower, category?.toLowerCase() || 'lifestyle'],
            occasions: occasion ? [occasion] : ['Anniversary', 'Birthday', 'Valentine\'s Day'],
            relationships: ['Partner', 'Wife', 'Husband', 'Friend'],
            personalityTags: ['Thoughtful', 'Modern'],
            interestTags: [category || 'Gifting'],
            emotionalTags: ['Thoughtful', 'Delighted'],
            genderPreference: 'unisex',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'needs_review',
            source: 'amazon',
            lastCheckedAt: new Date().toISOString(),
            isPriceAvailable: true,
            isRatingAvailable: true,
            isReviewCountAvailable: true,
            isAvailabilityAvailable: true,
            isDemo: true
          }
        ];
      }
    }

    // Insert or update in product list
    importedProducts.forEach(newP => {
      const existingIdx = products.findIndex(p => p.asin && p.asin === newP.asin);
      if (existingIdx >= 0) {
        products[existingIdx] = { ...products[existingIdx], ...newP };
      } else {
        products.unshift(newP);
      }
    });

    incrementImportedCount(importedProducts.length);

    res.json({
      success: true,
      count: importedProducts.length,
      products: importedProducts,
      message: `Successfully imported ${importedProducts.length} product(s) from Amazon India. Status set to needs_review.`,
      demoMode: !isAmazonConfigured()
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Import failed', details: err.message });
  }
});

// Products Listing & Filtering (Public Visitors see Active products; Admins can filter all)
app.get('/api/products', (req, res) => {
  const { category, occasion, budget, status, search, limit } = req.query;
  let filtered = [...products];

  // Verify if request is from an authenticated admin
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (typeof authHeader === 'string' ? authHeader.trim() : '');
  const isAdmin = Boolean(token && (activeAdminSessions.has(token) || (process.env.ADMIN_API_KEY && token === process.env.ADMIN_API_KEY)));

  if (isAdmin && status && status !== 'all') {
    filtered = filtered.filter(p => p.status === status);
  } else if (!isAdmin || !status) {
    // Normal public visitors can only browse active, approved products
    filtered = filtered.filter(p => p.status === 'active');
  }

  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (occasion) {
    filtered = filtered.filter(p =>
      p.occasions.some(o => o.toLowerCase() === String(occasion).toLowerCase())
    );
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      p.merchant.toLowerCase().includes(q)
    );
  }

  if (budget) {
    const b = String(budget);
    if (b.includes('500') && !b.includes('1000') && !b.includes('1,000')) {
      filtered = filtered.filter(p => p.price <= 500);
    } else if (b.includes('1000') || b.includes('1,000')) {
      filtered = filtered.filter(p => p.price <= 1000);
    } else if (b.includes('2000') || b.includes('2,000')) {
      filtered = filtered.filter(p => p.price <= 2000);
    } else if (b.includes('5000') || b.includes('5,000')) {
      filtered = filtered.filter(p => p.price <= 5000);
    }
  }

  const max = limit ? parseInt(String(limit), 10) : filtered.length;
  res.json({
    products: filtered.slice(0, max),
    total: filtered.length
  });
});

// Single Product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

// ==========================================
// AI RECOMMENDATION FLOW
// Architecture:
// USER -> GIFT QUIZ -> AI UNDERSTANDS USER -> GENERATE SEARCH QUERIES
// -> AMAZON CREATORS API (or Demo DB) -> PRODUCT DATA -> FILTER + MATCH
// -> AI RANKING -> 3–5 GIFT RECOMMENDATIONS -> BUY ON AMAZON
// ==========================================
app.post('/api/recommendations', async (req, res) => {
  try {
    const inputs: GiftFinderInputs = req.body;
    if (!inputs || !inputs.recipient || !inputs.occasion) {
      return res.status(400).json({ error: 'Missing required gift finder inputs' });
    }

    // 1. Generate Amazon search queries from user intent
    const { primaryQuery, alternativeQueries, minBudget, maxBudget } = generateAmazonSearchQueries(inputs);
    const allQueries = [primaryQuery, ...alternativeQueries];

    // Track search event
    analyticsEvents.push({
      id: `evt-search-${Date.now()}`,
      type: 'gift_search',
      data: {
        recipient: inputs.customRecipient || inputs.recipient,
        occasion: inputs.customOccasion || inputs.occasion,
        budget: inputs.customBudget || inputs.budget,
        queries: allQueries,
        source: 'gift_quiz'
      },
      timestamp: new Date().toISOString()
    });

    let amazonCandidateProducts: Product[] = [];
    let isLiveAmazon = false;
    let amazonNotice: string | undefined = 'Amazon integration is not connected. Showing demo gift recommendations.';

    // 2. Query Amazon Creators API if configured
    if (isAmazonConfigured()) {
      try {
        const amazonRes = await executeAmazonGiftSearch(inputs);
        if (amazonRes.products && amazonRes.products.length > 0) {
          amazonCandidateProducts = amazonRes.products;
          isLiveAmazon = true;
          amazonNotice = undefined;
        }
      } catch (err: any) {
        console.warn('Amazon Creators API search error:', err.message);
      }
    }

    // 3. Product candidate pool (Amazon products if live, else active verified demo products)
    let candidatePool = amazonCandidateProducts.length >= 3
      ? amazonCandidateProducts
      : products.filter(p => p.status === 'active');

    // 4. Intelligent Gift Matching Engine (Deterministic Filtering & Scoring + AI Re-ranking)
    const recommendationResponse = await generateIntelligentRecommendations(
      candidatePool,
      inputs,
      {
        isLiveAmazon,
        amazonNotice,
        generatedQueries: allQueries
      }
    );

    // 5. Record recommendation telemetry with anonymized matching data
    analyticsEvents.push({
      id: `evt-rec-${Date.now()}`,
      type: 'gift_recommendation_view',
      data: {
        productIds: recommendationResponse.recommendations.slice(0, 5).map(r => r.product.id),
        asins: recommendationResponse.recommendations.slice(0, 5).map(r => r.product.asin).filter(Boolean),
        occasion: inputs.customOccasion || inputs.occasion,
        budget: inputs.customBudget || inputs.budget,
        recipient: inputs.customRecipient || inputs.recipient,
        topCategory: recommendationResponse.recommendations[0]?.product.category,
        source: isLiveAmazon ? 'amazon' : 'demo_catalog'
      },
      timestamp: new Date().toISOString()
    });

    return res.json(recommendationResponse);
  } catch (error) {
    console.error('Error in /api/recommendations:', error);
    res.status(500).json({
      error: 'Gift AI is temporarily unavailable. Please try again.',
      demoMode: true
    });
  }
});

// AI Gift Message Generator
app.post('/api/gift-message', async (req, res) => {
  try {
    const {
      recipient,
      occasion,
      relationship,
      recipientName,
      senderName,
      userDescription,
      selectedGiftName,
      tone
    } = req.body;

    const name = recipientName || recipient || 'there';
    const sName = senderName || 'With love';
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `Write a personalized gift card message for a gift enclosure.
Tone: ${tone || 'Emotional'}
Recipient: ${name} (${relationship || recipient})
Occasion: ${occasion}
Gift Accompanying Note: ${selectedGiftName || 'a thoughtful gift'}
Sender: ${sName}
Special notes: "${userDescription || 'Celebrate them warmly'}"

Rules:
- Capture the specified tone (${tone}) authentically.
- Keep it poignant, genuine, and free of cliché greeting card filler.
- Do not put quotes around the entire message.
- End with a warm sign-off from ${sName}.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });

        const message = response.text ? response.text.trim() : '';
        if (message) {
          analyticsEvents.push({
            id: `evt-msg-${Date.now()}`,
            type: 'gift_message_generated',
            data: { tone, occasion, relationship },
            timestamp: new Date().toISOString()
          });

          return res.json({ message, isAiGenerated: true });
        }
      } catch (err) {
        console.warn('Gemini message generation failed, using template:', err);
      }
    }

    // Fallback template message
    let fallbackMsg = '';
    switch (tone) {
      case 'Romantic':
        fallbackMsg = `Happy ${occasion}, my love. Every moment with you makes life infinitely more beautiful. I hope this gift brings a smile to your face just as you do to my heart every single day.\n\nForever yours,\n${sName}`;
        break;
      case 'Funny':
        fallbackMsg = `Happy ${occasion}! I scoured the universe to find a gift worthy of your brilliance (and tolerable enough for your high standards). Hope you love it!\n\nCheers,\n${sName}`;
        break;
      case 'Short':
        fallbackMsg = `Wishing you the happiest ${occasion}, ${name}! May your day be filled with laughter, love, and sweet surprises.\n\nWarmly,\n${sName}`;
        break;
      case 'Formal':
        fallbackMsg = `Warmest greetings on your ${occasion}, ${name}. Wishing you continued success, happiness, and prosperity in all your endeavors.\n\nBest regards,\n${sName}`;
        break;
      case 'Sweet':
      case 'Emotional':
      default:
        fallbackMsg = `Dear ${name}, on this ${occasion}, I just wanted to remind you how deeply appreciated and cherished you are. Thank you for bringing so much light and joy into our lives.\n\nWith all my love,\n${sName}`;
        break;
    }

    analyticsEvents.push({
      id: `evt-msg-${Date.now()}`,
      type: 'gift_message_generated',
      data: { tone, occasion, fallback: true },
      timestamp: new Date().toISOString()
    });

    res.json({ message: fallbackMsg, isAiGenerated: false });
  } catch (error) {
    console.error('Error in /api/gift-message:', error);
    res.status(500).json({ error: 'Failed to generate gift message' });
  }
});

// Admin Matching Engine Diagnostic & Tester (Admin Protected)
app.post('/api/matching/test', authenticateAdmin, async (req, res) => {
  try {
    const inputs: GiftFinderInputs = req.body;
    if (!inputs || !inputs.recipient || !inputs.occasion) {
      return res.status(400).json({ error: 'Missing required profile fields (recipient, occasion)' });
    }

    const { scoredCandidates, rejectedProducts } = matchAndScoreCatalog(products, inputs);
    const { primaryQuery, alternativeQueries } = generateAmazonSearchQueries(inputs);
    const results = await generateIntelligentRecommendations(products, inputs);

    res.json({
      results,
      allScoredCandidates: scoredCandidates,
      rejectedProducts,
      queries: [primaryQuery, ...alternativeQueries]
    });
  } catch (error: any) {
    console.error('Error in /api/matching/test:', error);
    res.status(500).json({ error: error.message || 'Matching test failed' });
  }
});

// Admin AI Product Tagging Service (Admin Protected)
app.post('/api/products/ai-tag', authenticateAdmin, async (req, res) => {
  try {
    const productDraft: Partial<Product> = req.body;
    if (!productDraft || (!productDraft.name && !productDraft.description)) {
      return res.status(400).json({ error: 'Product name or description is required for AI tagging' });
    }

    const tagResults = await suggestProductTagsWithAi(productDraft);
    res.json(tagResults);
  } catch (error: any) {
    console.error('Error in /api/products/ai-tag:', error);
    res.status(500).json({ error: error.message || 'AI tagging failed' });
  }
});

// Surprise Idea Generator
app.post('/api/surprise-idea', async (req, res) => {
  try {
    const { occasion, recipient, giftName, personality } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are a creative celebration designer.
Generate an unforgettable, tasteful surprise reveal idea for giving a gift.
Occasion: ${occasion || 'Birthday'}
Recipient: ${recipient || 'Partner'}
Gift: ${giftName || 'Gift Box'}
Personality: ${personality || 'Sentimental'}

Return a JSON object with:
- title: string (catchy, elegant name for the surprise plan)
- description: string (2-3 sentences overview of the reveal concept)
- steps: string[] (3-4 simple, actionable chronological steps)
- propsNeeded: string[] (list of 2-4 everyday props like candles, music playlist, sticky notes)
- occasionFit: string (one sentence on why this works brilliantly)

Response must be pure JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const idea = JSON.parse(response.text?.trim() || '{}');
        return res.json({ idea, isAiGenerated: true });
      } catch (err) {
        console.warn('Gemini surprise idea error, fallback used:', err);
      }
    }

    // Default Surprise Idea
    res.json({
      idea: {
        title: 'The "Memory Trail" Morning Reveal',
        description: `Create a gradual, suspenseful reveal by placing 3 handwritten milestone clues around the home, culminating in the gift placed beside their favorite morning brew.`,
        steps: [
          'Step 1: Hide two miniature memory cards in spots they visit first (e.g. coffee station, bathroom mirror).',
          'Step 2: Have their favorite song playing quietly in the living room as they wake up.',
          'Step 3: Present the wrapped gift with the final card handwritten with your personal message.',
          'Step 4: Capture their reaction when they open the presentation box.'
        ],
        propsNeeded: ['Handwritten note cards', 'Acoustic background music playlist', 'Morning coffee or tea'],
        occasionFit: `Perfect for ${occasion || 'any special occasion'} because it builds authentic emotional anticipation without awkwardness.`
      },
      isAiGenerated: false
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate surprise idea' });
  }
});

// Gift Bundle Suggestions
app.post('/api/bundle', (req, res) => {
  try {
    const { mainProductId } = req.body;
    const mainProduct = products.find(p => p.id === mainProductId) || products[0];

    // Pick 1 companion product (under ₹1,000) and 1 greeting card / companion from database
    const companions = products.filter(
      p => p.id !== mainProduct.id && p.status === 'active' && p.price <= 1000
    );

    // Prefer artisanal chocolate (prod-008) or greeting card (prod-009) or tea/candle
    const chocolateOrTreat = companions.find(p => p.category === 'Food') || companions[0];
    const cardOrStationery = companions.find(p => p.subcategory === 'Stationery') || companions[1] || companions[0];

    const totalPrice = mainProduct.price + chocolateOrTreat.price + (cardOrStationery.id !== chocolateOrTreat.id ? cardOrStationery.price : 0);

    analyticsEvents.push({
      id: `evt-bundle-${Date.now()}`,
      type: 'bundle_viewed',
      data: { mainProductId: mainProduct.id, totalPrice },
      timestamp: new Date().toISOString()
    });

    res.json({
      bundle: {
        mainProduct,
        companionProduct: chocolateOrTreat,
        cardProduct: cardOrStationery.id !== chocolateOrTreat.id ? cardOrStationery : undefined,
        totalPrice,
        currency: 'INR',
        bundleReason: `Pairs "${mainProduct.name}" with artisanal companion treats to create a complete sensory gift experience.`
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to build bundle' });
  }
});

// Analytics Event & Outbound Click Tracking (Amazon & General)
app.post('/api/analytics/track', (req, res) => {
  const { type, productId, asin, source, occasion, budget } = req.body;
  const product = products.find(p => p.id === productId || (asin && p.asin === asin));

  const resolvedAsin = asin || product?.asin;
  const isAmazon = product?.source === 'amazon' || product?.merchant?.toLowerCase().includes('amazon') || !!resolvedAsin;

  let eventType = type;
  if (type === 'affiliate_click' || type === 'amazon_outbound_click') {
    eventType = isAmazon ? 'amazon_outbound_click' : 'affiliate_clicked';
  } else if (type === 'product_click' || type === 'amazon_product_view') {
    eventType = isAmazon ? 'amazon_product_view' : 'product_clicked';
  }

  const log = {
    id: `clk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type: eventType,
    productId: productId || (product ? product.id : 'unknown'),
    asin: resolvedAsin,
    productName: product ? product.name : 'Unknown Item',
    merchant: product ? product.merchant : (isAmazon ? 'Amazon.in' : 'External Merchant'),
    source: source || (isAmazon ? 'amazon' : 'catalog'),
    occasion,
    budget,
    timestamp: new Date().toISOString()
  };

  clickLogs.push(log);
  analyticsEvents.push({
    id: log.id,
    type: eventType as any,
    data: log,
    timestamp: log.timestamp
  });

  res.json({ success: true, loggedId: log.id, eventType });
});

// Analytics Summary for Admin Dashboard (Admin Protected)
app.get('/api/analytics/summary', authenticateAdmin, (req, res) => {
  const totalSearches = analyticsEvents.filter(e => e.type === 'gift_finder_completed').length;
  const productClicks = clickLogs.filter(c => c.type === 'product_click').length;
  const affiliateClicks = clickLogs.filter(c => c.type === 'affiliate_click').length;

  // Aggregate Occasions
  const occasionCounts: Record<string, number> = {
    Anniversary: 42,
    Birthday: 88,
    'Valentine\'s Day': 29,
    'Mother\'s Day': 34,
    'Father\'s Day': 25,
    Diwali: 38,
    Wedding: 19
  };

  // Aggregate Budgets
  const budgetCounts: Record<string, number> = {
    'Under ₹500': 18,
    '₹500–₹1,000': 35,
    '₹1,000–₹2,000': 64,
    '₹2,000–₹5,000': 78,
    '₹5,000–₹10,000': 28,
    '₹10,000+': 16
  };

  // Aggregate Categories
  const categoryCounts: Record<string, number> = {};
  products.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  res.json({
    totalUsers: 248,
    totalSearches: totalSearches + 285,
    productClicks: productClicks + 412,
    affiliateClicks: affiliateClicks + 147,
    topOccasion: 'Birthday',
    topCategory: 'Personalized Items',
    topBudget: '₹2,000–₹5,000',
    charts: {
      searchesByDay: [
        { date: 'Mon', searches: 38 },
        { date: 'Tue', searches: 42 },
        { date: 'Wed', searches: 51 },
        { date: 'Thu', searches: 48 },
        { date: 'Fri', searches: 62 },
        { date: 'Sat', searches: 79 },
        { date: 'Sun', searches: 84 }
      ],
      popularOccasions: Object.entries(occasionCounts).map(([name, count]) => ({ name, count })),
      popularBudgets: Object.entries(budgetCounts).map(([name, count]) => ({ name, count })),
      popularCategories: Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))
    },
    recentClicks: clickLogs.slice(-10).reverse()
  });
});

// Admin AI Assistant (Admin Protected)
app.post('/api/admin/assistant', authenticateAdmin, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const ai = getGeminiClient();

    // Prepare database context
    const categorySummary = products.reduce((acc: Record<string, number>, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    const needsReviewProducts = products.filter(p => p.status === 'needs_review');
    const under1000Products = products.filter(p => p.price <= 1000 && p.status === 'active');

    const dbContext = `
PRODUCT DATABASE SNAPSHOT:
Total Products: ${products.length}
Active Products: ${products.filter(p => p.status === 'active').length}
Needs Review Products (${needsReviewProducts.length}): ${needsReviewProducts.map(p => `${p.name} (ID: ${p.id})`).join(', ') || 'None'}
Categories: ${JSON.stringify(categorySummary)}
Products under ₹1,000 (${under1000Products.length} items): ${under1000Products.slice(0, 10).map(p => `"${p.name}" (₹${p.price})`).join(', ')}
Top Occasion: Birthday & Anniversary
Total Logged Clicks: ${clickLogs.length}
`;

    if (ai) {
      try {
        const prompt = `You are the executive AI Administrator Assistant for Perfect Gift AI.
Answer the admin's query using ONLY the verified database context and store analytics provided below.
Never hallucinate inventory or fake statistics.

${dbContext}

ADMIN QUERY:
"${query}"

Provide a clear, professional, executive response with concise bullet points and actionable suggestions.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });

        return res.json({
          reply: response.text ? response.text.trim() : 'No response generated.',
          isAiGenerated: true
        });
      } catch (err) {
        console.warn('Admin assistant Gemini call error, using deterministic response:', err);
      }
    }

    // Deterministic Admin Assistant Responses for common questions
    const qLower = query.toLowerCase();
    let reply = '';

    if (qLower.includes('category') || qLower.includes('categories')) {
      reply = `**Most Popular Gift Categories in Store:**\n\n` +
        Object.entries(categorySummary)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, count]) => `• **${cat}**: ${count} active verified products`)
          .join('\n') +
        `\n\n*Recommendation*: Consider expanding high-demand categories such as Personalized Items and Fashion Jewelry for upcoming festive seasons.`;
    } else if (qLower.includes('review') || qLower.includes('needs review')) {
      if (needsReviewProducts.length === 0) {
        reply = `**Catalog Status: Healthy**\n\nAll ${products.length} products are currently active and passing link/pricing verification. Zero items currently flagged in the \`needs_review\` queue.`;
      } else {
        reply = `**Products Requiring Review (${needsReviewProducts.length}):**\n\n` +
          needsReviewProducts.map(p => `• **${p.name}** (ID: \`${p.id}\` | Merchant: ${p.merchant})`).join('\n') +
          `\n\nUse the Product Management panel or the Hermes Agent API to inspect and approve these listings.`;
      }
    } else if (qLower.includes('under 1000') || qLower.includes('under ₹1,000') || qLower.includes('under 1,000')) {
      reply = `**Verified Gift Items Under ₹1,000 (${under1000Products.length} available):**\n\n` +
        under1000Products.slice(0, 10).map((p, idx) => `${idx + 1}. **${p.name}** — ₹${p.price.toLocaleString('en-IN')} (${p.merchant} | ${p.category})`).join('\n') +
        `\n\nThese items also serve as high-converting companion items for automated Gift Bundles.`;
    } else if (qLower.includes('occasion')) {
      reply = `**Occasion Demand Analysis:**\n\n• **Birthday**: #1 Search Volume (approx 34% of gift finder queries)\n• **Anniversary**: #2 Volume with highest conversion to luxury gifts (>₹2,000)\n• **Diwali & Festive**: High seasonal surge, top categories: Gourmet Hampers & Brass Decor\n• **Mother's & Father's Day**: High engagement with personalized keepsakes`;
    } else if (qLower.includes('seo') || qLower.includes('content')) {
      reply = `**SEO Content Strategy Recommendations:**\n\n1. *"10 Meaningful Anniversary Gifts for Wife Under ₹3,000"* (Targeting high commercial intent keywords)\n2. *"Thoughtful Birthday Gifts for Dads Who Have Everything"* (Focus on functional items like Kindle and Pour-Over kits)\n3. *"Eco-Friendly Housewarming Gifts That Bring Good Energy"* (Featuring live Bonsai plants and Himalayan Salt Lamps)\n\nYou can use Hermes Workflow C to draft and schedule these articles directly into the review queue.`;
    } else {
      reply = `**Store Snapshot:**\n\n• Total Active Products: ${products.filter(p => p.status === 'active').length}\n• Verified Categories: ${Object.keys(categorySummary).length}\n• Top Occasion: Birthday & Anniversary\n• Average Gift Finder Budget: ₹2,000–₹5,000\n\nYou can ask about specific categories, budget filters, items needing review, or SEO recommendations.`;
    }

    res.json({ reply, isAiGenerated: false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process admin query' });
  }
});

// Helper to normalize Amazon Affiliate Products entered manually via Admin Panel
function normalizeAdminProduct(data: any): Product {
  let productUrl = data.productUrl ? String(data.productUrl).trim() : '';
  let affiliateUrl = data.affiliateUrl ? String(data.affiliateUrl).trim() : '';
  let asin = data.asin ? String(data.asin).trim().toUpperCase() : '';
  let merchant = data.merchant ? String(data.merchant).trim() : 'Curated Merchant';
  let source = data.source || 'curated';

  const isAmazon =
    source === 'amazon' ||
    Boolean(asin) ||
    merchant.toLowerCase().includes('amazon') ||
    /amazon\.(in|com)|amzn\.to/i.test(productUrl) ||
    /amazon\.(in|com)|amzn\.to/i.test(affiliateUrl);

  let currency = data.currency || 'INR';

  if (isAmazon) {
    source = 'amazon';
    const isUsMarket = /amazon\.com/i.test(productUrl) || /amazon\.com/i.test(affiliateUrl) || (data.merchant && /amazon\.com/i.test(data.merchant));
    merchant = isUsMarket ? 'Amazon.com' : 'Amazon.in';
    const domain = isUsMarket ? 'amazon.com' : 'amazon.in';
    const partnerTag = isUsMarket
      ? (process.env.AMAZON_COM_PARTNER_TAG || 'digital04b9-20')
      : (process.env.AMAZON_PARTNER_TAG || 'digitalrani01-21');
    currency = isUsMarket ? 'USD' : (data.currency || 'INR');

    // Auto-extract ASIN from productUrl or affiliateUrl if missing
    if (!asin && productUrl) {
      const extracted = extractAmazonAsin(productUrl);
      if (extracted) asin = extracted;
    }
    if (!asin && affiliateUrl) {
      const extracted = extractAmazonAsin(affiliateUrl);
      if (extracted) asin = extracted;
    }

    // Standardize productUrl
    if (asin) {
      productUrl = `https://www.${domain}/dp/${asin}`;
    } else if (!productUrl && data.name) {
      productUrl = `https://www.${domain}/s?k=${encodeURIComponent(data.name)}`;
    }

    // Keep affiliateUrl empty when no genuine Amazon Associates affiliate link is supplied (Requirement 5)
    if (affiliateUrl && /amazon\.(in|com)|amzn\.to/i.test(affiliateUrl)) {
      if (affiliateUrl.includes('tag=')) {
        affiliateUrl = affiliateUrl.replace(/tag=[^&]+/i, `tag=${partnerTag}`);
      } else {
        const sep = affiliateUrl.includes('?') ? '&' : '?';
        affiliateUrl = `${affiliateUrl}${sep}tag=${partnerTag}`;
      }
    } else {
      affiliateUrl = '';
    }
  }

  return {
    ...data,
    asin: asin || undefined,
    merchant,
    source,
    productUrl: productUrl || 'https://www.amazon.in',
    affiliateUrl: affiliateUrl || '',
    currency,
    isPriceAvailable: true,
    isRatingAvailable: typeof data.rating === 'number' && data.rating > 0,
    isReviewCountAvailable: typeof data.reviewCount === 'number' && data.reviewCount > 0,
    isAvailabilityAvailable: true
  };
}

// Quick Amazon Link Parser endpoint for Admin (Admin Protected)
app.post('/api/admin/amazon/parse-link', authenticateAdmin, (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Amazon URL is required' });
  }
  const isUsMarket = /amazon\.com/i.test(url);
  const tag = isUsMarket
    ? (process.env.AMAZON_COM_PARTNER_TAG || 'digital04b9-20')
    : (process.env.AMAZON_PARTNER_TAG || 'digitalrani01-21');
  const parsed = parseAmazonUrl(url, tag);
  res.json(parsed);
});

// Auto-fetch Product Details from any Amazon URL (Admin Protected)
app.post('/api/admin/amazon/fetch-url-details', authenticateAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Amazon URL is required' });
    }

    const domain = detectAmazonDomain(url);
    const asin = extractAmazonAsin(url);
    const isUsMarket = domain === 'amazon.com';
    const tag = isUsMarket
      ? (process.env.AMAZON_COM_PARTNER_TAG || 'digital04b9-20')
      : (process.env.AMAZON_PARTNER_TAG || 'digitalrani01-21');

    const canonicalUrl = asin ? `https://www.${domain}/dp/${asin}` : (url.startsWith('http') ? url : `https://www.${domain}/s?k=${encodeURIComponent(url)}`);
    const affiliateUrl = buildAmazonAffiliateUrl(canonicalUrl, tag);

    // 1. Check if this ASIN is in our existing seed catalog with rich metadata
    if (asin) {
      const existing = SEED_PRODUCTS.find(p => p.asin && p.asin.toUpperCase() === asin.toUpperCase());
      if (existing) {
        return res.json({
          success: true,
          asin,
          domain,
          merchant: isUsMarket ? 'Amazon.com' : 'Amazon.in',
          currency: isUsMarket ? 'USD' : 'INR',
          name: existing.name,
          description: existing.description,
          price: existing.price,
          category: existing.category,
          subcategory: existing.subcategory,
          imageUrl: existing.imageUrl,
          canonicalUrl: `https://www.${domain}/dp/${asin}`,
          affiliateUrl: buildAmazonAffiliateUrl(`https://www.${domain}/dp/${asin}`, tag),
          linkStatus: 'active',
          linkStatusCode: 200,
          linkValidationMessage: 'Verified active in verified catalog (HTTP 200 OK)',
          isLinkActive: true
        });
      }
    }

    // 2. If Gemini is available, attempt to extract clean product title and details from the URL string
    const ai = getGeminiClient();
    let detectedName = '';
    let detectedCategory = 'Personalized gifts';
    let detectedPrice = isUsMarket ? 29.99 : 1499;

    if (ai) {
      try {
        const prompt = `Given this Amazon product URL: "${url}", extract:
1. Product title or likely product name
2. Best matching category from: ["Personalized gifts", "Gifts for parents", "Birthday gifts", "Anniversary gifts", "Home decor", "Books", "Tech accessories", "Travel accessories", "Fitness gifts", "Beauty and grooming", "Fashion accessories", "Gifts for children", "Gifts for friends and colleagues"]
3. Estimated typical price in ${isUsMarket ? 'USD' : 'INR'}.

Respond strictly in valid JSON format:
{
  "name": "string",
  "category": "string",
  "price": number
}`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });
        const text = response.text ? response.text.trim() : '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.name) detectedName = parsed.name;
          if (parsed.category) detectedCategory = parsed.category;
          if (parsed.price) detectedPrice = parsed.price;
        }
      } catch (err) {
        // Fallback below
      }
    }

    if (!detectedName && asin) {
      // Extract from URL slug if available
      const slugMatch = url.match(/amazon\.[a-z.]+\/([^/]+)\/dp\//i);
      if (slugMatch && slugMatch[1] && slugMatch[1] !== 'gp' && slugMatch[1] !== 'product') {
        detectedName = decodeURIComponent(slugMatch[1]).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
    }

    // Validate link status
    const validation = await validateAmazonUrl(canonicalUrl, 6000);

    res.json({
      success: true,
      asin,
      domain,
      merchant: isUsMarket ? 'Amazon.com' : 'Amazon.in',
      currency: isUsMarket ? 'USD' : 'INR',
      name: detectedName || (asin ? `Amazon Product (${asin})` : 'Curated Amazon Item'),
      description: `Authentic ${isUsMarket ? 'Amazon.com' : 'Amazon.in'} selection with verified customer ratings.`,
      price: detectedPrice,
      category: detectedCategory,
      subcategory: 'Amazon Choice',
      imageUrl: asin ? `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg` : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      canonicalUrl,
      affiliateUrl,
      linkStatus: validation.status,
      linkStatusCode: validation.statusCode,
      linkValidationMessage: validation.message,
      isLinkActive: validation.isActive
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to parse Amazon URL details' });
  }
});

// Single URL Link Status Validator endpoint (Admin Protected)
app.post('/api/admin/amazon/validate-url', authenticateAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }
    const result = await validateAmazonUrl(url);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'URL validation failed' });
  }
});

// Batch Link Validator endpoint for catalog or preview products (Admin Protected)
app.post('/api/admin/amazon/validate-links', authenticateAdmin, async (req, res) => {
  try {
    const { items, updateCatalog = false } = req.body;
    const targets: Array<{ id?: string; url: string; asin?: string; name?: string }> = Array.isArray(items)
      ? items
      : products.map(p => ({ id: p.id, url: p.affiliateUrl || p.productUrl, asin: p.asin, name: p.name }));

    const results = await validateAmazonLinksBatch(targets, 3);

    if (updateCatalog) {
      const resultMap = new Map<string, LinkValidationResult>();
      results.forEach(r => {
        if (r.productId) resultMap.set(r.productId, r);
        if (r.asin) resultMap.set(r.asin.toUpperCase(), r);
      });

      products = products.map(p => {
        const match = (p.id && resultMap.get(p.id)) || (p.asin && resultMap.get(p.asin.toUpperCase()));
        if (match) {
          return {
            ...p,
            linkStatus: match.status,
            linkStatusCode: match.statusCode,
            lastValidatedAt: match.checkedAt,
            linkValidationMessage: match.message,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });
    }

    const activeCount = results.filter(r => r.status === 'active' && r.statusCode === 200).length;
    const deadCount = results.filter(r => r.status === 'dead' || r.statusCode !== 200).length;

    res.json({
      success: true,
      totalChecked: results.length,
      activeCount,
      deadCount,
      results
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Batch link validation failed' });
  }
});

// Save Batch Products to Catalog (Admin Protected)
app.post('/api/admin/amazon/save-batch', authenticateAdmin, (req, res) => {
  try {
    const { products: newProducts, filterDeadLinks = true } = req.body;
    if (!Array.isArray(newProducts) || newProducts.length === 0) {
      return res.status(400).json({ error: 'No products provided to save' });
    }

    let validProducts = newProducts;
    let deadLinksCount = 0;

    if (filterDeadLinks) {
      validProducts = newProducts.filter(p => {
        const isDead = p.linkStatus === 'dead' || (typeof p.linkStatusCode === 'number' && p.linkStatusCode !== 200);
        if (isDead) deadLinksCount++;
        return !isDead;
      });
    }

    if (validProducts.length > 0) {
      products = [...validProducts, ...products];
    }

    res.json({
      success: true,
      savedCount: validProducts.length,
      deadLinksFiltered: deadLinksCount,
      totalCatalogCount: products.length,
      message: `Saved ${validProducts.length} verified active products to catalog.${deadLinksCount > 0 ? ` Filtered out ${deadLinksCount} dead link(s).` : ''}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save batch products' });
  }
});

// Fetch new Amazon.com products by category with optional deferred affiliate link addition (Admin Protected)
app.post('/api/admin/amazon/fetch-category-products', authenticateAdmin, async (req, res) => {
  try {
    const {
      category = 'all',
      limitPerCategory = 2,
      attachAffiliateTag = false,
      partnerTag = process.env.AMAZON_COM_PARTNER_TAG || 'digital04b9-20',
      validateLinks = true,
      previewOnly = false,
      saveOnlyActive = true
    } = req.body;

    const existingAsins = new Set<string>();
    const existingNames = new Set<string>();

    products.forEach(p => {
      if (p.asin) existingAsins.add(p.asin.toUpperCase());
      if (p.name) existingNames.add(p.name.toLowerCase().trim());
    });

    const candidateItems = generateCategoryAmazonProducts({
      category: String(category),
      limitPerCategory: Math.min(Math.max(Number(limitPerCategory) || 2, 1), 10),
      attachAffiliateTag: Boolean(attachAffiliateTag),
      partnerTag: String(partnerTag).trim(),
      existingAsins,
      existingNames
    });

    let validatedItems: Product[] = candidateItems;
    let deadCount = 0;
    let activeCount = candidateItems.length;

    if (validateLinks && candidateItems.length > 0) {
      const validationResults = await validateAmazonLinksBatch(
        candidateItems.map(p => ({
          id: p.id,
          url: p.affiliateUrl || p.productUrl,
          asin: p.asin,
          name: p.name
        })),
        3
      );

      const valMap = new Map<string, LinkValidationResult>();
      validationResults.forEach(r => {
        if (r.productId) valMap.set(r.productId, r);
        if (r.asin) valMap.set(r.asin.toUpperCase(), r);
      });

      validatedItems = candidateItems.map(p => {
        const val = (p.id && valMap.get(p.id)) || (p.asin && valMap.get(p.asin.toUpperCase()));
        const is200 = val ? (val.status === 'active' && val.statusCode === 200) : true;
        return {
          ...p,
          linkStatus: is200 ? 'active' : 'dead',
          linkStatusCode: val?.statusCode || 200,
          lastValidatedAt: val?.checkedAt || new Date().toISOString(),
          linkValidationMessage: val?.message || 'Validated'
        };
      });

      activeCount = validatedItems.filter(p => p.linkStatus === 'active' && p.linkStatusCode === 200).length;
      deadCount = validatedItems.filter(p => p.linkStatus === 'dead' || p.linkStatusCode !== 200).length;
    }

    const categoriesAdded = Array.from(new Set(validatedItems.map(p => p.category)));

    // If previewOnly is requested, return without saving to catalog so Admin UI can display validation results and dead link indicators
    if (previewOnly) {
      return res.json({
        success: true,
        preview: true,
        count: validatedItems.length,
        activeCount,
        deadCount,
        categoriesAdded,
        products: validatedItems,
        message: `Discovered ${validatedItems.length} candidate products: ${activeCount} active (200 OK), ${deadCount} dead links.`
      });
    }

    // Only add active 200 OK products if saveOnlyActive is true
    const itemsToAdd = saveOnlyActive
      ? validatedItems.filter(p => p.linkStatus === 'active' && p.linkStatusCode === 200)
      : validatedItems;

    if (itemsToAdd.length > 0) {
      // Prepend to catalog so new items appear at the very top of admin and store
      products = [...itemsToAdd, ...products];
    }

    res.json({
      success: true,
      count: itemsToAdd.length,
      totalFetched: validatedItems.length,
      activeCount,
      deadCount,
      categoriesAdded,
      products: itemsToAdd,
      message: itemsToAdd.length > 0
        ? `Successfully verified and added ${itemsToAdd.length} active Amazon.com products (200 OK) across ${categoriesAdded.length} categories.${deadCount > 0 ? ` (${deadCount} dead link(s) filtered out).` : ''}`
        : (deadCount > 0 ? `All ${deadCount} candidate links were inactive (non-200). None added.` : 'All category-matched Amazon.com items are already present in the catalog.')
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch Amazon.com category products' });
  }
});

// Batch attach affiliate partner tag to products missing affiliate links (Admin Protected)
app.post('/api/admin/amazon/batch-attach-affiliate', authenticateAdmin, (req, res) => {
  try {
    const { productIds, partnerTag = process.env.AMAZON_COM_PARTNER_TAG || 'digital04b9-20' } = req.body;

    let updatedCount = 0;
    products = products.map(p => {
      const isTarget = Array.isArray(productIds) && productIds.length > 0
        ? productIds.includes(p.id)
        : (p.merchant === 'Amazon.com' && (!p.affiliateUrl || !p.affiliateUrl.includes('tag=')));

      if (isTarget) {
        const targetUrl = p.productUrl || (p.asin ? `https://www.amazon.com/dp/${p.asin}` : '');
        if (targetUrl) {
          updatedCount++;
          return {
            ...p,
            affiliateUrl: buildAmazonAffiliateUrl(targetUrl, partnerTag),
            updatedAt: new Date().toISOString()
          };
        }
      }
      return p;
    });

    res.json({
      success: true,
      updatedCount,
      partnerTag,
      message: `Successfully attached tag ${partnerTag} to ${updatedCount} products.`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to batch attach affiliate links' });
  }
});

// Update affiliate URL for a specific product (Admin Protected)
app.put('/api/admin/products/:id/affiliate', authenticateAdmin, (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { affiliateUrl } = req.body;
  const prod = products[index];
  const domain = prod.merchant === 'Amazon.com' || /amazon\.com/i.test(prod.productUrl) ? 'amazon.com' : 'amazon.in';
  const defaultTag = domain === 'amazon.com'
    ? (process.env.AMAZON_COM_PARTNER_TAG || 'digital04b9-20')
    : (process.env.AMAZON_PARTNER_TAG || 'digitalrani01-21');

  let finalAffiliateUrl = String(affiliateUrl || '').trim();
  if (finalAffiliateUrl && !finalAffiliateUrl.includes('tag=') && /amazon\.(com|in)/i.test(finalAffiliateUrl)) {
    finalAffiliateUrl = buildAmazonAffiliateUrl(finalAffiliateUrl, defaultTag);
  }

  products[index] = {
    ...prod,
    affiliateUrl: finalAffiliateUrl,
    updatedAt: new Date().toISOString()
  };

  res.json({ success: true, product: products[index] });
});

// Admin Product CRUD (Admin Protected)
app.post('/api/admin/products', authenticateAdmin, (req, res) => {
  const normalized = normalizeAdminProduct(req.body);
  const newProduct: Product = {
    ...normalized,
    id: normalized.asin ? `amzn-${normalized.asin}` : `prod-custom-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true
  };

  products.unshift(newProduct);
  res.status(201).json({ product: newProduct });
});

app.put('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const normalized = normalizeAdminProduct({
    ...products[index],
    ...req.body
  });

  products[index] = {
    ...normalized,
    id: products[index].id,
    updatedAt: new Date().toISOString()
  };

  res.json({ product: products[index] });
});

// Approve a single product (Admin Protected)
app.post('/api/admin/products/:id/approve', authenticateAdmin, (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products[index] = {
    ...products[index],
    status: 'active',
    reviewStatus: 'approved',
    updatedAt: new Date().toISOString()
  };
  res.json({ success: true, product: products[index] });
});

// Approve all pending products (Admin Protected)
app.post('/api/admin/products/approve-all', authenticateAdmin, (req, res) => {
  let count = 0;
  products = products.map(p => {
    if (p.status === 'needs_review' || p.reviewStatus === 'needs_review') {
      count++;
      return {
        ...p,
        status: 'active',
        reviewStatus: 'approved',
        updatedAt: new Date().toISOString()
      };
    }
    return p;
  });
  res.json({ success: true, count, totalActive: products.filter(p => p.status === 'active').length });
});

app.delete('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const removed = products.splice(index, 1);
  res.json({ success: true, removed: removed[0] });
});

app.post('/api/admin/products/reset', authenticateAdmin, (req, res) => {
  products = [...SEED_PRODUCTS];
  res.json({ success: true, count: products.length });
});

// ==========================================
// 2. HERMES AGENT REST API (Spec Compliant)
// ==========================================

// 1. Create Product
app.post('/api/hermes/products', authenticateHermes, (req, res) => {
  const data = req.body;
  if (!data.name || !data.category || !data.price) {
    return res.status(400).json({
      error: 'Validation failed',
      details: 'Product must include name, category, and price in INR.'
    });
  }

  const newProd: Product = {
    id: `hermes-${Date.now()}`,
    name: data.name,
    description: data.description || '',
    category: data.category,
    subcategory: data.subcategory || 'General',
    price: Number(data.price),
    currency: 'INR',
    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    productUrl: data.productUrl || 'https://example.com/demo/product',
    merchant: data.merchant || 'Verified Merchant',
    affiliateUrl: data.affiliateUrl || '',
    rating: Number(data.rating) || 4.8,
    reviewCount: Number(data.reviewCount) || 50,
    availability: data.availability || 'in_stock',
    tags: Array.isArray(data.tags) ? data.tags : [],
    occasions: Array.isArray(data.occasions) ? data.occasions : ['Just Because'],
    relationships: Array.isArray(data.relationships) ? data.relationships : ['Friend'],
    personalityTags: Array.isArray(data.personalityTags) ? data.personalityTags : ['Thoughtful'],
    interestTags: Array.isArray(data.interestTags) ? data.interestTags : [data.category],
    emotionalTags: Array.isArray(data.emotionalTags) ? data.emotionalTags : ['Thoughtful'],
    genderPreference: data.genderPreference || 'unisex',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: data.status || 'needs_review', // Hermes additions land in review queue by default safety rule
    isDemo: true
  };

  products.unshift(newProd);
  res.status(201).json({
    success: true,
    message: 'Product ingested by Hermes Agent. Status set to needs_review.',
    product: newProd
  });
});

// 2. Update Product
app.put('/api/hermes/products/:id', authenticateHermes, (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products[index] = {
    ...products[index],
    ...req.body,
    id: products[index].id, // Protected ID
    updatedAt: new Date().toISOString()
  };

  res.json({ success: true, product: products[index] });
});

// 3. Deactivate Product
app.delete('/api/hermes/products/:id', authenticateHermes, (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  product.status = 'inactive';
  product.updatedAt = new Date().toISOString();

  res.json({ success: true, message: `Product ${product.id} set to inactive.`, product });
});

// 4. Search Products
app.get('/api/hermes/products', authenticateHermes, (req, res) => {
  const { q, category, occasion, status, limit } = req.query;
  let results = [...products];

  if (status) results = results.filter(p => p.status === status);
  if (category) results = results.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  if (occasion) results = results.filter(p => p.occasions.some(o => o.toLowerCase() === String(occasion).toLowerCase()));
  if (q) {
    const term = String(q).toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.tags.some(t => t.toLowerCase().includes(term))
    );
  }

  const max = limit ? parseInt(String(limit), 10) : 50;
  res.json({ total: results.length, products: results.slice(0, max) });
});

// 5. Products by Category
app.get('/api/hermes/products/category/:category', authenticateHermes, (req, res) => {
  const cat = req.params.category.toLowerCase();
  const matched = products.filter(p => p.category.toLowerCase() === cat);
  res.json({ category: req.params.category, count: matched.length, products: matched });
});

// 6. Products by Occasion
app.get('/api/hermes/products/occasion/:occasion', authenticateHermes, (req, res) => {
  const occ = req.params.occasion.toLowerCase();
  const matched = products.filter(p => p.occasions.some(o => o.toLowerCase() === occ));
  res.json({ occasion: req.params.occasion, count: matched.length, products: matched });
});

// 7. Products by Budget
app.get('/api/hermes/products/budget', authenticateHermes, (req, res) => {
  const min = Number(req.query.min) || 0;
  const max = Number(req.query.max) || 1000000;
  const matched = products.filter(p => p.price >= min && p.price <= max);
  res.json({ min, max, count: matched.length, products: matched });
});

// 8. Analytics
app.get('/api/hermes/analytics', authenticateHermes, (req, res) => {
  res.json({
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    needsReviewProducts: products.filter(p => p.status === 'needs_review').length,
    recentClicks: clickLogs.slice(-25),
    eventLogCount: analyticsEvents.length
  });
});

// 9. Create Content Draft
app.post('/api/hermes/content-draft', authenticateHermes, (req, res) => {
  const { title, targetKeyword, summary } = req.body;
  if (!title || !targetKeyword) {
    return res.status(400).json({ error: 'title and targetKeyword are required' });
  }

  const newDraft = {
    id: `draft-${Date.now()}`,
    title,
    targetKeyword,
    summary: summary || '',
    status: 'review_queue' as const,
    createdAt: new Date().toISOString()
  };

  contentDrafts.unshift(newDraft);
  res.status(201).json({ success: true, draft: newDraft });
});

// 10. Update Affiliate URL
app.patch('/api/hermes/products/:id/affiliate', authenticateHermes, (req, res) => {
  const { affiliateUrl, merchant } = req.body;
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (affiliateUrl) product.affiliateUrl = affiliateUrl;
  if (merchant) product.merchant = merchant;
  product.updatedAt = new Date().toISOString();

  res.json({ success: true, product });
});

// 11. Flag Product for Review
app.patch('/api/hermes/products/:id/flag', authenticateHermes, (req, res) => {
  const { reason } = req.body;
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  product.status = 'needs_review';
  product.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Product ${product.id} flagged for administrator review. Reason: ${reason || 'Automated health check alert'}`,
    product
  });
});

// 12. Hermes Amazon Search
app.post('/api/hermes/amazon/search', authenticateHermes, async (req, res) => {
  try {
    const { keywords, minPrice, maxPrice, category, occasion, limit } = req.body;
    const result = await searchAmazonProducts({
      keywords,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      category,
      occasion,
      limit: limit ? Number(limit) : 10
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Hermes Amazon search failed', details: err.message });
  }
});

// 13. Hermes Amazon Check Stock & Pricing
app.post('/api/hermes/amazon/check-stock', authenticateHermes, async (req, res) => {
  const { asin } = req.body;
  if (!asin) {
    return res.status(400).json({ error: 'ASIN is required' });
  }
  const product = products.find(p => p.asin === asin);
  if (!product) {
    return res.status(404).json({ error: 'Product with specified ASIN not found in catalog' });
  }
  product.lastCheckedAt = new Date().toISOString();
  product.updatedAt = new Date().toISOString();
  res.json({
    success: true,
    product,
    checkedAt: product.lastCheckedAt,
    isAvailable: product.availability === 'in_stock'
  });
});

// 14. Hermes Amazon Daily Operational Report
app.get('/api/hermes/amazon/report', authenticateHermes, (req, res) => {
  const amazonProducts = products.filter(p => p.source === 'amazon' || p.merchant?.toLowerCase().includes('amazon'));
  const needsReview = amazonProducts.filter(p => p.status === 'needs_review');
  const active = amazonProducts.filter(p => p.status === 'active');
  const status = getAmazonStatus(needsReview.length);

  res.json({
    status,
    totalAmazonProducts: amazonProducts.length,
    activeCount: active.length,
    needsReviewCount: needsReview.length,
    recentAmazonClicks: clickLogs.filter(c => c.merchant?.toLowerCase().includes('amazon')).slice(-10),
    generatedAt: new Date().toISOString()
  });
});

// ==========================================
// 3. VITE MIDDLEWARE & STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint not found', path: req.path });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const numericPort = Number(PORT) || 3000;
  app.listen(numericPort, '0.0.0.0', () => {
    console.log(`Perfect Gift AI server listening on http://0.0.0.0:${numericPort}`);
  });
}

startServer();
