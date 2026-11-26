# AEVORA (TravelIQ) — Architecture Weaknesses & Refactoring Analysis

**Audit Date:** 2026-11-26  
**Scope:** Structural modularity, dependency graph, routing consolidation, API contracts, dead code, frontend-backend alignment, and infrastructure topology.

---

## 1. Confirmed Structural & Architectural Weaknesses

### `ARCH-001` — Circular Dependency Between Core Routing & Validation Services
- **Severity:** High
- **Affected File & Line:** `Ai travel assistant/backend/services/routeValidationEngine.js` <-> `Ai travel assistant/backend/services/multiModalRoutingEngine.js`
- **Actual Technical Problem:** Both modules mutually `require()` each other at top-level load time.
- **Reproduction / Evidence:** Static dependency graph analysis across `Ai travel assistant/backend/` confirmed cycle:
  `services/routeValidationEngine.js -> services/multiModalRoutingEngine.js -> services/routeValidationEngine.js`
- **Recommended Solution:** Extract shared station-cluster normalization, Haversine distance, and schedule window predicates into `shared/utils/` or `travel/validation/`, breaking the cycle cleanly so `routing` depends unilaterally on `validation`.
- **Implementation Status:** Open (Confirmed)

### `ARCH-002` — 4-Way Routing Logic Duplication & Unused Provider Adapters
- **Severity:** High
- **Affected File & Line:**
  - `Ai travel assistant/backend/controllers/travelController.js:4-11,170-206,510-522`
  - `Ai travel assistant/backend/services/multiModalDiscoveryService.js:126-455,617-628`
  - `Ai travel assistant/backend/services/multiModalRoutingEngine.js:668-897,1008-1219`
  - `Ai travel assistant/backend/services/routeValidationEngine.js:126-235`
  - `Ai travel assistant/backend/services/deterministicRoutingService.js:50-86`
  - `Ai travel assistant/ai-services/routing.py:182-278`
- **Actual Technical Problem:** Route discovery, schedule verification, and fare generation are duplicated across four backend files and one Python file, with divergent logic and discarded work:
  1. `travelController.js:170` invokes `discoverMultiModalRoutes()` which builds `generateRealisticTrainSchedule()` (`multiModalDiscoveryService.js:126-175`), and then lines `510-522` discard `discovery.trains`.
  2. `MultiModalRoutingEngine.findLegs()` (`multiModalRoutingEngine.js:1196-1219`) scans only 14+ hardcoded in-memory trains instead of MySQL.
  3. `services/adapters/` contains `trainProviderAdapter.js`, `flightProviderAdapter.js`, `busProviderAdapter.js`, and `ferryProviderAdapter.js`, yet `travelController.js:10` only imports `ferryProviderAdapter.js`.
  4. `ai-services/routing.py:182-278` maintains a completely separate hardcoded table of 11 direct + 3 connecting corridors and imports `networkx` (`line 1`) without building a graph.
- **Recommended Solution:** Standardize on one canonical `travel/` domain module backed by unified provider adapter interfaces (`train/`, `flight/`, `bus/`, `ferry/`) and DB-driven routing; deprecate `generateRealisticTrainSchedule` and `ai-services/routing.py` hardcoded routes.
- **Implementation Status:** Open (Confirmed)

### `ARCH-003` — Broken SQL Schema References in `deterministicRoutingService.js`
- **Severity:** High
- **Affected File & Line:** `Ai travel assistant/backend/services/deterministicRoutingService.js:50-86` (`getVerifiedDirectTrains`) vs `Ai travel assistant/backend/models/Train.js:4-40` & `Ai travel assistant/backend/server.js:353-358`
- **Actual Technical Problem:** `deterministicRoutingService.js:52,58,67` executes raw SQL referencing `t.train_no` and `t.runs_on_days` on `trains t`, whereas `trains` columns are `train_number` and `runs_on`. `train_stops` view (`server.js:355`) aliases `train_number AS train_no`, not `trains`, and `seed_runner.js` does not create `train_stops` at all.
- **Reproduction / Evidence:** The `catch` block (`deterministicRoutingService.js:83-86`) swallows the MySQL `Unknown column 't.train_no'` error and returns `[]`, silently blinding grounded chatbot direct-train lookup.
- **Recommended Solution:** Query `train_schedules` joined to `trains` via `t.train_number` and `t.runs_on`, manage views in proper migrations, and fail loudly on SQL schema errors.
- **Implementation Status:** Open (Confirmed)

### `ARCH-004` — Cluster Origin/Destination Code Loss, UTC/IST Labeling Bug, & Next-Day Connecting Bug
- **Severity:** High
- **Affected File & Line:**
  - `Ai travel assistant/backend/controllers/travelController.js:176-203,269-275,334-339`
  - `Ai travel assistant/backend/services/multiModalRoutingEngine.js:337-372,1032-1056` (`buildIsoUtcTimestamp`)
  - `Ai travel assistant/backend/services/routeValidationEngine.js:183-189`
- **Actual Technical Problem:**
  1. `travelController.js:176-195` filters `s1.station_code IN (:origin_station_codes)` grouped by `t.train_number` without returning the matched `s1.station_code`/`s2.station_code`, falling back to `originStnCode`/`destStnCode` (e.g., `NDLS` when the train stops at `ANVT`).
  2. `buildIsoUtcTimestamp` feeds IST local timetable strings directly into `Date.UTC(...)`, emitting `'...Z'` UTC timestamps shifted by +05:30.
  3. `routeValidationEngine.js:183-189` validates both `leg1Days` and `leg2Days` against the **same `targetDay`**, rejecting valid overnight transfers where Leg 2 departs on day+1.
- **Recommended Solution:** Select exact matched boarding/alighting stop codes per corridor pair, adjust IST (`UTC+05:30`) to true UTC during serialization, and calculate Leg 2 departure weekday from `leg1ArrivalTimestamp + layover`.
- **Implementation Status:** Open (Confirmed)

### `ARCH-005` — Unverified Static Schedules Labeled `"provider_verified"` & Synthesized Fares
- **Severity:** High
- **Affected File & Line:**
  - `Ai travel assistant/backend/services/multiModalDiscoveryService.js:367-387,441`
  - `Ai travel assistant/backend/services/multiModalRoutingEngine.js:668-897,1206,1385-1415`
  - `Ai travel assistant/backend/services/routeValidationEngine.js:227`
  - `Ai travel assistant/backend/services/adapters/ferryProviderAdapter.js:30-45`
- **Actual Technical Problem:** Static in-memory flight, bus, and ferry catalogs are marked `"source_verified: true"` / `"provider_verified"` with no external API feed and zero `valid_from`/`valid_until`/`last_verified_at` metadata. Missing flight classes (`Flexi`/`Business`), cab legs (`distanceKm * 12`), and connecting fares (`850`, `1250`, `6h 15m` flat duration) are fabricated synthetically.
- **Recommended Solution:** Attach explicit provenance metadata (`source_type: 'reference_catalog'`, `verification_status`, `retrieved_at`, `valid_from`, `valid_until`) to every transport option and return `null` with `"fare_unavailable"` rather than fabricated multipliers when tariffs are missing.
- **Implementation Status:** Open (Confirmed)

### `ARCH-006` — Split-Brain Per-Process Memory & Local File Storage Blocking Horizontal Scaling
- **Severity:** Critical
- **Affected File & Line:**
  - `Ai travel assistant/backend/services/hotelService.js:40,888-992,1196-1198` (`reservationsCache`)
  - `Ai travel assistant/backend/middleware/rateLimiter.js:28-168` (`MemoryStore`)
  - `Ai travel assistant/backend/middleware/antiScrapingMiddleware.js:8,12` (`blacklistedIPs`, `requestVelocityMap`)
  - `Ai travel assistant/backend/services/apiKeyService.js:34` (`keyRateLimitWindows`)
  - `Ai travel assistant/backend/utils/webauthn.js:11` (`challengeStore`)
  - `Ai travel assistant/backend/controllers/apiKeyController.js:260` (`pendingPaymentIntents`)
  - `Ai travel assistant/ai-services/main.py:1387,1499` (`RAG_UPLOAD_DIR`, `USER_MEMORIES`)
  - `Ai travel assistant/backend/server.js:385-394` (`setInterval` expiry loop)
- **Actual Technical Problem:** Despite `INSTANCE_ID` clustering support (`server.js:69`) and `docker-compose.loadbalance.yml`, critical state—rate limits, IP bans, WebAuthn challenges, B2B payment intents, hotel bookings, AI memories, and RAG uploaded files—is stored in process-local memory or local container disk.
- **Recommended Solution:** Move rate limiters, IP blacklists, WebAuthn challenges, and API key windows to shared Redis; move hotel inventory/reservations and payment intents to MySQL; transfer RAG document contents via HTTP/shared storage; and run scheduled jobs in a single worker/leader-locked process.
- **Implementation Status:** Open (Confirmed)

### `ARCH-007` — Triplicated Endpoints, Broken Parameter Binding, & Dead/Stubbed Controllers
- **Severity:** Medium
- **Affected File & Line:**
  - Sessions: `securityController.js` (`/api/security/active-sessions`), `sessionController.js` (`/api/sessions`), `deviceController.js` (`/api/devices`)
  - Support tickets: `supportRoutes.js` (`/api/support`), `userRoutes.js:26-27` (`/api/users/tickets`), `adminRoutes.js:162` (`/api/admin/tickets/:ticketId` -> `replyToTicket` reads `req.params.id`)
  - SOS: `sosRoutes.js:7` (`/api/sos/trigger` -> `SosAlert`), `securityRoutes.js:36` (`/api/security/sos` -> `SecurityAlert`)
  - Stubs/Orphans: `adminController.js:1417-1432,1472-1473` (`resetDatabase`, `triggerMlRetrain`, `updateAdminSecuritySettings`, `getRouteManagement`, `toggleAnnouncement`, `deleteAnnouncement`), `fraudController.js:4-64`, `emailService.js:204-229` (`sendPasswordResetEmail`), `rateLimiter.js:72` (`otpLimiter`), `backend/{dedupe_orgs.js,migrate_admin_db.js,migrate_food.js,test_gemini_flow.js}`
  - Broken CLI config: `backend/sequelizerc:4` (points to non-existent `config/config.json`)
- **Actual Technical Problem:** Competing route trees share inconsistent authorization, attachment handling, and token revocation rules; `adminRoutes.js:162` always 404s due to `:ticketId` vs `req.params.id`; several admin/fraud endpoints return hardcoded stub JSON; and root operational scripts sit unreferenced alongside broken `sequelize-cli` config.
- **Recommended Solution:** Consolidate duplicate routes behind shared service modules with thin deprecation aliases, fix `:ticketId`, implement real DB aggregations or disable stub admin buttons, and fix `.sequelizerc` to use `config/db.js` / valid CLI config.
- **Implementation Status:** Open (Confirmed)

### `ARCH-008` — Frontend API Contract Drift, Raw `fetch`/`axios`, & Client Fallback Fabrications
- **Severity:** High
- **Affected File & Line:**
  - `Ai travel assistant/frontend/src/pages/DestinationPage.jsx:95` (`/api/hotels/search` -> `/api/api/hotels/search`)
  - `Ai travel assistant/frontend/src/pages/AIPredictionsPage.jsx:67`, `KnowledgeGraphPage.jsx:29`, `RAGSearchPage.jsx:8,30,44-56`, `components/AIChatbot.jsx:123-170`
  - `Ai travel assistant/frontend/src/pages/Dashboard.jsx:59,104,180,287`
  - `Ai travel assistant/frontend/src/pages/LiveTrackingPage.jsx:286-318`
  - `Ai travel assistant/frontend/src/pages/AgenticPlannerPage.jsx:457-458` & `backend/controllers/agentController.js:238-239,335-375`
- **Actual Technical Problem:** Several pages bypass the configured `api` Axios helper (breaking cross-origin `VITE_BACKEND_URL` and silent 401 refresh), `Dashboard.resetFilters()` omits `'Ferry'` and injects fake ₹800/₹950 fares on missing data, `LiveTrackingPage` overwrites backend running days/classes/distance with modulo arithmetic (`num % 7`), and `RAGSearchPage`/`AIChatbot` invent local answers on error.
- **Recommended Solution:** Standardize all frontend HTTP requests through `src/utils/api.js`, remove fabricated UI fallbacks in favor of explicit error/unavailable banners, and render authoritative backend fields cleanly.
- **Implementation Status:** Open (Confirmed)

### `ARCH-009` — Nginx LB, Docker Compose, Render, & Netlify Misconfigurations
- **Severity:** High
- **Affected File & Line:**
  - `Ai travel assistant/load_testing/nginx_load_balancer.conf:69-165` & `docker-compose.loadbalance.yml:7-117`
  - `Ai travel assistant/frontend/Dockerfile.prod:13-22` & `frontend/nginx.conf:1-41`
  - `render.yaml:34-79`, `netlify.toml:15-19`, `frontend/public/_redirects:2`
  - `Ai travel assistant/backend/Dockerfile:1-22`
- **Actual Technical Problem:**
  1. `docker-compose.loadbalance.yml` mounts `nginx_load_balancer.conf` (which serves `/` from `/usr/share/nginx/html`) into bare `nginx:alpine` with no frontend assets, exposes port `443` with no TLS block, omits `TRUST_PROXY=true` and Razorpay/refresh env vars, and leaves `aevora_ai_cluster` upstream unused.
  2. `render.yaml` omits `ENVIRONMENT=production` on `traveliq-ai-service`.
  3. `netlify.toml` & `_redirects` proxy `/ai/*` publicly to FastAPI, where browser clients lack `INTERNAL_SERVICE_KEY` (guaranteed 403/500).
  4. `frontend/Dockerfile.prod` defaults `VITE_API_URL=/api`, yet `frontend/nginx.conf` lacks any `/api` `proxy_pass`.
  5. `load_testing/locustfile.py:80` targets nonexistent `/api/travel/search` (vs `/api/travel/routes/search`), and `load_test_suite.js:343` hardcodes a Windows `C:/Users/adity/...` output path.
- **Recommended Solution:** Align container reverse-proxy rules, remove direct public `/ai/*` proxy from Netlify (route browser AI calls through Express `/api/ai/*`), set `ENVIRONMENT=production` across all production manifests, and add `HEALTHCHECK` to `backend/Dockerfile`.
- **Implementation Status:** Open (Confirmed)

---

## 2. Potential Architectural Risks

1. **Monolith Domain Coupling (`backend/` flat folders):** All 28 controllers, 59 models, and 14 services sit in flat directories, making transaction boundaries, shared utilities, and domain ownership unclear as the team scales. Incremental migration into `backend/src/modules/{domain}/` with backward-compatible route mounts will improve maintainability without splitting into premature microservices.
2. **In-Process Boot Seeding Coupled to HTTP Readiness:** Running 8 sequential seeders (8,542 stations + trains + fares + hotels + admin panel datasets) inline before `app.listen()` delays cold starts and risks Render/Docker health-check timeouts.
3. **Lack of Centralized Error Class Hierarchy & Response Envelope:** Controllers mix `{ message }`, `{ success, error }`, and `{ error }` response shapes and rely on ad-hoc `try/catch` blocks (`console.error` instead of Pino `logger`), complicating frontend error handling and observability.
4. **3D Station Placeholder Persistence:** `stationController.js:6-206` writes a generic New Delhi layout (`"Ajmeri Gate Entrance"`, `"Paharganj Entrance"`) into MySQL `StationModel` for any unmapped station, polluting authoritative data with template placeholders.
