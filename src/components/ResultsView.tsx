import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Heart,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Info,
  CheckCircle2,
  Gift,
  Send,
  CreditCard,
  Flame,
  Star
} from 'lucide-react';
import { RecommendationResponse, GiftFinderInputs, ScoredRecommendation, Product } from '../types';
import { trackClick } from '../services/api';

interface ResultsViewProps {
  results: RecommendationResponse;
  inputs: GiftFinderInputs;
  savedProductIds: string[];
  onToggleSave: (product: Product) => void;
  onStartNewSearch: () => void;
  onOpenPersonalization: (product: Product, defaultTab?: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  results,
  inputs,
  savedProductIds,
  onToggleSave,
  onStartNewSearch,
  onOpenPersonalization
}) => {
  const [showAllIdeas, setShowAllIdeas] = useState(false);
  const [activeScoreTooltip, setActiveScoreTooltip] = useState<string | null>(null);

  const mainRecommendations = results.recommendations.slice(0, 3);
  const additionalRecommendations = results.recommendations.slice(3);

  const handleProductClick = (product: Product, source: string) => {
    const isAmazon = product.source === 'amazon' || product.merchant?.toLowerCase().includes('amazon') || !!product.asin;
    trackClick({
      type: isAmazon ? 'amazon_outbound_click' : (product.affiliateUrl ? 'affiliate_click' : 'product_click'),
      productId: product.id,
      asin: product.asin,
      source,
      occasion: inputs.customOccasion || inputs.occasion,
      budget: inputs.customBudget || inputs.budget
    });

    const targetUrl = product.affiliateUrl || product.productUrl;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const getBadgeStyle = (matchLabel: string) => {
    switch (matchLabel) {
      case 'Excellent Match':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Great Match':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Good Match':
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  const getTierHeading = (type: string) => {
    switch (type) {
      case 'best_match':
        return {
          label: 'BEST MATCH',
          tagline: 'Optimal balance of personality, budget, and milestone significance',
          chipColor: 'bg-rose-700 text-white'
        };
      case 'emotional_choice':
        return {
          label: 'EMOTIONAL CHOICE',
          tagline: 'Deep sentimental resonance crafted to evoke authentic feeling',
          chipColor: 'bg-pink-700 text-white'
        };
      case 'budget_premium_alternative':
        return {
          label: 'SMART ALTERNATIVE',
          tagline: 'Priced for strategic value or elevated milestone luxury',
          chipColor: 'bg-stone-800 text-white'
        };
      default:
        return {
          label: 'RECOMMENDED IDEA',
          tagline: 'Hand-curated candidate matching your criteria',
          chipColor: 'bg-stone-700 text-white'
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/90 text-rose-900 text-xs font-semibold mb-4 border border-rose-200">
          <Sparkles className="w-3.5 h-3.5 text-rose-700" />
          <span>Curated by Perfect Gift AI</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
          We Found Some Gifts They'll Love 🎁
        </h1>

        {/* Input Summary Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-700 shadow-2xs">
            Recipient: <span className="font-bold text-stone-900">{inputs.customRecipient || inputs.recipient}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-700 shadow-2xs">
            Occasion: <span className="font-bold text-stone-900">{inputs.customOccasion || inputs.occasion}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-700 shadow-2xs">
            Budget: <span className="font-bold text-stone-900">{inputs.customBudget ? `₹${inputs.customBudget}` : inputs.budget}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-700 shadow-2xs">
            Emotion: <span className="font-bold text-stone-900">{inputs.desiredReaction.split('/')[0]}</span>
          </div>
          <button
            onClick={onStartNewSearch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
            title="Refine inputs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Refine Criteria</span>
          </button>
        </div>

        {/* Amazon Integration / Demo Mode Notice */}
        {results.amazonNotice && (
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium shadow-2xs">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{results.amazonNotice}</span>
          </div>
        )}

        {/* Generated Amazon Search Queries */}
        {results.generatedQueries && results.generatedQueries.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-stone-500">
            <span className="font-semibold text-stone-700">Search Queries Generated:</span>
            {results.generatedQueries.map((q, qIdx) => (
              <span key={qIdx} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-mono text-[10px]">
                "{q}"
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main 3 Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {mainRecommendations.map((rec, idx) => {
          const tier = getTierHeading(rec.recommendationType);
          const isSaved = savedProductIds.includes(rec.product.id);
          const isTooltipOpen = activeScoreTooltip === rec.product.id;
          const isAmazon = rec.product.source === 'amazon' || rec.product.merchant?.toLowerCase().includes('amazon') || !!rec.product.asin;

          return (
            <div
              key={rec.product.id}
              className={`bg-white rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative shadow-xs hover:shadow-lg ${
                idx === 0
                  ? 'border-rose-300 ring-2 ring-rose-700/10'
                  : 'border-stone-200'
              }`}
            >
              {/* Card Header Tag */}
              <div className="p-6 pb-4 border-b border-stone-100">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${tier.chipColor}`}>
                    {tier.label}
                  </span>

                  {/* Score pill with breakdown tooltip */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveScoreTooltip(isTooltipOpen ? null : rec.product.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${getBadgeStyle(
                        rec.matchLabel
                      )}`}
                    >
                      <span>{rec.matchLabel}</span>
                      <Info className="w-3 h-3 opacity-70" />
                    </button>

                    {/* Breakdown Tooltip */}
                    {isTooltipOpen && (
                      <div className="absolute right-0 top-8 z-30 w-64 p-3.5 bg-stone-900 text-white rounded-2xl shadow-xl text-xs space-y-2 border border-stone-700 animate-in fade-in duration-150">
                        <div className="font-semibold text-stone-200 border-b border-stone-800 pb-1 flex justify-between">
                          <span>Internal Matching Profile</span>
                          <span className="text-rose-400 font-bold">{rec.score}/100</span>
                        </div>
                        <div className="space-y-1 text-stone-300">
                          <div className="flex justify-between">
                            <span>Budget Match (max 25):</span>
                            <span className="font-semibold">{rec.scoreBreakdown.budgetMatch} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Occasion Match (max 20):</span>
                            <span className="font-semibold">{rec.scoreBreakdown.occasionMatch} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Personality Match (max 20):</span>
                            <span className="font-semibold">{rec.scoreBreakdown.personalityMatch} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Interests Match (max 15):</span>
                            <span className="font-semibold">{rec.scoreBreakdown.interestMatch} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Relationship Match (max 10):</span>
                            <span className="font-semibold">{rec.scoreBreakdown.relationshipMatch} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Reaction Match (max 10):</span>
                            <span className="font-semibold">{rec.scoreBreakdown.emotionalReactionMatch} pts</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[12px] text-stone-500 font-sans">{tier.tagline}</p>
              </div>

              {/* Product Visual & Badges */}
              <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                <img
                  src={rec.product.imageUrl}
                  alt={rec.product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                    {isAmazon && <span className="text-amber-400">★</span>}
                    <span>{rec.product.merchant}</span>
                  </span>
                  {rec.product.isDemo && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-stone-950 text-[10px] font-bold">
                      Demo Catalog
                    </span>
                  )}
                </div>

                <button
                  id={`save-btn-${rec.product.id}`}
                  onClick={() => onToggleSave(rec.product)}
                  className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-colors ${
                    isSaved
                      ? 'bg-rose-700 text-white shadow-md'
                      : 'bg-white/85 text-stone-700 hover:text-rose-700 hover:bg-white'
                  }`}
                  title={isSaved ? 'Remove from Saved' : 'Save for Later'}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>

                {/* Price Display: Accurate / No Guessing */}
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md text-stone-900 text-sm font-bold shadow-xs">
                  {rec.product.isPriceAvailable !== false && rec.product.price > 0
                    ? `₹${rec.product.price.toLocaleString('en-IN')}`
                    : 'Information unavailable'}
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Rating & Reviews: Accurate / No Guessing */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold mb-2">
                    {rec.product.isRatingAvailable !== false && rec.product.rating > 0 ? (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{rec.product.rating}</span>
                        <span className="text-stone-400">
                          {rec.product.isReviewCountAvailable !== false && rec.product.reviewCount > 0
                            ? `(${rec.product.reviewCount.toLocaleString('en-IN')} reviews)`
                            : '(Reviews: Information unavailable)'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-stone-400 text-[11px]">Rating: Information unavailable</span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-3 leading-snug">
                    {rec.product.name}
                  </h3>

                  {/* AI Explanation Callout */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-stone-800 space-y-2 mb-4">
                    <div className="font-bold text-rose-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-700" />
                      <span>Why We Picked This:</span>
                    </div>
                    <p className="leading-relaxed font-sans">{rec.whySelected}</p>
                  </div>

                  {/* Key Features from DB / Amazon */}
                  <div className="space-y-1.5 mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Verified Highlights:
                    </p>
                    {rec.keyFeatures.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-stone-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {rec.product.lastCheckedAt && (
                    <p className="text-[11px] text-stone-400 mb-3">
                      Last checked: {new Date(rec.product.lastCheckedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                {/* Actions & Personalization */}
                <div className="space-y-2.5 pt-4 border-t border-stone-100">
                  <button
                    id={`view-gift-btn-${rec.product.id}`}
                    onClick={() => handleProductClick(rec.product, `results_${rec.recommendationType}`)}
                    className={`w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors ${
                      isAmazon
                        ? 'bg-[#e47911] hover:bg-[#d66a06]'
                        : 'bg-rose-700 hover:bg-rose-800'
                    }`}
                  >
                    <span>{isAmazon ? 'View on Amazon' : `View on ${rec.product.merchant}`}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenPersonalization(rec.product, 'message')}
                      className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5 text-rose-700" />
                      <span>Write Message</span>
                    </button>

                    <button
                      onClick={() => onOpenPersonalization(rec.product, 'bundle')}
                      className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5 text-rose-700" />
                      <span>Create Bundle</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* "See More Gift Ideas" section */}
      {additionalRecommendations.length > 0 && (
        <div className="pt-10 border-t border-stone-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                More Gift Ideas for Your {inputs.customRecipient || inputs.recipient}
              </h2>
              <p className="text-sm text-stone-600 mt-0.5">
                Additional items from our verified catalog meeting your budget and category preferences.
              </p>
            </div>

            <button
              id="toggle-all-ideas-btn"
              onClick={() => setShowAllIdeas(!showAllIdeas)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors shadow-2xs"
            >
              <span>{showAllIdeas ? 'Show Fewer' : `View All (${additionalRecommendations.length})`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllIdeas ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(showAllIdeas ? additionalRecommendations : additionalRecommendations.slice(0, 4)).map(item => {
              const isSaved = savedProductIds.includes(item.product.id);
              return (
                <div
                  key={item.product.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-4/3 bg-stone-100">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => onToggleSave(item.product)}
                      className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-colors ${
                        isSaved ? 'bg-rose-700 text-white' : 'bg-white/80 text-stone-700 hover:text-rose-700'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[11px] font-bold">
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                        <span>{item.product.merchant}</span>
                        {item.product.isRatingAvailable !== false && item.product.rating > 0 && (
                          <span className="text-amber-600 font-semibold">{item.product.rating}★</span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-2 mb-2">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-2 mb-3">
                        {item.whySelected}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => handleProductClick(item.product, 'more_ideas')}
                        className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
                      >
                        <span>{item.product.source === 'amazon' ? 'View on Amazon' : 'View Item'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onOpenPersonalization(item.product, 'message')}
                        className="text-[11px] text-stone-500 hover:text-stone-900"
                      >
                        Gift Message
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Required Amazon Affiliate Disclosure */}
      <div className="mt-16 pt-8 border-t border-stone-200 text-center max-w-3xl mx-auto space-y-2">
        <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
          Affiliate & Marketplace Transparency Disclosure
        </p>
        <p className="text-xs text-stone-500 leading-relaxed font-sans">
          As an Amazon Associate, Perfect Gift AI earns from qualifying purchases at no additional cost to you. Product prices, ratings, and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon.in at the time of purchase will apply to the purchase of this product.
        </p>
        <p className="text-[11px] text-stone-400">
          Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
        </p>
      </div>
    </div>
  );
};
