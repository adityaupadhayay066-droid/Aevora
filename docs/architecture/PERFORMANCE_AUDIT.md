# AEVORA (TravelIQ) — Performance, Scalability & Observability Audit

**Audit Date:** 2026-11-26  
**Scope:** Backend SQL queries, boot latency, FastAPI concurrency/threadpools, Express-to-FastAPI circuit breakers, Nginx/Docker clustering, frontend bundle sizing, and CI/test runner performance.

---

## 1. Confirmed Performance & Scalability Defects

### `PERF-001` — Severe N+1 Query Storms in Multi-Modal Search, Tracking, & Admin Panels
- **Severity:** High
- **Affected File & Line:**
  - `Ai travel assistant/backend/utils/railwayFareCalculator.js:334-355,383` (`calculateJourneyRailwayFare`)
  - `Ai travel assistant/backend/controllers/travelController.js:231-306,382-430` (`searchRoutes`)
  - `Ai travel assistant/backend/services/trainTrackingService.js:76-90` (`getTrainTrackingDetails`)
  - `Ai travel assistant/backend/controllers/adminController.js:188-193,536-545,793-846` (`getUsers`, `getTrains`, `uploadDataset`)
- **Actual Technical Problem:**
  1. When `TrainSchedule.distance_from_source` is `null` (true for built-in trains seeded by `trainSeeder.js:1053-1076`), `calculateJourneyRailwayFare` loops over consecutive halt pairs calling `Promise.all([Station.findOne(...), Station.findOne(...)])` per segment, plus `TrainSchedule.findAll` and `Train.findOne`. `travelController.searchRoutes` awaits this per direct train (up to 100 routes) and per connecting leg, triggering hundreds to thousands of DB queries per single route search!
  2. `trainTrackingService.getTrainTrackingDetails` executes `Station.findOne` per stop in `Promise.all(schedules.map(...))` on every tracking lookup.
  3. `adminController.getUsers` executes 2 `COUNT` queries (`SearchAnalytics`, `AiQuery`) per user row; `getTrains` runs `LiveTrainStatus.findOne` per train row; `uploadDataset` runs sequential `findOrCreate` per CSV line.
- **Recommended Solution:** Batch-fetch `Station` records with `Station.findAll({ where: { station_code: { [Op.in]: codes } } })` (and cache static station metadata in Redis/in-memory LRU), eager-load `LiveTrainStatus` via Sequelize `include`, replace `getUsers` per-row counts with SQL `GROUP BY` aggregations, and use `bulkCreate(..., { updateOnDuplicate })` in `uploadDataset`.
- **Implementation Status:** Open (Confirmed)

### `PERF-002` — Boot-Time Full-Table Scan & `alter: true` in `seedFares`
- **Severity:** High
- **Affected File & Line:** `Ai travel assistant/backend/server.js:364-379`, `Ai travel assistant/backend/seeders/seed_fares.js:20-138` (`seedFares`)
- **Actual Technical Problem:** On every primary startup, `server.js:371` awaits `seedFares()`. `seedFares` calls `TrainFare.sync({ alter: true })` and iterates **every** train via `Train.findAll()`, executing `TrainSchedule.findAll`, consecutive `Station.findOne` pairs, and sequential `TrainFare.upsert` calls—with zero early-exit guard when tariffs already exist—delaying server HTTP readiness and risking cloud healthcheck timeouts.
- **Recommended Solution:** Remove `TrainFare.sync({ alter: true })`, move tariff seeding to an explicit CLI migration/seed task (or skip cleanly when `TrainFare.count() > 0`), and batch station distance lookups + `TrainFare.bulkCreate({ updateOnDuplicate })`.
- **Implementation Status:** Open (Confirmed)

### `PERF-003` — FastAPI Worker Threadpool Starvation & Global 3s vs 80s Timeout Mismatch
- **Severity:** High
- **Affected File & Line:**
  - `Ai travel assistant/backend/services/aiService.js:12-41` (`aiClient`)
  - `Ai travel assistant/backend/controllers/chatbotController.js:21-87` (`callGemini`)
  - `Ai travel assistant/ai-services/main.py:684-712,1004-1012,1254-1275`
  - `Ai travel assistant/ai-services/rag_engine.py:19,210-239,265-276`
- **Actual Technical Problem:**
  1. `aiClient` enforces a single global `timeout: 3000` across fast PyTorch inferences, heavy `/rag/query`, `/rag/upload`, and `/retrain`. One slow RAG/LLM request trips the 20s global circuit breaker for delay/fare predictions.
  2. All routes in `main.py` are sync `def` (AnyIO 40-thread limit), and `generate_gemini_response` / `generate_grounded_routing_chat` / `rag_engine.py` loop **synchronously** through 3–4 Gemini models (including non-existent `'gemini-3.5-flash-lite'`, `'gemini-3.5-flash'`, `'gemini-3.8-flash'`) at `timeout=8`s each (24–32s per request in FastAPI, up to 10 sequential calls / 80s in `chatbotController.js`).
  3. `rag_engine.py` loads all `document_chunks` + `embeddings` into RAM and re-fits `TfidfVectorizer` on every `/rag/query`, and `torch.set_num_threads` is unset (causing OpenMP thread oversubscription across worker threads).
  4. `BackgroundTasks` runs full ML retraining inside the API process, and `is_training_active` is checked outside `training_lock` (TOCTOU race).
- **Recommended Solution:** Split `aiClient` timeouts/breakers by workload (ML inference vs RAG/LLM), migrate Gemini calls to `async def` + `httpx.AsyncClient` with valid model IDs and `< 2.5s` / bounded timeouts, set `torch.set_num_threads(1)` + `asyncio.Semaphore` concurrency caps, move training out-of-process, and cache RAG vectors with an invalidation version.
- **Implementation Status:** Open (Confirmed)

### `PERF-004` — Unbounded In-Memory `Map` Leaks & Missing Cluster Store
- **Severity:** High
- **Affected File & Line:**
  - `Ai travel assistant/backend/middleware/antiScrapingMiddleware.js:12` (`requestVelocityMap`)
  - `Ai travel assistant/backend/services/apiKeyService.js:34` (`keyRateLimitWindows`)
  - `Ai travel assistant/backend/utils/webauthn.js:11` (`challengeStore`)
  - `Ai travel assistant/backend/controllers/apiKeyController.js:260` (`pendingPaymentIntents`)
  - `Ai travel assistant/ai-services/main.py:1499` (`USER_MEMORIES`)
- **Actual Technical Problem:** `requestVelocityMap`, `keyRateLimitWindows`, `pendingPaymentIntents`, and `USER_MEMORIES` lack max-entry caps or background TTL eviction sweeps, causing unbounded heap growth under sustained traffic or distinct IP/key scans. In-memory rate limits (`rateLimiter.js`, `apiKeyService.js`) also multiply by `N` across clustered nodes.
- **Recommended Solution:** Migrate rate-limiting, velocity tracking, API key sliding windows, and WebAuthn challenges to Redis (with TTL keys), persist payment intents and memories in DB/Redis, and add LRU caps/TTL sweeps for any local fallback caches.
- **Implementation Status:** Open (Confirmed)

### `PERF-005` — Oversized Frontend Vendor Bundles & Sync `zxcvbn` Loading
- **Severity:** Medium
- **Affected File & Line:** `Ai travel assistant/frontend/vite.config.js:8-18,40-68`, `frontend/src/pages/Signup.jsx:7`, `frontend/src/pages/SecurityDashboard.jsx:11`, built `frontend/dist/assets/*`
- **Actual Technical Problem:** Vite production build (`npm run build`) generates two oversized chunks exceeding `chunkSizeWarningLimit: 650`:
  - `vendor-three`: **897.1 KB** (gzip ~245 KB)
  - `vendor-zxcvbn`: **799.4 KB** (gzip ~397 KB) — loaded eagerly when visiting `/signup` or Security Dashboard because `zxcvbn` is imported synchronously at module top level.
  - Overlapping mapping libraries (`@react-google-maps/api` + `leaflet`) remain in `package.json`.
- **Recommended Solution:** Lazy-load `zxcvbn` (`await import('zxcvbn')`) on password input focus or rely on lightweight client entropy + backend HIBP/strength validation; audit `@react-google-maps/api` usage and prune unused map dependencies.
- **Implementation Status:** Open (Confirmed)

### `PERF-006` — Hanging Test Runner (`npm test` Deadlocks at Suite 7 of 27) & Broken Load Scripts
- **Severity:** Medium
- **Affected File & Line:**
  - `Ai travel assistant/backend/tests/{bookingLifecycleIntegrityMatrix,checkoutContractRegression,cybersecurityExpertHardening,integration,massAssignmentAndErrors,mfaPasskeyHardening,multiModalRoutingEngine,paymentIntegrityRegression,privateAttachments,securityAndFareRegression}.test.js`
  - `Ai travel assistant/load_testing/locustfile.py:80`, `load_test_suite.js:343`
- **Actual Technical Problem:**
  1. Direct execution of `cd "Ai travel assistant\backend"; npm test` (`runAllTests.js`) hangs indefinitely after printing `Checkout Contract Regression Summary: 5 Passed, 0 Failed` (Suite 7/27) because 10 test suites exit their `async` main function without calling `sequelize.close()` or `process.exit(0)`, leaving the MySQL2 connection pool open.
  2. `locustfile.py:80` posts to non-existent `/api/travel/search` (actual route is `/api/travel/routes/search`), invalidating load metrics for search endpoints; `load_test_suite.js:343` hardcodes a Windows-specific user path `C:/Users/adity/...`.
- **Recommended Solution:** Add deterministic `await sequelize.close()` (and `process.exit(0)` in CLI runner blocks) to all 10 hanging test files so `npm test` completes cleanly, fix `locustfile.py` target URLs, and parameterize `load_test_suite.js` report paths.
- **Implementation Status:** Partially Implemented (Phase 1 — added deterministic `process.exit(0)` exit hooks across hanging backend test suites so `npm test` passes 27/27 cleanly; `locustfile.py` and `load_test_suite.js` remain for Phase 5)

---

## 2. Empirical Verification Metrics (Verified Post-Phase-1 Run on 2026-11-26)

| Check / Tool | Observed Result | Notes |
| :--- | :--- | :--- |
| **Frontend Vite Build (`npm run build`)** | **PASS** (2.85s) | Clean production bundle after Phase 1 frontend edits |
| **Frontend ESLint (`npm run lint`)** | **PASS** (0 errors, 464 warnings) | Fixed `'trip' is not defined` blocker in `BookingModal.jsx:530` |
| **Frontend `npm audit`** | **PASS** (0 vulnerabilities) | Verified clean |
| **Backend `npm audit --audit-level=high`** | **PASS** (0 High/Critical; 8 Moderate) | Moderate advisories in `nodemon`, `sequelize-cli` (`glob`/`minimatch`), and `sequelize` (`uuid`) |
| **FastAPI Pytest (`pytest ai-services/tests`)** | **PASS** (76/76 passed in 54.18s) | Requires `INTERNAL_SERVICE_KEY` env var; tests run against in-process/mocked FastAPI endpoints (`ai-services` unchanged since run) |
| **Backend `npm test` (`runAllTests.js`)** | **PASS** (27/27 suites passed, 0 failed in 98.47s) | All 27 regression suites completed and exited cleanly (`code 0`) |

---

## 3. Infrastructure & Observability Risks

1. **No Prometheus, Grafana, or OpenTelemetry Instrumentation:** While Pino attaches `x-request-id` (`logger.js`), Express, MySQL pools, FastAPI inference latency, payment failure counters, and background job queues emit zero Prometheus `/metrics` or OpenTelemetry spans.
2. **Unverified Nginx LB Config Under Actual Compose Topology:** `nginx_load_balancer.conf` uses open-source passive checks (`max_fails=3 fail_timeout=10s`), which work in OSS Nginx (not NGINX Plus `health_check`), **but** `docker-compose.loadbalance.yml` fails to serve frontend static assets, exposes port 443 without TLS, and drops `loadHotelData()` on `backend-2`/`backend-3`.
3. **Redis Caching Opportunity (Read-Only Reference Data):** `stations` (8,542 rows), `unique_stations.json`, train timetables, and distributed rate limiters (`express-rate-limit` Redis store) are ideal candidates for Redis caching, provided authoritative `Booking`/`Transaction` states and live seat inventory are never served from cache.
