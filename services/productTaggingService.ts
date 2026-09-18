import { GoogleGenAI } from '@google/genai';
import { Product } from '../src/types';

export interface ProductTaggingResult {
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
}

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
    console.error('Failed to initialize Gemini Client in tagging service:', err);
    return null;
  }
}

/**
 * Deterministic fallback tagger when AI is unavailable or fails.
 */
export function generateDeterministicTags(product: Partial<Product>): ProductTaggingResult {
  const title = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const text = `${title} ${desc} ${product.category || ''} ${product.subcategory || ''}`;
  const price = product.price || 1000;

  const occasions: string[] = [];
  if (text.includes('anniversary') || text.includes('couple') || text.includes('wedding')) occasions.push('Anniversary', 'Wedding');
  if (text.includes('birthday') || text.includes('party')) occasions.push('Birthday');
  if (text.includes('valentine') || text.includes('heart') || text.includes('love')) occasions.push("Valentine's Day");
  if (text.includes('mother') || text.includes('mom')) occasions.push("Mother's Day");
  if (text.includes('father') || text.includes('dad')) occasions.push("Father's Day");
  if (text.includes('diwali') || text.includes('festive')) occasions.push('Diwali');
  if (text.includes('rakhi') || text.includes('raksha bandhan') || text.includes('brother') || text.includes('sister')) occasions.push('Raksha Bandhan');
  if (text.includes('farewell') || text.includes('office') || text.includes('colleague')) occasions.push('Farewell');
  if (text.includes('housewarming') || text.includes('home') || text.includes('plant') || text.includes('decor')) occasions.push('Housewarming');
  if (occasions.length === 0) occasions.push('Birthday', 'Just Because');

  const recipients: string[] = [];
  if (text.includes('wife') || text.includes('girlfriend') || text.includes('women') || text.includes('she') || text.includes('jewelry')) {
    recipients.push('Wife', 'Girlfriend', 'Partner');
  }
  if (text.includes('husband') || text.includes('boyfriend') || text.includes('men') || text.includes('he') || text.includes('beard') || text.includes('shave')) {
    recipients.push('Husband', 'Boyfriend', 'Partner');
  }
  if (text.includes('mom') || text.includes('mother')) recipients.push('Mom');
  if (text.includes('dad') || text.includes('father')) recipients.push('Dad');
  if (text.includes('friend') || text.includes('bestie')) recipients.push('Friend');
  if (text.includes('colleague') || text.includes('coworker') || text.includes('office')) recipients.push('Colleague');
  if (text.includes('kid') || text.includes('child') || text.includes('toy') || text.includes('baby')) recipients.push('Child');
  if (recipients.length === 0) recipients.push('Partner', 'Friend', 'Family');

  const relationships: string[] = [];
  if (recipients.includes('Wife') || recipients.includes('Husband') || recipients.includes('Girlfriend') || recipients.includes('Boyfriend')) {
    relationships.push('Romantic Partner', 'Spouse');
  }
  if (recipients.includes('Mom') || recipients.includes('Dad') || recipients.includes('Brother') || recipients.includes('Sister')) {
    relationships.push('Immediate Family');
  }
  if (recipients.includes('Friend')) relationships.push('Close Friend');
  if (recipients.includes('Colleague')) relationships.push('Workplace');
  if (relationships.length === 0) relationships.push('Personal');

  const personalities: string[] = [];
  if (text.includes('romantic') || text.includes('heart') || text.includes('love') || text.includes('star map') || text.includes('pendant')) personalities.push('Romantic');
  if (text.includes('sentimental') || text.includes('personalized') || text.includes('custom') || text.includes('memory') || text.includes('photo')) personalities.push('Sentimental');
  if (text.includes('tech') || text.includes('smart') || text.includes('digital') || text.includes('gadget') || text.includes('wireless')) personalities.push('Tech Lover');
  if (text.includes('practical') || text.includes('utility') || text.includes('durable') || text.includes('organizer')) personalities.push('Practical');
  if (text.includes('food') || text.includes('coffee') || text.includes('tea') || text.includes('chocolate') || text.includes('cook')) personalities.push('Foodie');
  if (text.includes('art') || text.includes('craft') || text.includes('creative') || text.includes('diy') || text.includes('design')) personalities.push('Creative');
  if (text.includes('travel') || text.includes('luggage') || text.includes('outdoor') || text.includes('adventure')) personalities.push('Traveller', 'Adventurous');
  if (text.includes('luxury') || text.includes('gold') || text.includes('silver') || text.includes('leather') || text.includes('premium')) personalities.push('Luxury Lover');
  if (text.includes('funny') || text.includes('humor') || text.includes('quirky') || text.includes('joke')) personalities.push('Funny');
  if (personalities.length === 0) personalities.push('Thoughtful', 'Creative');

  const interests: string[] = [];
  if (text.includes('jewelry') || text.includes('fashion') || text.includes('watch') || text.includes('wear')) interests.push('Fashion', 'Jewelry');
  if (text.includes('book') || text.includes('read') || text.includes('stoic') || text.includes('author')) interests.push('Books');
  if (text.includes('coffee') || text.includes('brew') || text.includes('espresso') || text.includes('tea')) interests.push('Coffee & Tea', 'Cooking');
  if (text.includes('fitness') || text.includes('yoga') || text.includes('workout') || text.includes('gym')) interests.push('Fitness', 'Health');
  if (text.includes('game') || text.includes('gaming') || text.includes('rgb') || text.includes('mouse')) interests.push('Gaming', 'Technology');
  if (text.includes('plant') || text.includes('bonsai') || text.includes('greenery')) interests.push('Plants', 'Home Decor');
  if (interests.length === 0) interests.push(product.category || 'Lifestyle');

  const emotions: string[] = [];
  if (personalities.includes('Romantic') || personalities.includes('Sentimental')) emotions.push('Emotional', 'Thoughtful', 'Sweet');
  if (personalities.includes('Funny')) emotions.push('Funny', 'Laughter');
  if (personalities.includes('Tech Lover') || personalities.includes('Creative')) emotions.push('Cool', 'Surprised');
  if (personalities.includes('Luxury Lover')) emotions.push('Impressed', 'Amazed');
  if (emotions.length === 0) emotions.push('Thoughtful', 'Delighted');

  return {
    category: product.category || 'Personalized Items',
    subcategory: product.subcategory || 'Specialty Gift',
    recipientTags: Array.from(new Set(recipients)),
    relationshipTags: Array.from(new Set(relationships)),
    occasionTags: Array.from(new Set(occasions)),
    personalityTags: Array.from(new Set(personalities)),
    interestTags: Array.from(new Set(interests)),
    emotionTags: Array.from(new Set(emotions)),
    budgetMin: Math.max(0, Math.round(price * 0.8)),
    budgetMax: Math.round(price * 1.2),
    confidenceNotes: 'Generated using deterministic catalog heuristics.',
    isAiGenerated: false
  };
}

/**
 * AI-powered tagging service using Gemini.
 * Strictly grounds tags in actual product description and facts without hallucinating.
 */
export async function suggestProductTagsWithAi(product: Partial<Product>): Promise<ProductTaggingResult> {
  const fallback = generateDeterministicTags(product);
  const ai = getGeminiClient();

  if (!ai) {
    return fallback;
  }

  try {
    const prompt = `You are an expert E-Commerce Product Metadata and Gift Categorization Specialist for "Perfect Gift AI".
Analyze the product details below and suggest accurate, normalized gift-matching tags.
CRITICAL CONSTRAINT: You must ONLY use facts grounded in the provided product title, description, category, and price. Do NOT hallucinate unmentioned capabilities.

PRODUCT DETAILS:
Title: ${product.name || 'Untitled Product'}
Description: ${product.description || 'No description provided'}
Merchant: ${product.merchant || 'Standard Retailer'}
Current Category: ${product.category || 'General'}
Current Subcategory: ${product.subcategory || 'General'}
Price: ₹${product.price || 1000} ${product.currency || 'INR'}

Analyze and return a JSON object with:
- category: string (refined gift category, e.g., "Personalized Items", "Fashion", "Technology", "Home Decor", "Food & Gourmet", "Fitness", "Books", "Gaming", "Beauty & Wellness", "Kids", "Travel")
- subcategory: string (e.g., "Jewelry", "Audio", "Cookware", "Aromatherapy", "Keepsakes")
- recipientTags: string[] (most suitable recipients, e.g., ["Wife", "Husband", "Mom", "Dad", "Friend", "Colleague", "Child", "Partner", "Sister", "Brother"])
- relationshipTags: string[] (e.g., ["Romantic Partner", "Spouse", "Family", "Close Friend", "Workplace / Professional"])
- occasionTags: string[] (occasions this gift shines in, e.g., ["Anniversary", "Birthday", "Valentine's Day", "Diwali", "Mother's Day", "Father's Day", "Housewarming", "Farewell", "Wedding", "Graduation", "Just Because"])
- personalityTags: string[] (personality traits that appreciate this item, e.g., ["Romantic", "Sentimental", "Practical", "Tech Lover", "Foodie", "Creative", "Minimalist", "Fitness Lover", "Luxury Lover", "Homebody", "Adventurous", "Funny"])
- interestTags: string[] (interests or hobbies this addresses, e.g., ["Jewelry", "Cooking", "Coffee", "Books", "Gaming", "Art", "Travel", "Plants", "Photography", "Fitness", "Wellness"])
- emotionTags: string[] (desired reaction it naturally creates, e.g., ["Emotional", "Thoughtful", "Surprised", "Impressed", "Sweet", "Cool", "Funny"])
- budgetMin: number (appropriate minimum customer budget target, reasonable rounded integer)
- budgetMax: number (appropriate maximum customer budget target, reasonable rounded integer)

Return ONLY valid JSON matching this schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const rawText = response.text || '';
    const parsed = JSON.parse(rawText.trim());

    return {
      category: parsed.category || fallback.category,
      subcategory: parsed.subcategory || fallback.subcategory,
      recipientTags: Array.isArray(parsed.recipientTags) && parsed.recipientTags.length > 0 ? parsed.recipientTags : fallback.recipientTags,
      relationshipTags: Array.isArray(parsed.relationshipTags) && parsed.relationshipTags.length > 0 ? parsed.relationshipTags : fallback.relationshipTags,
      occasionTags: Array.isArray(parsed.occasionTags) && parsed.occasionTags.length > 0 ? parsed.occasionTags : fallback.occasionTags,
      personalityTags: Array.isArray(parsed.personalityTags) && parsed.personalityTags.length > 0 ? parsed.personalityTags : fallback.personalityTags,
      interestTags: Array.isArray(parsed.interestTags) && parsed.interestTags.length > 0 ? parsed.interestTags : fallback.interestTags,
      emotionTags: Array.isArray(parsed.emotionTags) && parsed.emotionTags.length > 0 ? parsed.emotionTags : fallback.emotionTags,
      budgetMin: typeof parsed.budgetMin === 'number' ? parsed.budgetMin : fallback.budgetMin,
      budgetMax: typeof parsed.budgetMax === 'number' ? parsed.budgetMax : fallback.budgetMax,
      confidenceNotes: 'Auto-tagged via Gemini 3.8 Flash grounded in product description.',
      isAiGenerated: true
    };
  } catch (err: any) {
    console.warn('Gemini auto-tagging error, falling back to deterministic tags:', err.message);
    return fallback;
  }
}
