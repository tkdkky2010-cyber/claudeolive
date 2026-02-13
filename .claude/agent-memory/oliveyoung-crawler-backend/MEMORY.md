# OliveYoung Crawler Backend - Agent Memory

## Project Overview
Node.js + Express backend for crawling OliveYoung ranking TOP 100 and serving via REST API.

## Tech Stack
- Express.js (REST API)
- Playwright (Web crawling with JS rendering)
- SQLite + better-sqlite3 (Database)
- node-cron (Task scheduling)
- JWT + Google OAuth (Authentication)

## Implementation Complete (2026-02-10)

### File Structure Created
```
/Users/jasonkim/Desktop/claude code/
├── src/
│   ├── crawler/oliveyoung.js      # Playwright-based crawler
│   ├── db/
│   │   ├── schema.sql              # DB schema with indexes
│   │   ├── database.js             # CRUD operations
│   │   └── init.js                 # DB initialization script
│   ├── routes/
│   │   ├── products.js             # Product API endpoints
│   │   ├── auth.js                 # Google OAuth + JWT
│   │   └── cart.js                 # Cart management
│   ├── middleware/auth.js          # JWT verification
│   └── server.js                   # Express server + cron scheduling
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Data Collection Scope (Legal Compliance)

### ✅ Collected Fields
- rank (순위)
- product_name (상품명)
- original_price (정가)
- sale_price (판매가)
- discount_rate (할인율)
- oliveyoung_url (상품 링크)

### ❌ NOT Collected (Legal Risk)
- image_url (저작권 위험)
- review data (개인정보 포함 가능)

## Crawler Implementation Notes

### Target URL
`https://www.oliveyoung.co.kr/store/main/getBestList.do`

### DOM Selectors (As of 2026-02-10)
- Product list container: `.cate_prd_list li`
- Product name: `.tx_name`
- Product link: `a.prd_link`
- Original price: `.price-2 del`
- Sale price: `.price-2 strong` or `.tx_cur strong`
- Discount rate: `.percent`

### Rate Limiting
- Minimum delay: 2000ms between requests
- robots.txt check before first crawl
- HTTP 403 → immediate stop
- HTTP 429 → exponential backoff
- Max retries: 3 attempts

### Error Handling Strategy
1. Network errors: Retry with exponential backoff (2s, 4s, 8s)
2. Parse errors: Log and skip individual product, continue with others
3. Rate limiting (429): Stop immediately, log, retry after delay
4. Page structure changes: Log detailed error with HTML snapshot

## Database Design

### UPSERT Logic
Uses `ON CONFLICT(ranking_date, rank) DO UPDATE` to handle re-crawled data gracefully.

### Indexes
- `idx_products_ranking_date` - Fast queries by date
- `idx_products_rank` - Fast rank-based queries
- `idx_users_google_id` - Fast user lookup
- `idx_cart_user_id` - Fast cart queries
- `idx_crawl_logs_started_at` - Log monitoring

## API Design Decisions

### Response Format
- Always camelCase for JSON keys
- Always include `success: boolean`
- Always include `updatedAt` timestamp
- Always include `total` count in list responses
- Meaningful error messages with proper HTTP codes

### Authentication Flow
1. Client gets Google ID token
2. POST to `/api/auth/google` with idToken
3. Server verifies with Google OAuth client
4. Server creates/updates user in DB
5. Server returns JWT token (7 day expiry)
6. Client sends JWT in `Authorization: Bearer <token>` header

## Cron Scheduling

### Schedule Times (Asia/Seoul timezone)
- 3:00 AM KST - Morning crawl
- 3:00 PM KST - Afternoon crawl

### Why These Times
- Low server traffic
- Before peak user hours
- Twice daily for data freshness

## Common Issues & Solutions

### Issue: Playwright installation
**Solution:** Run `npx playwright install chromium` after npm install

### Issue: Google OAuth not configured
**Solution:** Set `GOOGLE_CLIENT_ID` in .env file

### Issue: Database locked
**Solution:** SQLite WAL mode enabled by default for better concurrency

## Next Steps / TODO

- [ ] Add Redis caching layer for high traffic
- [ ] Implement pagination for products API
- [ ] Add webhook notifications for crawl failures
- [ ] Implement data retention policy (old rankings cleanup)
- [ ] Add Prometheus metrics for monitoring
- [ ] Implement circuit breaker for crawler resilience

## Links to Other Memory Files
- See `dom-selectors.md` for detailed selector documentation (TODO)
- See `deployment.md` for production deployment guide (TODO)
