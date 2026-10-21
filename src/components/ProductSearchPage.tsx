import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Star,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Gift
} from 'lucide-react';
import { Product } from '../types';
import { trackClick } from '../services/api';

interface ProductSearchPageProps {
  products: Product[];
  savedProductIds: string[];
  onToggleSave: (product: Product) => void;
  onOpenPersonalization: (product: Product) => void;
  initialCategory?: string;
  initialOccasion?: string;
  initialBudget?: string;
  initialSearch?: string;
}

export const ProductSearchPage: React.FC<ProductSearchPageProps> = ({
  products,
  savedProductIds,
  onToggleSave,
  onOpenPersonalization,
  initialCategory = '',
  initialOccasion = '',
  initialBudget = '',
  initialSearch = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedOccasion, setSelectedOccasion] = useState(initialOccasion);
  const [selectedBudget, setSelectedBudget] = useState(initialBudget);
  const [sortBy, setSortBy] = useState<'rating' | 'price-asc' | 'price-desc' | 'name'>('rating');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All Categories', ...Array.from(set)];
  }, [products]);

  const occasions = [
    'All Occasions',
    'Birthday',
    'Anniversary',
    'Valentine\'s Day',
    'Mother\'s Day',
    'Father\'s Day',
    'Diwali',
    'Housewarming',
    'Wedding',
    'Thank You',
    'Just Because'
  ];

  const budgets = [
    'All Budgets',
    'Under ₹500',
    '₹500–₹1,000',
    '₹1,000–₹2,000',
    '₹2,000–₹5,000',
    '₹5,000+'
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Must be active
      if (p.status !== 'active') return false;

      // Category filter (flexible match)
      if (selectedCategory && selectedCategory !== 'All Categories') {
        const catLower = p.category.toLowerCase();
        const selLower = selectedCategory.toLowerCase();
        const matchesCategory =
          catLower === selLower ||
          catLower.includes(selLower) ||
          selLower.includes(catLower) ||
          (selLower.includes('personalized') && catLower.includes('personalized')) ||
          (selLower.includes('tech') && catLower.includes('tech')) ||
          (selLower.includes('fashion') && catLower.includes('fashion')) ||
          (selLower.includes('home') && catLower.includes('home')) ||
          (selLower.includes('wellness') && (catLower.includes('beauty') || catLower.includes('fitness')));
        if (!matchesCategory) return false;
      }

      // Occasion filter
      if (selectedOccasion && selectedOccasion !== 'All Occasions') {
        const matches = p.occasions.some(
          o => o.toLowerCase() === selectedOccasion.toLowerCase()
        );
        if (!matches) return false;
      }

      // Budget filter (handles both INR and USD equivalent ~₹84)
      if (selectedBudget && selectedBudget !== 'All Budgets') {
        const effectivePrice = p.currency === 'USD' ? p.price * 84 : p.price;
        if (selectedBudget.includes('Under ₹500') && effectivePrice > 500) return false;
        if (selectedBudget.includes('₹500–₹1,000') && (effectivePrice < 500 || effectivePrice > 1000)) return false;
        if (selectedBudget.includes('₹1,000–₹2,000') && (effectivePrice < 1000 || effectivePrice > 2000)) return false;
        if (selectedBudget.includes('₹2,000–₹5,000') && (effectivePrice < 2000 || effectivePrice > 5000)) return false;
        if (selectedBudget.includes('₹5,000+') && effectivePrice < 5000) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.merchant.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, selectedCategory, selectedOccasion, selectedBudget, searchTerm, sortBy]);

  const handleProductClick = (product: Product) => {
    trackClick({
      type: product.affiliateUrl ? 'affiliate_click' : 'product_click',
      productId: product.id,
      source: 'catalog_search_grid',
      occasion: selectedOccasion,
      budget: selectedBudget
    });

    const target = product.affiliateUrl || product.productUrl;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedOccasion('');
    setSelectedBudget('');
    setSortBy('rating');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          Verified Indian Gift Catalog
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2">
          Explore Gift Database
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-1">
          Search and filter verified products across categories, occasions, and budgets with real INR pricing.
        </p>

        {/* Big Search Bar */}
        <div className="relative mt-6">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by gift idea, recipient, brand, or hobby (e.g. coffee, silver, kindle)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-stone-300 bg-white text-stone-900 text-sm shadow-xs focus:ring-2 focus:ring-rose-700 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-8 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
            {/* Category Dropdown */}
            <select
              value={selectedCategory || 'All Categories'}
              onChange={e => setSelectedCategory(e.target.value === 'All Categories' ? '' : e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium text-stone-800 bg-stone-50 focus:ring-2 focus:ring-rose-700"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Occasion Dropdown */}
            <select
              value={selectedOccasion || 'All Occasions'}
              onChange={e => setSelectedOccasion(e.target.value === 'All Occasions' ? '' : e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium text-stone-800 bg-stone-50 focus:ring-2 focus:ring-rose-700"
            >
              {occasions.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            {/* Budget Dropdown */}
            <select
              value={selectedBudget || 'All Budgets'}
              onChange={e => setSelectedBudget(e.target.value === 'All Budgets' ? '' : e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium text-stone-800 bg-stone-50 focus:ring-2 focus:ring-rose-700"
            >
              {budgets.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {(selectedCategory || selectedOccasion || selectedBudget || searchTerm) && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium text-stone-800 bg-stone-50 focus:ring-2 focus:ring-rose-700"
            >
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-medium text-stone-600">
          Showing <span className="font-bold text-stone-900">{filteredProducts.length}</span> verified gift{filteredProducts.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Grid of Products */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-300">
          <Gift className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">
            No matching items found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
            Try adjusting your search keywords or clearing your budget and category filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isSaved = savedProductIds.includes(product.id);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-semibold">
                      {product.merchant}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleSave(product)}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-colors ${
                      isSaved
                        ? 'bg-rose-700 text-white'
                        : 'bg-white/80 text-stone-700 hover:text-rose-700 hover:bg-white'
                    }`}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>

                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-stone-900 shadow-xs flex flex-col">
                    <span className="text-xs font-bold leading-tight">
                      {product.currency === 'USD' ? `$${product.price.toFixed(2)}` : `₹${product.price.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-[8px] text-stone-500 font-normal leading-tight">*Subject to change</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                      <span>{product.category}</span>
                      {product.isRatingAvailable !== false && product.rating > 0 ? (
                        <div className="flex items-center gap-1 text-amber-600 font-semibold">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{product.rating}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-400">Rating unavailable</span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-stone-900 text-sm mb-1.5 line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleProductClick(product)}
                      className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
                    >
                      <span>Buy Item</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onOpenPersonalization(product)}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold transition-colors"
                    >
                      Personalize
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pricing & Availability Transparency Disclaimer (Requirement 8) */}
      <div className="mt-12 pt-6 border-t border-stone-200 text-center text-xs text-stone-500 max-w-2xl mx-auto">
        <p>
          *Product prices and availability on Amazon.in are accurate as of the verification date and are subject to change.
          Real-time pricing and stock status are confirmed upon checkout on Amazon.in.
        </p>
      </div>
    </div>
  );
};
