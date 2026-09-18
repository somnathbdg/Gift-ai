import React from 'react';
import { ArrowLeft, Cpu, Copy, Check, ShieldCheck, Terminal, BookOpen } from 'lucide-react';

interface HermesSpecViewProps {
  onBack: () => void;
}

export const HermesSpecView: React.FC<HermesSpecViewProps> = ({ onBack }) => {
  const [copiedCurl, setCopiedCurl] = React.useState(false);

  const curlExample = `curl -X POST https://your-domain.com/api/hermes/products \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Artisanal Pour-Over Coffee Brewer",
    "category": "Food",
    "subcategory": "Beverages",
    "price": 1899,
    "merchant": "Blue Tokai",
    "productUrl": "https://example.com/brewer",
    "rating": 4.8,
    "reviewCount": 110,
    "occasions": ["Birthday", "Housewarming"],
    "personalityTags": ["Foodie", "Practical"],
    "interestTags": ["Cooking", "Food"]
  }'
# Note: In Demo Mode, no API key is required. 
# In production, optionally add -H "X-Hermes-API-Key: your_secret_key"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlExample);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Storefront</span>
      </button>

      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold mb-3">
            <Cpu className="w-4 h-4 text-rose-700" />
            <span>Autonomous Commerce Architecture</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900">
            Hermes Agent Headless Specification
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-2 leading-relaxed">
            Perfect Gift AI is engineered with full headless REST endpoints allowing autonomous external agents (e.g. Hermes Agent) to discover products, monitor stock integrity, submit SEO drafts, and inspect analytics.
          </p>
        </div>

        {/* Authentication Notice */}
        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-stone-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authentication Protocol (Demo Mode: Open & Optional)</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            In Demo Mode, the Hermes REST architecture is active and permits requests without requiring any API key so developers and external agents can test immediately. In production, configuring <code className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-900 font-mono">HERMES_API_KEY</code> activates strict token validation via the <code className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-900 font-mono">X-Hermes-API-Key</code> header.
            Ingested items default to status <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">needs_review</code> to preserve catalog integrity.
          </p>
        </div>

        {/* Workflows Overview */}
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Automated Operational Workflows
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <span className="font-bold text-rose-700 uppercase">Workflow A — Product Research</span>
              <p className="text-stone-600 mt-1">
                Hermes validates specifications in INR, classifies relationships and occasions, and calls <code className="font-mono">POST /api/hermes/products</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <span className="font-bold text-rose-700 uppercase">Workflow B — Price & Stock Monitoring</span>
              <p className="text-stone-600 mt-1">
                Hermes probes merchant URLs periodically and updates only verified live attributes via <code className="font-mono">PUT /api/hermes/products/:id</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <span className="font-bold text-rose-700 uppercase">Workflow C — SEO Editorial Drafts</span>
              <p className="text-stone-600 mt-1">
                Hermes queries trending gift searches via <code className="font-mono">GET /api/hermes/analytics</code> and deposits buying guide drafts into the review queue.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <span className="font-bold text-rose-700 uppercase">Workflow E — Dead Link Detection</span>
              <p className="text-stone-600 mt-1">
                Dead or out-of-stock links are automatically flagged for administrator inspection via <code className="font-mono">PATCH /api/hermes/products/:id/flag</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Curl Example */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              cURL Ingestion Payload Example
            </span>
            <button
              onClick={handleCopyCurl}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>
          <pre className="p-5 rounded-2xl bg-stone-950 text-stone-200 text-xs font-mono overflow-x-auto border border-stone-800 leading-relaxed">
            {curlExample}
          </pre>
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
          <span>Complete Markdown specification available in project root: <code className="font-bold">HERMES_AGENT_SPEC.md</code></span>
          <button
            onClick={onBack}
            className="font-semibold text-rose-700 hover:underline"
          >
            Return to Store
          </button>
        </div>
      </div>
    </div>
  );
};
