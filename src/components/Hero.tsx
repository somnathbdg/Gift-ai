import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Zap, Gift, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onStartFinder: (prefill?: any) => void;
  onScrollToHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartFinder, onScrollToHowItWorks }) => {
  const quickIdeas = [
    { label: 'Anniversary for Wife', recipient: 'Wife', occasion: 'Anniversary', budget: '₹2,000–₹5,000' },
    { label: 'Birthday for Mom', recipient: 'Mom', occasion: 'Birthday', budget: '₹1,000–₹2,000' },
    { label: 'Tech Gifts for Dad', recipient: 'Dad', occasion: 'Father\'s Day', budget: '₹2,000–₹5,000' },
    { label: 'Budget Under ₹1,000', recipient: 'Friend', occasion: 'Birthday', budget: '₹500–₹1,000' }
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-stone-100/70 via-stone-50 to-stone-100/50">
      {/* Subtle decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-rose-200/30 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200/80 text-rose-900 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-rose-700" />
          <span>Personalized AI Gift Concierge</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15] max-w-4xl mx-auto mb-6">
          Find a Gift They'll <span className="text-rose-700 italic font-serif">Actually</span> Love.
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-stone-700 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
          Tell us who you're buying for, what they're like, and your budget. Our AI will find thoughtful gift ideas for you.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            id="hero-primary-cta"
            onClick={() => onStartFinder()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-base shadow-lg shadow-rose-900/20 hover:shadow-xl hover:shadow-rose-900/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <Gift className="w-5 h-5 text-rose-200" />
            Find My Perfect Gift
            <ArrowRight className="w-4 h-4 text-rose-200" />
          </button>

          <button
            id="hero-secondary-cta"
            onClick={onScrollToHowItWorks}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 font-medium text-base border border-stone-300 hover:border-stone-400 shadow-sm transition-all"
          >
            How It Works
          </button>
        </div>

        {/* Quick Start Pills */}
        <div className="inline-flex flex-col items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Quick start by popular discovery:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickIdeas.map((idea, idx) => (
              <button
                key={idx}
                onClick={() => onStartFinder(idea)}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-900 border border-stone-200 hover:border-rose-300 text-xs font-medium shadow-2xs transition-all hover:scale-105"
              >
                {idea.label} →
              </button>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-10 border-t border-stone-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-200/70 flex items-center justify-center shrink-0 mt-0.5 text-stone-800">
              <ShieldCheck className="w-4 h-4 text-rose-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Verified Catalog</p>
              <p className="text-[12px] text-stone-600">Zero fake specs or fabricated pricing.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-200/70 flex items-center justify-center shrink-0 mt-0.5 text-stone-800">
              <HeartHandshake className="w-4 h-4 text-rose-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Emotional Match</p>
              <p className="text-[12px] text-stone-600">Scores personality, sentiment & occasion.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-200/70 flex items-center justify-center shrink-0 mt-0.5 text-stone-800">
              <Zap className="w-4 h-4 text-rose-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Instant Concierge</p>
              <p className="text-[12px] text-stone-600">3 perfect choices in under 60 seconds.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-200/70 flex items-center justify-center shrink-0 mt-0.5 text-stone-800">
              <CheckCircle2 className="w-4 h-4 text-rose-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Complete Gifting</p>
              <p className="text-[12px] text-stone-600">Cards, custom messages & surprise ideas.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
