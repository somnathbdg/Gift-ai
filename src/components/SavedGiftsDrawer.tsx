import React from 'react';
import { X, BookmarkCheck, ExternalLink, Trash2, Gift, Sparkles } from 'lucide-react';
import { Product } from '../types';

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
  if (!isOpen) return null;

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

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
            savedProducts.map(prod => (
              <div key={prod.id} className="pt-4 first:pt-0 flex gap-4 items-start">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-0.5">
                    <span>{prod.merchant}</span>
                    <span className="font-bold text-stone-900">₹{prod.price.toLocaleString('en-IN')}</span>
                  </div>

                  <h4 className="font-serif font-bold text-stone-900 text-xs line-clamp-1 mb-2">
                    {prod.name}
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const target = prod.affiliateUrl || prod.productUrl;
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
          <div className="p-6 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
            >
              Clear Shortlist
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
