# AEVORA (TravelIQ) — Comprehensive System Audit

**Audit Date:** 2026-11-26  
**Repository Root:** `d:\MYGIT\TravelIQ` (Primary App Monorepo: `Ai travel assistant/`)  
**Scope:** End-to-end inspection of Backend (`Express 5` / `Sequelize` / `MySQL 8`), Frontend (`React 19` / `Vite 8`), AI/ML Microservice (`FastAPI` / `PyTorch` / `RAG`), `n8n` Workflows, Load Balancing (`Nginx` / `Docker Compose`), CI/CD (`.github/workflows/security.yml`), and Deployment Configs (`render.yaml`, `netlify.toml`).

---

## 1. Executive Summary

AEVORA (formerly TravelIQ) is an ambitious, feature-rich multi-modal travel intelligence platform covering Indian Railways, domestic flights, intercity buses, ferries, hotels, food recommendations, emergency SOS, B2B developer API governance, and AI-powered predictions/RAG. The repository demonstrates meaningful prior security hardening (raw-body Razorpay webhook HMAC verification, JWT algorithm pinning, WebAuthn FIDO2 passkey support, CSV formula escaping, parameterized SQL in most services, and 27 backend regression test files).

However, deep code-level inspection reveals **systemic gaps between documented architecture and actual runtime behavior** that must be resolved before production deployment:

1. **Booking, Refund & Hotel Financial Integrity Gaps:** Concurrent refund race conditions (`executeRefundCore`), expired-booking captured webhooks marked `Refund Pending` with zero background settlement, `HotelBookingModal.jsx` silently fabricating `CONFIRMED` vouchers when backend calls fail, `BookingModal.jsx` crashing with `ReferenceError: trip is not defined` in live Razorpay checkout, and a completely split-brain in-memory `reservationsCache` for hotels.
2. **Broken Security Controls & In-Memory Clustering Blind Spots:** `User.two_factor_enabled` vs `UserSecurity.two_factor_enabled` mismatch breaks 2FA enforcement; Turnstile CAPTCHA is bypassed when `turnstileToken` is omitted; `support_admin` silently elevates above `data_manager` in `ROLE_HIERARCHY`; `apiKeyController.js` allows B2B Enterprise upgrades via an undelivered 6-digit OTP without payment gateway settlement; and rate limiters, anti-scraping blacklists, WebAuthn challenges, API key windows, and hotel inventory all reside in process-local RAM.
3. **Schema Drift & Multi-Model Inconsistencies:** `schema.sql` diverges dramatically from the 59 Sequelize models (table casing `users` vs `Users`, default `'Paid'`/`'Confirmed'` bookings, missing tables/columns, missing FK indexes and unique constraints), `deterministicRoutingService.js` queries non-existent `trains.train_no` / `trains.runs_on_days` columns, and `sequelizerc` points to a non-existent `config/config.json`.
4. **AI/ML & RAG Reliability Failures:** All 8 ML models are trained on 100% synthetic data (`occupancy_model` loses to majority baseline; `behavior_net` has 0.1655 macro-F1), severe train–serving feature mismatches (`Clear` weather maps to `Foggy`, station names vs codes, `/7` vs `/24`), `rag_engine.py` re-fits 128-dim TF-IDF on every query and fails across Docker containers due to local disk path coupling, and fallback mocks pollute real MySQL prediction tables.
5. **Infrastructure & CI/CD Drift:** `SKIP_SEEDERS=true` on clustered backend replicas skips `loadHotelData()` causing HTTP 503s; `render.yaml` omits `ENVIRONMENT=production` on the AI service; `netlify.toml` proxies `/ai/*` publicly without `INTERNAL_SERVICE_KEY`; and `.github/workflows/security.yml` only executes 7 of the 27 backend regression test suites.

---

## 2. Current Repository Organization & Subsystem Inventory

| Subsystem | Location | Technology | Key Role & Findings |
| :--- | :--- | :--- | :--- |
| **Core Backend API** | `Ai travel assistant/backend/` | Node.js, Express 5.2.1, Sequelize 6.37.8 | 28 controllers, 26 route files, 14+ services, 6 middleware modules, 59 models, 8 seeders |
| **Frontend SPA** | `Ai travel assistant/frontend/` | React 19, Vite 8, Tailwind CSS v4, Three.js, Leaflet | 60+ pages (public + admin portal), `AuthContext`, `BookingModal`, `HotelBookingModal`, `DeveloperPortal` |
| **AI/ML & RAG Service** | `Ai travel assistant/ai-services/` | Python 3.11/3.12, FastAPI, PyTorch, Scikit-learn | 8 neural/ML networks (`ai_engine/`), `rag_engine.py`, `routing.py`, 3 pytest files (76 items) |
| **Database Assets** | `Ai travel assistant/schema.sql`, `backend/migrations/` | MySQL 8.0 (InnoDB) | `schema.sql` (out of sync), `001_booking_lifecycle_integrity.js` (uninvoked by boot), ad-hoc `migrate_*.js` |
| **Automation Engine** | `Ai travel assistant/n8n/` | n8n (Docker Compose, port 5678) | 3 workflow JSONs (booking, delay-refund, support); unauthenticated webhooks with SSRF risk |
| **Load Balancing & SRE** | `Ai travel assistant/load_testing/` | Nginx, Docker Compose, Locust, Node.js | 3x backend + 2x AI service compose template (missing frontend root, TLS, and shared Redis) |
| **CI/CD & Cloud** | `.github/workflows/security.yml`, `render.yaml`, `netlify.toml` | GitHub Actions, Render, Netlify | Automated `npm audit`, 7/27 backend tests, Vite build check, FastAPI pytest |

---

## 3. Confirmed Cross-Cutting System Findings

### `SYS-001` — Live Razorpay Checkout Runtime Crash (`trip is not defined`)
- **Severity:** Critical
- **Affected File & Line:** `Ai travel assistant/frontend/src/components/BookingModal.jsx:530`
- **Actual Technical Problem:** Inside the live Razorpay checkout branch (`order?.key_id && order.key_id !== 'rzp_test_key'`), the modal options reference `trip?.train_name`, but `trip` is not declared anywhere in `BookingModal` (the component prop is `train`).
- **Reproduction / Evidence:**
  ```js
  // Ai travel assistant/frontend/src/components/BookingModal.jsx:530
  description: `Booking #${booking.booking_reference || booking.id} (${trip?.train_name || 'Travel Ticket'})`,
  ```
  Triggering checkout with real Razorpay keys throws an unhandled `ReferenceError: trip is not defined` before `window.Razorpay` opens.
- **Recommended Solution:** Replace `trip?.train_name` with `train?.train_name || train?.name`.
- **Implementation Status:** Implemented & Verified (Phase 1)

### `SYS-002` — Silent Fake Hotel Confirmation on Backend Failure
- **Severity:** Critical
- **Affected File & Line:** `Ai travel assistant/frontend/src/components/HotelBookingModal.jsx:558-612`
- **Actual Technical Problem:** When `POST /api/hotels/reserve` fails (e.g., 401 unauthenticated, 400 validation failure, 503 when `SKIP_SEEDERS=true`, or network error), the `catch` block silently constructs a fake reservation (`TIQ-STAY-...`, `status: 'CONFIRMED'`, `govIdVerified: true`) and displays `toast.success('Stay Confirmed! E-Voucher Ready.')`.
- **Reproduction / Evidence:** `HotelBookingModal.jsx:576-612` persists the fabricated voucher into `localStorage.getItem('traveliq_hotel_reservations')` and ignores `localStorage.getItem('userInfo')` (reading `'user'` at line `191`).
- **Recommended Solution:** Remove the fabricated `CONFIRMED` fallback in `catch`, display explicit server/authentication error feedback, and read user context from `useAuth()`.
- **Implementation Status:** Implemented & Verified (Phase 1)

### `SYS-003` — Broken Developer Portal Top-Up Pack Contract & Sandbox Bypass
- **Severity:** High
- **Affected File & Line:** `Ai travel assistant/frontend/src/pages/DeveloperPortal.jsx:734-763`, `DeveloperPaymentModal.jsx:166-181,258-271,819` vs `Ai travel assistant/backend/controllers/apiKeyController.js:7-11,274-309`
- **Actual Technical Problem:** Frontend booster packs use `pack_10k`/`pack_50k`/`pack_200k` and pass `top_up_name: item.name` (e.g., `'50,000 API Calls Booster'`), whereas the backend expects `TOP_UP_PACKS` keys `'pack_1k'`, `'pack_5k'`, `'pack_25k'`. Additionally, the frontend sandbox mode skips `/developer/payment/initiate` and sends `order_id: undefined` with hardcoded OTP `'849201'`.
- **Reproduction / Evidence:** Clicking any top-up pack on the Developer Portal triggers HTTP `400 'Invalid top-up pack requested'`.
- **Recommended Solution:** Unify `TOP_UP_PACKS` identifiers across frontend and backend, and remove hardcoded OTP `'849201'` sandbox shortcuts in favor of real Razorpay test-mode orders.
- **Implementation Status:** Implemented & Verified (Phase 1 — aligned `DeveloperPortal.jsx` to `pack_1k`/`pack_5k`/`pack_25k`, removed sandbox bypass UI, and enforced 5-attempt lockout + production gateway check in `apiKeyController.js`)

### `SYS-004` — Non-Existent FastAPI Endpoints & Schema Mismatches in Express Bridge
- **Severity:** High
- **Affected File & Line:** `Ai travel assistant/backend/controllers/travelController.js:13-27`, `Ai travel assistant/backend/services/aiService.js:51-59`, `Ai travel assistant/backend/routes/v1PublicRoutes.js:183-187,238-283` vs `Ai travel assistant/ai-services/main.py:344-370`
- **Actual Technical Problem:**
  1. `travelController.predictTrip` calls `aiService.predictPrice` (`/predict-price`) and `aiService.predictTime` (`/predict-time`), neither of which exists in `ai-services/main.py`.
  2. `v1PublicRoutes.js` `/recommend-route` forwards `{ source, destination, preferences }` directly, failing FastAPI's `RouteRecommendRequest` (`{ user_id, route_id, cost, duration, eco, comfort, student_budget }`) with HTTP `422`. `/recommend-food` sends `{ destination, dietary_pref, budget }` vs `FoodRecommendRequest` (`{ destination, budget, travel_mode, duration, travelers, is_student }`) -> `422`.
  3. `DestinationPage.jsx:95` calls `api.get('/api/hotels/search?...')`, which prepends `/api` onto `baseURL: '/api'` -> `/api/api/hotels/search` (404).
- **Reproduction / Evidence:** Direct code comparison of Express callers vs FastAPI Pydantic models (`main.py:344-370`) and `api.js:58`.
- **Recommended Solution:** Remove dead `predictTrip` stubs or implement matching ML endpoints, transform payloads cleanly in `aiService.js`, and fix `DestinationPage.jsx:95` to `/hotels/search`.
- **Implementation Status:** Partially Implemented (Phase 1 — fixed `DestinationPage.jsx:95` to `/hotels/search`; remaining: `predictTrip` stubs and `v1PublicRoutes.js` payload mappings)

### `SYS-005` — CI/CD Pipeline Skips 20 of 27 Regression Suites & Incomplete Seed Setup
- **Severity:** High
- **Affected File & Line:** `.github/workflows/security.yml:81,95-101`, `Ai travel assistant/backend/tests/runAllTests.js:5-33`, `Ai travel assistant/backend/seed_runner.js:1-14`
- **Actual Technical Problem:** `security.yml` bypasses `npm test` (`runAllTests.js`, 27 suites) and only executes 7 files, skipping `paymentIntegrityRegression.test.js`, `shieldRegression.test.js`, `b2bBillingAndConcurrencyRegression.test.js`, `antiHallucinationRegression.test.js`, `multiModalRoutingEngine.test.js`, and 15 others. Furthermore, `seed_runner.js` only seeds stations and trains, omitting `seedFares()`, `seedAdmin()`, `loadHotelData()`, and the `train_stops` view.
- **Reproduction / Evidence:** Inspecting `.github/workflows/security.yml:95-101` vs `runAllTests.js:5-33`.
- **Recommended Solution:** Run the full `npm test` suite in CI (split across parallel jobs if needed), add `npm run lint` for frontend, and unify `seed_runner.js` / migrations with `server.js`.
- **Implementation Status:** Implemented & Verified (Phase 1 — fixed 9 test files without `process.exit(0)` + 10ms shield timing flake, expanded `seed_runner.js`, and updated `.github/workflows/security.yml` to run `npm test` + `npm run lint`)

### `SYS-006` — `SKIP_SEEDERS=true` Disables Hotel Inventory on Clustered Replicas
- **Severity:** High
- **Affected File & Line:** `Ai travel assistant/backend/server.js:364-379`, `Ai travel assistant/load_testing/docker-compose.loadbalance.yml:50,70`, `Ai travel assistant/backend/controllers/hotelController.js:26-31`
- **Actual Technical Problem:** `docker-compose.loadbalance.yml` sets `SKIP_SEEDERS=true` on `backend-2` and `backend-3`. In `server.js:374`, `await loadHotelData()` sits inside `if (process.env.SKIP_SEEDERS !== 'true')`, leaving the in-memory `hotelsCache` empty on secondary replicas.
- **Reproduction / Evidence:** Any hotel search routed to `backend-2` or `backend-3` fails with HTTP `503 'Hotel data is not available'`.
- **Recommended Solution:** Move hotel catalog and reservation persistence to MySQL, and always load read-only reference caches (or read from MySQL/Redis) regardless of `SKIP_SEEDERS`.
- **Implementation Status:** Open (Confirmed)

---

## 4. Confirmed vs. Architectural Risk Separation

| Category | Confirmed Defects (Code Evidence Verified) | Architectural Risks (Scale & Operations) |
| :--- | :--- | :--- |
| **Security & Auth** | 2FA column mismatch (`User` vs `UserSecurity`), Turnstile bypass on omitted token, pre-auth status mutation, `support_admin` escalation, PaaS regex CORS + `SameSite=None` without CSRF, devtunnels WebAuthn bypass, B2B OTP payment bypass. | Shared `JWT_SECRET` across access/2FA/device/PII encryption; non-atomic refresh rotation; missing `CSP` nonce enforcement; single-node `MemoryStore` for rate limiters, challenges, and blacklists. |
| **Database & Booking** | `schema.sql` vs Sequelize drift (`users`/`Users`, `'Paid'` defaults, missing columns), broken SQL in `deterministicRoutingService.js`, double-refund race in `executeRefundCore`, expired-webhook unqueued `Refund Pending`, `Booking.payment_status` `'Pending'` vs `'Unpaid'` transition crash, `BookingEvent` race, split-brain `reservationsCache`. | Pooled `SET FOREIGN_KEY_CHECKS=0` race; boot-time `TrainFare.sync({ alter: true })` and `seedFares()` full scan; missing indexes on `Booking`/`Transaction`/`ProcessedWebhookEvent`; absence of train seat inventory model; multi-worker expiry timer contention. |
| **Travel & AI/ML** | Broken `train_no` query, cluster station code loss in SQL `GROUP BY`, IST mislabeled as UTC, Leg 2 same-day bug, N+1 `Station.findOne` fare loops, synthetic ML models failing majority baseline (`occupancy_model`), train–serving feature mismatches, `/copilot/query` hardcoded JSON, Docker RAG path failure, TF-IDF query-time refit drift. | Lack of live GDS/IRCTC/flight/bus/ferry API feeds; reliance on static JSON/CSV catalogs without validity timestamps; global 3s circuit breaker killing fast ML calls during slow RAG queries; 40-thread AnyIO pool exhaustion under concurrent PyTorch/Gemini calls. |
| **Frontend & Infra** | `BookingModal.jsx:530` `trip` crash, `HotelBookingModal.jsx` fake confirmation, `DeveloperPortal` pack mismatch, `DestinationPage` `/api/api/`, broken `nginx_load_balancer.conf` frontend root & port 443, `render.yaml` missing `ENVIRONMENT=production`, `netlify.toml` exposing unauthenticated `/ai/*`. | Heavy bundle chunks (`vendor-three` 897 KB, `vendor-zxcvbn` 799 KB); `localStorage` storing unencrypted PII/medical/reservation JSON; lack of Prometheus/OpenTelemetry metrics or distributed tracing. |

---

## 5. Audit Index

Detailed, line-by-line findings are documented across the companion architecture reports:
1. [ARCHITECTURE_WEAKNESSES.md](file:///d:/MYGIT/TravelIQ/docs/architecture/ARCHITECTURE_WEAKNESSES.md) — Modular structure, duplication, circular dependencies, routing drift, frontend/infra issues.
2. [SECURITY_AUDIT.md](file:///d:/MYGIT/TravelIQ/docs/architecture/SECURITY_AUDIT.md) — OWASP Top 10, authentication, RBAC, WebAuthn, CORS/CSRF, uploads, B2B API keys, n8n SSRF.
3. [DATABASE_AUDIT.md](file:///d:/MYGIT/TravelIQ/docs/architecture/DATABASE_AUDIT.md) — Schema drift, missing indexes/FKs/uniques, transactions, booking state machine, Razorpay & hotel concurrency.
4. [PERFORMANCE_AUDIT.md](file:///d:/MYGIT/TravelIQ/docs/architecture/PERFORMANCE_AUDIT.md) — N+1 queries, boot scans, event loop/threadpool bottlenecks, bundle sizes, Redis & Nginx scaling.
5. [AI_ML_AUDIT.md](file:///d:/MYGIT/TravelIQ/docs/architecture/AI_ML_AUDIT.md) — ML dataset provenance, train-serving skew, evaluation metrics, RAG vector corruption & hallucination risks.
6. [IMPLEMENTATION_ROADMAP.md](file:///d:/MYGIT/TravelIQ/docs/architecture/IMPLEMENTATION_ROADMAP.md) — Phased remediation backlog, migration safety strategy, and verification gates.
