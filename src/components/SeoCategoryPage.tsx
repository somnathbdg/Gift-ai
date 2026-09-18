import React from 'react';
import { Sparkles, ArrowRight, Star, ExternalLink, Bookmark, CheckCircle2, Gift } from 'lucide-react';
import { Product } from '../types';
import { trackClick } from '../services/api';

interface SeoCategoryPageProps {
  slug: string;
  recipient?: string;
  occasion?: string;
  budget?: string;
  products: Product[];
  savedProductIds: string[];
  onToggleSave: (product: Product) => void;
  onStartFinderWithPrefill: (prefill: { recipient?: string; occasion?: string; budget?: string }) => void;
  onOpenPersonalization: (product: Product) => void;
  onNavigateSeo: (slug: string, params?: any) => void;
}

export const SeoCategoryPage: React.FC<SeoCategoryPageProps> = ({
  slug,
  recipient,
  occasion,
  budget,
  products,
  savedProductIds,
  onToggleSave,
  onStartFinderWithPrefill,
  onOpenPersonalization,
  onNavigateSeo
}) => {
  // Derive page metadata based on slug
  const pageMeta = React.useMemo(() => {
    if (recipient === 'Wife' || slug.includes('wife')) {
      return {
        title: 'Meaningful & Romantic Gifts for Wife',
        eyebrow: 'Curated for Wives',
        subheading: 'Discover thoughtful anniversary, birthday, and milestone gifts chosen for their emotional impact and artisanal craftsmanship.',
        recipientTarget: 'Wife',
        occasionTarget: 'Anniversary'
      };
    }
    if (recipient === 'Husband' || slug.includes('husband')) {
      return {
        title: 'Thoughtful & Elevated Gifts for Husband',
        eyebrow: 'Curated for Husbands',
        subheading: 'From leather tech organizers to pour-over coffee sets, discover gifts he will genuinely cherish and use every day.',
        recipientTarget: 'Husband',
        occasionTarget: 'Birthday'
      };
    }
    if (recipient === 'Mom' || slug.includes('mom')) {
      return {
        title: 'Heartfelt Gifts for Mom to Show Your Love',
        eyebrow: 'Curated for Mothers',
        subheading: 'Pampering Ayurvedic skincare sets, bonsai trees, and customized keepsake maps that express deep gratitude.',
        recipientTarget: 'Mom',
        occasionTarget: 'Mother\'s Day'
      };
    }
    if (recipient === 'Dad' || slug.includes('dad')) {
      return {
        title: 'Practical, Tech & Classic Gifts for Dad',
        eyebrow: 'Curated for Fathers',
        subheading: 'High-utility devices, Kindle paperwhites, and specialty brewing gear built to last.',
        recipientTarget: 'Dad',
        occasionTarget: 'Father\'s Day'
      };
    }
    if (occasion === 'Birthday' || slug.includes('birthday')) {
      return {
        title: 'Handpicked Birthday Gifts for Every Personality',
        eyebrow: 'Birthday Curations',
        subheading: 'Celebrate another trip around the sun with personalized star maps, smart speakers, and gourmet chocolates.',
        recipientTarget: 'Friend',
        occasionTarget: 'Birthday'
      };
    }
    if (occasion === 'Anniversary' || slug.includes('anniversary')) {
      return {
        title: 'Timeless Anniversary Gifts to Celebrate Love',
        eyebrow: 'Anniversary Collection',
        subheading: 'Celebrate your shared milestones with 925 sterling silver jewelry, bespoke couple keepsakes, and romantic reveals.',
        recipientTarget: 'Partner',
        occasionTarget: 'Anniversary'
      };
    }
    if (budget || slug.includes('under')) {
      const bText = budget || (slug.includes('500') ? 'Under ₹500' : slug.includes('1000') ? 'Under ₹1,000' : 'Under ₹2,000');
      return {
        title: `Thoughtful Gifts ${bText} That Look Luxury`,
        eyebrow: 'High Value Gifting',
        subheading: 'Prove that meaningful gifting does not require overspending. Verified artisan gifts with maximum thoughtfulness.',
        recipientTarget: 'Friend',
        occasionTarget: 'Birthday'
      };
    }
    return {
      title: 'Curated Gifts for Special Moments',
      eyebrow: 'Perfect Gift AI Collection',
      subheading: 'Explore hand-selected items from verified Indian merchants with real prices and instant personalization.',
      recipientTarget: 'Partner',
      occasionTarget: 'Birthday'
    };
  }, [slug, recipient, occasion, budget]);

  // Filter products for this SEO view
  const matchingProducts = React.useMemo(() => {
    return products.filter(p => {
      if (p.status !== 'active') return false;
      if (recipient && p.relationships.some(r => r.toLowerCase() === recipient.toLowerCase())) return true;
      if (occasion && p.occasions.some(o => o.toLowerCase() === occasion.toLowerCase())) return true;
      if (budget) {
        if (budget.includes('500') && p.price <= 500) return true;
        if (budget.includes('1,000') && p.price <= 1000) return true;
        if (budget.includes('2,000') && p.price <= 2000) return true;
        if (budget.includes('5,000') && p.price <= 5000) return true;
      }
      return true;
    }).slice(0, 12);
  }, [products, recipient, occasion, budget]);

  const handleProductClick = (product: Product) => {
    trackClick({
      type: product.affiliateUrl ? 'affiliate_click' : 'product_click',
      productId: product.id,
      source: `seo_${slug}`,
      occasion: occasion || pageMeta.occasionTarget,
      budget
    });

    const target = product.affiliateUrl || product.productUrl;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Hero Header */}
      <div className="max-w-3xl mx-auto text-center mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-rose-700" />
          <span>{pageMeta.eyebrow}</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
          {pageMeta.title}
        </h1>

        <p className="text-base sm:text-lg text-stone-600 mt-4 leading-relaxed font-sans">
          {pageMeta.subheading}
        </p>

        {/* Dynamic CTA Launching Wizard */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() =>
              onStartFinderWithPrefill({
                recipient: recipient || pageMeta.recipientTarget,
                occasion: occasion || pageMeta.occasionTarget,
                budget
              })
            }
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-sm shadow-md transition-all"
          >
            <Gift className="w-4 h-4 text-rose-200" />
            <span>Launch AI Concierge for {recipient || pageMeta.recipientTarget}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
        {matchingProducts.map(product => {
          const isSaved = savedProductIds.includes(product.id);
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-semibold">
                  {product.merchant}
                </span>

                <button
                  onClick={() => onToggleSave(product)}
                  className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-colors ${
                    isSaved ? 'bg-rose-700 text-white' : 'bg-white/80 text-stone-700 hover:text-rose-700'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-stone-900 text-xs font-bold shadow-xs">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span>{product.category}</span>
                    <span className="text-amber-600 font-semibold">{product.rating}★</span>
                  </div>

                  <h3 className="font-serif font-bold text-stone-900 text-sm mb-1.5 line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => handleProductClick(product)}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
                  >
                    <span>View Deal</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onOpenPersonalization(product)}
                    className="text-xs text-stone-600 hover:text-stone-950 font-medium"
                  >
                    Personalize
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SEO Structured Data Callout & Related Hubs */}
      <div className="pt-10 border-t border-stone-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">
          Related Gift Guides:
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Gifts for Wife', slug: 'gifts-for-wife', recipient: 'Wife' },
            { label: 'Gifts for Husband', slug: 'gifts-for-husband', recipient: 'Husband' },
            { label: 'Gifts for Mom', slug: 'gifts-for-mom', recipient: 'Mom' },
            { label: 'Gifts for Dad', slug: 'gifts-for-dad', recipient: 'Dad' },
            { label: 'Birthday Gifts', slug: 'birthday-gifts', occasion: 'Birthday' },
            { label: 'Anniversary Gifts', slug: 'anniversary-gifts', occasion: 'Anniversary' },
            { label: 'Gifts Under ₹1,000', slug: 'gifts-under-1000', budget: '₹500–₹1,000' },
            { label: 'Gifts Under ₹2,000', slug: 'gifts-under-2000', budget: '₹1,000–₹2,000' }
          ].map(hub => (
            <button
              key={hub.slug}
              onClick={() => onNavigateSeo(hub.slug, hub)}
              className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white text-xs font-medium text-stone-700 hover:text-rose-900 transition-colors"
            >
              {hub.label} →
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
