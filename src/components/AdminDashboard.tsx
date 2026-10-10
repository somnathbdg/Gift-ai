import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Sparkles,
  Users,
  Search,
  Link,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  Bot,
  Lock,
  ArrowRight,
  Eye,
  Check,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Globe,
  Radio,
  Clock
} from 'lucide-react';
import { Product, AmazonIntegrationStatus } from '../types';
import {
  DEFAULT_AMAZON_PARTNER_TAG,
  extractAmazonAsin,
  buildAmazonAffiliateUrl,
  resolveProductOutboundUrl
} from '../utils/affiliate';
import {
  fetchAnalyticsSummary,
  queryAdminAssistant,
  adminSaveProduct,
  adminDeleteProduct,
  adminResetProducts,
  fetchAmazonStatus,
  testAmazonConnectionApi,
  importAmazonProductsApi,
  testMatchingEngineApi,
  aiSuggestTagsApi
} from '../services/api';

interface AdminDashboardProps {
  products: Product[];
  onRefreshProducts: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onRefreshProducts,
  onExitAdmin
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'matching_tester' | 'categories' | 'searches' | 'affiliate' | 'amazon' | 'assistant' | 'settings'
  >('dashboard');

  // Intelligent Matching Engine Tester State
  const [matchingTestInputs, setMatchingTestInputs] = useState({
    recipient: 'Wife',
    occasion: 'Anniversary',
    budget: '₹1,000–₹2,000',
    personalities: ['Romantic', 'Sentimental'],
    interests: ['Photography'],
    desiredReaction: 'Emotional / Tearful',
    notes: 'She loves meaningful personalized gifts.'
  });
  const [isTestingMatching, setIsTestingMatching] = useState(false);
  const [matchingTestResult, setMatchingTestResult] = useState<any>(null);
  const [isAiTaggingRunning, setIsAiTaggingRunning] = useState(false);

  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Amazon Integration state
  const [amazonStatus, setAmazonStatus] = useState<AmazonIntegrationStatus | null>(null);
  const [isLoadingAmazonStatus, setIsLoadingAmazonStatus] = useState(false);
  const [isTestingAmazon, setIsTestingAmazon] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    timestamp: string;
  } | null>(null);

  // Amazon Import form state
  const [importForm, setImportForm] = useState({
    keyword: 'Anniversary gifts silver jewellery',
    minPrice: '',
    maxPrice: '5000',
    category: 'Personalized Items',
    occasion: 'Anniversary',
    limit: 6
  });
  const [isImportingAmazon, setIsImportingAmazon] = useState(false);
  const [importResult, setImportResult] = useState<{
    count: number;
    message: string;
    demoMode: boolean;
  } | null>(null);

  // Product management state
  const [productSearch, setProductSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'needs_review' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Admin AI Assistant chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'admin' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: "Hello! I am your AI Store Assistant for Perfect Gift AI. You can ask me about top searched occasions, catalog gaps, inventory needing review, or ideas under ₹1,000.",
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
    loadAmazonStatus();
  }, []);

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await fetchAnalyticsSummary();
      setAnalytics(data);
    } catch (err) {
      console.warn('Analytics summary load error:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const loadAmazonStatus = async () => {
    setIsLoadingAmazonStatus(true);
    try {
      const data = await fetchAmazonStatus();
      setAmazonStatus(data);
    } catch (err) {
      console.warn('Failed to load Amazon status:', err);
    } finally {
      setIsLoadingAmazonStatus(false);
    }
  };

  const handleTestAmazonConnection = async () => {
    setIsTestingAmazon(true);
    setTestResult(null);
    try {
      const res = await testAmazonConnectionApi();
      setTestResult(res);
      await loadAmazonStatus();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTestingAmazon(false);
    }
  };

  const handleImportAmazonProducts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importForm.keyword) return;

    setIsImportingAmazon(true);
    setImportResult(null);
    try {
      const res = await importAmazonProductsApi({
        keyword: importForm.keyword,
        minPrice: importForm.minPrice ? Number(importForm.minPrice) : undefined,
        maxPrice: importForm.maxPrice ? Number(importForm.maxPrice) : undefined,
        category: importForm.category,
        occasion: importForm.occasion,
        limit: Number(importForm.limit) || 6
      });
      setImportResult({
        count: res.count,
        message: res.message,
        demoMode: res.demoMode
      });
      onRefreshProducts();
      await loadAmazonStatus();
    } catch (err: any) {
      setImportResult({
        count: 0,
        message: err.message || 'Failed to import products from Amazon',
        demoMode: true
      });
    } finally {
      setIsImportingAmazon(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct({
      name: '',
      description: '',
      category: 'Personalized Items',
      subcategory: 'Keepsakes',
      price: 1499,
      currency: 'INR',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      productUrl: 'https://example.com/item',
      merchant: 'Artisan Works',
      affiliateUrl: '',
      rating: 4.8,
      reviewCount: 24,
      availability: 'in_stock',
      tags: ['gift', 'personalized'],
      occasions: ['Birthday', 'Anniversary'],
      relationships: ['Partner', 'Friend'],
      personalityTags: ['Thoughtful', 'Romantic'],
      interestTags: ['Personalized Items'],
      emotionalTags: ['Thoughtful', 'Sweet'],
      genderPreference: 'unisex',
      status: 'active',
      source: 'curated'
    });
    setIsModalOpen(true);
  };

  const handleOpenAddAmazonModal = () => {
    setEditingProduct({
      name: '',
      description: '',
      category: 'Personalized Items',
      subcategory: 'Amazon India Choice',
      price: 1299,
      currency: 'INR',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      productUrl: 'https://www.amazon.in/dp/',
      merchant: 'Amazon.in',
      affiliateUrl: `https://www.amazon.in/dp/?tag=${DEFAULT_AMAZON_PARTNER_TAG}`,
      rating: 4.8,
      reviewCount: 52,
      availability: 'in_stock',
      tags: ['amazon.in', 'curated_gift'],
      occasions: ['Birthday', 'Anniversary', 'Valentine\'s Day'],
      relationships: ['Partner', 'Wife', 'Husband', 'Friend'],
      personalityTags: ['Thoughtful', 'Modern'],
      interestTags: ['Personalized Items'],
      emotionalTags: ['Thoughtful', 'Delighted'],
      genderPreference: 'unisex',
      status: 'active',
      source: 'amazon'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) return;
    setIsSavingProduct(true);

    try {
      let finalProduct = { ...editingProduct };
      const isAmazon =
        finalProduct.source === 'amazon' ||
        finalProduct.merchant?.toLowerCase().includes('amazon') ||
        Boolean(finalProduct.asin) ||
        /amazon\.(in|com)|amzn\.to/i.test(finalProduct.productUrl || '') ||
        /amazon\.(in|com)|amzn\.to/i.test(finalProduct.affiliateUrl || '');

      if (isAmazon) {
        finalProduct.source = 'amazon';
        finalProduct.merchant = 'Amazon.in';

        // Auto-extract ASIN if missing
        if (!finalProduct.asin && finalProduct.productUrl) {
          const extracted = extractAmazonAsin(finalProduct.productUrl);
          if (extracted) finalProduct.asin = extracted;
        }
        if (!finalProduct.asin && finalProduct.affiliateUrl) {
          const extracted = extractAmazonAsin(finalProduct.affiliateUrl);
          if (extracted) finalProduct.asin = extracted;
        }

        // Apply partner tag
        if (finalProduct.affiliateUrl) {
          finalProduct.affiliateUrl = buildAmazonAffiliateUrl(finalProduct.affiliateUrl, DEFAULT_AMAZON_PARTNER_TAG);
        } else if (finalProduct.productUrl) {
          finalProduct.affiliateUrl = buildAmazonAffiliateUrl(finalProduct.productUrl, DEFAULT_AMAZON_PARTNER_TAG);
        }
      }

      await adminSaveProduct(finalProduct, !!finalProduct.id);
      setIsModalOpen(false);
      setEditingProduct(null);
      onRefreshProducts();
    } catch (err) {
      alert('Failed to save product');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminDeleteProduct(id);
      onRefreshProducts();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleToggleStatus = async (product: Product, newStatus: 'active' | 'needs_review' | 'inactive') => {
    try {
      await adminSaveProduct({ ...product, status: newStatus }, true);
      onRefreshProducts();
    } catch (err) {
      alert('Status update failed');
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perfect-gift-ai-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            await adminSaveProduct(item, false);
          }
          alert(`Successfully imported ${parsed.length} products!`);
          onRefreshProducts();
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSendChat = async (promptText?: string) => {
    const q = promptText || chatInput;
    if (!q.trim()) return;

    const userMsg = { sender: 'admin' as const, text: q, time: 'Just now' };
    setChatMessages(prev => [...prev, userMsg]);
    if (!promptText) setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await queryAdminAssistant(q);
      setChatMessages(prev => [
        ...prev,
        { sender: 'assistant', text: res.reply, time: 'Just now' }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to reach the assistant at this time. Please try again.',
          time: 'Just now'
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.merchant.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-stone-900 text-stone-100 px-6 py-4 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-700 text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-white">
              Perfect Gift AI <span className="text-rose-400 font-sans text-xs">Admin Console</span>
            </h1>
            <p className="text-[11px] text-stone-400">
              Autonomous Commerce & Catalog Management Center
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExitAdmin}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
          >
            Exit to Storefront
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-rose-50 text-rose-800 font-bold'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-rose-700" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'products'
                ? 'bg-rose-50 text-rose-800 font-bold'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-rose-700" />
              <span>Products ({products.length})</span>
            </span>
            {products.filter(p => p.status === 'needs_review').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                {products.filter(p => p.status === 'needs_review').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('matching_tester')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'matching_tester'
                ? 'bg-rose-100/80 text-rose-900 font-bold border border-rose-200'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-700" />
            <span>Test Gift Matching</span>
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'assistant'
                ? 'bg-rose-50 text-rose-800 font-bold'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Bot className="w-4 h-4 text-rose-700" />
            <span>AI Admin Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'categories'
                ? 'bg-rose-50 text-rose-800 font-bold'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <FolderTree className="w-4 h-4 text-stone-500" />
            <span>Gift Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('searches')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'searches'
                ? 'bg-rose-50 text-rose-800 font-bold'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Search className="w-4 h-4 text-stone-500" />
            <span>Gift Searches</span>
          </button>

          <button
            onClick={() => setActiveTab('affiliate')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'affiliate'
                ? 'bg-rose-50 text-rose-800 font-bold'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Link className="w-4 h-4 text-stone-500" />
            <span>Affiliate & Clicks</span>
          </button>

          <button
            onClick={() => setActiveTab('amazon')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'amazon'
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-[#e47911]" />
              <span>Amazon India</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              amazonStatus?.mode === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {amazonStatus?.mode === 'live' ? 'LIVE' : 'DEMO'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'bg-rose-50 text-rose-800 font-bold'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Settings className="w-4 h-4 text-stone-500" />
            <span>Hermes & Settings</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Total Users
                  </span>
                  <p className="text-2xl font-serif font-bold text-stone-900 mt-1">
                    {analytics?.totalUsers || 248}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-1">↑ +14% this week</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Gift Searches
                  </span>
                  <p className="text-2xl font-serif font-bold text-stone-900 mt-1">
                    {analytics?.totalSearches || 292}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Top: <span className="font-bold text-stone-800">{analytics?.topOccasion || 'Birthday'}</span>
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Product Clicks
                  </span>
                  <p className="text-2xl font-serif font-bold text-stone-900 mt-1">
                    {analytics?.productClicks || 414}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">Direct merchant view</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Affiliate Clicks
                  </span>
                  <p className="text-2xl font-serif font-bold text-stone-900 mt-1">
                    {analytics?.affiliateClicks || 149}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-1">~36% outbound conversion</p>
                </div>
              </div>

              {/* Visual Performance Charts (SVG based for reliability) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Searches by Day */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                  <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
                    Gift Finder Volume by Day
                  </h3>
                  <p className="text-xs text-stone-500 mb-6">Completed discovery runs over past 7 days</p>

                  <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                    {(analytics?.charts?.searchesByDay || [
                      { date: 'Mon', searches: 38 },
                      { date: 'Tue', searches: 42 },
                      { date: 'Wed', searches: 51 },
                      { date: 'Thu', searches: 48 },
                      { date: 'Fri', searches: 62 },
                      { date: 'Sat', searches: 79 },
                      { date: 'Sun', searches: 84 }
                    ]).map((d: any, idx: number) => {
                      const heightPercent = Math.min(100, Math.round((d.searches / 90) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-[10px] font-bold text-stone-600">{d.searches}</span>
                          <div className="w-full bg-stone-100 rounded-t-lg h-32 flex items-end">
                            <div
                              className="w-full bg-rose-700 rounded-t-lg transition-all duration-500"
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-stone-500">{d.date}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Popular Occasions Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                  <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
                    Popular Occasions Distribution
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">Search demand by celebration category</p>

                  <div className="space-y-3">
                    {[
                      { name: 'Birthday', count: 88, percent: 34 },
                      { name: 'Anniversary', count: 42, percent: 22 },
                      { name: 'Diwali & Festive', count: 38, percent: 18 },
                      { name: 'Mother\'s Day', count: 34, percent: 14 },
                      { name: 'Valentine\'s Day', count: 29, percent: 12 }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-stone-700">
                          <span>{item.name}</span>
                          <span className="text-stone-500">{item.count} searches ({item.percent}%)</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-stone-900 h-full rounded-full"
                            style={{ width: `${item.percent * 2.5}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick AI Store Assistant Prompt Banner */}
              <div className="bg-gradient-to-r from-rose-900 to-stone-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-800 text-rose-200 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Bot className="w-3 h-3" />
                    <span>Admin Copilot</span>
                  </div>
                  <h4 className="font-serif text-lg font-bold">Ask AI Store Assistant</h4>
                  <p className="text-xs text-stone-300 max-w-lg mt-0.5">
                    Query catalog inventory, inspect flagged products, generate SEO content ideas, and monitor search telemetry in plain language.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('assistant')}
                  className="px-4 py-2 rounded-xl bg-white text-stone-900 text-xs font-bold hover:bg-stone-100 transition-colors shrink-0"
                >
                  Open Copilot →
                </button>
              </div>
            </div>
          )}

          {/* TAB: TEST GIFT MATCHING (ADMIN TESTER - Section 21) */}
          {activeTab === 'matching_tester' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-rose-700" />
                      <span>Admin Matching Engine Diagnostic</span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-stone-900">
                      Test Gift Matching Engine
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Enter customer profile criteria to run deterministic 100-pt scoring, test Gemini AI explanations, and inspect matching & rejection breakdowns.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500">Preset Scenarios:</span>
                    <button
                      type="button"
                      onClick={() => setMatchingTestInputs({
                        recipient: 'Wife',
                        occasion: 'Anniversary',
                        budget: '₹1,000–₹2,000',
                        personalities: ['Romantic', 'Sentimental'],
                        interests: ['Photography'],
                        desiredReaction: 'Emotional / Tearful',
                        notes: 'She loves meaningful personalized gifts.'
                      })}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
                    >
                      Wife / Anniv
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchingTestInputs({
                        recipient: 'Husband',
                        occasion: 'Birthday',
                        budget: '₹2,000–₹5,000',
                        personalities: ['Tech Lover', 'Practical'],
                        interests: ['Technology', 'Gaming'],
                        desiredReaction: 'Cool / Useful',
                        notes: 'Loves desk gadgets and audio gear.'
                      })}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
                    >
                      Husband / Tech
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchingTestInputs({
                        recipient: 'Mom',
                        occasion: "Mother's Day",
                        budget: '₹2,000–₹5,000',
                        personalities: ['Sentimental', 'Homebody'],
                        interests: ['Beauty', 'Health'],
                        desiredReaction: 'Emotional / Tearful',
                        notes: 'Deserves a pampering wellness treat.'
                      })}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
                    >
                      Mom / Mother's Day
                    </button>
                  </div>
                </div>

                {/* Form Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Recipient:
                    </label>
                    <input
                      type="text"
                      value={matchingTestInputs.recipient}
                      onChange={e => setMatchingTestInputs({ ...matchingTestInputs, recipient: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white"
                      placeholder="e.g. Wife, Husband, Mom, Dad, Friend"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Occasion:
                    </label>
                    <input
                      type="text"
                      value={matchingTestInputs.occasion}
                      onChange={e => setMatchingTestInputs({ ...matchingTestInputs, occasion: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white"
                      placeholder="e.g. Anniversary, Birthday, Diwali"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Budget:
                    </label>
                    <select
                      value={matchingTestInputs.budget}
                      onChange={e => setMatchingTestInputs({ ...matchingTestInputs, budget: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white"
                    >
                      <option value="Under ₹500">Under ₹500</option>
                      <option value="₹500–₹1,000">₹500–₹1,000</option>
                      <option value="₹1,000–₹2,000">₹1,000–₹2,000</option>
                      <option value="₹2,000–₹5,000">₹2,000–₹5,000</option>
                      <option value="₹5,000–₹10,000">₹5,000–₹10,000</option>
                      <option value="₹10,000+">₹10,000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Personalities (comma-separated):
                    </label>
                    <input
                      type="text"
                      value={matchingTestInputs.personalities.join(', ')}
                      onChange={e => setMatchingTestInputs({ ...matchingTestInputs, personalities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white"
                      placeholder="e.g. Romantic, Tech Lover, Practical"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Interests (comma-separated):
                    </label>
                    <input
                      type="text"
                      value={matchingTestInputs.interests.join(', ')}
                      onChange={e => setMatchingTestInputs({ ...matchingTestInputs, interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white"
                      placeholder="e.g. Photography, Books, Gaming, Fitness"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Desired Reaction:
                    </label>
                    <select
                      value={matchingTestInputs.desiredReaction}
                      onChange={e => setMatchingTestInputs({ ...matchingTestInputs, desiredReaction: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white"
                    >
                      <option value="Emotional / Tearful">Emotional / Tearful</option>
                      <option value="Surprised">Surprised</option>
                      <option value="Funny / Laugh">Funny / Laugh</option>
                      <option value="Impressed / Wow">Impressed / Wow</option>
                      <option value="Thoughtful / Sweet">Thoughtful / Sweet</option>
                      <option value="Cool / Useful">Cool / Useful</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Free-text Notes / Description:
                  </label>
                  <input
                    type="text"
                    value={matchingTestInputs.notes}
                    onChange={e => setMatchingTestInputs({ ...matchingTestInputs, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white"
                    placeholder="e.g. She loves meaningful personalized gifts."
                  />
                </div>

                <button
                  type="button"
                  disabled={isTestingMatching}
                  onClick={async () => {
                    setIsTestingMatching(true);
                    setMatchingTestResult(null);
                    try {
                      const res = await testMatchingEngineApi(matchingTestInputs as any);
                      setMatchingTestResult(res);
                    } catch (err: any) {
                      alert('Matching test failed: ' + err.message);
                    } finally {
                      setIsTestingMatching(false);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isTestingMatching ? 'Calculating 100-Point Match Score...' : 'Run Matching Test'}</span>
                </button>
              </div>

              {/* TEST RESULTS DISPLAY */}
              {matchingTestResult && (
                <div className="space-y-6">
                  {/* Generated Search Queries */}
                  {matchingTestResult.queries && (
                    <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-xs">
                      <span className="font-bold text-stone-800">Generated Search Queries for Amazon / Catalog:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {matchingTestResult.queries.map((q: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 rounded-md bg-white border border-stone-300 font-mono text-[11px] text-stone-800">
                            "{q}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4 Final Recommendations Summary */}
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                    <h3 className="font-serif text-lg font-bold text-stone-900 mb-4">
                      Final Concierge Recommendations (Customer View)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {matchingTestResult.results?.recommendations?.slice(0, 4).map((rec: any, idx: number) => (
                        <div key={rec.product.id} className="p-4 rounded-xl border border-stone-200 flex flex-col justify-between bg-stone-50/50">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-900 text-white">
                                {rec.recommendationType.replace('_', ' ')}
                              </span>
                              <span className="text-xs font-bold text-rose-700">{rec.score}/100</span>
                            </div>
                            <img src={rec.product.imageUrl} alt={rec.product.name} className="w-full h-28 object-cover rounded-lg mb-2" />
                            <h4 className="font-bold text-xs text-stone-900 line-clamp-2">{rec.product.name}</h4>
                            <p className="text-[11px] text-stone-500 font-semibold mt-1">₹{rec.product.price} • {rec.product.merchant}</p>
                            <p className="text-[11px] text-stone-700 mt-2 p-2 bg-white rounded-lg border border-stone-100">
                              <span className="font-bold text-rose-800">Why picked: </span>
                              {rec.whySelected}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full Candidate Ranking & Internal 100-pt Score Breakdown */}
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                    <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">
                      Deterministic Score Breakdown (All Candidates)
                    </h3>
                    <p className="text-xs text-stone-500 mb-4">
                      Budget (25) + Occasion (20) + Personality (20) + Interest (15) + Relationship (10) + Emotion (10) = 100 max
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-700">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="p-3">Rank & Product</th>
                            <th className="p-3">Price</th>
                            <th className="p-3 text-center">Budget (25)</th>
                            <th className="p-3 text-center">Occasion (20)</th>
                            <th className="p-3 text-center">Pers. (20)</th>
                            <th className="p-3 text-center">Int. (15)</th>
                            <th className="p-3 text-center">Rel. (10)</th>
                            <th className="p-3 text-center">Emo. (10)</th>
                            <th className="p-3 text-right">Total Score</th>
                            <th className="p-3">Match Highlights / Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {matchingTestResult.allScoredCandidates?.map((c: any, cIdx: number) => (
                            <tr key={c.product.id} className={cIdx < 4 ? 'bg-rose-50/30' : ''}>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-stone-400">#{cIdx + 1}</span>
                                  <div>
                                    <p className="font-semibold text-stone-900 line-clamp-1">{c.product.name}</p>
                                    <span className="text-[10px] text-stone-500">{c.product.category}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 font-semibold">₹{c.product.price}</td>
                              <td className="p-3 text-center font-mono">{c.breakdown?.budgetMatch}</td>
                              <td className="p-3 text-center font-mono">{c.breakdown?.occasionMatch}</td>
                              <td className="p-3 text-center font-mono">{c.breakdown?.personalityMatch}</td>
                              <td className="p-3 text-center font-mono">{c.breakdown?.interestMatch}</td>
                              <td className="p-3 text-center font-mono">{c.breakdown?.relationshipMatch}</td>
                              <td className="p-3 text-center font-mono">{c.breakdown?.emotionalReactionMatch}</td>
                              <td className="p-3 text-right">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  c.score >= 78 ? 'bg-emerald-100 text-emerald-800' : c.score >= 60 ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-800'
                                }`}>
                                  {c.score}/100
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="text-[11px] text-stone-600">
                                  {c.matchHighlights?.[0] || c.breakdown?.details?.budgetExplanation || 'General suitability'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Rejected Products List */}
                  {matchingTestResult.rejectedProducts?.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                      <h3 className="font-serif text-lg font-bold text-rose-950 mb-1">
                        Rejected Products (Quality & Validation Filter)
                      </h3>
                      <p className="text-xs text-stone-500 mb-4">
                        Items rejected before matching due to inactive status, missing price, incomplete URLs, or invalid metadata.
                      </p>
                      <div className="divide-y divide-stone-100 text-xs">
                        {matchingTestResult.rejectedProducts.map((rej: any, rIdx: number) => (
                          <div key={rIdx} className="py-2.5 flex items-center justify-between">
                            <span className="font-semibold text-stone-800">{rej.product.name}</span>
                            <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-mono text-[11px]">
                              {rej.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Product toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Product Management
                  </h2>
                  <p className="text-xs text-stone-500">
                    Manage catalog listings, verify affiliate URLs, and review items ingested by Hermes Agent.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportJson}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>

                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON</span>
                    <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                  </label>

                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>

                  <button
                    onClick={handleOpenAddAmazonModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e47911] hover:bg-[#d66a06] text-white text-xs font-semibold shadow-xs"
                    title={`Add product with Amazon Partner Tag ${DEFAULT_AMAZON_PARTNER_TAG}`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Amazon Affiliate Product</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search by product name or brand..."
                    className="w-full text-xs bg-transparent border-none focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="text-xs px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-800"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="needs_review">Needs Review</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-800"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price (INR)</th>
                        <th className="p-4">Merchant</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredProducts.map(prod => (
                        <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-stone-900 line-clamp-1">{prod.name}</p>
                                <p className="text-[11px] text-stone-400">ID: {prod.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-medium">{prod.category}</td>
                          <td className="p-4 font-bold text-stone-900">₹{prod.price.toLocaleString('en-IN')}</td>
                          <td className="p-4 text-stone-600">{prod.merchant}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prod.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prod.status === 'needs_review'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {prod.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {prod.status === 'needs_review' && (
                                <button
                                  onClick={() => handleToggleStatus(prod, 'active')}
                                  className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                                  title="Approve & Activate"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEditModal(prod)}
                                className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADMIN AI ASSISTANT */}
          {activeTab === 'assistant' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  AI Store Administrator Assistant
                </h2>
                <p className="text-xs text-stone-500">
                  Grounded strictly in your live database catalog, merchant inventory, and search history.
                </p>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Show me the most popular gift categories',
                  'Which products need review?',
                  'Give me 10 gift ideas under ₹1,000',
                  'Which occasion is getting the most searches?',
                  'Create SEO content ideas for anniversary gifts'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(chip)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-rose-300 hover:bg-rose-50 text-xs font-medium text-stone-800 transition-colors"
                  >
                    "{chip}"
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4 shadow-2xs">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${
                      msg.sender === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-rose-700 text-white flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                        msg.sender === 'admin'
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-50 text-stone-800 border border-stone-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-xs text-stone-500 italic">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-700" />
                    <span>Analyzing database inventory...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask a question about the store catalog or search metrics..."
                  className="flex-1 px-4 py-3 rounded-2xl border border-stone-300 bg-white text-xs text-stone-900 focus:ring-2 focus:ring-rose-700 focus:outline-none"
                />
                <button
                  onClick={() => handleSendChat()}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & HERMES SPEC */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  External AI Agent (Hermes) Settings
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  External agents communicate via the secure REST endpoints defined in <span className="font-mono font-bold">HERMES_AGENT_SPEC.md</span>.
                </p>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Hermes Endpoint Status:</span>
                    <span className="font-bold text-emerald-700">Active & Ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Auth Header:</span>
                    <span className="font-mono font-bold">X-Hermes-API-Key</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Default Sandbox Token:</span>
                    <span className="font-mono text-stone-700">hermes_agent_secret_key_demo</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={async () => {
                      if (confirm('Reset catalog to the default 32 seeded products?')) {
                        await adminResetProducts();
                        onRefreshProducts();
                        alert('Catalog reset complete!');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 text-xs font-semibold border border-stone-300 transition-colors"
                  >
                    Reset Catalog to Seed Database
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Gift Taxonomies & Categories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat).length;
                  return (
                    <div key={cat} className="p-5 rounded-2xl bg-white border border-stone-200">
                      <h4 className="font-bold text-stone-900 text-sm">{cat}</h4>
                      <p className="text-xs text-stone-500 mt-1">{count} verified active products</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: SEARCHES */}
          {activeTab === 'searches' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Recent Gift Searches
              </h2>
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
                {[
                  { recipient: 'Wife', occasion: 'Anniversary', budget: '₹2,000–₹5,000', emotion: 'Emotional', time: '2 mins ago' },
                  { recipient: 'Mom', occasion: 'Birthday', budget: '₹1,000–₹2,000', emotion: 'Thoughtful', time: '14 mins ago' },
                  { recipient: 'Dad', occasion: 'Father\'s Day', budget: '₹2,000–₹5,000', emotion: 'Useful', time: '42 mins ago' },
                  { recipient: 'Friend', occasion: 'Birthday', budget: 'Under ₹500', emotion: 'Funny', time: '1 hour ago' },
                  { recipient: 'Partner', occasion: 'Valentine\'s Day', budget: '₹5,000–₹10,000', emotion: 'Romantic', time: '3 hours ago' }
                ].map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-900">{s.recipient}</span> • {s.occasion} • {s.budget}
                    </div>
                    <span className="text-stone-400">{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: AFFILIATE */}
          {activeTab === 'affiliate' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Affiliate Outbound Telemetry
              </h2>
              <p className="text-xs text-stone-500">
                Tracking outbound clicks to partner merchants with affiliate attribution tags.
              </p>
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Item</th>
                      <th className="p-4">Merchant</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {(analytics?.recentClicks || [
                      { productName: 'Custom Constellation Star Map Night Light', merchant: 'Ferns N Petals', source: 'results_best_match', timestamp: 'Today' },
                      { productName: '925 Sterling Silver Interlocking Heart Pendant', merchant: 'Tata CliQ Luxury', source: 'results_emotional_choice', timestamp: 'Today' }
                    ]).map((clk: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-4 font-bold text-stone-900">{clk.productName}</td>
                        <td className="p-4 text-stone-600">{clk.merchant}</td>
                        <td className="p-4"><span className="px-2 py-0.5 rounded bg-stone-100 text-[10px]">{clk.source}</span></td>
                        <td className="p-4 text-stone-400 text-[11px]">{new Date(clk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: AMAZON INDIA CREATORS API INTEGRATION */}
          {activeTab === 'amazon' && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e47911] animate-pulse"></span>
                    <h2 className="font-serif text-2xl font-bold text-stone-900">
                      Amazon India Commerce Integration
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500">
                    Target Marketplace: <span className="font-mono font-semibold text-stone-800">www.amazon.in</span> • Architecture: <span className="font-semibold text-stone-800">Amazon Creators API (OAuth 2.0)</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAmazonStatus}
                    disabled={isLoadingAmazonStatus}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAmazonStatus ? 'animate-spin' : ''}`} />
                    <span>Refresh Status</span>
                  </button>
                </div>
              </div>

              {/* Status Alert Banner */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-bold flex items-center gap-2">
                      <span>Demo Mode Active • Amazon Partner Tag: <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 text-stone-900 font-bold">{DEFAULT_AMAZON_PARTNER_TAG}</span></span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-200 text-emerald-900">
                        Operational
                      </span>
                    </div>
                    <p className="leading-relaxed opacity-90 text-stone-700">
                      All Amazon Creators API and Hermes API credential requirements are optional. The site runs completely in Demo Mode. Your partner tag <strong className="font-mono text-stone-900">{DEFAULT_AMAZON_PARTNER_TAG}</strong> is automatically bound to manually added Amazon product links.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenAddAmazonModal}
                  className="shrink-0 px-4 py-2 rounded-xl bg-[#e47911] hover:bg-[#d66a06] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Amazon Product Manually</span>
                </button>
              </div>

              {/* Bento Grid: API Status & Importer */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel 1: Credentials & Connectivity */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#e47911]" />
                      <span>API Credentials & Status</span>
                    </h3>
                    <span className="text-[11px] font-mono text-stone-500">v{amazonStatus?.credentialVersion || '2.1'}</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-stone-600 font-medium">Target Marketplace</span>
                      <span className="font-mono font-bold text-stone-900">www.amazon.in</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-stone-600 font-medium">Partner Tag</span>
                      <span className="font-mono font-bold text-stone-900">
                        {amazonStatus?.partnerTag || 'Not Configured (Demo)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-stone-600 font-medium">API Protocol</span>
                      <span className="font-sans font-bold text-stone-800">
                        Amazon Creators API (OAuth 2.0)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-stone-600 font-medium">Legacy PA-API 5.0 Status</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Deprecated & Avoided</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-center">
                        <span className="text-[11px] text-stone-500 block">Client ID</span>
                        <span className={`font-bold text-xs ${amazonStatus?.hasClientId ? 'text-emerald-700' : 'text-stone-400'}`}>
                          {amazonStatus?.hasClientId ? '✓ Set' : '✗ Missing'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-center">
                        <span className="text-[11px] text-stone-500 block">Client Secret</span>
                        <span className={`font-bold text-xs ${amazonStatus?.hasClientSecret ? 'text-emerald-700' : 'text-stone-400'}`}>
                          {amazonStatus?.hasClientSecret ? '✓ Set' : '✗ Missing'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Test Connection Action */}
                  <div className="pt-2 border-t border-stone-100 space-y-3">
                    <button
                      onClick={handleTestAmazonConnection}
                      disabled={isTestingAmazon}
                      className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingAmazon ? 'animate-spin' : ''}`} />
                      <span>{isTestingAmazon ? 'Testing Gateway Connection...' : 'Test Connection Gateway'}</span>
                    </button>

                    {testResult && (
                      <div className={`p-3 rounded-xl text-xs space-y-1 ${
                        testResult.success
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                          : 'bg-amber-50 border border-amber-200 text-amber-900'
                      }`}>
                        <div className="font-bold flex items-center justify-between">
                          <span>{testResult.success ? 'Gateway Verified' : 'Gateway Notice'}</span>
                          {testResult.latencyMs && (
                            <span className="font-mono text-[10px]">{testResult.latencyMs}ms</span>
                          )}
                        </div>
                        <p className="text-[11px] leading-relaxed">{testResult.message}</p>
                        <p className="text-[10px] opacity-70">Checked: {new Date(testResult.timestamp).toLocaleTimeString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel 2: Product Importer Console */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-rose-700" />
                      <span>Amazon Product Importer</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold">
                      Auto Review Queue
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    Search and import products from Amazon India directly into the catalog. All imported items automatically default to <span className="font-bold text-amber-800">"Needs Review"</span> to ensure human or agent curation before going live.
                  </p>

                  <form onSubmit={handleImportAmazonProducts} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Search Keyword / Gift Theme:
                      </label>
                      <input
                        type="text"
                        required
                        value={importForm.keyword}
                        onChange={e => setImportForm({ ...importForm, keyword: e.target.value })}
                        placeholder="e.g. Silver earrings, smart watch, espresso machine"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-rose-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Min Price (₹):
                        </label>
                        <input
                          type="number"
                          value={importForm.minPrice}
                          onChange={e => setImportForm({ ...importForm, minPrice: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Max Price (₹):
                        </label>
                        <input
                          type="number"
                          value={importForm.maxPrice}
                          onChange={e => setImportForm({ ...importForm, maxPrice: e.target.value })}
                          placeholder="e.g. 5000"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Category:
                        </label>
                        <select
                          value={importForm.category}
                          onChange={e => setImportForm({ ...importForm, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                        >
                          {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Target Occasion:
                        </label>
                        <select
                          value={importForm.occasion}
                          onChange={e => setImportForm({ ...importForm, occasion: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                        >
                          <option value="Anniversary">Anniversary</option>
                          <option value="Birthday">Birthday</option>
                          <option value="Wedding">Wedding</option>
                          <option value="Valentine's Day">Valentine's Day</option>
                          <option value="Housewarming">Housewarming</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Max Items to Import:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={importForm.limit}
                        onChange={e => setImportForm({ ...importForm, limit: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isImportingAmazon}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#e47911] hover:bg-[#d66a06] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors"
                    >
                      <Download className={`w-3.5 h-3.5 ${isImportingAmazon ? 'animate-spin' : ''}`} />
                      <span>{isImportingAmazon ? 'Importing Products from Amazon...' : 'Import Products to Catalog'}</span>
                    </button>
                  </form>

                  {importResult && (
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">
                          {importResult.count > 0 ? `Imported ${importResult.count} Products` : 'Import Finished'}
                        </span>
                        {importResult.demoMode && (
                          <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold">
                            Demo Mode
                          </span>
                        )}
                      </div>
                      <p className="text-stone-600 text-[11px] leading-relaxed">
                        {importResult.message}
                      </p>
                      {importResult.count > 0 && (
                        <button
                          onClick={() => {
                            setActiveTab('products');
                            setStatusFilter('needs_review');
                          }}
                          className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-800 font-bold text-xs"
                        >
                          <span>Review Imported Products ({products.filter(p => p.status === 'needs_review').length})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Telemetry & Catalog Status Table */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Amazon India Catalog & Outbound Metrics
                    </h3>
                    <p className="text-xs text-stone-500">
                      Real-time inventory and outbound clicks routed to amazon.in
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200">
                      Amazon Products: <span className="font-bold text-stone-900">{products.filter(p => p.source === 'amazon' || p.merchant?.toLowerCase().includes('amazon')).length}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                      Needs Review: <span className="font-bold">{products.filter(p => (p.source === 'amazon' || p.merchant?.toLowerCase().includes('amazon')) && p.status === 'needs_review').length}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">ASIN</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products
                        .filter(p => p.source === 'amazon' || p.merchant?.toLowerCase().includes('amazon'))
                        .slice(0, 6)
                        .map(item => (
                          <tr key={item.id} className="hover:bg-stone-50/50">
                            <td className="p-3 font-semibold text-stone-900 max-w-xs truncate">
                              {item.name}
                            </td>
                            <td className="p-3 font-mono text-stone-500">
                              {item.asin || '—'}
                            </td>
                            <td className="p-3 text-stone-600">{item.category}</td>
                            <td className="p-3 font-bold text-stone-900">
                              {item.isPriceAvailable !== false && item.price > 0 ? `₹${item.price.toLocaleString('en-IN')}` : 'Unavailable'}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <a
                                href={item.affiliateUrl || item.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-[#e47911] hover:underline flex items-center gap-1"
                              >
                                <span>Amazon</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Policy & Affiliate Disclosure Section */}
              <div className="bg-stone-900 text-stone-200 p-6 rounded-2xl border border-stone-800 space-y-2 text-xs">
                <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Amazon Creators API & Associates Compliance</span>
                </h4>
                <p className="text-stone-400 leading-relaxed text-[11px]">
                  All outbound links to Amazon products append your configured <span className="font-mono text-amber-300">AMAZON_PARTNER_TAG</span>. Our storefront embeds the mandated legal disclosure on every recommendation page and does not fabricate prices or ratings when unavailable from the Creators API.
                </p>
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-400">
                  "As an Amazon Associate, Perfect Gift AI earns from qualifying purchases. Product prices, ratings, and availability are accurate as of the date/time indicated and are subject to change."
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {editingProduct.id ? 'Edit Product' : 'Add New Product to Catalog'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Configure product details and manual Amazon affiliate tracking links.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  editingProduct.source === 'amazon' || editingProduct.merchant === 'Amazon.in'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-100 text-stone-700'
                }`}>
                  {editingProduct.source === 'amazon' || editingProduct.merchant === 'Amazon.in'
                    ? `Amazon.in • Tag: ${DEFAULT_AMAZON_PARTNER_TAG}`
                    : 'Standard Merchant'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Source Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Product Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const asin = editingProduct.asin || '';
                      setEditingProduct({
                        ...editingProduct,
                        source: 'amazon',
                        merchant: 'Amazon.in',
                        productUrl: editingProduct.productUrl && editingProduct.productUrl !== 'https://example.com/item'
                          ? editingProduct.productUrl
                          : (asin ? `https://www.amazon.in/dp/${asin}` : 'https://www.amazon.in/dp/'),
                        affiliateUrl: editingProduct.affiliateUrl || (asin ? `https://www.amazon.in/dp/${asin}?tag=${DEFAULT_AMAZON_PARTNER_TAG}` : `https://www.amazon.in/dp/?tag=${DEFAULT_AMAZON_PARTNER_TAG}`)
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                      editingProduct.source === 'amazon' || editingProduct.merchant === 'Amazon.in'
                        ? 'border-[#e47911] bg-amber-50/70 text-[#9c4d05]'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#e47911]" />
                    <span>Amazon India (Affiliate Link)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct({
                        ...editingProduct,
                        source: 'curated',
                        merchant: editingProduct.merchant === 'Amazon.in' ? 'Artisan Works' : editingProduct.merchant
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                      editingProduct.source !== 'amazon' && editingProduct.merchant !== 'Amazon.in'
                        ? 'border-stone-800 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Direct / Independent Merchant</span>
                  </button>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Product Name <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Personalized Wooden Photo Keepsake"
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-600"
                />
              </div>

              {/* Amazon-Specific URL and ASIN Panel */}
              {(editingProduct.source === 'amazon' || editingProduct.merchant === 'Amazon.in') && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#e47911]" />
                      <span>Amazon India Affiliate Link Configuration</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                      Partner Tag: {DEFAULT_AMAZON_PARTNER_TAG}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Amazon ASIN (10 chars):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. B08N5WRWNW"
                        maxLength={10}
                        value={editingProduct.asin || ''}
                        onChange={e => {
                          const val = e.target.value.trim().toUpperCase();
                          setEditingProduct({
                            ...editingProduct,
                            asin: val,
                            productUrl: val ? `https://www.amazon.in/dp/${val}` : editingProduct.productUrl,
                            affiliateUrl: val ? `https://www.amazon.in/dp/${val}?tag=${DEFAULT_AMAZON_PARTNER_TAG}` : editingProduct.affiliateUrl
                          });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-mono uppercase bg-white text-stone-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!editingProduct.asin) {
                            alert('Please enter a 10-character Amazon ASIN first (e.g. B08N5WRWNW)');
                            return;
                          }
                          const asin = editingProduct.asin.trim().toUpperCase();
                          setEditingProduct({
                            ...editingProduct,
                            asin,
                            productUrl: `https://www.amazon.in/dp/${asin}`,
                            affiliateUrl: `https://www.amazon.in/dp/${asin}?tag=${DEFAULT_AMAZON_PARTNER_TAG}`
                          });
                        }}
                        className="w-full py-1.5 px-3 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-[11px] font-semibold text-amber-900 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#e47911]" />
                        <span>Autofill Links with ASIN & Partner Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* Product URL */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Amazon Product Page URL:
                    </label>
                    <input
                      type="url"
                      placeholder="Paste any Amazon.in product link (e.g. https://www.amazon.in/dp/B08N5WRWNW)"
                      value={editingProduct.productUrl || ''}
                      onChange={e => {
                        const url = e.target.value;
                        const extractedAsin = extractAmazonAsin(url);
                        const autoAffiliate = url ? buildAmazonAffiliateUrl(url, DEFAULT_AMAZON_PARTNER_TAG) : '';

                        setEditingProduct({
                          ...editingProduct,
                          productUrl: url,
                          asin: extractedAsin || editingProduct.asin,
                          affiliateUrl: autoAffiliate || editingProduct.affiliateUrl
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-mono bg-white text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-stone-500 mt-0.5 block">
                      Pasting an Amazon URL will automatically extract the ASIN and append tag={DEFAULT_AMAZON_PARTNER_TAG}.
                    </span>
                  </div>

                  {/* Affiliate URL */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-stone-700">
                        Outbound Affiliate URL (with Tag):
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const current = editingProduct.affiliateUrl || editingProduct.productUrl || '';
                            if (current) {
                              setEditingProduct({
                                ...editingProduct,
                                affiliateUrl: buildAmazonAffiliateUrl(current, DEFAULT_AMAZON_PARTNER_TAG)
                              });
                            }
                          }}
                          className="text-[10px] font-bold text-[#e47911] hover:underline flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Attach tag={DEFAULT_AMAZON_PARTNER_TAG}</span>
                        </button>
                        {editingProduct.affiliateUrl && (
                          <a
                            href={editingProduct.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-stone-600 hover:text-stone-900 flex items-center gap-0.5"
                          >
                            <span>Test</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder={`https://www.amazon.in/dp/ASIN?tag=${DEFAULT_AMAZON_PARTNER_TAG}`}
                      value={editingProduct.affiliateUrl || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, affiliateUrl: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-mono bg-white text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Price, Category, Merchant */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Price (INR ₹) <span className="text-rose-600">*</span>:
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1499"
                    value={editingProduct.price || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category:
                  </label>
                  <select
                    value={editingProduct.category || 'Personalized Items'}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Merchant Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.merchant || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, merchant: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-600"
                  />
                </div>
              </div>

              {/* Rating, Reviews, Availability, Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Rating (1.0–5.0):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingProduct.rating ?? 4.8}
                    onChange={e => setEditingProduct({ ...editingProduct, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Review Count:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.reviewCount ?? 50}
                    onChange={e => setEditingProduct({ ...editingProduct, reviewCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Availability:
                  </label>
                  <select
                    value={editingProduct.availability || 'in_stock'}
                    onChange={e => setEditingProduct({ ...editingProduct, availability: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="limited_stock">Limited Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Catalog Status:
                  </label>
                  <select
                    value={editingProduct.status || 'active'}
                    onChange={e => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="needs_review">Needs Review</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Image URL & Thumbnail Preview */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Image URL:
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or Amazon media link"
                    value={editingProduct.imageUrl || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-600"
                  />
                  {editingProduct.imageUrl && (
                    <img
                      src={editingProduct.imageUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Description & AI Product Tagging (Section 4) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Product Description:
                  </label>
                  <button
                    type="button"
                    disabled={isAiTaggingRunning || (!editingProduct.name && !editingProduct.description)}
                    onClick={async () => {
                      setIsAiTaggingRunning(true);
                      try {
                        const tags = await aiSuggestTagsApi(editingProduct);
                        setEditingProduct({
                          ...editingProduct,
                          category: tags.category || editingProduct.category,
                          subcategory: tags.subcategory || editingProduct.subcategory,
                          recipientTags: tags.recipientTags,
                          relationships: tags.recipientTags,
                          relationshipTags: tags.relationshipTags,
                          occasionTags: tags.occasionTags,
                          occasions: tags.occasionTags,
                          personalityTags: tags.personalityTags,
                          interestTags: tags.interestTags,
                          emotionTags: tags.emotionTags,
                          emotionalTags: tags.emotionTags,
                          budgetMin: tags.budgetMin,
                          budgetMax: tags.budgetMax
                        });
                      } catch (err: any) {
                        alert('AI Tagging failed: ' + err.message);
                      } finally {
                        setIsAiTaggingRunning(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-700" />
                    <span>{isAiTaggingRunning ? 'AI Extracting Tags...' : '✨ AI Suggest Matching Tags'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Detailed description highlighting gifting reasons, materials, and presentation..."
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-600"
                />
              </div>

              {/* Tagging Engine Attributes (Normalized & Admin Editable - Section 3 & 4) */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-700" />
                    <span>Intelligent Gift Matching Tags</span>
                  </span>
                  <span className="text-[10px] text-stone-500">Edit or refine AI-suggested tags before publishing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Recipient Tags (comma-separated):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wife, Girlfriend, Partner, Mom"
                      value={(editingProduct.recipientTags || editingProduct.relationships || []).join(', ')}
                      onChange={e => {
                        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setEditingProduct({ ...editingProduct, recipientTags: arr, relationships: arr });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Occasion Tags (comma-separated):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Anniversary, Birthday, Valentine's Day"
                      value={(editingProduct.occasionTags || editingProduct.occasions || []).join(', ')}
                      onChange={e => {
                        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setEditingProduct({ ...editingProduct, occasionTags: arr, occasions: arr });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Personality Tags (comma-separated):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Romantic, Sentimental, Creative"
                      value={(editingProduct.personalityTags || []).join(', ')}
                      onChange={e => {
                        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setEditingProduct({ ...editingProduct, personalityTags: arr });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Interest Tags (comma-separated):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Photography, Books, Travel"
                      value={(editingProduct.interestTags || []).join(', ')}
                      onChange={e => {
                        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setEditingProduct({ ...editingProduct, interestTags: arr });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Emotion / Desired Reaction Tags:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Emotional, Surprised, Thoughtful"
                      value={(editingProduct.emotionTags || editingProduct.emotionalTags || []).join(', ')}
                      onChange={e => {
                        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setEditingProduct({ ...editingProduct, emotionTags: arr, emotionalTags: arr });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Budget Min (₹):
                      </label>
                      <input
                        type="number"
                        placeholder="500"
                        value={editingProduct.budgetMin || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, budgetMin: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Budget Max (₹):
                      </label>
                      <input
                        type="number"
                        placeholder="2000"
                        value={editingProduct.budgetMax || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, budgetMax: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <div className="text-[11px] text-stone-500">
                  {editingProduct.source === 'amazon' ? (
                    <span className="text-[#9c4d05] font-semibold">
                      Outbound clicks will credit to StoreID: {DEFAULT_AMAZON_PARTNER_TAG}
                    </span>
                  ) : (
                    <span>Direct merchant listing</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
                  >
                    {isSavingProduct ? 'Saving...' : 'Save Product to Catalog'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
