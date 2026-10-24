import React, { useEffect, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  Bookmark,
  Gift,
  CheckCircle2,
  Heart,
  Clock,
  ChevronRight,
  ShieldCheck,
  Compass,
  Star
} from 'lucide-react';
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
  const normalizedSlug = (slug || '').toLowerCase().replace(/^\/+|\/+$/g, '');

  // Determine specific page content and SEO metadata based on URL slug and props
  const pageMeta = useMemo(() => {
    // 1. Birthday Gifts (/birthday-gifts or birthday)
    if (normalizedSlug === 'birthday-gifts' || normalizedSlug.includes('birthday') || occasion?.toLowerCase() === 'birthday') {
      return {
        slug: 'birthday-gifts',
        canonicalUrl: 'https://shop.todkart.com/birthday-gifts',
        seoTitle: 'Birthday Gifts: Unique, Thoughtful & Handpicked Ideas | Perfect Gift AI',
        metaDescription: 'Discover memorable birthday gifts tailored to friends, family, and loved ones. Explore handpicked tech gadgets, personalized keepsakes, and artisanal gift sets.',
        h1: 'Thoughtful Birthday Gifts Curated for Every Personality & Budget',
        eyebrow: 'Birthday Curations',
        subheading: 'Celebrate another trip around the sun with personalized star maps, smart gadgets, artisanal treats, and memorable keepsakes designed to make their day truly unforgettable.',
        introTitle: 'How to Choose the Perfect Birthday Gift',
        introParagraphs: [
          'Finding a birthday gift that feels genuinely personal doesn\'t have to be overwhelming. The most memorable presents align with the recipient\'s everyday rituals, hobbies, or milestone moments rather than fleeting trends.',
          'Whether you\'re celebrating a milestone year (like an 18th, 30th, or 50th) or surprising a close colleague or friend, focusing on high-utility items or custom personalized keepsakes ensures your gift will be cherished and put to use immediately.'
        ],
        guidePoints: [
          {
            title: 'Milestone Celebrations',
            text: 'For landmark birthdays, consider bespoke keepsakes like custom engraved acrylic frames, retro photo books, or premium audio gear that mark the occasion with lasting elegance.'
          },
          {
            title: 'Everyday Passion & Lifestyle',
            text: 'Look at what brings them daily joy—from pour-over coffee kits and smart wireless chargers to botanical relaxation sets and best-selling book collections.'
          },
          {
            title: 'Sensory Unboxing Experience',
            text: 'Elevate any gift by adding a heartfelt handwritten note or artisanal companion treat using our free AI Message Studio and gift card generators.'
          }
        ],
        recipientTarget: 'Friend',
        occasionTarget: 'Birthday'
      };
    }

    // 2. Gifts for Wife (/gifts-for-wife or wife)
    if (normalizedSlug === 'gifts-for-wife' || normalizedSlug.includes('wife') || recipient?.toLowerCase() === 'wife') {
      return {
        slug: 'gifts-for-wife',
        canonicalUrl: 'https://shop.todkart.com/gifts-for-wife',
        seoTitle: 'Best Gifts for Wife: Meaningful, Romantic & Luxury Ideas | Perfect Gift AI',
        metaDescription: 'Celebrate your wife with gifts that speak to her heart. Browse curated fine jewelry, personalized anniversary keepsakes, pampering wellness hampers, and luxury home accents.',
        h1: 'Meaningful Gifts for Your Wife: Romantic, Personalized & Luxury Keepsakes',
        eyebrow: 'Curated for Wives & Partners',
        subheading: 'Show her how deeply she is cherished with handpicked anniversary, birthday, and milestone gifts chosen for their emotional resonance, fine craftsmanship, and timeless beauty.',
        introTitle: 'Thoughtful Ways to Delight Your Wife on Any Special Occasion',
        introParagraphs: [
          'The most meaningful gifts for your wife are those that demonstrate you notice the subtle details of her life—her favorite rituals, shared memories from your journey together, and the small comforts she rarely buys for herself.',
          'From delicate 925 sterling silver interlocking jewelry to personalized celestial night lights marking your special date, our hand-verified collection balances romance with premium quality.'
        ],
        guidePoints: [
          {
            title: 'Cherished Milestones',
            text: 'Honor your love story with bespoke star map lights, customized book-style memory frames, or engraved jewelry that represents your enduring bond.'
          },
          {
            title: 'Rest & Everyday Pampering',
            text: 'Give the gift of true relaxation with luxury botanical reed diffusers, rich Ayurvedic body elixirs, and soothing aromatherapy accents.'
          },
          {
            title: 'Add a Heartfelt Message',
            text: 'Pair her gift with a sincere personal message. Our AI Gift Message Studio crafts emotional, romantic sentiments that articulate your gratitude perfectly.'
          }
        ],
        recipientTarget: 'Wife',
        occasionTarget: 'Anniversary'
      };
    }

    // 3. Gifts for Husband (/gifts-for-husband or husband)
    if (normalizedSlug === 'gifts-for-husband' || normalizedSlug.includes('husband') || recipient?.toLowerCase() === 'husband') {
      return {
        slug: 'gifts-for-husband',
        canonicalUrl: 'https://shop.todkart.com/gifts-for-husband',
        seoTitle: 'Best Gifts for Husband: Tech, Practical & Thoughtful Ideas | Perfect Gift AI',
        metaDescription: 'Find gifts your husband will actually use and love. Handpicked wireless chargers, rugged travel organizers, pour-over coffee sets, and timeless accessories.',
        h1: 'Top Gifts for Husband: Practical Tech, Premium Essentials & Unique Ideas',
        eyebrow: 'Curated for Husbands & Partners',
        subheading: 'From high-utility multi-device chargers and RFID-blocking leather wallets to artisanal coffee gear, explore gifts he will appreciate and use every single day.',
        introTitle: 'Finding a Gift Your Husband Will Truly Appreciate',
        introParagraphs: [
          'Most men value gifts that combine durable craftsmanship with genuine everyday utility. Instead of generic novelties that end up forgotten in a drawer, the best gifts for husbands solve daily frustrations or elevate his favorite downtime activities.',
          'Whether he is a gadget enthusiast, frequent business traveler, fitness lover, or coffee connoisseur, our catalog features verified products with reliable reviews and direct merchant fulfillment.'
        ],
        guidePoints: [
          {
            title: 'Everyday Tech Upgrades',
            text: 'High-speed wireless desk charging stands, compact GaN wall chargers, and magnetic power banks keep his essential devices powered seamlessly.'
          },
          {
            title: 'Timeless Leather & Travel Gear',
            text: 'Refined RFID-protected bifold wallets, personalized leather passport covers, and memory foam travel pillows built for comfort and longevity.'
          },
          {
            title: 'Downtime & Lifestyle Essentials',
            text: 'Specialty coffee accessories, ergonomic grooming kits, and acoustic Bluetooth beanies that complement his personal interests.'
          }
        ],
        recipientTarget: 'Husband',
        occasionTarget: 'Birthday'
      };
    }

    // 4. Gifts for Mom
    if (normalizedSlug.includes('mom') || recipient?.toLowerCase() === 'mom') {
      return {
        slug: 'gifts-for-mom',
        canonicalUrl: 'https://shop.todkart.com/gifts-for-mom',
        seoTitle: 'Heartfelt Gifts for Mom to Show Your Love | Perfect Gift AI',
        metaDescription: 'Pampering Ayurvedic skincare sets, bonsai trees, and customized keepsake maps that express deep gratitude.',
        h1: 'Heartfelt Gifts for Mom to Show Your Gratitude and Love',
        eyebrow: 'Curated for Mothers',
        subheading: 'Express deep gratitude with pampering wellness hampers, personalized family photo keepsakes, and soothing home accents.',
        introTitle: 'Meaningful Ways to Celebrate Mom',
        introParagraphs: [
          'Moms give endlessly to everyone around them. The most touching gifts give back moments of comfort, peace, and tangible appreciation for everything she does.'
        ],
        guidePoints: [
          { title: 'Relaxation & Spa', text: 'Herbal tea gift sets, scented luxury candles, and rejuvenating hand creams.' },
          { title: 'Family Keepsakes', text: 'Customized multi-photo frames and sentimental engraved plaques she will display with pride.' }
        ],
        recipientTarget: 'Mom',
        occasionTarget: "Mother's Day"
      };
    }

    // 5. Gifts for Dad
    if (normalizedSlug.includes('dad') || recipient?.toLowerCase() === 'dad') {
      return {
        slug: 'gifts-for-dad',
        canonicalUrl: 'https://shop.todkart.com/gifts-for-dad',
        seoTitle: 'Practical, Tech & Classic Gifts for Dad | Perfect Gift AI',
        metaDescription: 'High-utility devices, Kindle paperwhites, and specialty brewing gear built to last.',
        h1: 'Practical, Tech & Classic Gifts for Dad That He Will Use Daily',
        eyebrow: 'Curated for Fathers',
        subheading: 'High-utility devices, rugged accessories, and premium brewing gear built for reliability.',
        introTitle: 'Thoughtful Gifts Dad Will Actually Use',
        introParagraphs: [
          'Choose gifts with durable build quality and clear everyday function that make his routines easier and more enjoyable.'
        ],
        guidePoints: [
          { title: 'Everyday Utility', text: 'Multi-tools, ergonomic wallets, and dependable fast chargers.' },
          { title: 'Hobbies & Relaxing', text: 'Bestselling boxed book sets and coffee brewing accessories.' }
        ],
        recipientTarget: 'Dad',
        occasionTarget: "Father's Day"
      };
    }

    // 6. Generic / Fallback
    return {
      slug: normalizedSlug || 'curated-gifts',
      canonicalUrl: `https://shop.todkart.com/${normalizedSlug}`,
      seoTitle: 'Curated Gift Ideas & Personalized Recommendations | Perfect Gift AI',
      metaDescription: 'Discover personalized gift ideas with Perfect Gift AI. Verified merchant pricing, real customer reviews, and intelligent AI gift finding.',
      h1: 'Curated Gift Ideas for Special Moments and Loved Ones',
      eyebrow: 'Curated Collection',
      subheading: 'Explore hand-selected items from verified merchants with real prices, verified availability, and instant personalization.',
      introTitle: 'Personalized Gifting Made Effortless',
      introParagraphs: [
        'Explore our catalog of verified gifts matched to authentic relationships, occasions, and individual personalities.'
      ],
      guidePoints: [],
      recipientTarget: recipient || 'Partner',
      occasionTarget: occasion || 'Birthday'
    };
  }, [normalizedSlug, recipient, occasion, budget]);

  // Update dynamic document metadata (Title, Meta Description, Canonical URL, OpenGraph, JSON-LD)
  useEffect(() => {
    // 1. Title
    document.title = pageMeta.seoTitle;

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', pageMeta.metaDescription);

    // 3. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageMeta.canonicalUrl);

    // 4. OpenGraph tags
    const updateOg = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOg('og:title', pageMeta.seoTitle);
    updateOg('og:description', pageMeta.metaDescription);
    updateOg('og:url', pageMeta.canonicalUrl);
    updateOg('og:type', 'website');

    // 5. Schema.org JSON-LD Structured Data
    const scriptId = 'seo-category-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageMeta.h1,
      description: pageMeta.metaDescription,
      url: pageMeta.canonicalUrl,
      publisher: {
        '@type': 'Organization',
        name: 'Perfect Gift AI',
        url: 'https://shop.todkart.com/'
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: products
          .filter(p => p.status === 'active')
          .slice(0, 10)
          .map((p, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              name: p.name,
              description: p.description,
              image: p.imageUrl,
              offers: {
                '@type': 'Offer',
                price: p.price,
                priceCurrency: p.currency || 'INR',
                availability: 'https://schema.org/InStock',
                url: p.affiliateUrl || p.productUrl
              }
            }
          }))
      }
    };

    scriptTag.textContent = JSON.stringify(structuredData);

    return () => {
      // Cleanup custom JSON-LD when leaving page
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, [pageMeta, products]);

  // Filter matching products with strict relevance for this category
  const matchingProducts = useMemo(() => {
    return products.filter(p => {
      if (p.status !== 'active') return false;

      // Birthday Gifts
      if (pageMeta.slug === 'birthday-gifts') {
        const matchesOccasion = p.occasions && p.occasions.some(o => o.toLowerCase().includes('birthday'));
        const matchesCategory = p.category?.toLowerCase().includes('birthday') || p.tags?.some(t => t.toLowerCase().includes('birthday'));
        return matchesOccasion || matchesCategory;
      }

      // Gifts for Wife
      if (pageMeta.slug === 'gifts-for-wife') {
        const matchesRel = p.relationships && p.relationships.some(r => ['wife', 'partner', 'her', 'women', 'couple'].includes(r.toLowerCase()));
        const matchesOcc = p.occasions && p.occasions.some(o => ['anniversary', "valentine's day", 'birthday'].includes(o.toLowerCase()));
        return matchesRel || matchesOcc;
      }

      // Gifts for Husband
      if (pageMeta.slug === 'gifts-for-husband') {
        const matchesRel = p.relationships && p.relationships.some(r => ['husband', 'partner', 'him', 'men', 'father'].includes(r.toLowerCase()));
        const matchesOcc = p.occasions && p.occasions.some(o => ['anniversary', 'birthday', "father's day"].includes(o.toLowerCase()));
        return matchesRel || matchesOcc;
      }

      // General props-based filter
      if (recipient && p.relationships && p.relationships.some(r => r.toLowerCase() === recipient.toLowerCase())) return true;
      if (occasion && p.occasions && p.occasions.some(o => o.toLowerCase() === occasion.toLowerCase())) return true;

      return true;
    }).slice(0, 16);
  }, [products, pageMeta.slug, recipient, occasion]);

  const handleProductClick = (product: Product) => {
    trackClick({
      type: product.affiliateUrl ? 'affiliate_click' : 'product_click',
      productId: product.id,
      asin: product.asin,
      source: `seo_${pageMeta.slug}`,
      occasion: occasion || pageMeta.occasionTarget,
      budget
    });

    const target = product.affiliateUrl || product.productUrl;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const handleInternalNav = (targetSlug: string, params: any = {}) => {
    onNavigateSeo(targetSlug, params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Crawlable Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-xs text-stone-500 font-medium">
          <li>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleInternalNav('home');
              }}
              className="text-stone-600 hover:text-rose-700 transition-colors"
            >
              Home
            </a>
          </li>
          <li>
            <ChevronRight className="w-3 h-3 text-stone-400" />
          </li>
          <li className="text-rose-900 font-semibold truncate max-w-xs sm:max-w-md">
            {pageMeta.h1}
          </li>
        </ol>
      </nav>

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-rose-700" />
          <span>{pageMeta.eyebrow}</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
          {pageMeta.h1}
        </h1>

        <p className="text-base sm:text-lg text-stone-600 mt-4 leading-relaxed font-sans max-w-3xl mx-auto">
          {pageMeta.subheading}
        </p>

        {/* Dynamic CTA Launching AI Wizard with prefilled context */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() =>
              onStartFinderWithPrefill({
                recipient: recipient || pageMeta.recipientTarget,
                occasion: occasion || pageMeta.occasionTarget,
                budget
              })
            }
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Gift className="w-4 h-4 text-rose-200" />
            <span>Launch AI Concierge for {recipient || pageMeta.recipientTarget}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editorial Gifting Advice Box (Unique to each category page) */}
      {pageMeta.introParagraphs.length > 0 && (
        <section className="mb-14 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center gap-2.5 text-rose-800 font-semibold text-xs uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4 text-rose-700" />
            <span>Curator's Buying Guide</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-4 tracking-tight">
            {pageMeta.introTitle}
          </h2>

          <div className="space-y-3 text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
            {pageMeta.introParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {pageMeta.guidePoints && pageMeta.guidePoints.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
              {pageMeta.guidePoints.map((point, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{point.title}</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {point.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Curated Products Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Featured Verified Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Showing {matchingProducts.length} handpicked items with verified active links and real merchant prices
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Real Merchant Inventory</span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
        {matchingProducts.map(product => {
          const isSaved = savedProductIds.includes(product.id);
          const currencySymbol = product.currency === 'USD' ? '$' : '₹';
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
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
                  aria-label={isSaved ? 'Remove from saved' : 'Save gift idea'}
                  title={isSaved ? 'Remove from saved' : 'Save gift idea'}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-stone-900 text-xs font-bold shadow-xs">
                  {currencySymbol}{product.price.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span className="truncate max-w-[140px]">{product.category}</span>
                    {product.rating > 0 && (
                      <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {product.rating}
                      </span>
                    )}
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
                    className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 focus:outline-none"
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

      {/* Crawlable Related Gift Guides Hub (Uses semantic <a href="..."> links) */}
      <section className="pt-10 border-t border-stone-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">
          Explore Related Gift Guides:
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {[
            { label: 'Birthday Gifts', slug: 'birthday-gifts', occasion: 'Birthday' },
            { label: 'Gifts for Wife', slug: 'gifts-for-wife', recipient: 'Wife' },
            { label: 'Gifts for Husband', slug: 'gifts-for-husband', recipient: 'Husband' },
            { label: 'Gifts for Mom', slug: 'gifts-for-mom', recipient: 'Mom' },
            { label: 'Gifts for Dad', slug: 'gifts-for-dad', recipient: 'Dad' },
            { label: 'Anniversary Gifts', slug: 'anniversary-gifts', occasion: 'Anniversary' },
            { label: 'Gifts Under ₹1,000', slug: 'gifts-under-1000', budget: '₹500–₹1,000' },
            { label: 'Gifts Under ₹2,000', slug: 'gifts-under-2000', budget: '₹1,000–₹2,000' }
          ].map(hub => {
            const isCurrent = normalizedSlug === hub.slug;
            return (
              <a
                key={hub.slug}
                href={`/${hub.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleInternalNav(hub.slug, hub);
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'border-rose-300 bg-rose-50 text-rose-900 font-semibold'
                    : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-700 hover:text-rose-900 hover:border-stone-300'
                }`}
              >
                {hub.label} →
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
};
