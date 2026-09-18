# HERMES AGENT COMPATIBILITY SPECIFICATION
**Autonomous Agent Integration Architecture for Perfect Gift AI**

Version: 1.0.0  
Status: Production-Ready MVP Interface  
Target Agent: Hermes Agent (and compatible autonomous commerce agents)

---

## 1. Overview

Perfect Gift AI is engineered with an agent-first headless operations layer. External AI agents such as **Hermes Agent** can autonomously discover products, monitor merchant pricing and stock integrity, draft SEO content based on actual user searches, and report broken affiliate links directly through secure REST endpoints.

Hermes Agent interacts through programmatic API endpoints protected by shared secret authentication. Critical data modifications default to a human-in-the-loop review queue (`needs_review`) to protect catalog integrity.

---

## 2. Authentication & Authorization

The Hermes Agent API is designed with a future-ready authentication architecture that supports both open sandbox evaluation and hardened production environments:

- **Demo Mode (Default):** When `HERMES_API_KEY` is not set in the environment, the server operates in permissive Demo Mode. External testing tools, agents, and developers can test all `/api/hermes/*` endpoints without providing any secret key.
- **Production Mode:** When `HERMES_API_KEY` is configured in the environment, all requests strictly require authentication.

### Authentication Headers (When Configured)
Hermes provides one of the following in HTTP requests:

```http
X-Hermes-API-Key: <HERMES_API_KEY>
```
or
```http
Authorization: Bearer <HERMES_API_KEY>
```

- **Environment Variable:** `HERMES_API_KEY` (Optional; leave unset for zero-friction Demo Mode).
- **Default Sandbox Key:** `hermes_agent_secret_key_demo` (accepted whenever key validation is enabled).

---

## 3. Endpoints Reference

### 3.1. Product Operations

#### `POST /api/hermes/products`
Ingests a new product discovered during research.
- **Security Rule:** Newly ingested products are automatically assigned `status: "needs_review"`. They will not appear in user gift recommendations until approved by an administrator.
- **Payload Schema:**
```json
{
  "name": "Single-Origin Specialty Pour-Over Kit",
  "category": "Food",
  "subcategory": "Beverages",
  "price": 1899,
  "currency": "INR",
  "imageUrl": "https://example.com/product.jpg",
  "productUrl": "https://merchant.com/item",
  "merchant": "Blue Tokai",
  "affiliateUrl": "https://merchant.com/item?ref=perfectgift",
  "availability": "in_stock",
  "rating": 4.8,
  "reviewCount": 120,
  "tags": ["coffee", "pour over", "artisan"],
  "occasions": ["Birthday", "Housewarming", "Thank You"],
  "relationships": ["Friend", "Colleague", "Brother"],
  "personalityTags": ["Foodie", "Practical", "Minimalist"],
  "interestTags": ["Cooking", "Food", "Technology"],
  "emotionalTags": ["Thoughtful", "Cool"],
  "genderPreference": "unisex"
}
```
- **Response:** `201 Created` with generated product ID and status `needs_review`.

#### `PUT /api/hermes/products/:id`
Updates an existing product's specifications.
- **Safety Rule:** Product `id` is immutable.
- **Payload Schema:** Any subset of product fields (e.g. updated `availability`, `rating`, `reviewCount`).

#### `DELETE /api/hermes/products/:id`
Deactivates a product that is discontinued or out of stock.
- **Safety Rule:** This performs a soft deactivation (`status: "inactive"`), preserving historic search analytics.

#### `PATCH /api/hermes/products/:id/affiliate`
Updates or rotates affiliate link credentials.
- **Payload:**
```json
{
  "affiliateUrl": "https://partner.affiliate.com/track?id=xyz",
  "merchant": "Amazon India"
}
```

#### `PATCH /api/hermes/products/:id/flag`
Flags a product for administrative review when stock or price discrepancy is detected.
- **Payload:**
```json
{
  "reason": "Merchant URL returned 404 or out of stock during automated probe."
}
```

---

### 3.2. Product Discovery & Filtering

#### `GET /api/hermes/products`
Lists products with optional query filters:
- `?q=keyword`
- `?category=Technology`
- `?occasion=Anniversary`
- `?status=active|needs_review|inactive`
- `?limit=50`

#### `GET /api/hermes/products/category/:category`
Returns all products under a specific taxonomy branch.

#### `GET /api/hermes/products/occasion/:occasion`
Returns verified products tagged for a specific celebration.

#### `GET /api/hermes/products/budget?min=500&max=2000`
Returns products within a defined INR price boundary.

---

### 3.3. Content & SEO Publishing

#### `POST /api/hermes/content-draft`
Submits an AI-researched article or buying guide for review.
- **Safety Rule:** Content is deposited into `review_queue`. It is never auto-published to public canonical pages without approval.
- **Payload:**
```json
{
  "title": "Top 10 Romantic Anniversary Gifts for Wife Under ₹3,000",
  "targetKeyword": "anniversary gifts for wife under 3000",
  "summary": "Focuses on celestial star maps and 925 silver jewelry options with verified merchant reliability."
}
```

---

### 3.4. Analytics & Telemetry

#### `GET /api/hermes/analytics`
Returns aggregate statistics for daily health reports:
- Total product inventory count
- Active vs. needs_review product count
- Recent search volume trends
- Product click and affiliate click logs

---

## 4. Autonomous Agent Workflows

Hermes Agent operates five core automation pipelines:

### WORKFLOW A — Product Research
```
[External Web / Merchant Search]
                │
                ▼
      [Validate Specifications] (Price in INR, Stock Status, Image)
                │
                ▼
      [Categorize & Tag] (Occasion, Relationship, Personality, Emotion)
                │
                ▼
   [POST /api/hermes/products] ──> Status: "needs_review"
                │
                ▼
      [Admin Review Notification]
```

### WORKFLOW B — Product Monitoring
```
   [Periodic Cron Execution]
                │
                ▼
   [Fetch Active Products via GET /api/hermes/products]
                │
                ▼
   [Probe Merchant Page URL]
                │
         ┌──────┴──────┐
         ▼             ▼
   [Changed?]       [Matching]
         │             │
   [Update via PUT]  [Pass]
```

### WORKFLOW C — Content & SEO Optimization
```
   [GET /api/hermes/analytics] (Identify top rising search occasions)
                │
                ▼
   [Formulate High-Intent Editorial Topic]
                │
                ▼
   [Select 5 Verified Database Products]
                │
                ▼
   [POST /api/hermes/content-draft] ──> Ingested into Admin Review Queue
```

### WORKFLOW D — Daily Analytics Briefing
```
   [GET /api/hermes/analytics]
                │
                ▼
   [Compute Click-Through Ratio by Occasion]
                │
                ▼
   [Identify Inventory Gaps in High-Demand Categories]
                │
                ▼
   [Dispatch Executive Briefing to Admin]
```

### WORKFLOW E — Broken Affiliate Links & Price Verification
```
   [Probe all affiliateUrl headers]
                │
         ┌──────┴──────┐
         ▼             ▼
    [HTTP 200]    [HTTP 4xx / 5xx / Redirect Fail]
         │             │
      [Pass]    [PATCH /api/hermes/products/:id/flag]
                       │
                       ▼
               [Mark needs_review & Alert Staff]
```

---

## 5. Non-Negotiable Safety Rules for External Agents

1. **Zero Hallucination Tolerance**: Hermes must NEVER create mock products with fake prices, fabricated customer reviews, or synthetic ratings. All data ingested must correspond to verifiable merchant items.
2. **Review Queue Default**: All new product submissions and article drafts must enter the review queue before becoming public.
3. **No Direct Secret Exposure**: Hermes credentials must never be written into client-side bundles or exposed in public API responses.
4. **State Transparency**: If an external affiliate API or merchant scraper is unreachable or unconfigured, Hermes and the UI must display a clear "Not Connected" state rather than fabricating mock live data.
