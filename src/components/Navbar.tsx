import React from 'react';
import { Gift, Search, Sparkles, Shield, Bookmark, Heart, Menu, X, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  demoMode: boolean;
  amazonConnected?: boolean;
  geminiConfigured?: boolean;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  demoMode,
  amazonConnected = false,
  geminiConfigured = false,
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
          <a
            id="nav-logo-btn"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
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
                {amazonConnected ? (
                  <span
                    title="Connected to Amazon Creators API for real-time live product queries."
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Amazon Live API
                  </span>
                ) : (
                  <span
                    title="Curated catalog of 180 verified gifts with direct Amazon affiliate links. Real-time price and availability are confirmed on Amazon."
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200"
                  >
                    <CheckCircle2 className="w-3 h-3 text-stone-500" />
                    Curated Catalog
                  </span>
                )}
              </div>
              <p className="text-[12px] text-stone-600 hidden sm:block">
                Tell us about them. We'll find the gift.
              </p>
            </div>
          </a>

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

            {/* Curated Category Guides Dropdown */}
            <div className="relative group">
              <button
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentView === 'seo-page'
                    ? 'text-rose-900 bg-rose-50/80 font-semibold'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                <span>Curated Guides</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute left-0 top-full pt-1 hidden group-hover:block z-50 w-48">
                <div className="bg-white rounded-2xl shadow-lg border border-stone-200/90 py-2 px-1">
                  <a
                    href="/birthday-gifts"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('seo-page', { slug: 'birthday-gifts' });
                    }}
                    className="block px-3 py-2 text-xs font-semibold text-stone-700 hover:text-rose-900 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Birthday Gifts
                  </a>
                  <a
                    href="/gifts-for-wife"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('seo-page', { slug: 'gifts-for-wife' });
                    }}
                    className="block px-3 py-2 text-xs font-semibold text-stone-700 hover:text-rose-900 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Gifts for Wife
                  </a>
                  <a
                    href="/gifts-for-husband"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('seo-page', { slug: 'gifts-for-husband' });
                    }}
                    className="block px-3 py-2 text-xs font-semibold text-stone-700 hover:text-rose-900 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Gifts for Husband
                  </a>
                </div>
              </div>
            </div>
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
              title="Administrator Dashboard"
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

          {/* Crawlable Popular Gift Guides */}
          <div className="pt-2 border-t border-stone-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 px-3">
              Popular Gift Guides
            </span>
            <div className="mt-1 space-y-1">
              <a
                href="/birthday-gifts"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('seo-page', { slug: 'birthday-gifts' });
                  setMobileMenuOpen(false);
                }}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-rose-50 hover:text-rose-900 transition-colors"
              >
                Birthday Gifts Guide
              </a>
              <a
                href="/gifts-for-wife"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('seo-page', { slug: 'gifts-for-wife' });
                  setMobileMenuOpen(false);
                }}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-pink-50 hover:text-pink-900 transition-colors"
              >
                Gifts for Wife Guide
              </a>
              <a
                href="/gifts-for-husband"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('seo-page', { slug: 'gifts-for-husband' });
                  setMobileMenuOpen(false);
                }}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-amber-50 hover:text-amber-900 transition-colors"
              >
                Gifts for Husband Guide
              </a>
            </div>
          </div>

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
