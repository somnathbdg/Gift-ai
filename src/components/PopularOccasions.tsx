import React from 'react';
import { Cake, Sparkles, Heart, Flower2, Briefcase, Home, Flame, PartyPopper, ArrowRight } from 'lucide-react';

interface PopularOccasionsProps {
  onSelectOccasion: (occasion: string) => void;
  onNavigateToSeo: (occasion: string) => void;
}

export const PopularOccasions: React.FC<PopularOccasionsProps> = ({ onSelectOccasion, onNavigateToSeo }) => {
  const occasions = [
    {
      name: 'Birthday',
      subtitle: 'Celebrations made unforgettable',
      count: '18 curated items',
      icon: Cake,
      color: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      name: 'Anniversary',
      subtitle: 'Milestones of love and devotion',
      count: '14 curated items',
      icon: Heart,
      color: 'bg-pink-50 text-pink-700 border-pink-200'
    },
    {
      name: 'Valentine\'s Day',
      subtitle: 'Heartfelt gestures & keepsakes',
      count: '12 curated items',
      icon: Sparkles,
      color: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      name: 'Mother\'s Day',
      subtitle: 'Pampering and gratitude gifts',
      count: '11 curated items',
      icon: Flower2,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      name: 'Father\'s Day',
      subtitle: 'Practical, tech, and heritage',
      count: '10 curated items',
      icon: Briefcase,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      name: 'Housewarming',
      subtitle: 'Living plants and brass decor',
      count: '9 curated items',
      icon: Home,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      name: 'Diwali & Festive',
      subtitle: 'Gourmet sweets and light decor',
      count: '15 curated items',
      icon: Flame,
      color: 'bg-orange-50 text-orange-800 border-orange-200'
    },
    {
      name: 'Just Because',
      subtitle: 'Unexpected moments of joy',
      count: '22 curated items',
      icon: PartyPopper,
      color: 'bg-blue-50 text-blue-800 border-blue-200'
    }
  ];

  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Celebration Hub
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2 tracking-tight">
              Popular Gifting Occasions
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-1">
              Select an upcoming celebration to launch the tailored AI concierge or explore curated gifts.
            </p>
          </div>
          <button
            onClick={() => onSelectOccasion('Birthday')}
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 hover:text-rose-800"
          >
            <span>View All Occasions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Featured Popular Category Hubs - Crawlable Navigation Links */}
        <div className="mb-8 p-4 rounded-2xl bg-white border border-stone-200/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Top Curated Guides:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href="/birthday-gifts"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToSeo('birthday-gifts');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Cake className="w-3.5 h-3.5 text-rose-700" />
              <span>Birthday Gifts</span>
            </a>
            <a
              href="/gifts-for-wife"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToSeo('gifts-for-wife');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-pink-700" />
              <span>Gifts for Wife</span>
            </a>
            <a
              href="/gifts-for-husband"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToSeo('gifts-for-husband');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-700" />
              <span>Gifts for Husband</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {occasions.map((occ, idx) => {
            const Icon = occ.icon;
            const targetSlug = occ.name === 'Birthday' ? 'birthday-gifts'
              : occ.name === 'Anniversary' ? 'anniversary-gifts'
              : occ.name === "Mother's Day" ? 'gifts-for-mom'
              : occ.name === "Father's Day" ? 'gifts-for-dad'
              : occ.name.toLowerCase().replace(/\s+/g, '-');

            return (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all duration-200 text-left flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${occ.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-rose-900 transition-colors">
                    {occ.name}
                  </h3>

                  <p className="text-xs text-stone-500 mt-1 mb-2">
                    {occ.subtitle}
                  </p>

                  <span className="inline-block text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                    {occ.count}
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectOccasion(occ.name)}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
                  >
                    <span>Find Gift</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <a
                    href={`/${targetSlug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateToSeo(targetSlug);
                    }}
                    className="text-[11px] text-stone-500 hover:text-rose-900 font-medium transition-colors"
                  >
                    Browse Guide →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
