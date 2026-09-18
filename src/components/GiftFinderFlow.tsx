import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Heart,
  User,
  Calendar,
  IndianRupee,
  Smile,
  Compass,
  FileText,
  Check,
  RefreshCw
} from 'lucide-react';
import { GiftFinderInputs, RecommendationResponse } from '../types';
import { getRecommendations } from '../services/api';

interface GiftFinderFlowProps {
  initialValues?: Partial<GiftFinderInputs>;
  onComplete: (results: RecommendationResponse, inputs: GiftFinderInputs) => void;
  onCancel: () => void;
}

export const GiftFinderFlow: React.FC<GiftFinderFlowProps> = ({
  initialValues,
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 7; // Step 8 is the animated loading screen

  const [inputs, setInputs] = useState<GiftFinderInputs>({
    recipient: initialValues?.recipient || 'Partner',
    customRecipient: '',
    occasion: initialValues?.occasion || 'Birthday',
    customOccasion: '',
    budget: initialValues?.budget || '₹1,000–₹2,000',
    customBudget: '',
    personalities: initialValues?.personalities || ['Thoughtful', 'Romantic'],
    interests: initialValues?.interests || ['Personalized Items'],
    desiredReaction: initialValues?.desiredReaction || 'Thoughtful / Sweet',
    notes: '',
    recipientName: '',
    recipientAge: '25-34'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadingMessages = [
    'Finding gifts that match your recipient...',
    'Understanding their personality and nuances...',
    'Checking verified catalog prices against your budget...',
    'Synthesizing personalized match explanations...'
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIdx(prev => (prev + 1) % loadingMessages.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Recipient options
  const recipientOptions = [
    { label: 'Partner', icon: '💑' },
    { label: 'Wife', icon: '💍' },
    { label: 'Husband', icon: '🤵' },
    { label: 'Girlfriend', icon: '💐' },
    { label: 'Boyfriend', icon: '👔' },
    { label: 'Mom', icon: '🌸' },
    { label: 'Dad', icon: '☕' },
    { label: 'Sister', icon: '✨' },
    { label: 'Brother', icon: '🎮' },
    { label: 'Friend', icon: '🤝' },
    { label: 'Child', icon: '🧸' },
    { label: 'Colleague', icon: '💼' },
    { label: 'Other', icon: '🌟' }
  ];

  // Occasion options
  const occasionOptions = [
    'Birthday',
    'Anniversary',
    'Wedding',
    'Engagement',
    'Valentine\'s Day',
    'Mother\'s Day',
    'Father\'s Day',
    'Raksha Bandhan',
    'Diwali',
    'Christmas',
    'Graduation',
    'Housewarming',
    'Thank You',
    'Farewell',
    'Just Because',
    'Other'
  ];

  // Budget options
  const budgetOptions = [
    'Under ₹500',
    '₹500–₹1,000',
    '₹1,000–₹2,000',
    '₹2,000–₹5,000',
    '₹5,000–₹10,000',
    '₹10,000+',
    'Custom Budget'
  ];

  // Personality options
  const personalityOptions = [
    'Romantic',
    'Practical',
    'Creative',
    'Fashionable',
    'Funny',
    'Tech Lover',
    'Traveller',
    'Fitness Lover',
    'Foodie',
    'Luxury Lover',
    'Minimalist',
    'Sentimental',
    'Homebody',
    'Spiritual',
    'Adventurous'
  ];

  // Interest options
  const interestOptions = [
    'Fashion',
    'Beauty',
    'Travel',
    'Photography',
    'Books',
    'Music',
    'Movies',
    'Gaming',
    'Fitness',
    'Cooking',
    'Food',
    'Technology',
    'Home Decor',
    'Art',
    'Plants',
    'Pets',
    'Personalized Items',
    'Experiences'
  ];

  // Desired reaction options
  const reactionOptions = [
    {
      reaction: 'Emotional / Tearful',
      quote: '"Aww, this is so thoughtful and touching"',
      emoji: '❤️'
    },
    {
      reaction: 'Surprised',
      quote: '"I never expected this! How did you find it?"',
      emoji: '😮'
    },
    {
      reaction: 'Funny / Laugh',
      quote: '"This is hilarious, you know me too well"',
      emoji: '😂'
    },
    {
      reaction: 'Impressed / Wow',
      quote: '"This is exceptional craftsmanship and quality"',
      emoji: '✨'
    },
    {
      reaction: 'Thoughtful / Sweet',
      quote: '"You really listened to what I wished for"',
      emoji: '🥰'
    },
    {
      reaction: 'Cool / Useful',
      quote: '"I am going to use this every single day"',
      emoji: '🔥'
    }
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      // Trigger submission
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  const togglePersonality = (trait: string) => {
    setInputs(prev => {
      const exists = prev.personalities.includes(trait);
      if (exists) {
        return { ...prev, personalities: prev.personalities.filter(p => p !== trait) };
      } else {
        return { ...prev, personalities: [...prev.personalities, trait] };
      }
    });
  };

  const toggleInterest = (interest: string) => {
    setInputs(prev => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await getRecommendations(inputs);
      // Ensure at least 1.8s of delightful animation so user feels the concierge thinking
      setTimeout(() => {
        setIsLoading(false);
        onComplete(response, inputs);
      }, 1800);
    } catch (err: any) {
      console.error('Recommendation fetch error:', err);
      setIsLoading(false);
      setErrorMsg(err.message || 'Something went wrong while curating your gifts. Please try again.');
    }
  };

  // STEP 8: Animated Loading State
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center mb-8 relative shadow-lg shadow-rose-900/10">
          <Sparkles className="w-10 h-10 text-rose-700 animate-spin duration-3000" />
          <div className="absolute -inset-1 rounded-3xl bg-rose-400/20 animate-pulse -z-10" />
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
          Curating Your Perfect Gifts
        </h3>

        <div className="h-8 flex items-center justify-center">
          <p className="text-base text-rose-800 font-medium animate-fade-in key={loadingMessageIdx}">
            {loadingMessages[loadingMessageIdx]}
          </p>
        </div>

        <div className="max-w-md mx-auto mt-8 bg-stone-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-rose-700 h-full transition-all duration-700 ease-out"
            style={{ width: `${((loadingMessageIdx + 1) / loadingMessages.length) * 100}%` }}
          />
        </div>

        <p className="text-xs text-stone-500 mt-6">
          Analyzing {inputs.customRecipient || inputs.recipient} • {inputs.customOccasion || inputs.occasion} • {inputs.customBudget || inputs.budget}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header bar with progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            id="finder-back-btn"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Exit to Home' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Step {step} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-rose-700 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={handleSubmit}
            className="text-xs font-bold underline hover:no-underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* STEP 1: Who are you buying for? */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Recipient Profile
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Who are you buying for?
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Select your relationship with the recipient so we can tailor intimacy and tone.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {recipientOptions.map(opt => {
              const isSelected = inputs.recipient === opt.label;
              return (
                <button
                  key={opt.label}
                  id={`recipient-btn-${opt.label.toLowerCase()}`}
                  onClick={() => setInputs(prev => ({ ...prev, recipient: opt.label }))}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col items-start justify-between min-h-[90px] ${
                    isSelected
                      ? 'border-rose-700 bg-rose-50/70 text-rose-950 ring-2 ring-rose-700/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80 text-stone-800'
                  }`}
                >
                  <span className="text-2xl mb-1">{opt.icon}</span>
                  <span className="text-sm font-semibold">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {inputs.recipient === 'Other' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Specify relationship:
              </label>
              <input
                type="text"
                value={inputs.customRecipient || ''}
                onChange={e => setInputs(prev => ({ ...prev, customRecipient: e.target.value }))}
                placeholder="e.g. Mentor, Mother-in-law, Neighbor"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-700"
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 2: What's the occasion? */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Celebration
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              What's the occasion?
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Every occasion calls for a different balance of practicality, sentiment, or excitement.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {occasionOptions.map(occ => {
              const isSelected = inputs.occasion === occ;
              return (
                <button
                  key={occ}
                  id={`occasion-btn-${occ.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setInputs(prev => ({ ...prev, occasion: occ }))}
                  className={`p-3.5 rounded-xl border text-sm font-semibold text-left transition-all ${
                    isSelected
                      ? 'border-rose-700 bg-rose-50/80 text-rose-950 ring-2 ring-rose-700/20'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80 text-stone-800'
                  }`}
                >
                  {occ}
                </button>
              );
            })}
          </div>

          {inputs.occasion === 'Other' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Specify custom occasion:
              </label>
              <input
                type="text"
                value={inputs.customOccasion || ''}
                onChange={e => setInputs(prev => ({ ...prev, customOccasion: e.target.value }))}
                placeholder="e.g. Promotion, Half-Marathon Finish, New Pet"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-700"
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 3: What's your budget? */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Price Range
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              What's your budget?
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              We only show verified catalog products that respect your exact financial comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {budgetOptions.map(b => {
              const isSelected = inputs.budget === b;
              return (
                <button
                  key={b}
                  id={`budget-btn-${b.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setInputs(prev => ({ ...prev, budget: b }))}
                  className={`p-4 rounded-xl border text-base font-semibold text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-rose-700 bg-rose-50/80 text-rose-950 ring-2 ring-rose-700/20'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80 text-stone-800'
                  }`}
                >
                  <span>{b}</span>
                  {isSelected && <Check className="w-5 h-5 text-rose-700" />}
                </button>
              );
            })}
          </div>

          {inputs.budget === 'Custom Budget' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Target budget amount in INR (₹):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-medium">₹</span>
                <input
                  type="number"
                  value={inputs.customBudget || ''}
                  onChange={e => setInputs(prev => ({ ...prev, customBudget: e.target.value }))}
                  placeholder="e.g. 3500"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-700"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: What are they like? */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Personality & Archetype
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              What are they like?
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Select 1 to 4 traits that capture their essence and everyday demeanor.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {personalityOptions.map(trait => {
              const isSelected = inputs.personalities.includes(trait);
              return (
                <button
                  key={trait}
                  id={`trait-btn-${trait.toLowerCase()}`}
                  onClick={() => togglePersonality(trait)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-rose-700 bg-rose-700 text-white shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-800'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
                  <span>{trait}</span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-stone-500">
            Selected: <span className="font-semibold text-stone-800">{inputs.personalities.length}</span> trait(s)
          </p>
        </div>
      )}

      {/* STEP 5: What do they enjoy? */}
      {step === 5 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Interests & Passions
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              What do they enjoy?
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Select what they spend their free time on or what they get excited talking about.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {interestOptions.map(interest => {
              const isSelected = inputs.interests.includes(interest);
              return (
                <button
                  key={interest}
                  id={`interest-btn-${interest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-800'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
                  <span>{interest}</span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-stone-500">
            Selected: <span className="font-semibold text-stone-800">{inputs.interests.length}</span> interest(s)
          </p>
        </div>
      )}

      {/* STEP 6: Desired emotional reaction? */}
      {step === 6 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Emotional Impact
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              What emotional reaction do you want?
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              How do you want them to feel when they unwrap your gift?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {reactionOptions.map(opt => {
              const isSelected = inputs.desiredReaction.startsWith(opt.reaction);
              return (
                <button
                  key={opt.reaction}
                  id={`reaction-btn-${opt.reaction.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setInputs(prev => ({ ...prev, desiredReaction: opt.reaction }))}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-rose-700 bg-rose-50/80 ring-2 ring-rose-700/20 text-rose-950 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="font-bold text-base">{opt.reaction}</span>
                  </div>
                  <p className="text-xs text-stone-600 italic">
                    {opt.quote}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 7: Anything else we should know? */}
      {step === 7 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Personal Touch
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Tell us anything else about them.
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Any inside jokes, dislikes, specific tastes, or memories you want our concierge to keep in mind.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Special notes, preferences or quirks:
              </label>
              <textarea
                rows={4}
                value={inputs.notes || ''}
                onChange={e => setInputs(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Example: She loves travelling, photography and simple meaningful gifts. She doesn't like overly flashy jewelry or clutter."
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Recipient Name (Optional):
                </label>
                <input
                  type="text"
                  value={inputs.recipientName || ''}
                  onChange={e => setInputs(prev => ({ ...prev, recipientName: e.target.value }))}
                  placeholder="e.g. Priya, Rohit, Mom"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Age Group (Optional):
                </label>
                <select
                  value={inputs.recipientAge || '25-34'}
                  onChange={e => setInputs(prev => ({ ...prev, recipientAge: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-700"
                >
                  <option value="Under 18">Under 18</option>
                  <option value="18-24">18–24 (Young Adult)</option>
                  <option value="25-34">25–34</option>
                  <option value="35-49">35–49</option>
                  <option value="50-64">50–64</option>
                  <option value="65+">65+ (Senior)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="mt-10 pt-6 border-t border-stone-200 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-sm font-medium transition-colors"
        >
          {step === 1 ? 'Cancel' : 'Previous Step'}
        </button>

        <button
          id="finder-next-btn"
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold shadow-md shadow-rose-900/15 hover:shadow-lg transition-all"
        >
          <span>{step === totalSteps ? 'Discover My Gifts' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
