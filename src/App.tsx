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
import { fetchProducts, checkServerHealth } from './services/api';
import { SEED_PRODUCTS } from './data/seedProducts';

export default function App() {
  // Navigation & Views
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

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
      return sessionStorage.getItem('pg_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Initial Load: check health & fetch products from backend
  useEffect(() => {
    loadCatalog();
    checkHealth();
  }, []);

  // Sync saved gifts with local storage
  useEffect(() => {
    try {
      localStorage.setItem('pg_saved_gifts', JSON.stringify(savedProducts));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [savedProducts]);

  const loadCatalog = async () => {
    try {
      const items = await fetchProducts();
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
    setCurrentView(view);
    setViewParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Save / Shortlist Product
  const handleToggleSave = (product: Product) => {
    setSavedProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
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
    try {
      sessionStorage.setItem('pg_admin_logged_in', 'true');
    } catch {}
    setIsAdminModalOpen(false);
    handleNavigate('admin');
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
              onNavigateToSeo={occ => handleNavigate('seo-page', { occasion: occ, slug: occ.toLowerCase() })}
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
