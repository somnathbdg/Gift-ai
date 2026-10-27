# Perfect Gift AI 🎁
> *"Tell us about them. We'll find the gift."*

Perfect Gift AI is an AI-powered personalized gift discovery platform. Instead of forcing users to scroll through endless generic product grids, Perfect Gift AI acts as a sophisticated concierge. It understands relationships, milestones, personalities, interests, budgets, and desired emotional reactions to curate thoughtful gifts from a verified product database.

---

## 🚀 Key Features

- **8-Step AI Gift Finder**: Mobile-optimized concierge wizard capturing relationship, celebration, budget, personality, passions, desired reaction (Emotional, Surprised, Funny, Impressed, Thoughtful, Cool), and custom nuances.
- **AI Recommendation Engine**: Powered by Google Gemini (`gemini-3.8-flash`) server-side with transparent matching scores:
  - Budget Match (25%)
  - Occasion Match (20%)
  - Personality Match (20%)
  - Interest Match (15%)
  - Relationship Match (10%)
  - Emotional Reaction Match (10%)
  - User-facing status: *Excellent Match*, *Great Match*, *Good Match* (zero fake precision).
- **Three-Tier Recommendations**:
  1. *Best Match* (optimal balance of all criteria)
  2. *Emotional Choice* (deep sentimental resonance)
  3. *Budget / Premium Alternative* (smart value or milestone upgrade)
- **Gift Personalization Suite**:
  - **AI Gift Message Generator**: Crafts heartfelt, romantic, witty, or formal enclosure messages with instant copy and regeneration.
  - **Digital Gift Card Studio**: Custom live card preview with 5 designer visual aesthetics (Romantic, Elegant, Birthday, Minimal, Celebration) plus print/download/share capabilities.
  - **Surprise Reveal Planner**: Tailored surprise reveal blueprints (e.g. Scavenger Hunt, Memory Trail, Breakfast Reveal).
  - **Verified Gift Bundles**: Pairs the primary gift with genuine companion database products with exact calculated INR pricing.
- **Dynamic SEO Landing Pages**: Pre-built, metadata-optimized pages for `/gifts-for-wife`, `/gifts-for-husband`, `/gifts-for-mom`, `/birthday-gifts`, `/anniversary-gifts`, `/gifts-under-1000`, etc.
- **Comprehensive Admin Dashboard**:
  - Real-time metrics: Total Users, Searches, Product Clicks, Affiliate Clicks, Top Occasion, Top Category.
  - Full Product CRUD with instant search, tag filtering, and JSON import/export.
  - **Admin AI Assistant**: Natural language store assistant querying live inventory and search telemetry.
- **Demo Mode**: Full functionality out of the box even before API keys are connected, with clear indicator pills and zero mock fabrications.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion
- **Backend**: Express 4, Node.js (TSX / Esbuild)
- **AI Engine**: Google Gen AI SDK (`@google/genai` with `gemini-3.8-flash`)
- **Persistence / Architecture**: Server-side in-memory data store with full RESTful CRUD and JSON sync
- **Deployment**: Single-port full-stack container on Port 3000

---

## 🔑 Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | Google Gemini API Key for dynamic LLM descriptions. If omitted, app operates in Demo Mode. |
| `APP_URL` | Auto-injected | Canonical public app URL. |

> **Note on Demo Mode**: The application runs completely in Demo Mode without requiring any API keys or secrets. All features—including the Gift Finder wizard, Personalization Studio, Catalog Search, and Admin Console—are instantly accessible for testing and previewing.

---

## 💻 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Server binds to `http://localhost:3000`.

3. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🤖 Configuring Gemini AI (Optional)

1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. In AI Studio Build, open **Settings > Secrets** and add `GEMINI_API_KEY`.
3. Perfect Gift AI will detect the key and activate live Gemini recommendations, message generation, and surprise planning.

---

## 🛡 Demo Mode

When running without any API keys configured:
- The backend utilizes deterministic multi-attribute scoring algorithms, curated templates, and verified database product matching.
- The UI status badge in the header displays `Demo Mode`.
- The Admin Console is unlocked for instant testing.

---

## 🧑‍💼 Admin Dashboard Access

- Click **Admin** in the header or footer navigation.
- In Demo Mode, simply click **Unlock Dashboard** or **Enter Demo Mode Directly** for instant preview access.
- Manage products, inspect click analytics, test search queries, or chat with the **AI Admin Assistant**.

---

## 🛒 Amazon India Commerce Integration (Creators API)

Perfect Gift AI supports **Amazon India (`www.amazon.in`)** affiliate commerce using the **Amazon Creators API** (avoiding deprecated PA-API 5.0).

- **Optional Setup**: Runs fully in **Demo Mode** with seed products if Amazon credentials are not supplied.
- **Dynamic Search & Stock Check**: Live queries retrieve real-time ASINs, pricing, and stock status.
- **Admin Control**: The **Amazon India** tab in the Admin Dashboard provides connection latency testing, one-click catalog import with automatic `'needs_review'` status, and outbound telemetry.
- **Affiliate Disclosure**: Built-in compliance with Amazon Associates Operating Agreement rules and no fabricated pricing/ratings.

For full technical details and environment setup, see [`AMAZON_INTEGRATION.md`](./AMAZON_INTEGRATION.md).
