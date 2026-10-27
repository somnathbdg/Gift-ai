export interface Product {
  id: string;
  asin?: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  currency: 'INR' | 'USD';
  imageUrl: string;
  productUrl: string;
  merchant: string;
  affiliateUrl: string;
  rating: number;
  reviewCount: number;
  availability: 'in_stock' | 'limited_stock' | 'out_of_stock';
  tags: string[];
  occasions: string[];
  relationships: string[];
  personalityTags: string[];
  interestTags: string[];
  emotionalTags: string[];
  // Normalized alias fields for Intelligent Gift Matching Engine
  recipientTags?: string[];
  relationshipTags?: string[];
  occasionTags?: string[];
  emotionTags?: string[];
  budgetMin?: number;
  budgetMax?: number;
  genderPreference: 'any' | 'men' | 'women' | 'kids' | 'unisex';
  createdAt: string;
  updatedAt: string;
  savedAt?: string;
  status: 'active' | 'inactive' | 'needs_review';
  isDemo?: boolean;
  source?: 'amazon' | 'curated' | string;
  lastCheckedAt?: string;
  isPriceAvailable?: boolean;
  isRatingAvailable?: boolean;
  isReviewCountAvailable?: boolean;
  isAvailabilityAvailable?: boolean;
  // Preserved Amazon Catalog Fields
  rawPrice?: string;
  recipients?: string[];
  sourceUrl?: string;
  researchedAt?: string;
  priceVerifiedAt?: string;
  availabilityStatus?: string;
  verificationStatus?: 'verified' | 'partially_verified' | 'unverified' | string;
  reviewStatus?: 'needs_review' | 'approved' | 'rejected' | string;
  brand?: string;
  descriptionSource?: string;
  // Link Health & Validation Status
  linkStatus?: 'active' | 'dead' | 'checking' | 'unknown';
  linkStatusCode?: number;
  lastValidatedAt?: string;
  linkValidationMessage?: string;
}

export interface LinkValidationResult {
  url: string;
  asin?: string;
  productId?: string;
  statusCode: number;
  isActive: boolean;
  status: 'active' | 'dead';
  message: string;
  checkedAt: string;
}

export interface GiftFinderInputs {
  recipient: string;
  relationship?: string;
  customRecipient?: string;
  occasion: string;
  customOccasion?: string;
  budget: string;
  customBudget?: string;
  budgetMin?: number;
  budgetMax?: number;
  personalities: string[];
  interests: string[];
  desiredReaction: string;
  notes: string;
  recipientName?: string;
  recipientAge?: string;
  genderPreference?: 'any' | 'men' | 'women' | 'kids' | 'unisex';
  freeTextDescription?: string;
}

export interface ScoreBreakdown {
  budgetMatch: number; // Max 25
  occasionMatch: number; // Max 20
  personalityMatch: number; // Max 20
  interestMatch: number; // Max 15
  relationshipMatch: number; // Max 10
  emotionalReactionMatch: number; // Max 10
  details?: {
    budgetExplanation?: string;
    occasionExplanation?: string;
    personalityExplanation?: string;
    interestExplanation?: string;
    relationshipExplanation?: string;
    emotionExplanation?: string;
  };
}

export interface ScoredRecommendation {
  product: Product;
  score: number; // 0 to 100
  scoreBreakdown: ScoreBreakdown;
  matchLabel: 'Excellent Match' | 'Great Match' | 'Good Match';
  recommendationType:
    | 'best_match'
    | 'emotional_choice'
    | 'budget_choice'
    | 'premium_alternative'
    | 'budget_premium_alternative'
    | 'additional_idea';
  whySelected: string;
  matchExplanation: string;
  keyFeatures: string[];
  rejectionReason?: string;
}

export interface RecommendationResponse {
  recommendations: ScoredRecommendation[];
  structuredRecommendations?: {
    bestMatch?: ScoredRecommendation;
    emotionalChoice?: ScoredRecommendation;
    budgetChoice?: ScoredRecommendation;
    premiumAlternative?: ScoredRecommendation;
    otherRecommendations: ScoredRecommendation[];
  };
  inputs: GiftFinderInputs;
  generatedAt: string;
  isAiPowered: boolean;
  demoMode: boolean;
  amazonConnected?: boolean;
  amazonNotice?: string;
  generatedQueries?: string[];
  noMatchFallback?: boolean;
  fallbackReason?: string;
  closestMatches?: ScoredRecommendation[];
}

export interface AmazonIntegrationStatus {
  marketplace: string;
  connectionStatus: 'CONNECTED' | 'DEMO_MODE';
  mode?: 'live' | 'demo';
  partnerTagMasked: string;
  partnerTag?: string;
  partnerTagUs?: string;
  partnerTagIn?: string;
  creatorsApiStatus: 'Connected' | 'Not Connected';
  lastSuccessfulRequest: string | null;
  lastError: string | null;
  productsImportedCount: number;
  productsNeedingReviewCount: number;
  credentialVersion?: string;
  hasClientId?: boolean;
  hasClientSecret?: boolean;
}

export interface AmazonImportParams {
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  occasion?: string;
  limit?: number;
}

export interface GiftMessageRequest {
  recipient: string;
  occasion: string;
  relationship: string;
  recipientName?: string;
  senderName?: string;
  userDescription?: string;
  selectedGiftName?: string;
  tone: 'Romantic' | 'Emotional' | 'Funny' | 'Sweet' | 'Short' | 'Long' | 'Formal';
}

export interface GiftBundle {
  mainProduct: Product;
  companionProduct: Product;
  cardProduct?: Product;
  totalPrice: number;
  currency: string;
  bundleReason: string;
}

export interface SurpriseIdea {
  title: string;
  description: string;
  steps: string[];
  propsNeeded: string[];
  occasionFit: string;
}

export interface DigitalCardData {
  recipientName: string;
  senderName: string;
  message: string;
  style: 'romantic' | 'elegant' | 'birthday' | 'minimal' | 'celebration';
  occasion?: string;
}

export interface AnalyticsEvent {
  id: string;
  type:
    | 'gift_finder_started'
    | 'gift_finder_completed'
    | 'occasion_selected'
    | 'budget_selected'
    | 'category_selected'
    | 'recommendation_viewed'
    | 'product_clicked'
    | 'affiliate_clicked'
    | 'gift_message_generated'
    | 'gift_card_generated'
    | 'bundle_viewed'
    | 'amazon_product_view'
    | 'amazon_outbound_click'
    | 'gift_search'
    | 'gift_recommendation_view';
  data: Record<string, any>;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  savedGifts: string[]; // product IDs
  favoriteProducts: string[]; // product IDs
  giftSearches: Array<{
    id: string;
    date: string;
    inputs: GiftFinderInputs;
    topMatchName: string;
  }>;
  generatedMessages: Array<{
    id: string;
    date: string;
    recipient: string;
    message: string;
    tone: string;
  }>;
}
