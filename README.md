# MarketLens

A clean stock market dashboard built with Next.js and the AlphaVantage API.

## Quick Start

```bash
# Install dependencies
pnpm install

# Add your API key
echo "ALPHAVANTAGE_API_KEY=your_key_here" > .env.local

# Fetch company logos (one-time setup, logos already installed for default stocks)
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

## The AlphaVantage Challenge

The free tier has strict limits:
- **25 requests per day**
- **5 requests per minute**

For 18 stocks with full data, that's 36 requests (OVERVIEW + PRICES for each). This exceeds the daily limit.

## How I Solved It

**Dynamic Homepage**
- Server-rendered on every request to show current cache state
- No API calls on page load
- Shows 18 stock cards with logos and cached data
- Instant load, always reflects latest cache

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

## Beyond the Requirements

### Subtle Animated Background

A slow-moving grid pattern adds visual depth without distraction. It's intentionally minimal — low CPU cost, no interference with content, and demonstrates clean integration of client-side animations in Next.js App Router (dynamic imports, SSR handling, theme awareness).

### Recently Viewed Stocks

Persists the last 5 viewed stocks in localStorage for faster navigation. Uses otherwise-empty space at the top of the homepage. Shows state management across client/server boundaries and adds a small layer of personalization without backend complexity.

**Philosophy**: I only add features that are practical, simple, and serve a clear purpose. The file-based cache (vs Redis), local logos (vs API calls), and these two UX enhancements all follow that principle — solve real problems without unnecessary complexity.

## Project Structure

```
app/
├── page.tsx                      # Homepage (dynamic SSR)
├── layout.tsx                    # Root layout with theme
├── stocks/[symbol]/
│   ├── page.tsx                  # Stock details
│   ├── loading.tsx               # Loading state
│   └── error.tsx                 # Error boundary
└── api/
    ├── overview/route.ts         # Company data endpoint
    └── prices/route.ts           # Price data endpoint

lib/
├── alphavantage.ts               # API client with rate limiting
├── cache.ts                      # File-based cache
├── cache-reader.ts               # Server-side cache reader
├── normalize.ts                  # Data formatting
├── time-utils.ts                 # Time formatting utilities
└── tickers.ts                    # Featured stock list

components/
├── enhanced-stock-card.tsx       # Homepage stock cards
├── stock-chart.tsx               # Price history chart
├── stock-metrics.tsx             # Key statistics
├── price-history.tsx             # Price table (responsive)
├── data-freshness-badge.tsx      # Cache indicators
├── market-lens-loader.tsx        # Loading animation
├── recent-stocks.tsx             # Recently viewed toolbar
├── animated-background.tsx       # Grid animation
├── theme-toggle.tsx              # Dark/light mode toggle
└── ui/                           # shadcn/ui components
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
# Development server
pnpm dev

# Production build
pnpm build
pnpm start
```

## Deployment

Tested on a simple Linux server with nginx

Set `ALPHAVANTAGE_API_KEY` as an environment variable in your deployment settings.
