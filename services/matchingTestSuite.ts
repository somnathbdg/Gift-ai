import { SEED_PRODUCTS } from '../src/data/seedProducts';
import { GiftFinderInputs } from '../src/types';
import { matchAndScoreCatalog } from './giftMatchingService';
import { generateIntelligentRecommendations } from './recommendationService';

interface TestCase {
  name: string;
  inputs: GiftFinderInputs;
  expectedCategoryOrKeyword: string;
}

const testCases: TestCase[] = [
  {
    name: '1. Wife + Anniversary + Romantic',
    inputs: {
      recipient: 'Wife',
      relationship: 'Spouse',
      occasion: 'Anniversary',
      budget: '₹1,000–₹2,000',
      personalities: ['Romantic', 'Sentimental'],
      interests: ['Photography'],
      desiredReaction: 'Emotional / Tearful',
      notes: 'She loves meaningful personalized gifts.'
    },
    expectedCategoryOrKeyword: 'personalized'
  },
  {
    name: '2. Husband + Birthday + Tech Lover',
    inputs: {
      recipient: 'Husband',
      relationship: 'Spouse',
      occasion: 'Birthday',
      budget: '₹2,000–₹5,000',
      personalities: ['Tech Lover', 'Practical'],
      interests: ['Technology'],
      desiredReaction: 'Cool / Useful',
      notes: 'Loves audio and desk gear.'
    },
    expectedCategoryOrKeyword: 'tech'
  },
  {
    name: '3. Mom + Mother\'s Day + Emotional',
    inputs: {
      recipient: 'Mom',
      relationship: 'Family',
      occasion: "Mother's Day",
      budget: '₹2,000–₹5,000',
      personalities: ['Sentimental', 'Homebody'],
      interests: ['Beauty', 'Health'],
      desiredReaction: 'Emotional / Tearful',
      notes: 'Deserves deep pampering.'
    },
    expectedCategoryOrKeyword: 'beauty'
  },
  {
    name: '4. Dad + Father\'s Day + Practical',
    inputs: {
      recipient: 'Dad',
      relationship: 'Family',
      occasion: "Father's Day",
      budget: '₹1,000–₹2,000',
      personalities: ['Practical'],
      interests: ['Technology', 'Fashion'],
      desiredReaction: 'Cool / Useful',
      notes: 'Prefers useful, durable items.'
    },
    expectedCategoryOrKeyword: 'practical'
  },
  {
    name: '5. Girlfriend + Valentine\'s Day + Romantic',
    inputs: {
      recipient: 'Girlfriend',
      relationship: 'Partner',
      occasion: "Valentine's Day",
      budget: '₹1,000–₹2,000',
      personalities: ['Romantic'],
      interests: ['Fashion', 'Personalized Items'],
      desiredReaction: 'Emotional / Tearful',
      notes: 'Special anniversary/valentine surprise.'
    },
    expectedCategoryOrKeyword: 'romantic'
  },
  {
    name: '6. Boyfriend + Birthday + Gaming',
    inputs: {
      recipient: 'Boyfriend',
      relationship: 'Partner',
      occasion: 'Birthday',
      budget: '₹2,000–₹5,000',
      personalities: ['Tech Lover', 'Creative'],
      interests: ['Gaming', 'Technology'],
      desiredReaction: 'Cool / Useful',
      notes: 'Loves gaming setup accessories.'
    },
    expectedCategoryOrKeyword: 'gaming'
  },
  {
    name: '7. Friend + Birthday + Funny',
    inputs: {
      recipient: 'Friend',
      relationship: 'Friend',
      occasion: 'Birthday',
      budget: 'Under ₹500',
      personalities: ['Funny', 'Creative'],
      interests: ['Food', 'Art'],
      desiredReaction: 'Funny / Laugh',
      notes: 'Something lighthearted.'
    },
    expectedCategoryOrKeyword: 'funny'
  },
  {
    name: '8. Colleague + Farewell + Professional',
    inputs: {
      recipient: 'Colleague',
      relationship: 'Workplace',
      occasion: 'Farewell',
      budget: '₹500–₹1,000',
      personalities: ['Practical'],
      interests: ['Books', 'Technology'],
      desiredReaction: 'Thoughtful / Sweet',
      notes: 'Office desk or notebook gift.'
    },
    expectedCategoryOrKeyword: 'notebook'
  },
  {
    name: '9. Traveller + Birthday',
    inputs: {
      recipient: 'Friend',
      relationship: 'Friend',
      occasion: 'Birthday',
      budget: '₹1,000–₹2,000',
      personalities: ['Traveller', 'Adventurous'],
      interests: ['Travel', 'Photography'],
      desiredReaction: 'Cool / Useful',
      notes: 'Always exploring new cities.'
    },
    expectedCategoryOrKeyword: 'travel'
  },
  {
    name: '10. Fitness Lover + Birthday',
    inputs: {
      recipient: 'Partner',
      relationship: 'Partner',
      occasion: 'Birthday',
      budget: '₹1,000–₹2,000',
      personalities: ['Fitness Lover'],
      interests: ['Fitness', 'Health'],
      desiredReaction: 'Cool / Useful',
      notes: 'Passionate about yoga and workouts.'
    },
    expectedCategoryOrKeyword: 'fitness'
  }
];

async function runTestSuite() {
  console.log('--- RUNNING 10 TEST PROFILES AGAINST MATCHING ENGINE ---');
  let passCount = 0;

  for (const t of testCases) {
    const { scoredCandidates } = matchAndScoreCatalog(SEED_PRODUCTS, t.inputs);
    const topMatch = scoredCandidates[0];
    const top3 = scoredCandidates.slice(0, 3);

    console.log(`\nTest: ${t.name}`);
    console.log(`Top 1: "${topMatch.product.name}" (Score: ${topMatch.score}/100, Price: ₹${topMatch.product.price})`);
    console.log(`Highlights: ${topMatch.matchHighlights.join('; ')}`);
    console.log(`Breakdown: Budget=${topMatch.breakdown.budgetMatch}, Occasion=${topMatch.breakdown.occasionMatch}, Pers=${topMatch.breakdown.personalityMatch}, Int=${topMatch.breakdown.interestMatch}`);

    if (topMatch.score >= 60) {
      passCount++;
      console.log('Result: PASS (High Relevance Match)');
    } else {
      console.log('Result: LOW SCORE');
    }
  }

  console.log(`\nSummary: ${passCount} / ${testCases.length} tests passed successfully.`);
}

runTestSuite().catch(console.error);
