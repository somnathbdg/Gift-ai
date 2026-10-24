import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { WhyUs } from './components/WhyUs';
import { PopularOccasions } from './components/PopularOccasions';
import { PopularCategories } from './components/PopularCategories';
import { FaqSection } from './components/FaqSection';
import { GiftFinderFlow } from './components/GiftFinderFlow';
import { ResultsView } from './components/ResultsView';
import { PersonalizationSuite } from './components/PersonalizationSuite';
import { ProductSearchPage } from './components/ProductSearchPage';
import { SeoCategoryPage } from './components/SeoCategoryPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SavedGiftsDrawer } from './components/SavedGiftsDrawer';
import { HermesSpecView } from './components/HermesSpecView';
import { Product, GiftFinderInputs, RecommendationResponse } from './types';
import { fetchProducts, checkServerHealth, adminVerifyAuthApi, adminLogoutApi } from './services/api';
import { SEED_PRODUCTS } from './data/seedProducts';

export default function App() {
  // Navigation & Views

  // Initialize the page from the current URL
  const getInitialRoute = () => {
    const slug = window.location.pathname.replace(/^\/+|\/+$/g, '');

    if (!slug) {
      return { view: 'home', params: {} };
    }
    if (slug === 'search') {
      return { view: 'search', params: {} };
    }
    if (slug === 'gift-finder' || slug === 'finder') {
      return { view: 'finder', params: {} };
    }
    if (slug === 'personalize') {
      return { view: 'personalization', params: {} };
    }
    if (slug === 'gift-message-generator') {
      return { view: 'message-generator', params: {} };
    }
    if (slug === 'digital-gift-card') {
      return { view: 'digital-card', params: {} };
    }
    if (slug === 'admin') {
      return { view: 'admin', params: {} };
    }
    if (slug === 'hermes-spec') {
      return { view: 'hermes-spec', params: {} };
    }

    return {
      view: 'seo-page',
      params: { slug },
    };
  };

  const [initialRoute] = useState(getInitialRoute);

  const [currentView, setCurrentView] = useState<string>(initialRoute.view);
  const [viewParams, setViewParams] = useState<any>(initialRoute.params);

  // Products & Health State
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [demoMode, setDemoMode] = useState(true);

  // Saved / Favorites Shortlist (Stored locally)
  const [savedProducts, setSavedProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('pg_saved_gifts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Gift Finder State
  const [finderPrefill, setFinderPrefill] = useState<Partial<GiftFinderInputs>>({});
  const [finderInputs, setFinderInputs] = useState<GiftFinderInputs | null>(null);
  const [recommendationResults, setRecommendationResults] = useState<RecommendationResponse | null>(null);

  // Personalization State
  const [personalizationProduct, setPersonalizationProduct] = useState<Product | null>(null);
  const [personalizationTab, setPersonalizationTab] = useState<'message' | 'card' | 'surprise' | 'bundle'>('message');

  // Admin State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return sessionStorage.getItem('pg_admin_logged_in') === 'true' && Boolean(sessionStorage.getItem('pg_admin_token'));
    } catch {
      return false;
    }
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Initial Load: check health, load catalog & verify admin session
  useEffect(() => {
    loadCatalog();
    checkHealth();
    verifyAdminSession();

    const handlePopState = () => {
      const slug = window.location.pathname.replace(/^\/+|\/+$/g, '');
      if (slug === 'search') {
        setCurrentView('search');
        setViewParams({});
      } else if (slug === 'gift-finder' || slug === 'finder') {
        setCurrentView('finder');
        setViewParams({});
      } else if (slug === 'personalize') {
        setCurrentView('personalization');
        setViewParams({});
      } else if (slug === 'gift-message-generator') {
        setCurrentView('message-generator');
        setViewParams({});
      } else if (slug === 'digital-gift-card') {
        setCurrentView('digital-card');
        setViewParams({});
      } else if (slug === 'admin') {
        setCurrentView('admin');
        setViewParams({});
      } else if (slug === 'hermes-spec') {
        setCurrentView('hermes-spec');
        setViewParams({});
      } else if (slug) {
        setCurrentView('seo-page');
        setViewParams({ slug });
      } else {
        setCurrentView('home');
        setViewParams({});
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync homepage title and canonical URL when returning to home view
  useEffect(() => {
    if (currentView === 'home') {
      document.title = 'Perfect Gift AI | Personalized Gift Ideas for Every Occasion';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Discover personalized gift ideas with Perfect Gift AI. Find thoughtful gifts for birthdays, anniversaries, holidays and special occasions, tailored to their interests and your budget.'
        );
      }
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', 'https://shop.todkart.com/');
      }
    }
  }, [currentView]);

  const verifyAdminSession = async () => {
    try {
      const authStatus = await adminVerifyAuthApi();
      if (authStatus.authenticated) {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
        if (currentView === 'admin') {
          setCurrentView('home');
        }
      }
    } catch {
      setIsAdminLoggedIn(false);
    }
  };

  // Sync saved gifts with local storage
  useEffect(() => {
    try {
      localStorage.setItem('pg_saved_gifts', JSON.stringify(savedProducts));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [savedProducts]);

  // Handle shared shortlist URL parameters (?saved=id1,id2)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const savedParam = params.get('saved') || params.get('savedIds');
      if (savedParam) {
        const idList = savedParam.split(',').map(s => decodeURIComponent(s.trim())).filter(Boolean);
        if (idList.length > 0) {
          const catalogPool = products.length > 0 ? products : SEED_PRODUCTS;
          const found = catalogPool.filter(p => idList.includes(p.id) || (p.asin && idList.includes(p.asin)));
          if (found.length > 0) {
            setSavedProducts(prev => {
              const prevIds = new Set(prev.map(p => p.id));
              const newItems = found
                .filter(p => !prevIds.has(p.id))
                .map(p => ({ ...p, savedAt: p.savedAt || new Date().toISOString() }));
              return [...prev, ...newItems];
            });
            setIsSavedDrawerOpen(true);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading shared saved gifts from URL:', e);
    }
  }, [products]);

  const loadCatalog = async () => {
    try {
      const items = await fetchProducts({ status: 'all' });
      if (items && items.length > 0) {
        setProducts(items);
      }
    } catch (err) {
      console.warn('Error fetching catalog, using local seed:', err);
    }
  };

  const checkHealth = async () => {
    try {
      const res = await checkServerHealth();
      setDemoMode(res.demoMode);
    } catch {
      setDemoMode(true);
    }
  };

  // Navigation Handler

  const handleNavigate = (view: string, params?: any) => {
    const nextParams = params || {};

    let nextPath = '/';

    if (view === 'seo-page') {
      const slug = String(nextParams.slug || 'gifts-for-wife')
        .toLowerCase()
        .replace(/^\/+|\/+$/g, '');

      nextPath = `/${slug}`;
    } else if (view === 'search') {
      nextPath = '/search';
    } else if (view === 'finder') {
      nextPath = '/gift-finder';
    } else if (view === 'personalization') {
      nextPath = '/personalize';
    } else if (view === 'message-generator') {
      nextPath = '/gift-message-generator';
    } else if (view === 'digital-card') {
      nextPath = '/digital-gift-card';
    } else if (view === 'admin') {
      nextPath = '/admin';
    } else if (view === 'hermes-spec') {
      nextPath = '/hermes-spec';
    }

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setCurrentView(view);
    setViewParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Save / Shortlist Product
  const handleToggleSave = (product: Product) => {
    setSavedProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, { ...product, savedAt: new Date().toISOString() }];
      }
    });
  };

  const handleRemoveSaved = (id: string) => {
    setSavedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleClearAllSaved = () => {
    setSavedProducts([]);
  };

  // Launch Finder with optional prefill
  const handleStartFinder = (prefill?: Partial<GiftFinderInputs>) => {
    setFinderPrefill(prefill || {});
    handleNavigate('finder');
  };

  // Finder completed
  const handleFinderComplete = (results: RecommendationResponse, inputs: GiftFinderInputs) => {
    setRecommendationResults(results);
    setFinderInputs(inputs);
    // Set top product as default personalization candidate
    if (results.recommendations.length > 0) {
      setPersonalizationProduct(results.recommendations[0].product);
    }
    handleNavigate('results');
  };

  // Open Personalization Suite for a specific product
  const handleOpenPersonalization = (product: Product, defaultTab: string = 'message') => {
    setPersonalizationProduct(product);
    setPersonalizationTab(defaultTab as any);
    handleNavigate('personalization');
  };

  // Admin authentication handlers
  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      handleNavigate('admin');
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const handleAdminSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminModalOpen(false);
    handleNavigate('admin');
    loadCatalog();
  };

  const handleAdminLogout = async () => {
    await adminLogoutApi();
    setIsAdminLoggedIn(false);
    handleNavigate('home');
    loadCatalog();
  };

  const handleExitAdmin = () => {
    handleNavigate('home');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col selection:bg-rose-100 selection:text-rose-900">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        demoMode={demoMode}
        savedCount={savedProducts.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <>
            <Hero
              onStartFinder={handleStartFinder}
              onScrollToHowItWorks={() => {
                const el = document.getElementById('how-it-works-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <HowItWorks onStartFinder={() => handleStartFinder()} />
            <PopularOccasions
              onSelectOccasion={occ => handleStartFinder({ occasion: occ })}
              onNavigateToSeo={slugOrOcc => {
                let s = slugOrOcc.toLowerCase().replace(/\s+/g, '-');
                if (s === 'birthday') s = 'birthday-gifts';
                if (s === 'wife') s = 'gifts-for-wife';
                if (s === 'husband') s = 'gifts-for-husband';
                handleNavigate('seo-page', { slug: s });
              }}
            />
            <PopularCategories
              onSelectCategory={cat => handleNavigate('search', { category: cat })}
            />
            <WhyUs />
            <FaqSection />
          </>
        )}

        {/* VIEW 2: AI GIFT FINDER WIZARD */}
        {currentView === 'finder' && (
          <GiftFinderFlow
            initialValues={finderPrefill}
            onComplete={handleFinderComplete}
            onCancel={() => handleNavigate('home')}
          />
        )}

        {/* VIEW 3: RESULTS VIEW */}
        {currentView === 'results' && recommendationResults && finderInputs && (
          <>
            <ResultsView
              results={recommendationResults}
              inputs={finderInputs}
              savedProductIds={savedProducts.map(p => p.id)}
              onToggleSave={handleToggleSave}
              onStartNewSearch={() => handleStartFinder(finderInputs)}
              onOpenPersonalization={handleOpenPersonalization}
            />

            {/* In-page Personalization Suite anchored below results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <PersonalizationSuite
                product={personalizationProduct || recommendationResults.recommendations[0]?.product}
                defaultTab="message"
                recipientName={finderInputs.recipientName || finderInputs.customRecipient || finderInputs.recipient}
                occasion={finderInputs.customOccasion || finderInputs.occasion}
                relationship={finderInputs.customRecipient || finderInputs.recipient}
              />
            </div>
          </>
        )}

        {/* VIEW 4: DEDICATED PERSONALIZATION SUITE */}
        {currentView === 'personalization' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <PersonalizationSuite
              product={personalizationProduct || products[0]}
              defaultTab={personalizationTab}
              onClose={() => handleNavigate(recommendationResults ? 'results' : 'home')}
              recipientName={finderInputs?.recipientName || ''}
              occasion={finderInputs?.customOccasion || finderInputs?.occasion || 'Birthday'}
              relationship={finderInputs?.customRecipient || finderInputs?.recipient || 'Partner'}
            />
          </div>
        )}

        {/* VIEW 5: GIFT MESSAGE GENERATOR STANDALONE */}
        {currentView === 'message-generator' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <PersonalizationSuite
              product={products[0]}
              defaultTab="message"
              recipientName=""
              occasion="Birthday"
              relationship="Friend"
            />
          </div>
        )}

        {/* VIEW 6: DIGITAL GIFT CARD STANDALONE */}
        {currentView === 'digital-card' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <PersonalizationSuite
              product={products[0]}
              defaultTab="card"
              recipientName=""
              occasion="Anniversary"
              relationship="Partner"
            />
          </div>
        )}

        {/* VIEW 7: PRODUCT SEARCH CATALOG */}
        {currentView === 'search' && (
          <ProductSearchPage
            products={products}
            savedProductIds={savedProducts.map(p => p.id)}
            onToggleSave={handleToggleSave}
            onOpenPersonalization={handleOpenPersonalization}
            initialCategory={viewParams.category}
            initialOccasion={viewParams.occasion}
            initialBudget={viewParams.budget}
            initialSearch={viewParams.search}
          />
        )}

        {/* VIEW 8: SEO LANDING PAGE */}
        {currentView === 'seo-page' && (
          <SeoCategoryPage
            slug={viewParams.slug || 'gifts-for-wife'}
            recipient={viewParams.recipient}
            occasion={viewParams.occasion}
            budget={viewParams.budget}
            products={products}
            savedProductIds={savedProducts.map(p => p.id)}
            onToggleSave={handleToggleSave}
            onStartFinderWithPrefill={handleStartFinder}
            onOpenPersonalization={handleOpenPersonalization}
            onNavigateSeo={(slug, params) => handleNavigate('seo-page', { slug, ...params })}
          />
        )}

        {/* VIEW 9: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard
            products={products}
            onRefreshProducts={loadCatalog}
            onExitAdmin={handleExitAdmin}
            onLogout={handleAdminLogout}
          />
        )}

        {/* VIEW 10: HERMES AGENT SPEC */}
        {currentView === 'hermes-spec' && (
          <HermesSpecView onBack={() => handleNavigate('home')} />
        )}
      </main>

      {/* Footer (hidden when in admin console to maintain clean dashboard workspace) */}
      {currentView !== 'admin' && (
        <Footer
          onNavigate={handleNavigate}
          onOpenAdmin={handleOpenAdmin}
        />
      )}

      {/* Modals & Slide-over Drawers */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />

      <SavedGiftsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedProducts={savedProducts}
        onRemoveSaved={handleRemoveSaved}
        onClearAll={handleClearAllSaved}
        onPersonalize={handleOpenPersonalization}
      />
    </div>
  );
}
