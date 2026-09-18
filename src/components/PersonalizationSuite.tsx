import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  CreditCard,
  Sparkles,
  Gift,
  Copy,
  Check,
  RefreshCw,
  Download,
  Share2,
  Printer,
  ExternalLink,
  ChevronRight,
  Send,
  X
} from 'lucide-react';
import { Product, GiftBundle, SurpriseIdea } from '../types';
import { generateGiftMessage, generateSurpriseIdea, fetchGiftBundle } from '../services/api';

interface PersonalizationSuiteProps {
  product: Product | null;
  defaultTab?: 'message' | 'card' | 'surprise' | 'bundle';
  onClose?: () => void;
  recipientName?: string;
  occasion?: string;
  relationship?: string;
}

export const PersonalizationSuite: React.FC<PersonalizationSuiteProps> = ({
  product,
  defaultTab = 'message',
  onClose,
  recipientName = '',
  occasion = 'Birthday',
  relationship = 'Partner'
}) => {
  const [activeTab, setActiveTab] = useState<'message' | 'card' | 'surprise' | 'bundle'>(defaultTab);

  // --- Feature 1: Gift Message State ---
  const [tone, setTone] = useState<'Romantic' | 'Emotional' | 'Funny' | 'Sweet' | 'Short' | 'Formal'>('Emotional');
  const [senderName, setSenderName] = useState('With love');
  const [recipName, setRecipName] = useState(recipientName || 'You');
  const [userNotes, setUserNotes] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // --- Feature 2: Digital Gift Card State ---
  const [cardStyle, setCardStyle] = useState<'Romantic' | 'Elegant' | 'Birthday' | 'Minimal' | 'Celebration'>('Romantic');
  const [cardMessage, setCardMessage] = useState('');
  const [copiedCardLink, setCopiedCardLink] = useState(false);
  const cardPreviewRef = useRef<HTMLDivElement>(null);

  // --- Feature 3: Surprise Idea State ---
  const [surpriseIdea, setSurpriseIdea] = useState<SurpriseIdea | null>(null);
  const [isGeneratingSurprise, setIsGeneratingSurprise] = useState(false);

  // --- Feature 4: Gift Bundle State ---
  const [bundle, setBundle] = useState<GiftBundle | null>(null);
  const [isLoadingBundle, setIsLoadingBundle] = useState(false);

  // Sync default tab if changed
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Initial message generation
  useEffect(() => {
    handleGenerateMessage();
  }, [tone, product?.name]);

  // Fetch bundle when tab opens or product changes
  useEffect(() => {
    if (activeTab === 'bundle' && product) {
      loadBundle();
    }
  }, [activeTab, product?.id]);

  // Generate surprise idea when tab opens
  useEffect(() => {
    if (activeTab === 'surprise' && !surpriseIdea) {
      handleGenerateSurprise();
    }
  }, [activeTab]);

  // Sync card message with generated message
  useEffect(() => {
    if (generatedMessage && !cardMessage) {
      setCardMessage(generatedMessage);
    }
  }, [generatedMessage]);

  const handleGenerateMessage = async () => {
    setIsGeneratingMessage(true);
    try {
      const res = await generateGiftMessage({
        recipient: relationship,
        occasion,
        relationship,
        recipientName: recipName,
        senderName,
        userDescription: userNotes,
        selectedGiftName: product ? product.name : undefined,
        tone
      });
      setGeneratedMessage(res.message);
      if (!cardMessage || cardMessage === generatedMessage) {
        setCardMessage(res.message);
      }
    } catch (err) {
      console.warn('Failed to generate message:', err);
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleGenerateSurprise = async () => {
    setIsGeneratingSurprise(true);
    try {
      const res = await generateSurpriseIdea({
        occasion,
        recipient: relationship,
        giftName: product?.name || 'Your Special Gift',
        personality: 'Sentimental'
      });
      setSurpriseIdea(res.idea);
    } catch (err) {
      console.warn('Surprise idea generation failed:', err);
    } finally {
      setIsGeneratingSurprise(false);
    }
  };

  const loadBundle = async () => {
    if (!product) return;
    setIsLoadingBundle(true);
    try {
      const res = await fetchGiftBundle(product.id);
      setBundle(res.bundle);
    } catch (err) {
      console.warn('Bundle loading failed:', err);
    } finally {
      setIsLoadingBundle(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleCopyCardShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedCardLink(true);
    setTimeout(() => setCopiedCardLink(false), 2000);
  };

  // Card Theme Styling
  const getCardThemeClasses = (style: string) => {
    switch (style) {
      case 'Romantic':
        return {
          wrapper: 'bg-gradient-to-br from-rose-900 via-rose-950 to-stone-950 text-rose-100 border-rose-800',
          accent: 'text-rose-300 font-serif',
          chip: 'bg-rose-800/60 text-rose-200 border-rose-700'
        };
      case 'Elegant':
        return {
          wrapper: 'bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-stone-100 border-amber-500/30',
          accent: 'text-amber-300 font-serif',
          chip: 'bg-amber-950/60 text-amber-200 border-amber-800'
        };
      case 'Birthday':
        return {
          wrapper: 'bg-gradient-to-br from-amber-600 via-rose-600 to-indigo-800 text-white border-white/20',
          accent: 'text-amber-200 font-serif',
          chip: 'bg-white/20 text-white border-white/30'
        };
      case 'Minimal':
        return {
          wrapper: 'bg-white text-stone-900 border-stone-300 shadow-sm',
          accent: 'text-stone-900 font-serif',
          chip: 'bg-stone-100 text-stone-700 border-stone-200'
        };
      case 'Celebration':
      default:
        return {
          wrapper: 'bg-gradient-to-br from-teal-900 via-emerald-950 to-stone-950 text-emerald-100 border-emerald-800',
          accent: 'text-emerald-300 font-serif',
          chip: 'bg-emerald-800/60 text-emerald-200 border-emerald-700'
        };
    }
  };

  const cardTheme = getCardThemeClasses(cardStyle);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden my-8">
      {/* Header bar */}
      <div className="p-6 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-700" />
            <span>Make Your Gift Unforgettable</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Gift Personalization Studio
          </h2>
          {product && (
            <p className="text-xs text-stone-500 mt-0.5">
              Personalizing for: <span className="font-semibold text-stone-800">{product.name}</span> (₹{product.price.toLocaleString('en-IN')})
            </p>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-start sm:self-auto p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-stone-200 bg-white overflow-x-auto px-4">
        <button
          onClick={() => setActiveTab('message')}
          className={`flex items-center gap-2 py-4 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'message'
              ? 'border-rose-700 text-rose-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>1. AI Gift Message</span>
        </button>

        <button
          onClick={() => setActiveTab('card')}
          className={`flex items-center gap-2 py-4 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'card'
              ? 'border-rose-700 text-rose-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>2. Digital Gift Card</span>
        </button>

        <button
          onClick={() => setActiveTab('surprise')}
          className={`flex items-center gap-2 py-4 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'surprise'
              ? 'border-rose-700 text-rose-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>3. Surprise Reveal Planner</span>
        </button>

        <button
          onClick={() => setActiveTab('bundle')}
          className={`flex items-center gap-2 py-4 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'bundle'
              ? 'border-rose-700 text-rose-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>4. Complete Gift Bundle</span>
        </button>
      </div>

      {/* Tab 1: AI Gift Message Generator */}
      {activeTab === 'message' && (
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2 uppercase tracking-wider">
                Select Message Tone:
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Emotional', 'Romantic', 'Funny', 'Sweet', 'Short', 'Formal'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      tone === t
                        ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Recipient Name:
                </label>
                <input
                  type="text"
                  value={recipName}
                  onChange={e => setRecipName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-rose-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Sign-off Name:
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-rose-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Custom Memory or Notes (Optional):
              </label>
              <textarea
                rows={2}
                value={userNotes}
                onChange={e => setUserNotes(e.target.value)}
                placeholder="Mention an inside joke, a shared trip, or a milestone you cherish..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-rose-700"
              />
            </div>

            <button
              onClick={handleGenerateMessage}
              disabled={isGeneratingMessage}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingMessage ? 'animate-spin' : ''}`} />
              <span>{isGeneratingMessage ? 'Writing Note...' : 'Regenerate Note'}</span>
            </button>
          </div>

          {/* Result Card Preview */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  {tone} Enclosure Message
                </span>
                <span className="text-[11px] text-stone-500">Ready for Card or WhatsApp</span>
              </div>

              <div className="font-serif italic text-base text-stone-800 leading-relaxed whitespace-pre-line min-h-[140px]">
                {generatedMessage || 'Drafting your personalized message...'}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-semibold shadow-2xs transition-colors"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setCardMessage(generatedMessage);
                  setActiveTab('card');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Use on Digital Card</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Digital Gift Card */}
      {activeTab === 'card' && (
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Card Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2 uppercase tracking-wider">
                Select Card Aesthetic:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Romantic', 'Elegant', 'Birthday', 'Minimal', 'Celebration'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setCardStyle(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      cardStyle === s
                        ? 'border-rose-700 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-700/20'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Card Enclosure Text:
              </label>
              <textarea
                rows={5}
                value={cardMessage}
                onChange={e => setCardMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-rose-700"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={handlePrintCard}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </button>

              <button
                onClick={handleCopyCardShare}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-semibold shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedCardLink ? 'Link Copied!' : 'Share Digital Link'}</span>
              </button>
            </div>
          </div>

          {/* Live Card Canvas Preview (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div
              ref={cardPreviewRef}
              className={`w-full max-w-md p-8 sm:p-10 rounded-3xl border shadow-2xl relative overflow-hidden transition-all duration-300 flex flex-col justify-between min-h-[360px] ${cardTheme.wrapper}`}
            >
              {/* Subtle card emblem */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${cardTheme.chip}`}>
                  {occasion} Card
                </span>
                <span className="font-serif text-sm opacity-60 tracking-wider">
                  Perfect Gift AI
                </span>
              </div>

              {/* Message Body */}
              <div className="my-6">
                <p className="text-xs font-semibold opacity-75 mb-2">Dear {recipName || 'Friend'},</p>
                <p className="font-serif text-base sm:text-lg leading-relaxed whitespace-pre-line italic">
                  "{cardMessage || 'Wishing you the happiest celebration filled with immense love, joy, and memories.'}"
                </p>
                <p className="text-xs font-semibold text-right mt-4 opacity-80">
                  — {senderName}
                </p>
              </div>

              {/* Card Footer Badge */}
              <div className="pt-4 border-t border-current/20 flex items-center justify-between text-[10px] opacity-70">
                <span>Handcrafted Digital Keepsake</span>
                <span>{new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 mt-3 text-center">
              Preview matches print size. Use the print button to export as clean PDF or print on cardstock.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Surprise Reveal Planner */}
      {activeTab === 'surprise' && (
        <div className="p-6 sm:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Memorable Delivery
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900 mt-2">
                {surpriseIdea?.title || 'The "Memory Trail" Morning Reveal'}
              </h3>
              <p className="text-sm text-stone-600 mt-2">
                {surpriseIdea?.description ||
                  'Turn the gift presentation into an unforgettable milestone with a gradual, emotional reveal.'}
              </p>
            </div>

            {/* Actionable Steps */}
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Execution Blueprint:
              </h4>
              {(surpriseIdea?.steps || [
                'Step 1: Place a personalized clue on their morning coffee station.',
                'Step 2: Have acoustic music playing quietly as they find clue two in their favorite reading corner.',
                'Step 3: Present the wrapped gift along with your handwritten card.',
                'Step 4: Capture their reaction as they open the presentation box.'
              ]).map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-3 text-xs sm:text-sm text-stone-800">
                  <span className="w-5 h-5 rounded-full bg-rose-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {sIdx + 1}
                  </span>
                  <p>{step}</p>
                </div>
              ))}
            </div>

            {/* Props Needed */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Everyday Props Needed: </span>
                <span>
                  {surpriseIdea?.propsNeeded.join(', ') || 'Handwritten note cards, morning coffee, warm ambient lighting'}
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleGenerateSurprise}
                disabled={isGeneratingSurprise}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSurprise ? 'animate-spin' : ''}`} />
                <span>Generate Another Surprise Idea</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Complete Gift Bundle */}
      {activeTab === 'bundle' && (
        <div className="p-6 sm:p-8">
          {isLoadingBundle ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 text-rose-700 animate-spin mx-auto mb-2" />
              <p className="text-sm text-stone-600">Curating companion products from verified database...</p>
            </div>
          ) : bundle ? (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  All-In-One Presentation
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
                  Curated Companion Bundle
                </h3>
                <p className="text-sm text-stone-600 mt-1">
                  {bundle.bundleReason}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Main Product */}
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                      Primary Gift
                    </span>
                    <img
                      src={bundle.mainProduct.imageUrl}
                      alt={bundle.mainProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-4/3 object-cover rounded-xl mt-3 mb-3"
                    />
                    <h4 className="font-serif font-bold text-stone-900 text-sm mb-1">
                      {bundle.mainProduct.name}
                    </h4>
                    <p className="text-xs text-stone-500">{bundle.mainProduct.merchant}</p>
                  </div>
                  <p className="text-sm font-bold text-stone-900 mt-3 pt-3 border-t border-stone-200">
                    ₹{bundle.mainProduct.price.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* 2. Companion Product */}
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Companion Treat
                    </span>
                    <img
                      src={bundle.companionProduct.imageUrl}
                      alt={bundle.companionProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-4/3 object-cover rounded-xl mt-3 mb-3"
                    />
                    <h4 className="font-serif font-bold text-stone-900 text-sm mb-1">
                      {bundle.companionProduct.name}
                    </h4>
                    <p className="text-xs text-stone-500">{bundle.companionProduct.merchant}</p>
                  </div>
                  <p className="text-sm font-bold text-stone-900 mt-3 pt-3 border-t border-stone-200">
                    ₹{bundle.companionProduct.price.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* 3. Card / Enclosure Product */}
                {bundle.cardProduct && (
                  <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-md">
                        Enclosure & Note
                      </span>
                      <img
                        src={bundle.cardProduct.imageUrl}
                        alt={bundle.cardProduct.name}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-4/3 object-cover rounded-xl mt-3 mb-3"
                      />
                      <h4 className="font-serif font-bold text-stone-900 text-sm mb-1">
                        {bundle.cardProduct.name}
                      </h4>
                      <p className="text-xs text-stone-500">{bundle.cardProduct.merchant}</p>
                    </div>
                    <p className="text-sm font-bold text-stone-900 mt-3 pt-3 border-t border-stone-200">
                      ₹{bundle.cardProduct.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
              </div>

              {/* Total Calculated Pricing */}
              <div className="p-6 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-stone-400 uppercase tracking-wider">
                    Total Calculated Bundle Price:
                  </span>
                  <div className="text-3xl font-serif font-bold text-white mt-0.5">
                    ₹{bundle.totalPrice.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Sum total of genuine merchant products with zero hidden fees.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const target = bundle.mainProduct.affiliateUrl || bundle.mainProduct.productUrl;
                    window.open(target, '_blank');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span>Shop Bundle Items</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
