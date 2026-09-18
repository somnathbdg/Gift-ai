import React from 'react';
import { Database, BrainCircuit, Gift, SlidersHorizontal, CheckCircle } from 'lucide-react';

export const WhyUs: React.FC = () => {
  const points = [
    {
      icon: Database,
      title: 'Verified Database Only',
      description:
        'We never hallucinate prices, fake reviews, or invent products that do not exist. Every single recommendation is grounded in real merchant inventory with clear INR pricing.'
    },
    {
      icon: BrainCircuit,
      title: 'Six-Dimensional AI Scoring',
      description:
        'Instead of crude keyword search, our engine weighs Budget Match (25%), Occasion (20%), Personality (20%), Interests (15%), Relationship (10%), and Desired Emotion (10%).'
    },
    {
      icon: Gift,
      title: 'Beyond Just Physical Items',
      description:
        'A great gift is an emotional experience. We help you generate personal enclosure messages, design printable digital gift cards, and formulate memorable surprise delivery plans.'
    },
    {
      icon: SlidersHorizontal,
      title: 'No Fake Precision',
      description:
        'We reject misleading gimmicks like "98.7% match". Instead, we provide transparent match tiers: Excellent Match, Great Match, and Good Match with clear written explanations.'
    }
  ];

  return (
    <section className="py-20 bg-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            The Perfect Gift Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-3 tracking-tight">
            Why Perfect Gift AI is Different
          </h2>
          <p className="text-stone-600 mt-2 text-sm sm:text-base">
            Engineered for thoughtful individuals who care about the emotional impact of giving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {points.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-sans">
                    {p.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
