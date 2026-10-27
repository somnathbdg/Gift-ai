import React from 'react';
import { Gift, Heart, Shield, ExternalLink, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  const seoLinks = [
    { label: 'Gifts for Wife', slug: 'gifts-for-wife', recipient: 'Wife' },
    { label: 'Gifts for Husband', slug: 'gifts-for-husband', recipient: 'Husband' },
    { label: 'Gifts for Mom', slug: 'gifts-for-mom', recipient: 'Mom' },
    { label: 'Gifts for Dad', slug: 'gifts-for-dad', recipient: 'Dad' },
    { label: 'Gifts for Girlfriend', slug: 'gifts-for-girlfriend', recipient: 'Girlfriend' },
    { label: 'Gifts for Boyfriend', slug: 'gifts-for-boyfriend', recipient: 'Boyfriend' },
    { label: 'Gifts for Friend', slug: 'gifts-for-friend', recipient: 'Friend' },
    { label: 'Birthday Gifts', slug: 'birthday-gifts', occasion: 'Birthday' },
    { label: 'Anniversary Gifts', slug: 'anniversary-gifts', occasion: 'Anniversary' },
    { label: 'Gifts Under ₹500', slug: 'gifts-under-500', budget: 'Under ₹500' },
    { label: 'Gifts Under ₹1,000', slug: 'gifts-under-1000', budget: '₹500–₹1,000' },
    { label: 'Gifts Under ₹2,000', slug: 'gifts-under-2000', budget: '₹1,000–₹2,000' },
    { label: 'Gifts Under ₹5,000', slug: 'gifts-under-5000', budget: '₹2,000–₹5,000' }
  ];

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-900/30">
                <Gift className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                Perfect Gift <span className="text-rose-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              "Tell us about them. We'll find the gift." An AI-powered concierge that eliminates the stress of gifting by matching verified products to authentic emotional bonds, milestones, and individual personalities.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="footer-start-finder-btn"
                onClick={() => onNavigate('finder')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                Launch Gift Finder
              </button>
              <button
                id="footer-admin-btn"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                Admin Dashboard
              </button>
            </div>
          </div>

          {/* Col 3: Popular Curations (SEO Hubs) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Popular Curations
            </h3>
            <ul className="space-y-2 text-sm">
              {seoLinks.slice(0, 5).map(link => (
                <li key={link.slug}>
                  <a
                    href={`/${link.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('seo-page', { slug: link.slug, recipient: link.recipient });
                    }}
                    className="text-stone-400 hover:text-white transition-colors block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Milestone Occasions */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Milestone Occasions
            </h3>
            <ul className="space-y-2 text-sm">
              {seoLinks.slice(5, 9).map(link => (
                <li key={link.slug}>
                  <a
                    href={`/${link.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('seo-page', { slug: link.slug, occasion: link.occasion });
                    }}
                    className="text-stone-400 hover:text-white transition-colors block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Budget Hubs & Architecture */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Budget & Platform
            </h3>
            <ul className="space-y-2 text-sm">
              {seoLinks.slice(9).map(link => (
                <li key={link.slug}>
                  <a
                    href={`/${link.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('seo-page', { slug: link.slug, budget: link.budget });
                    }}
                    className="text-stone-400 hover:text-white transition-colors block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure & Bottom Bar */}
        <div className="pt-8 space-y-4">
          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-800 text-xs text-stone-400 leading-relaxed">
            <p className="font-semibold text-stone-300 mb-1">Affiliate Disclosure:</p>
            "Some links may be affiliate links. We may earn a commission if you make a purchase through qualifying links, at no additional cost to you."
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3 pt-2">
            <p>© {new Date().getFullYear()} Perfect Gift AI. Verified Database Architecture & Dedicated Gemini AI Concierge.</p>
            <div className="flex items-center gap-4">
              <span>Zero Hallucinated Prices</span>
              <span>•</span>
              <span>100% Real Merchant Inventory</span>
              <span>•</span>
              <button onClick={() => onNavigate('search')} className="hover:text-stone-300 underline">
                Browse Full Catalog
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
