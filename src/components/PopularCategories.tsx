import React from 'react';
import { Sparkles, Gem, Coffee, Headphones, HeartPulse, BookOpen, Trees, Compass, ArrowRight } from 'lucide-react';

interface PopularCategoriesProps {
  onSelectCategory: (category: string) => void;
}

export const PopularCategories: React.FC<PopularCategoriesProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      name: 'Personalized Items',
      description: 'Engraved keepsakes, star maps & custom art',
      icon: Sparkles,
      color: 'bg-rose-100 text-rose-800'
    },
    {
      name: 'Fashion & Jewelry',
      description: '925 silver pendants, silk scarves & leather',
      icon: Gem,
      color: 'bg-pink-100 text-pink-800'
    },
    {
      name: 'Food & Gourmet',
      description: 'Artisanal chocolates, pour-over coffees & teas',
      icon: Coffee,
      color: 'bg-amber-100 text-amber-900'
    },
    {
      name: 'Technology',
      description: 'Smart speakers, Kindle paperwhites & audio',
      icon: Headphones,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Wellness',
      description: 'Ayurvedic hampers, diffusers & botanical care',
      icon: HeartPulse,
      color: 'bg-emerald-100 text-emerald-800'
    },
    {
      name: 'Books & Stationery',
      description: 'Hardcover bestsellers, Italian leather journals',
      icon: BookOpen,
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      name: 'Home Decor',
      description: 'Brass lamps, bonsai trees & aromatic candles',
      icon: Trees,
      color: 'bg-stone-200 text-stone-800'
    },
    {
      name: 'Experiences',
      description: 'Pottery masterclasses & gourmet tasting tours',
      icon: Compass,
      color: 'bg-teal-100 text-teal-800'
    }
  ];

  return (
    <section className="py-20 bg-stone-100/40 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
            Curated Taxonomy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2 tracking-tight">
            Explore by Gift Category
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            Every product in our store is hand-curated from verified merchants with real pricing in INR.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectCategory(cat.name)}
                className="group p-6 rounded-2xl bg-white border border-stone-200 hover:border-rose-300 hover:shadow-md transition-all text-left flex items-start gap-4 hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 mt-3 group-hover:gap-1.5 transition-all">
                    <span>Browse gifts</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
