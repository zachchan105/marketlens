# MarketLens

A clean stock market dashboard built with Next.js and the AlphaVantage API.

## Quick Start

```bash
# Install dependencies
pnpm install

# Add your API key
echo "ALPHAVANTAGE_API_KEY=your_key_here" > .env.local

# Fetch company logos (one-time setup)
./scripts/fetch-logos.sh

# Run development server
pnpm dev
```

Visit `http://localhost:3000`

## Features

- 18 popular stocks on the homepage
- Detailed company info, price history, and charts
- Dark/light mode
- Fully responsive
- Works offline after initial data fetch

## The AlphaVantage Challenge

The free tier has strict limits:
- **25 requests per day**
- **5 requests per minute**

For 18 stocks with full data, that's 36 requests (OVERVIEW + PRICES for each). This exceeds the daily limit.

## How I Solved It

**Static Homepage**
- No API calls for the homepage
- Shows 18 stock cards with logos and basic info
- Instant load, always available

**Smart Caching**
- Data fetches happen when you click a stock
- Cached for 24 hours (prices) or 7 days (company info)
- Old cache is never deleted - used as fallback when limits are hit
- Shows freshness badges: "Live Data", "2h ago", etc.

**Graceful Degradation**
- If you hit the rate limit, old cached data is shown
- Clear indicators tell you when data is stale
- No crashes, no blank pages

**Real Usage Pattern:**
- First visit: Can view ~12 different stocks
- After that: Everything loads instantly from cache
- Works great for normal browsing

## Engineering Decisions

### Caching

MarketLens uses simple **file-based caching** for clarity and control.
It's stored in `.next/cache/alphavantage`, which works well for self-hosted or long-running instances.
On platforms like **Vercel** or **Coolify**, this cache may reset during rebuilds since those environments create new containers per deploy.
For a larger production setup, I'd likely switch to **Redis** for persistent and distributed caching.
For this project, file-based storage keeps things transparent and avoids unnecessary dependencies.

### Logos

Logos are stored **locally** in `/public/logos` rather than fetched live from Clearbit.
This avoids API dependency issues and ensures consistent visuals and offline reliability.
It also makes it easy to replace or edit logos manually later.

### Rate Limits

AlphaVantage's 25-call/day cap shaped how data is fetched:

* **Prices:** Cached for 24h (frequently changing)
* **Overviews:** Cached for 7d (rarely changing, staggered refresh)
* Old cache is reused when limits are hit

This design guarantees smooth behavior even when the free-tier API quota is reached.

## Project Structure

```
app/
├── page.tsx                    # Homepage (static)
├── stocks/[symbol]/page.tsx    # Stock details (dynamic)
└── api/
    ├── overview/route.ts       # Company data endpoint
    └── prices/route.ts         # Price data endpoint

lib/
├── alphavantage.ts             # API client with rate limiting
├── cache.ts                    # File-based cache
├── normalize.ts                # Data formatting
└── tickers.ts                  # Stock list

components/
├── stock-chart.tsx             # Price history chart
├── stock-metrics.tsx           # Key statistics
├── price-history.tsx           # Price table
└── data-freshness-badge.tsx    # Cache indicators
```

## Tech Stack

- **Next.js 15** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Charts
- **AlphaVantage** - Stock data
- **pnpm** - Package manager

## API Endpoints

### GET `/api/overview?symbol=AAPL`
Returns company information (name, sector, description, market cap, etc.)

### GET `/api/prices?symbol=AAPL`
Returns 100 days of price history with calculated daily changes

Both endpoints include cache metadata.

## Development

```bash
# Type check
pnpm tsc --noEmit

# Build for production
pnpm build

# Run production build
pnpm start
```

## Deployment

Works on Vercel, Netlify, or any platform that supports Next.js.

Add your `ALPHAVANTAGE_API_KEY` environment variable in your deployment settings.

## Notes

- Company logos are stored locally in `/public/logos/`
- Cache is stored in `.next/cache/alphavantage/`
- The rate limiter ensures we stay under API limits
- All 18 stocks can be viewed after the initial cache population
