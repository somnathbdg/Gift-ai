import { GoogleGenAI } from '@google/genai';
import { Product, GiftFinderInputs, ScoredRecommendation, RecommendationResponse } from '../src/types';
import { matchAndScoreCatalog, normalizeBudgetRange } from './giftMatchingService';

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
    console.error('Failed to initialize Gemini Client in recommendation service:', err);
    return null;
  }
}

/**
 * Builds deterministic fact-grounded explanations when AI is unavailable.
 */
function buildDeterministicExplanation(
  rec: { product: Product },
  inputs: GiftFinderInputs,
  role: 'best_match' | 'emotional_choice' | 'budget_choice' | 'premium_alternative' | 'additional_idea'
): { whySelected: string; matchExplanation: string } {
  const recipient = inputs.customRecipient || inputs.recipient || 'recipient';
  const occasion = inputs.customOccasion || inputs.occasion || 'occasion';
  const traits = (inputs.personalities || []).slice(0, 2).join(' & ') || 'personal';
  const interests = (inputs.interests || []).slice(0, 2).join(', ') || rec.product.category;
  const formattedPrice = `₹${rec.product.price.toLocaleString('en-IN')}`;

  let whySelected = '';
  let matchExplanation = '';

  switch (role) {
    case 'best_match':
      whySelected = `Selected as the best overall match for your ${recipient} celebrating their ${occasion}. It directly pairs with their ${traits} interests and stays comfortably priced at ${formattedPrice}.`;
      matchExplanation = `High compatibility across ${occasion} celebration etiquette and proven customer ratings (${rec.product.rating}★).`;
      break;
    case 'emotional_choice':
      whySelected = `Handpicked for meaningful personal impact and emotional resonance. Ideal for making your ${recipient} feel deeply cherished on this special ${occasion}.`;
      matchExplanation = `Strong sentimental and emotional appeal from ${rec.product.merchant} designed to create lasting memories.`;
      break;
    case 'budget_choice':
      whySelected = `An exceptional balance of quality and value at ${formattedPrice}, delivering thoughtful design without stretching your budget.`;
      matchExplanation = `Priced comfortably inside your target budget while maintaining high ratings (${rec.product.rating}★).`;
      break;
    case 'premium_alternative':
      whySelected = `An elevated, luxury alternative at ${formattedPrice} for an unforgettable milestone celebration. Perfect if you want to make a truly standout impression.`;
      matchExplanation = `Premium craftsmanship from ${rec.product.merchant} for special occasions requiring an extra touch of luxury.`;
      break;
    default:
      whySelected = `A versatile candidate that reflects their fondness for ${interests} and suits the festive tone of ${occasion}.`;
      matchExplanation = `Verified listing with reliable availability from ${rec.product.merchant}.`;
      break;
  }

  return { whySelected, matchExplanation };
}

/**
 * Orchestrates Intelligent Gift Matching:
 * 1. Deterministic Scoring & Filtering
 * 2. Role Assignment (Best Match, Emotional Choice, Budget Choice, Premium Alternative)
 * 3. Gemini AI Re-ranking & Fact-Grounded Explanation Generation
 * 4. Graceful No-Match Fallbacks
 */
export async function generateIntelligentRecommendations(
  catalog: Product[],
  inputs: GiftFinderInputs,
  options: {
    isLiveAmazon?: boolean;
    amazonNotice?: string;
    generatedQueries?: string[];
  } = {}
): Promise<RecommendationResponse> {
  const budgetRange = normalizeBudgetRange(inputs);

  // 1. Run Deterministic Scoring
  const { scoredCandidates, rejectedProducts } = matchAndScoreCatalog(catalog, inputs);

  // 2. Handle empty or no-match scenario gracefully
  if (scoredCandidates.length === 0 || scoredCandidates[0].score < 30) {
    // Attempt relaxed budget search for closest matches
    const relaxedInputs: GiftFinderInputs = {
      ...inputs,
      budget: 'Flexible',
      customBudget: undefined,
      budgetMin: 0,
      budgetMax: 500000
    };
    const relaxed = matchAndScoreCatalog(catalog, relaxedInputs);
    const closestMatches: ScoredRecommendation[] = relaxed.scoredCandidates.slice(0, 3).map(c => ({
      product: c.product,
      score: c.score,
      scoreBreakdown: c.breakdown,
      matchLabel: c.matchLabel,
      recommendationType: 'additional_idea',
      whySelected: `Closest alternative matching ${inputs.customOccasion || inputs.occasion} and interest in ${c.product.category}, priced at ₹${c.product.price.toLocaleString('en-IN')}.`,
      matchExplanation: `Outside current budget parameters, but strong functional match.`,
      keyFeatures: [
        `Verified listing from ${c.product.merchant}`,
        `Rated ${c.product.rating}★ (${c.product.reviewCount} reviews)`
      ]
    }));

    return {
      recommendations: [],
      structuredRecommendations: {
        otherRecommendations: []
      },
      inputs,
      generatedAt: new Date().toISOString(),
      isAiPowered: false,
      demoMode: !options.isLiveAmazon,
      amazonConnected: !!options.isLiveAmazon,
      amazonNotice: options.amazonNotice,
      generatedQueries: options.generatedQueries,
      noMatchFallback: true,
      fallbackReason: `We couldn't find an exact gift matching all criteria within ₹${budgetRange.min.toLocaleString('en-IN')}–₹${budgetRange.max.toLocaleString('en-IN')}. You can increase your budget range or explore our closest matches below.`,
      closestMatches
    };
  }

  // 3. Assign 4 Core Recommendations:
  // Card 1: Best Match (Highest deterministic score)
  const bestCandidate = scoredCandidates[0];

  // Card 2: Most Thoughtful / Emotional Choice
  // Select candidate with highest emotional + sentimental tags
  const emotionalCandidates = scoredCandidates
    .filter(c => c.product.id !== bestCandidate.product.id)
    .sort((a, b) => {
      const aEmo = (a.breakdown.emotionalReactionMatch || 0) + (a.breakdown.relationshipMatch || 0);
      const bEmo = (b.breakdown.emotionalReactionMatch || 0) + (b.breakdown.relationshipMatch || 0);
      return bEmo - aEmo;
    });
  const emotionalCandidate = emotionalCandidates[0] || scoredCandidates[1] || bestCandidate;

  // Card 3: Best Within Budget
  // Select candidate strictly inside budgetMin..budgetMax with highest budget score
  const budgetCandidates = scoredCandidates
    .filter(c => c.product.id !== bestCandidate.product.id && c.product.id !== emotionalCandidate.product.id)
    .filter(c => c.product.price <= budgetRange.max)
    .sort((a, b) => {
      // Prioritize high budget score and great ratings
      return (b.breakdown.budgetMatch + b.product.rating * 2) - (a.breakdown.budgetMatch + a.product.rating * 2);
    });
  const budgetCandidate = budgetCandidates[0] || scoredCandidates.filter(c => c.product.id !== bestCandidate.product.id)[0] || bestCandidate;

  // Card 4: Premium Alternative (Only if appropriate)
  // Check for an elevated item whose price is higher than bestMatch and reflects luxury/milestone
  const premiumCandidates = scoredCandidates
    .filter(c => c.product.id !== bestCandidate.product.id && c.product.id !== emotionalCandidate.product.id && c.product.id !== budgetCandidate.product.id)
    .filter(c => c.product.price > bestCandidate.product.price || c.product.price >= 2500)
    .sort((a, b) => b.product.price - a.product.price);
  const premiumCandidate = premiumCandidates.length > 0 ? premiumCandidates[0] : undefined;

  // Additional recommendations (pool of remaining top matches)
  const assignedIds = new Set([
    bestCandidate.product.id,
    emotionalCandidate.product.id,
    budgetCandidate.product.id,
    premiumCandidate?.product.id
  ].filter(Boolean) as string[]);

  const otherCandidates = scoredCandidates.filter(c => !assignedIds.has(c.product.id)).slice(0, 8);

  // Helper to build initial ScoredRecommendation object
  const createScored = (
    c: typeof bestCandidate,
    role: 'best_match' | 'emotional_choice' | 'budget_choice' | 'premium_alternative' | 'additional_idea'
  ): ScoredRecommendation => {
    const { whySelected, matchExplanation } = buildDeterministicExplanation(c, inputs, role);
    return {
      product: c.product,
      score: c.score,
      scoreBreakdown: c.breakdown,
      matchLabel: c.matchLabel,
      recommendationType: role,
      whySelected,
      matchExplanation,
      keyFeatures: [
        `Verified listing from ${c.product.merchant}`,
        `Rated ${c.product.rating}★ (${c.product.reviewCount} customer reviews)`,
        c.matchHighlights[0] || `Specifically matched for ${inputs.customOccasion || inputs.occasion}`
      ]
    };
  };

  const bestMatchRec = createScored(bestCandidate, 'best_match');
  const emotionalRec = createScored(emotionalCandidate, 'emotional_choice');
  const budgetRec = createScored(budgetCandidate, 'budget_choice');
  const premiumRec = premiumCandidate ? createScored(premiumCandidate, 'premium_alternative') : undefined;
  const otherRecs = otherCandidates.map(c => createScored(c, 'additional_idea'));

  // 4. AI Re-ranking & Fact-Grounded Explanation (Gemini 3.8 Flash)
  const ai = getGeminiClient();
  const topList = [bestMatchRec, emotionalRec, budgetRec, ...(premiumRec ? [premiumRec] : [])];

  if (ai) {
    try {
      const prompt = `You are the Lead Gift Recommendation Concierge for "Perfect Gift AI".
Evaluate these selected gift candidates against the customer profile.
Generate a concise, warm, authentic 1-3 sentence explanation for why each product was chosen for this recipient.
CRITICAL CONSTRAINT: You must ONLY use facts contained in the provided product details. Do NOT fabricate price, rating, reviews, shipping, availability, discounts, or unmentioned features.

CUSTOMER PROFILE:
- Recipient: ${inputs.customRecipient || inputs.recipient}
- Occasion: ${inputs.customOccasion || inputs.occasion}
- Budget: ${inputs.customBudget || inputs.budget} (Range: ₹${budgetRange.min}–₹${budgetRange.max})
- Personality: ${(inputs.personalities || []).join(', ') || 'Thoughtful'}
- Interests: ${(inputs.interests || []).join(', ') || 'Lifestyle'}
- Desired Reaction: ${inputs.desiredReaction || 'Heartfelt & Emotional'}
- User Notes: "${inputs.notes || 'None'}"

CANDIDATES TO EXPLAIN:
${topList.map((item, idx) => `
Candidate ${idx + 1} [Role: ${item.recommendationType.toUpperCase()}]:
ID: ${item.product.id}
Name: ${item.product.name}
Description: ${item.product.description}
Price: ₹${item.product.price}
Merchant: ${item.product.merchant}
Category: ${item.product.category}
Rating: ${item.product.rating}★
`).join('\n')}

INSTRUCTIONS:
Return a JSON array of objects for each candidate in order:
[
  {
    "id": "product-id",
    "whySelected": "1-3 warm, grounded sentences explaining why this fits their profile and occasion.",
    "matchExplanation": "1 concise sentence highlighting the core alignment."
  }
]
Format as strictly valid JSON without markdown wrapping.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const rawText = response.text || '';
      const parsed = JSON.parse(rawText.trim());

      if (Array.isArray(parsed)) {
        parsed.forEach((item: { id: string; whySelected?: string; matchExplanation?: string }) => {
          const match = topList.find(t => t.product.id === item.id);
          if (match) {
            if (item.whySelected && item.whySelected.trim().length > 10) {
              match.whySelected = item.whySelected.trim();
            }
            if (item.matchExplanation && item.matchExplanation.trim().length > 5) {
              match.matchExplanation = item.matchExplanation.trim();
            }
          }
        });
      }
    } catch (aiErr: any) {
      console.warn('Gemini explanation generation issue, retaining deterministic explanations:', aiErr.message);
    }
  }

  // Combine recommendations list
  const finalRecommendations: ScoredRecommendation[] = [
    bestMatchRec,
    emotionalRec,
    budgetRec,
    ...(premiumRec ? [premiumRec] : []),
    ...otherRecs
  ];

  return {
    recommendations: finalRecommendations,
    structuredRecommendations: {
      bestMatch: bestMatchRec,
      emotionalChoice: emotionalRec,
      budgetChoice: budgetRec,
      premiumAlternative: premiumRec,
      otherRecommendations: otherRecs
    },
    inputs,
    generatedAt: new Date().toISOString(),
    isAiPowered: !!ai,
    demoMode: !options.isLiveAmazon,
    amazonConnected: !!options.isLiveAmazon,
    amazonNotice: options.amazonNotice,
    generatedQueries: options.generatedQueries
  };
}
