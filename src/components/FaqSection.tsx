import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does Perfect Gift AI choose the gifts?',
      answer:
        'Instead of simple keyword matching, our engine analyzes your recipient’s personality, your relationship, the occasion, your budget, and the exact emotional reaction you want to evoke. We calculate an internal 6-factor score and select the optimal Best Match, an Emotional Choice, and a Budget/Upgrade alternative directly from our verified database.'
    },
    {
      question: 'Are the product prices and merchants real?',
      answer:
        'Yes. Unlike generic AI bots that invent hypothetical products or hallucinate arbitrary prices, Perfect Gift AI only recommends genuine catalog items from verified merchants (such as Ferns N Petals, Tata CliQ Luxury, Forest Essentials, Blue Tokai, Amazon, and verified artisans) with real prices in Indian Rupees (INR).'
    },
    {
      question: 'How does the affiliate commerce model work?',
      answer:
        'When you click to view or purchase a recommended item through our merchant links, we may earn a small affiliate commission at absolutely no extra cost to you. This helps keep our discovery engine free and independent.'
    },
    {
      question: 'How are gift recommendations curated and verified?',
      answer:
        'Perfect Gift AI evaluates gift ideas against multi-dimensional criteria including relationships, celebrations, personal interests, and budget parameters. All recommendations link directly to authentic merchant listings on Amazon, where real-time price, availability, and delivery options are confirmed at checkout.'
    },
    {
      question: 'Can I generate a personalized greeting card message?',
      answer:
        'Yes! After you discover a gift, open the Gift Message Studio to generate custom messages in various tones: Romantic, Emotional, Funny, Sweet, Formal, or Short. You can also design a digital gift card ready to print, share, or download.'
    },
    {
      question: 'How do you verify product availability and pricing?',
      answer:
        'Our catalog undergoes automated link and price verification checks to ensure items are active and in stock on verified merchant platforms such as Amazon, ensuring zero dead links or fabricated prices.'
    }
  ];

  return (
    <section className="py-20 bg-stone-100/60 border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-stone-600 mt-2 text-sm sm:text-base">
            Everything you need to know about our AI discovery concierge and verified product catalog.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none hover:bg-stone-50/70"
                >
                  <span className="font-serif font-bold text-base sm:text-lg text-stone-900">
                    {faq.question}
                  </span>
                  <span className="text-stone-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-rose-700" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-stone-600 leading-relaxed font-sans border-t border-stone-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
