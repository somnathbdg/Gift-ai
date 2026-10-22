import React, { useState, useMemo } from 'react';
import {
  X,
  BookmarkCheck,
  ExternalLink,
  Trash2,
  Gift,
  Sparkles,
  Share2,
  Check,
  ArrowUpDown,
  ChevronDown,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import { Product } from '../types';
import { resolveProductOutboundUrl } from '../utils/affiliate';

export type SavedSortOption = 'date-desc' | 'date-asc' | 'price-asc' | 'price-desc';

interface SavedGiftsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedProducts: Product[];
  onRemoveSaved: (id: string) => void;
  onClearAll: () => void;
  onPersonalize: (product: Product) => void;
}

export const SavedGiftsDrawer: React.FC<SavedGiftsDrawerProps> = ({
  isOpen,
  onClose,
  savedProducts,
  onRemoveSaved,
  onClearAll,
  onPersonalize
}) => {
  const [copied, setCopied] = useState(false);
  const [sortBy, setSortBy] = useState<SavedSortOption>('date-desc');

  // Sorted list of saved products based on selected sort option
  const sortedProducts = useMemo(() => {
    const indexed = savedProducts.map((p, idx) => ({ product: p, originalIndex: idx }));
    // Normalize USD to INR (~84x) so comparison between USD and INR products is accurate
    const getEffectivePrice = (p: Product) => (p.currency === 'USD' ? p.price * 84 : p.price);

    indexed.sort((a, b) => {
      if (sortBy === 'price-asc') {
        const diff = getEffectivePrice(a.product) - getEffectivePrice(b.product);
        return diff !== 0 ? diff : a.originalIndex - b.originalIndex;
      }
      if (sortBy === 'price-desc') {
        const diff = getEffectivePrice(b.product) - getEffectivePrice(a.product);
        return diff !== 0 ? diff : a.originalIndex - b.originalIndex;
      }
      if (sortBy === 'date-asc') {
        const timeA = a.product.savedAt ? new Date(a.product.savedAt).getTime() : NaN;
        const timeB = b.product.savedAt ? new Date(b.product.savedAt).getTime() : NaN;
        if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
          return timeA - timeB;
        }
        return a.originalIndex - b.originalIndex;
      }
      // Default 'date-desc': newest first
      const timeA = a.product.savedAt ? new Date(a.product.savedAt).getTime() : NaN;
      const timeB = b.product.savedAt ? new Date(b.product.savedAt).getTime() : NaN;
      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        return timeB - timeA;
      }
      return b.originalIndex - a.originalIndex;
    });

    return indexed.map(i => i.product);
  }, [savedProducts, sortBy]);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (savedProducts.length === 0) return;
    try {
      const ids = savedProducts.map(p => encodeURIComponent(p.id)).join(',');
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('saved', ids);
      const shareUrl = url.toString();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy share link:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Saved Gifts ({savedProducts.length})
              </h3>
              <p className="text-xs text-stone-500">Your shortlisted discoveries</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {savedProducts.length > 0 && (
              <button
                onClick={handleShare}
                title="Copy share link containing saved product IDs"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  copied
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Share</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copy confirmation notification banner */}
        {copied && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 flex items-center gap-2 text-xs font-medium text-emerald-800 animate-in fade-in slide-in-from-top-1 duration-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Link copied to clipboard! Contains your {savedProducts.length} saved gift IDs.</span>
          </div>
        )}

        {/* Sorting & Item Count Toolbar */}
        {savedProducts.length > 0 && (
          <div className="px-6 py-2.5 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-stone-500 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <span>
                {savedProducts.length} {savedProducts.length === 1 ? 'gift' : 'gifts'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="saved-gifts-sort" className="text-stone-500 font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Sort:</span>
              </label>
              <div className="relative">
                <select
                  id="saved-gifts-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SavedSortOption)}
                  aria-label="Sort saved gifts by price or date added"
                  className="appearance-none bg-white border border-stone-200 hover:border-stone-300 text-stone-800 font-semibold rounded-lg pl-2.5 pr-7 py-1 text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 cursor-pointer transition-colors"
                >
                  <option value="date-desc">Date Added (Newest)</option>
                  <option value="date-asc">Date Added (Oldest)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="p-6 flex-1 overflow-y-auto divide-y divide-stone-100 space-y-4">
          {savedProducts.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <Gift className="w-12 h-12 mx-auto mb-2 text-stone-300" />
              <p className="font-serif font-bold text-stone-700 text-sm">No saved gifts yet</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Click the bookmark icon on any recommended gift to save it for easy comparison and sharing.
              </p>
            </div>
          ) : (
            sortedProducts.map(prod => (
              <div key={prod.id} className="pt-4 first:pt-0 flex gap-4 items-start">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-0.5">
                    <span className="truncate pr-2 font-medium">{prod.merchant}</span>
                    <span className="font-bold text-stone-900 shrink-0">
                      {prod.currency === 'USD' ? `$${prod.price.toFixed(2)}` : `₹${prod.price.toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-stone-900 text-xs line-clamp-1 mb-1">
                    {prod.name}
                  </h4>

                  {prod.savedAt && (
                    <div className="text-[10px] text-stone-400 mb-2 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-stone-300" />
                      <span>
                        Added {new Date(prod.savedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const target = resolveProductOutboundUrl(prod);
                        window.open(target, '_blank');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-800"
                    >
                      <span>Buy</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onPersonalize(prod);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-stone-900"
                    >
                      <Sparkles className="w-3 h-3 text-rose-600" />
                      <span>Personalize</span>
                    </button>

                    <button
                      onClick={() => onRemoveSaved(prod.id)}
                      className="ml-auto text-stone-400 hover:text-red-600 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedProducts.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
            <button
              onClick={onClearAll}
              className="text-xs font-semibold text-stone-500 hover:text-red-600 transition-colors"
            >
              Clear Shortlist
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  copied
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Share Shortlist</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
