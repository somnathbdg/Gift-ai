import { Product, GiftFinderInputs, ScoreBreakdown, ScoredRecommendation } from '../types';

export function parseBudgetRange(budgetStr: string, customBudgetStr?: string): { min: number; max: number } {
  if (customBudgetStr && !isNaN(Number(customBudgetStr))) {
    const val = Number(customBudgetStr);
    return { min: Math.max(0, val * 0.7), max: val * 1.3 };
  }

  const normalized = budgetStr.toLowerCase();
  if (normalized.includes('under') || normalized.includes('500') && !normalized.includes('1,000') && !normalized.includes('1000')) {
    return { min: 0, max: 600 };
  }
  if (normalized.includes('500') && (normalized.includes('1,000') || normalized.includes('1000'))) {
    return { min: 450, max: 1200 };
  }
  if (normalized.includes('1,000') || normalized.includes('1000') && (normalized.includes('2,000') || normalized.includes('2000'))) {
    return { min: 900, max: 2300 };
  }
  if (normalized.includes('2,000') || normalized.includes('2000') && (normalized.includes('5,000') || normalized.includes('5000'))) {
    return { min: 1800, max: 5500 };
  }
  if (normalized.includes('5,000') || normalized.includes('5000') && (normalized.includes('10,000') || normalized.includes('10000'))) {
    return { min: 4500, max: 11000 };
  }
  if (normalized.includes('10,000') || normalized.includes('10000')) {
    return { min: 8500, max: 1000000 };
  }
  return { min: 0, max: 50000 };
}

export function scoreProduct(product: Product, inputs: GiftFinderInputs): { score: number; breakdown: ScoreBreakdown; matchLabel: 'Excellent Match' | 'Great Match' | 'Good Match' } {
  // 1. Budget Match (Max 25 points)
  const range = parseBudgetRange(inputs.budget, inputs.customBudget);
  let budgetScore = 0;
  if (product.price >= range.min && product.price <= range.max) {
    budgetScore = 25;
  } else if (product.price < range.min) {
    // Under budget is still acceptable but slightly lower weight
    const ratio = product.price / Math.max(1, range.min);
    budgetScore = Math.round(15 + Math.min(10, ratio * 10));
  } else {
    // Over budget penalty
    const overshoot = (product.price - range.max) / range.max;
    budgetScore = Math.max(0, Math.round(25 - overshoot * 35));
  }

  // 2. Occasion Match (Max 20 points)
  const targetOccasion = (inputs.customOccasion || inputs.occasion || '').toLowerCase();
  let occasionScore = 0;
  const occasionMatches = product.occasions.some(
    occ => occ.toLowerCase() === targetOccasion || targetOccasion.includes(occ.toLowerCase()) || occ.toLowerCase().includes(targetOccasion)
  );
  if (occasionMatches) {
    occasionScore = 20;
  } else if (product.occasions.includes('Just Because') || product.occasions.includes('Birthday')) {
    occasionScore = 12;
  } else {
    occasionScore = 8;
  }

  // 3. Personality Match (Max 20 points)
  let personalityScore = 0;
  if (inputs.personalities && inputs.personalities.length > 0) {
    const matchedCount = inputs.personalities.filter(p =>
      product.personalityTags.some(tag => tag.toLowerCase() === p.toLowerCase())
    ).length;
    const ratio = matchedCount / inputs.personalities.length;
    personalityScore = Math.min(20, Math.round(ratio * 20) + (matchedCount > 0 ? 5 : 0));
  } else {
    personalityScore = 14;
  }
  personalityScore = Math.min(20, personalityScore);

  // 4. Interest Match (Max 15 points)
  let interestScore = 0;
  if (inputs.interests && inputs.interests.length > 0) {
    const matchedCount = inputs.interests.filter(i =>
      product.interestTags.some(tag => tag.toLowerCase() === i.toLowerCase()) ||
      product.category.toLowerCase() === i.toLowerCase()
    ).length;
    const ratio = matchedCount / inputs.interests.length;
    interestScore = Math.min(15, Math.round(ratio * 15) + (matchedCount > 0 ? 4 : 0));
  } else {
    interestScore = 10;
  }
  interestScore = Math.min(15, interestScore);

  // 5. Relationship Match (Max 10 points)
  const targetRecipient = (inputs.customRecipient || inputs.recipient || '').toLowerCase();
  let relScore = 0;
  const relMatches = product.relationships.some(
    r => r.toLowerCase() === targetRecipient || targetRecipient.includes(r.toLowerCase()) || r.toLowerCase().includes(targetRecipient)
  );
  if (relMatches) {
    relScore = 10;
  } else if (product.relationships.includes('Friend') || product.relationships.includes('Partner')) {
    relScore = 6;
  } else {
    relScore = 4;
  }

  // 6. Emotional Reaction Match (Max 10 points)
  let emotionalScore = 0;
  const desiredReaction = (inputs.desiredReaction || '').toLowerCase();
  const emoMatches = product.emotionalTags.some(
    e => e.toLowerCase() === desiredReaction || desiredReaction.includes(e.toLowerCase()) || e.toLowerCase().includes(desiredReaction)
  );
  if (emoMatches) {
    emotionalScore = 10;
  } else {
    emotionalScore = 5;
  }

  const totalScore = Math.min(100, budgetScore + occasionScore + personalityScore + interestScore + relScore + emotionalScore);

  let matchLabel: 'Excellent Match' | 'Great Match' | 'Good Match';
  if (totalScore >= 78) {
    matchLabel = 'Excellent Match';
  } else if (totalScore >= 60) {
    matchLabel = 'Great Match';
  } else {
    matchLabel = 'Good Match';
  }

  return {
    score: totalScore,
    breakdown: {
      budgetMatch: budgetScore,
      occasionMatch: occasionScore,
      personalityMatch: personalityScore,
      interestMatch: interestScore,
      relationshipMatch: relScore,
      emotionalReactionMatch: emotionalScore
    },
    matchLabel
  };
}

export function generateScoredRecommendations(
  products: Product[],
  inputs: GiftFinderInputs
): ScoredRecommendation[] {
  // Only active products
  const activeProducts = products.filter(p => p.status === 'active');

  const scored = activeProducts.map(product => {
    const { score, breakdown, matchLabel } = scoreProduct(product, inputs);
    return {
      product,
      score,
      breakdown,
      matchLabel
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return [];
  }

  // 1. Best Match: Highest overall score
  const best = scored[0];

  // 2. Emotional Choice: High emotional + sentiment score or romantic/heartfelt item
  const emotionalCandidates = scored.slice(1).filter(
    s => s.product.emotionalTags.some(t => ['Emotional', 'Thoughtful', 'Sweet'].includes(t)) ||
         s.product.personalityTags.includes('Sentimental') ||
         s.product.personalityTags.includes('Romantic')
  );
  const emotional = emotionalCandidates[0] || scored[1] || scored[0];

  // 3. Budget / Premium Alternative:
  // If best match is high-priced, pick a high-value under-budget alternative; if best match is modest, pick an elevated upgrade
  const remaining = scored.filter(s => s.product.id !== best.product.id && s.product.id !== emotional.product.id);
  let alternative = remaining[0];
  if (remaining.length > 1) {
    if (best.product.price > 3000) {
      // Look for a smart budget alternative
      const cheaper = remaining.filter(s => s.product.price < best.product.price);
      if (cheaper.length > 0) alternative = cheaper[0];
    } else {
      // Look for a premium upgrade
      const upgrade = remaining.filter(s => s.product.price > best.product.price);
      if (upgrade.length > 0) alternative = upgrade[0];
    }
  }
  if (!alternative) {
    alternative = scored[2] || scored[1] || scored[0];
  }

  const results: ScoredRecommendation[] = [];

  // Best Match
  results.push({
    product: best.product,
    score: best.score,
    scoreBreakdown: best.breakdown,
    matchLabel: best.matchLabel,
    recommendationType: 'best_match',
    whySelected: `Selected as the top overall match for your ${inputs.recipient} on their ${inputs.occasion}. Directly aligns with their ${inputs.personalities.slice(0, 2).join(' & ') || 'personal'} traits and sits comfortably within your ₹${best.product.price.toLocaleString('en-IN')} budget.`,
    matchExplanation: `Strong alignment across ${inputs.occasion} compatibility, recipient preference for ${inputs.interests.slice(0, 2).join(', ') || 'quality essentials'}, and verified merchant reliability.`,
    keyFeatures: [
      `Official verified listing from ${best.product.merchant}`,
      `Rated ${best.product.rating}★ based on ${best.product.reviewCount} customer reviews`,
      `Verified availability: ${best.product.availability === 'in_stock' ? 'In Stock Ready to Ship' : 'Limited Inventory'}`
    ]
  });

  // Emotional Choice
  if (emotional && emotional.product.id !== best.product.id) {
    results.push({
      product: emotional.product,
      score: emotional.score,
      scoreBreakdown: emotional.breakdown,
      matchLabel: emotional.matchLabel,
      recommendationType: 'emotional_choice',
      whySelected: `Chosen specifically to deliver the ${inputs.desiredReaction.toLowerCase()} reaction you desire. Carries deep sentimental resonance and personal warmth that makes it unforgettable.`,
      matchExplanation: `Evokes heartfelt appreciation, matching their sentimental tastes and turning a routine ${inputs.occasion} into a lasting memory.`,
      keyFeatures: [
        `Curated for emotional impact and personal meaning`,
        `Handcrafted / artisanal finish with gift-ready packaging`,
        `Direct delivery available from ${emotional.product.merchant}`
      ]
    });
  }

  // Budget / Premium Alternative
  if (alternative && alternative.product.id !== best.product.id && alternative.product.id !== emotional.product.id) {
    const isBudget = alternative.product.price < best.product.price;
    results.push({
      product: alternative.product,
      score: alternative.score,
      scoreBreakdown: alternative.breakdown,
      matchLabel: alternative.matchLabel,
      recommendationType: 'budget_premium_alternative',
      whySelected: isBudget
        ? `A high-value smart alternative priced at ₹${alternative.product.price.toLocaleString('en-IN')}, delivering maximum thoughtfulness without overspending.`
        : `A premium elevated selection at ₹${alternative.product.price.toLocaleString('en-IN')} for an extraordinary milestone impression.`,
      matchExplanation: `Matches their interest in ${inputs.interests[0] || 'lifestyle goods'} while offering pricing flexibility for your budget range.`,
      keyFeatures: [
        `Outstanding value ratio from ${alternative.product.merchant}`,
        `Rated ${alternative.product.rating}★ with verified reviews`,
        `Versatile companion option for bundles and gift sets`
      ]
    });
  }

  // Add additional ideas for "See More Gift Ideas"
  const chosenIds = new Set(results.map(r => r.product.id));
  const additional = scored.filter(s => !chosenIds.has(s.product.id)).slice(0, 9);
  for (const item of additional) {
    results.push({
      product: item.product,
      score: item.score,
      scoreBreakdown: item.breakdown,
      matchLabel: item.matchLabel,
      recommendationType: 'additional_idea',
      whySelected: `Alternative match that aligns with their interest in ${item.product.category} and your selected occasion.`,
      matchExplanation: `Meets budget criteria and provides a versatile option from ${item.product.merchant}.`,
      keyFeatures: [
        `Verified listing from ${item.product.merchant}`,
        `Rated ${item.product.rating}★ (${item.product.reviewCount} reviews)`
      ]
    });
  }

  return results;
}
