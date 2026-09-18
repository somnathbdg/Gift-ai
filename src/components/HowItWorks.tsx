import React from 'react';
import { UserCheck, Sparkles, Gift, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onStartFinder: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartFinder }) => {
  const steps = [
    {
      number: '01',
      title: 'Tell Us About Them',
      description:
        'Share who you are celebrating, the occasion, their passions, their personality, and your budget. You can even mention the exact reaction you want to create.',
      icon: UserCheck,
      color: 'bg-rose-100 text-rose-800'
    },
    {
      number: '02',
      title: 'AI Evaluates Every Dimension',
      description:
        'Our algorithm evaluates genuine database products against six core criteria: budget compliance, occasion match, personality alignment, hobbies, relationship, and desired emotion.',
      icon: Sparkles,
      color: 'bg-amber-100 text-amber-900'
    },
    {
      number: '03',
      title: 'Receive 3 Curated Choices & Personalize',
      description:
        'Review your Best Match, an Emotional Choice, and a Smart Alternative. Then instantly craft a custom gift message, design a digital gift card, or explore a surprise reveal blueprint.',
      icon: Gift,
      color: 'bg-emerald-100 text-emerald-900'
    }
  ];

  return (
    <section id="how-it-works-section" className="py-20 bg-stone-100/50 border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Simple, Thoughtful Discovery
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-3 tracking-tight">
            How Perfect Gift AI Works
          </h2>
          <p className="text-base text-stone-600 mt-3">
            Say goodbye to generic top-10 lists and impersonal product grids. Gifting is an emotional experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-2xl p-8 border border-stone-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${step.color} shadow-xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-serif text-3xl font-bold text-stone-300">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-stone-600 leading-relaxed font-sans">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-semibold text-rose-700 flex items-center gap-1">
                  <span>Step {idx + 1} of 3</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onStartFinder}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold shadow-sm transition-all hover:gap-3"
          >
            <span>Try It Now for Your Recipient</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
