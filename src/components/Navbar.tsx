import React from 'react';
import { Gift, Search, Sparkles, Shield, Bookmark, Heart, Menu, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  demoMode: boolean;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  demoMode,
  savedCount,
  onOpenSaved,
  onOpenAdmin,
  isAdminLoggedIn
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-900/10 group-hover:scale-105 transition-transform duration-200">
              <Gift className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                  Perfect Gift <span className="text-rose-700">AI</span>
                </span>
                {demoMode ? (
                  <span
                    title="Operating in Demo Mode with verified local catalog. Gemini API key can be connected via Settings > Secrets."
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Demo Mode
                  </span>
                ) : (
                  <span
                    title="Connected to Gemini API server-side"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    AI Connected
                  </span>
                )}
              </div>
              <p className="text-[12px] text-stone-600 hidden sm:block">
                Tell us about them. We'll find the gift.
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              id="nav-home-btn"
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'text-rose-900 bg-rose-50/80 font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              Home
            </button>
            <button
              id="nav-finder-btn"
              onClick={() => onNavigate('finder')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'finder'
                  ? 'text-rose-900 bg-rose-50/80 font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-rose-700" />
              AI Gift Finder
            </button>
            <button
              id="nav-search-btn"
              onClick={() => onNavigate('search')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'search'
                  ? 'text-rose-900 bg-rose-50/80 font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              <Search className="w-4 h-4 text-stone-500" />
              Explore Catalog
            </button>
            <button
              id="nav-message-btn"
              onClick={() => onNavigate('message-generator')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'message-generator'
                  ? 'text-rose-900 bg-rose-50/80 font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              Gift Message Studio
            </button>
            <button
              id="nav-digital-card-btn"
              onClick={() => onNavigate('digital-card')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'digital-card'
                  ? 'text-rose-900 bg-rose-50/80 font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              Digital Cards
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Saved Gifts */}
            <button
              id="nav-saved-btn"
              onClick={onOpenSaved}
              className="relative p-2.5 rounded-xl text-stone-700 hover:text-rose-800 hover:bg-rose-50 transition-colors"
              title="Saved Gifts & Favorites"
              aria-label="Saved Gifts"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-700 text-white text-[10px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Admin Portal */}
            <button
              id="nav-admin-btn"
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                currentView === 'admin' || isAdminLoggedIn
                  ? 'bg-stone-900 text-stone-100 border-stone-800'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400 hover:bg-stone-50'
              }`}
              title="Administrator Dashboard & Hermes Specs"
            >
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            {/* Main Action CTA */}
            <button
              id="nav-cta-btn"
              onClick={() => onNavigate('finder')}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold shadow-sm transition-all hover:shadow-md"
            >
              <Gift className="w-4 h-4 text-rose-400" />
              Find My Perfect Gift
            </button>

            {/* Mobile Hamburger */}
            <button
              id="nav-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-stone-50 px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-stone-800 font-medium hover:bg-stone-200/60"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('finder');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-rose-900 font-semibold bg-rose-100/70"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-700" />
              AI Gift Finder
            </span>
            <span className="text-xs bg-rose-700 text-white px-2 py-0.5 rounded-full">Start</span>
          </button>
          <button
            onClick={() => {
              onNavigate('search');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-stone-800 font-medium hover:bg-stone-200/60"
          >
            Explore Catalog & Occasions
          </button>
          <button
            onClick={() => {
              onNavigate('message-generator');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-stone-800 font-medium hover:bg-stone-200/60"
          >
            Gift Message Generator
          </button>
          <button
            onClick={() => {
              onNavigate('digital-card');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-stone-800 font-medium hover:bg-stone-200/60"
          >
            Digital Gift Cards
          </button>
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-950"
            >
              <Shield className="w-4 h-4 text-rose-600" />
              Admin Portal
            </button>
            <button
              onClick={() => {
                onOpenSaved();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-950"
            >
              <Bookmark className="w-4 h-4 text-rose-600" />
              Saved Items ({savedCount})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
