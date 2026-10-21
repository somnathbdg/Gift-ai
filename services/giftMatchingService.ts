import { Product, GiftFinderInputs, ScoreBreakdown, ScoredRecommendation } from '../src/types';

export interface BudgetRange {
  min: number;
  max: number;
}

/**
 * Normalizes and extracts numerical min and max budget from customer profile inputs.
 */
export function normalizeBudgetRange(inputs: GiftFinderInputs): BudgetRange {
  // 1. Explicit min/max if provided
  if (typeof inputs.budgetMin === 'number' && typeof inputs.budgetMax === 'number' && inputs.budgetMax > 0) {
    return { min: Math.max(0, inputs.budgetMin), max: inputs.budgetMax };
  }

  // 2. Custom budget entered as raw number or range
  const customStr = (inputs.customBudget || '').trim();
  if (customStr) {
    const cleanNum = Number(customStr.replace(/[^0-9.]/g, ''));
    if (!isNaN(cleanNum) && cleanNum > 0) {
      return { min: Math.max(0, Math.round(cleanNum * 0.7)), max: Math.round(cleanNum * 1.15) };
    }
  }

  // 3. Preset budget string parsing
  const raw = (inputs.budget || '').toLowerCase().replace(/,/g, '');
  if (raw.includes('under 500') || (raw.includes('500') && !raw.includes('1000') && !raw.includes('to') && !raw.includes('–') && !raw.includes('-'))) {
    return { min: 0, max: 550 };
  }
  if (raw.includes('500') && raw.includes('1000')) {
    return { min: 450, max: 1100 };
  }
  if (raw.includes('1000') && raw.includes('2000')) {
    return { min: 900, max: 2200 };
  }
  if (raw.includes('2000') && raw.includes('5000')) {
    return { min: 1800, max: 5500 };
  }
  if (raw.includes('5000') && raw.includes('10000')) {
    return { min: 4500, max: 11000 };
  }
  if (raw.includes('10000') || raw.includes('10,000')) {
    return { min: 9000, max: 250000 };
  }

  // Default fallback range
  return { min: 0, max: 50000 };
}

/**
 * Validates product quality and data completeness.
 * Rejects inactive products, missing prices, images, titles, URLs or merchants.
 */
export function isProductQualityValid(product: Product): { valid: boolean; reason?: string } {
  if (product.status !== 'active') {
    return { valid: false, reason: `Status is "${product.status}" (requires "active")` };
  }
  if (!product.name || product.name.trim().length < 3) {
    return { valid: false, reason: 'Missing or insufficient product name' };
  }
  if (typeof product.price !== 'number' || product.price <= 0) {
    return { valid: false, reason: 'Missing or zero price' };
  }
  if (!product.imageUrl || product.imageUrl.trim().length < 5) {
    return { valid: false, reason: 'Missing product image URL' };
  }
  if (!product.productUrl && !product.affiliateUrl) {
    return { valid: false, reason: 'Missing purchase or outbound destination URL' };
  }
  if (!product.merchant || product.merchant.trim().length === 0) {
    return { valid: false, reason: 'Missing merchant name' };
  }
  return { valid: true };
}

/**
 * Normalizes tag strings for case-insensitive and partial comparisons.
 */
function normalizeStr(val: string): string {
  return (val || '').toLowerCase().trim();
}

function tagListContains(list: string[] | undefined, target: string): boolean {
  if (!list || list.length === 0 || !target) return false;
  const targetNorm = normalizeStr(target);
  return list.some(item => {
    const itemNorm = normalizeStr(item);
    return itemNorm === targetNorm || itemNorm.includes(targetNorm) || targetNorm.includes(itemNorm);
  });
}

function countTagOverlap(listA: string[] | undefined, listB: string[] | undefined): number {
  if (!listA || !listB || listA.length === 0 || listB.length === 0) return 0;
  const normB = listB.map(normalizeStr);
  return listA.filter(a => {
    const normA = normalizeStr(a);
    return normB.some(b => b === normA || b.includes(normA) || normA.includes(b));
  }).length;
}

/**
 * Scores a single product against customer profile inputs (0 to 100 points).
 * Budget = 25 pts
 * Occasion = 20 pts
 * Personality = 20 pts
 * Interest = 15 pts
 * Relationship = 10 pts
 * Desired Emotion = 10 pts
 */
export function scoreProductDetailed(
  product: Product,
  inputs: GiftFinderInputs
): {
  score: number;
  breakdown: ScoreBreakdown;
  matchLabel: 'Excellent Match' | 'Great Match' | 'Good Match';
  rejectionReason?: string;
  matchHighlights: string[];
} {
  const matchHighlights: string[] = [];
  const budgetRange = normalizeBudgetRange(inputs);

  // 1. BUDGET MATCH (Max 25 points)
  let budgetScore = 0;
  let budgetExplanation = '';
  // Support both USD and INR pricing against INR budget brackets (~₹84 per USD)
  const isUsd = product.currency === 'USD';
  const price = isUsd ? Math.round(product.price * 84) : product.price;
  const priceLabel = isUsd ? `$${product.price.toFixed(2)} (~₹${price.toLocaleString('en-IN')})` : `₹${price.toLocaleString('en-IN')}`;

  if (price >= budgetRange.min && price <= budgetRange.max) {
    budgetScore = 25;
    budgetExplanation = `${priceLabel} is perfectly within your budget range (₹${budgetRange.min.toLocaleString('en-IN')} – ₹${budgetRange.max.toLocaleString('en-IN')}).`;
    matchHighlights.push('Direct budget fit');
  } else if (price < budgetRange.min) {
    // Under budget: highly acceptable, small proportional scale
    const ratio = budgetRange.min > 0 ? price / budgetRange.min : 1;
    budgetScore = Math.max(16, Math.round(18 + ratio * 6));
    budgetExplanation = `${priceLabel} is comfortably below your minimum budget, offering great value.`;
    matchHighlights.push('High value for money');
  } else {
    // Over budget:
    const overPercent = (price - budgetRange.max) / budgetRange.max;
    if (overPercent <= 0.10) {
      // Up to 10% above budget is acceptable with modest penalty
      budgetScore = Math.max(16, Math.round(25 - overPercent * 50));
      budgetExplanation = `${priceLabel} is slightly above max budget (+${Math.round(overPercent * 100)}%), but within 10% acceptable flexibility.`;
      matchHighlights.push('Slightly above budget (within 10%)');
    } else {
      // Severely over budget
      const penalty = Math.min(25, Math.round(overPercent * 35));
      budgetScore = Math.max(0, 25 - penalty);
      budgetExplanation = `${priceLabel} exceeds target budget by ${Math.round(overPercent * 100)}%.`;
    }
  }

  // 2. OCCASION MATCH (Max 20 points)
  let occasionScore = 0;
  let occasionExplanation = '';
  const targetOccasion = inputs.customOccasion || inputs.occasion || '';
  const productOccasions = [...(product.occasionTags || []), ...(product.occasions || [])];

  if (tagListContains(productOccasions, targetOccasion)) {
    occasionScore = 20;
    occasionExplanation = `Specifically curated and celebrated for ${targetOccasion}.`;
    matchHighlights.push(`Ideal for ${targetOccasion}`);
  } else if (
    tagListContains(productOccasions, 'Just Because') ||
    tagListContains(productOccasions, 'Birthday') ||
    tagListContains(productOccasions, 'Thank You')
  ) {
    occasionScore = 13;
    occasionExplanation = `Versatile milestone gift suitable for ${targetOccasion} and general celebration.`;
  } else {
    occasionScore = 7;
    occasionExplanation = `Not specifically indexed for ${targetOccasion}.`;
  }

  // 3. PERSONALITY MATCH (Max 20 points)
  let personalityScore = 0;
  let personalityExplanation = '';
  const inputPersonalities = inputs.personalities || [];
  const productPersonalities = product.personalityTags || [];

  if (inputPersonalities.length > 0) {
    const matchedCount = countTagOverlap(inputPersonalities, productPersonalities);
    const ratio = matchedCount / Math.max(1, inputPersonalities.length);
    personalityScore = Math.min(20, Math.round(ratio * 16) + (matchedCount > 0 ? 4 : 0));
    if (matchedCount > 0) {
      personalityExplanation = `Matches recipient personality traits (${matchedCount} matched).`;
      matchHighlights.push(`Fits personality: ${inputPersonalities.slice(0, 2).join(', ')}`);
    } else {
      personalityExplanation = 'Does not directly reflect stated personality attributes.';
    }
  } else {
    personalityScore = 14;
    personalityExplanation = 'Balanced universally appealing personality fit.';
  }

  // 4. INTEREST MATCH (Max 15 points)
  let interestScore = 0;
  let interestExplanation = '';
  const inputInterests = inputs.interests || [];
  const productInterests = [
    ...(product.interestTags || []),
    product.category,
    product.subcategory,
    ...(product.tags || [])
  ];

  if (inputInterests.length > 0) {
    const matchedInterests = countTagOverlap(inputInterests, productInterests);
    const ratio = matchedInterests / Math.max(1, inputInterests.length);
    interestScore = Math.min(15, Math.round(ratio * 12) + (matchedInterests > 0 ? 3 : 0));
    if (matchedInterests > 0) {
      interestExplanation = `Strongly aligns with interests in ${inputInterests.slice(0, 2).join(', ')}.`;
      matchHighlights.push(`Aligns with interests: ${inputInterests.slice(0, 2).join(', ')}`);
    } else {
      interestExplanation = 'Secondary alignment with recipient hobby/interest preferences.';
    }
  } else {
    interestScore = 11;
    interestExplanation = 'General lifestyle category suitability.';
  }

  // 5. RELATIONSHIP MATCH (Max 10 points)
  let relationshipScore = 0;
  let relationshipExplanation = '';
  const targetRecipient = inputs.customRecipient || inputs.recipient || inputs.relationship || '';
  const productRelationships = [
    ...(product.recipientTags || []),
    ...(product.relationshipTags || []),
    ...(product.relationships || [])
  ];

  if (tagListContains(productRelationships, targetRecipient)) {
    relationshipScore = 10;
    relationshipExplanation = `Specifically suitable for your ${targetRecipient}.`;
    matchHighlights.push(`Curated for ${targetRecipient}`);
  } else if (
    tagListContains(productRelationships, 'Partner') ||
    tagListContains(productRelationships, 'Friend') ||
    tagListContains(productRelationships, 'Family')
  ) {
    relationshipScore = 6;
    relationshipExplanation = `Warm, versatile relationship dynamic appropriate for ${targetRecipient}.`;
  } else {
    relationshipScore = 4;
    relationshipExplanation = `Standard gift etiquette for ${targetRecipient}.`;
  }

  // 6. DESIRED REACTION / EMOTION MATCH (Max 10 points)
  let emotionScore = 0;
  let emotionExplanation = '';
  const targetEmotion = inputs.desiredReaction || '';
  const productEmotions = [...(product.emotionTags || []), ...(product.emotionalTags || [])];

  if (tagListContains(productEmotions, targetEmotion)) {
    emotionScore = 10;
    emotionExplanation = `Elicits the desired "${targetEmotion.split('/')[0]}" impression.`;
    matchHighlights.push(`Delivers "${targetEmotion.split('/')[0]}" feeling`);
  } else if (
    tagListContains(productEmotions, 'Thoughtful') ||
    tagListContains(productEmotions, 'Emotional') ||
    tagListContains(productEmotions, 'Impressed')
  ) {
    emotionScore = 6;
    emotionExplanation = `Generates a positive, thoughtful emotional resonance.`;
  } else {
    emotionScore = 4;
    emotionExplanation = `Subtle emotional impact.`;
  }

  // TOTAL SCORE (0 to 100)
  const rawTotal = budgetScore + occasionScore + personalityScore + interestScore + relationshipScore + emotionScore;
  const totalScore = Math.min(100, Math.max(0, rawTotal));

  let matchLabel: 'Excellent Match' | 'Great Match' | 'Good Match';
  if (totalScore >= 78) {
    matchLabel = 'Excellent Match';
  } else if (totalScore >= 60) {
    matchLabel = 'Great Match';
  } else {
    matchLabel = 'Good Match';
  }

  // Rejection / penalty evaluation if score is low
  let rejectionReason: string | undefined;
  if (totalScore < 50) {
    const reasons: string[] = [];
    if (budgetScore < 10) reasons.push('Price significantly outside budget');
    if (occasionScore < 10) reasons.push('Occasion mismatch');
    if (personalityScore < 8) reasons.push('No personality alignment');
    if (interestScore < 6) reasons.push('Category/interest mismatch');
    rejectionReason = reasons.join(', ') || 'Overall criteria mismatch';
  }

  return {
    score: totalScore,
    breakdown: {
      budgetMatch: budgetScore,
      occasionMatch: occasionScore,
      personalityMatch: personalityScore,
      interestMatch: interestScore,
      relationshipMatch: relationshipScore,
      emotionalReactionMatch: emotionScore,
      details: {
        budgetExplanation,
        occasionExplanation,
        personalityExplanation,
        interestExplanation,
        relationshipExplanation,
        emotionExplanation
      }
    },
    matchLabel,
    rejectionReason,
    matchHighlights
  };
}

/**
 * Filters and scores a list of products deterministically.
 */
export function matchAndScoreCatalog(
  allProducts: Product[],
  inputs: GiftFinderInputs
): {
  scoredCandidates: Array<{
    product: Product;
    score: number;
    breakdown: ScoreBreakdown;
    matchLabel: 'Excellent Match' | 'Great Match' | 'Good Match';
    rejectionReason?: string;
    matchHighlights: string[];
  }>;
  rejectedProducts: Array<{
    product: Product;
    reason: string;
  }>;
} {
  const rejectedProducts: Array<{ product: Product; reason: string }> = [];
  const validProducts: Product[] = [];

  for (const prod of allProducts) {
    const check = isProductQualityValid(prod);
    if (!check.valid) {
      rejectedProducts.push({ product: prod, reason: check.reason || 'Failed quality validation' });
    } else {
      validProducts.push(prod);
    }
  }

  const scoredCandidates = validProducts.map(product => {
    const res = scoreProductDetailed(product, inputs);
    return {
      product,
      score: res.score,
      breakdown: res.breakdown,
      matchLabel: res.matchLabel,
      rejectionReason: res.rejectionReason,
      matchHighlights: res.matchHighlights
    };
  });

  // Sort descending by score
  scoredCandidates.sort((a, b) => b.score - a.score);

  return { scoredCandidates, rejectedProducts };
}
