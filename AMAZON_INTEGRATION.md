# Amazon India Creators API Integration Architecture

## Overview

**Perfect Gift AI** integrates with Amazon India (`www.amazon.in`) to power real-time gift recommendations, stock checking, and affiliate commerce.

> **CRITICAL ARCHITECTURAL REQUIREMENT:**  
> The deprecated Amazon Product Advertising API 5.0 (PA-API 5.0) is **NOT** used.  
> The system utilizes the **Amazon Creators API** architecture with modern OAuth 2.0 authentication, structured payloads, and autonomous agent readiness.

---

## 1. Optional Integration & Demo Mode Fallback

The Amazon integration is completely **optional**. If credentials are not configured in the environment:
- The server automatically activates **Demo Mode** (`status.mode === 'demo'`).
- The application executes gift searches using the local seed catalog without disruption or API errors.
- The storefront displays a clear informational notice: `"Amazon integration is not connected. Showing demo gift recommendations."`
- The Admin Console shows an **Amazon India** panel indicating Demo Mode status and allows connection testing anytime.

---

## 2. Environment Variables

Store these variables in your `.env` or container settings. **Never expose these in client-side code.**

```env
# Target Marketplace: www.amazon.in
AMAZON_CLIENT_ID=your_creators_client_id
AMAZON_CLIENT_SECRET=your_creators_client_secret
AMAZON_CREDENTIAL_VERSION=2.1
AMAZON_PARTNER_TAG=your_affiliate_partner_tag-21
```

- **AMAZON_CLIENT_ID**: Amazon Creators API OAuth 2.0 Client Identifier.
- **AMAZON_CLIENT_SECRET**: Amazon Creators API OAuth 2.0 Client Secret.
- **AMAZON_CREDENTIAL_VERSION**: Credential specification version (defaults to `2.1`).
- **AMAZON_PARTNER_TAG**: Amazon India Associates Partner Tag used for signing outbound affiliate links.

---

## 3. Server-Side Service Architecture

Located in `/services/`:

### `/services/amazonCreatorsApi.ts`
- **`isAmazonConfigured()`**: Safe boolean validation of credentials without crashing on undefined variables.
- **`getAmazonAccessToken()`**: Server-side OAuth 2.0 client credential token acquisition with in-memory caching and automatic expiration refresh.
- **`searchAmazonProducts(params)`**: Executes queries against the Creators API, filtered by budget in INR (converted to paise where required), occasion, and category.
- **`getAmazonProduct(asin)`**: Retrieves single item by ASIN with up-to-date pricing and availability.
- **`getAmazonProducts(asins)`**: Batch product fetch.
- **`getAmazonCategories()`**: Returns taxonomy of gift categories supported on Amazon India.
- **`mapAmazonItemToProduct(item)`**: Canonical mapping from raw Amazon item payloads to internal `Product` schema.

### `/services/amazonSearch.ts`
- **`generateAmazonSearchQueries(inputs)`**: Translates recipient, occasion, personality, budget, and desired emotion into 3-4 high-intent search query strings (e.g., `"anniversary gift for wife jewellery"`, `"birthday thoughtful gift under 2000"`).
- **`executeAmazonGiftSearch(inputs, existingProducts)`**: Orchestrates multi-query search, deduplicates ASINs, falls back cleanly to seed catalog if live mode is inactive or returns zero results.

---

## 4. API Endpoints

### Storefront & Admin Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/amazon/status` | `GET` | Returns integration status, marketplace (`www.amazon.in`), credentials state, and partner tag (masked). |
| `/api/amazon/test-connection` | `POST` | Performs real-time latency check and handshake against Amazon Creators API gateway. |
| `/api/amazon/categories` | `GET` | Returns supported Amazon India gift categories. |
| `/api/amazon/search` | `GET` | Search Amazon India catalog by keyword, price range, and occasion. |
| `/api/amazon/import` | `POST` | Imports Amazon items into the catalog with initial `status: 'needs_review'`. |
| `/api/analytics/track` | `POST` | Logs outbound affiliate clicks (`amazon_outbound_click`) with ASIN attribution. |

### Hermes Agent Autonomous Endpoints

External AI agents (such as Hermes) can manage and audit Amazon inventory:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/hermes/amazon/search` | `POST` | Agentic search with parameter filtering. |
| `/api/hermes/amazon/check-stock` | `POST` | Validates stock and pricing for an ASIN and updates `lastCheckedAt`. |
| `/api/hermes/amazon/report` | `GET` | Generates summary of Amazon inventory, active vs review counts, and click telemetry. |

---

## 5. Compliance & Pricing Rules

In compliance with Amazon Associates Operating Agreement:

1. **No Data Fabrication**:
   - If price is unavailable from the API, the UI displays `"Information unavailable"` instead of guessing or hardcoding.
   - If ratings or review counts are unavailable, the UI displays `"Rating: Information unavailable"`.
2. **Timestamps**:
   - Displays `"Last checked: [Date/Time]"` on product cards.
3. **Mandatory Affiliate Disclosure**:
   The application displays the following disclosure across all recommendation pages:
   > *"As an Amazon Associate, Perfect Gift AI earns from qualifying purchases at no additional cost to you. Product prices, ratings, and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon.in at the time of purchase will apply to the purchase of this product."*
