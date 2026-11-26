# AEVORA (TravelIQ) — Prioritized Implementation & Production Readiness Roadmap

**Date:** 2026-11-26  
**Objective:** Incrementally refactor and harden AEVORA into a verifiable, transaction-safe, cluster-ready, production-grade platform without breaking existing API contracts or fabricating data.

---

## Phase 1: Critical Financial, Security & Runtime Fixes (Immediate Priority)
*Target: Eliminate live checkout crashes, double-refund races, auth/2FA bypasses, SSRF/OTP vulnerabilities, and hanging test suites.*

| Step | Task | Target Files | Linked Findings | Status & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **1.1** | Fix live Razorpay `ReferenceError: trip is not defined` (`train?.train_name`) and remove fake `'CONFIRMED'` hotel fallback on API failure | `frontend/src/components/BookingModal.jsx:530`, `HotelBookingModal.jsx:191,558-612`, `DestinationPage.jsx:95` | `SYS-001`, `SYS-002`, `ARCH-008` | **Implemented & Verified** (`npm run lint` 0 errors, `npm run build` pass) |
| **1.2** | Unify 2FA state (`UserSecurity` <-> `User`), fix Turnstile `!token` bypass, move `account_status` reactivation after password verification, and block `'suspended'` users | `backend/controllers/authController.js`, `securityController.js`, `middleware/authMiddleware.js` | `SEC-001`, `SEC-004`, `SEC-005` | **Implemented & Verified** (`securityHardening.test.js` + `sessionRevocationRegression.test.js` pass) |
| **1.3** | Fix `ROLE_HIERARCHY['support_admin']` privilege escalation & enforce `requireAdminRole` across all admin routes; allowlist `updateDestination` & ticket status mutations | `backend/controllers/adminController.js`, `routes/adminRoutes.js`, `controllers/supportController.js`, `adminDestinationController.js` | `SEC-006`, `SEC-009`, `SEC-012` | **Implemented & Verified** (`roleHierarchy.test.js` 9/9 pass) |
| **1.4** | Harden Razorpay refund locking (`executeRefundCore`), track ALL webhook events (`refund.*`, `payment.failed`) in `ProcessedWebhookEvent`, check `expires_at` on checkout, fix `'Pending'` vs `'Unpaid'` transition | `backend/controllers/paymentController.js`, `services/bookingLifecycleService.js`, `models/Booking.js` | `DB-002`, `DB-004`, `DB-006` | **Implemented & Verified** (`paymentIntegrityRegression.test.js` 14/14 pass; reconciliation cron queued for Phase 3.5) |
| **1.5** | Secure B2B Developer Checkout (deliver OTP, enforce 5-attempt lockout, prod Razorpay HMAC check, align `TOP_UP_PACKS`, strip `key_hash`, restrict quota refunds to `>= 500`) | `backend/controllers/apiKeyController.js`, `middleware/apiKeyMiddleware.js`, `frontend/src/pages/DeveloperPortal.jsx`, `DeveloperPaymentModal.jsx` | `SEC-003`, `SEC-010`, `SYS-003` | **Implemented & Verified** (`b2bBillingAndConcurrencyRegression.test.js` 10/10 pass) |
| **1.6** | Secure `n8n` boundary (strip `secret` from payloads, disable caller-supplied `callback_url` SSRF, remove hardcoded `'traveliq_n8n_secret_token_2026'`, lock down `handleSupportReply` statuses) | `backend/services/n8nService.js`, `controllers/n8nController.js`, `n8n/workflows/*.json` | `SEC-002` | **Implemented & Verified** (`n8nPromptInjection.test.js` 6/6 pass) |
| **1.7** | Fix `sequelize.close()` / clean exit across hanging backend test suites + 10ms shield flake, expand `seed_runner.js`, & run all 27 suites + `npm run lint` in CI | `backend/tests/*.test.js`, `backend/seed_runner.js`, `.github/workflows/security.yml` | `PERF-006`, `SYS-005` | **Implemented & Verified** (`npm test` 27/27 suites exit `0`) |

---

## Phase 2: Database Canonicalization, Migrations & Multi-Instance Hotel/Session Reliability
*Target: Eliminate schema drift, N+1 queries, split-brain RAM state, and missing constraints.*

| Step | Task | Target Files | Linked Findings | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **2.1** | Fix `deterministicRoutingService.js` broken `t.train_no` / `t.runs_on_days` SQL and `adminController`/`profileController` invalid column queries (`LoginHistory.login_time`, `AdminLog.target_id`, `SecurityAlert.resolved`, `user.phone_number`) | `backend/services/deterministicRoutingService.js`, `controllers/adminController.js`, `profileController.js`, `services/n8nService.js`, `emailService.js` | `ARCH-003`, `DB-001` | Grounded chatbot & admin log integration tests pass against MySQL without SQL errors |
| **2.2** | Establish canonical Sequelize migration framework (`sequelizerc` + `002_indexes_and_constraints.js`), remove runtime `TrainFare.sync({ alter: true })` and pooled `SET FOREIGN_KEY_CHECKS = 0/1`, deduplicate `trainSeeder.js:317-318` | `backend/sequelizerc`, `backend/migrations/`, `backend/server.js`, `seeders/seed_fares.js`, `seeders/trainSeeder.js`, `schema.sql` | `DB-001`, `DB-007`, `PERF-002` | Clean migration `up`/`down` tested on MySQL; zero duplicate `(train_number, stop_sequence)` rows |
| **2.3** | Migrate `HotelService` reservations & inventory from local `reservationsCache` to MySQL ACID transactions (`SELECT ... FOR UPDATE`), fix substring hotel collisions & room-type bypass, ensure `loadHotelData()` runs when `SKIP_SEEDERS=true` | `backend/services/hotelService.js`, `controllers/hotelController.js`, `models/HotelReservation.js`, `server.js` | `DB-005`, `SYS-006`, `ARCH-006` | `hotelReservationIntegrity.test.js` + concurrency overbooking tests pass across 2 simulated workers |
| **2.4** | Eliminate N+1 `Station.findOne` & admin count queries via batch `Op.in` station loading and SQL `GROUP BY` | `backend/utils/railwayFareCalculator.js`, `controllers/travelController.js`, `services/trainTrackingService.js`, `controllers/adminController.js` | `PERF-001` | Measured query count per search drops from `>100` to `<=5` |
| **2.5** | Consolidate CORS allowlist (remove shared PaaS regex), add CSRF protections on cookie mutations, enforce WebAuthn prod origins + `WEBAUTHN_RP_ID`, hash `RefreshToken.token`, separate `ENCRYPTION_KEY` without plaintext fallback | `backend/server.js`, `utils/webauthn.js`, `models/User.js`, `RefreshToken.js`, `controllers/authController.js` | `SEC-007`, `SEC-008`, `SEC-013`, `SEC-014` | Updated `mfaPasskeyHardening`, `sessionRevocation`, and CSRF/CORS tests pass |

---

## Phase 3: Modular Monolith Refactoring, Routing Unification & Durable Event Processing
*Target: Break circular dependencies, unify 4-way routing engines, and establish Redis + Transactional Outbox / RabbitMQ.*

| Step | Task | Target Files | Linked Findings | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **3.1** | Break circular dependency (`routeValidationEngine` <-> `multiModalRoutingEngine`), unify `travel/` module with standardized `train`/`flight`/`bus`/`ferry` provider adapters, and deprecate duplicated `generateRealisticTrainSchedule` & `ai-services/routing.py` tables | `backend/src/modules/travel/`, `backend/services/` | `ARCH-001`, `ARCH-002` | Static dependency check reports `0` cycles; all 4 routing test suites pass |
| **3.2** | Fix cluster station code propagation in SQL, IST-to-UTC timestamp serialization (`buildIsoUtcTimestamp`), next-day Leg 2 weekday validation, and explicit schedule validity metadata | `backend/controllers/travelController.js`, `services/multiModalRoutingEngine.js`, `routeValidationEngine.js`, `adapters/*` | `ARCH-004`, `ARCH-005` | Multi-station cluster & overnight transfer unit tests verify exact stop codes and UTC offsets |
| **3.3** | Introduce `backend/src/modules/` domain organization & `shared/` infrastructure (`errors`, `logging`, `security`, `cache`), consolidating duplicate `/sessions`/`/devices` and `/support`/`/users/tickets` routes with backward-compatible aliases | `backend/src/modules/*`, `backend/src/shared/*`, `backend/routes/*` | `ARCH-007` | Full API contract & integration suite passes with zero breaking route changes |
| **3.4** | Introduce Redis for shared rate limiting, anti-scraping blacklists/velocity, WebAuthn challenges, API key sliding windows, and static station/alias caching | `backend/shared/cache/`, `middleware/rateLimiter.js`, `antiScrapingMiddleware.js`, `services/apiKeyService.js`, `utils/webauthn.js` | `ARCH-006`, `PERF-004` | Multi-instance rate limit & session tests pass consistently across replicas |
| **3.5** | Implement Transactional Outbox (`BookingEvent` inside confirmation/refund DB transaction) + RabbitMQ (or Redis/DB `SKIP LOCKED` fallback worker) with DLQ, correlation IDs, and Razorpay reconciliation cron | `backend/services/bookingConfirmationService.js`, `backend/src/shared/events/`, `paymentController.js` | `DB-008`, `SEC-002` | Simulated mid-flight failures retry cleanly via worker; 0 duplicate deliveries |

---

## Phase 4: AI/ML Pipeline Standardization, RAG Overhaul & Grounding
*Target: Eliminate train–serving skew, prevent RAG vector corruption, and stop synthetic hallucination fallbacks.*

| Step | Task | Target Files | Linked Findings | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **4.1** | Reorganize `ai-services/` into `datasets/`, `training/`, `evaluation/`, `inference/`, `model_registry/`, `monitoring/` with shared deterministic JSON preprocessing (removing `pickle.load`) | `ai-services/` | `AI-001`, `AI-002`, `SEC-011` | `pytest` verifies identical transform output between training & serving and safe JSON deserialization |
| **4.2** | Fix feature scaling (`crowd_model`, `occupancy_model`, `route_recommender`, `behavior_net`, `delay_model` `"Clear"` -> unknown token, `fare_model` station codes), train/val/test split, full metrics (`MAE/RMSE/R2/F1/ROC-AUC`), and fix `test_loss` + `/retrain-with-data` atomic swap | `ai-services/training/`, `ai-services/evaluation/`, `ai-services/main.py` | `AI-001`, `AI-002`, `AI-005` | All promoted models beat majority/mean baselines on hold-out test split; metrics properly populated |
| **4.3** | Overhaul RAG: send document bytes/text over HTTP (fixing multi-container upload), switch to fixed-dim embeddings (eliminating query-time TF-IDF refit drift), index by `document_id`, require chunk citations (`temperature=0.0`) & abstain when retrieval misses | `ai-services/rag_engine.py`, `main.py`, `backend/controllers/ragController.js` | `AI-003`, `AI-004` | Upload -> delete -> query integration test across separate backend/AI containers passes without vector drift or hallucination |
| **4.4** | Remove fabricated telemetry from `/copilot/query`, `agentController.js`, `aiController.js` DB fallback logging, `RAGSearchPage.jsx`, and `AIChatbot.jsx`; switch `main.py` & `chatbotController.js` Gemini calls to async/header-key auth (`x-goog-api-key`) with separated timeouts | `ai-services/main.py`, `backend/services/aiService.js`, `controllers/aiController.js`, `agentController.js`, `chatbotController.js`, `frontend/` | `AI-004`, `PERF-003`, `SEC-011` | Zero fallback numbers persisted to DB; hallucination regression suite passes |

---

## Phase 5: Frontend Optimization, Infrastructure Hardening, Observability & Load Verification
*Target: Production-grade containers, Nginx/Render/Netlify alignment, Prometheus/OpenTelemetry, and verified load testing.*

| Step | Task | Target Files | Linked Findings | Verification Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **5.1** | Dynamically import `zxcvbn` (`799 KB`), route all pages through `src/utils/api.js`, remove plaintext medical/reservation `localStorage`, and verify `'Ferry'` filter reset | `frontend/src/pages/Signup.jsx`, `SecurityDashboard.jsx`, `Dashboard.jsx`, `EmergencySOSModal.jsx`, `AIPredictionsPage.jsx`, `KnowledgeGraphPage.jsx`, `RAGSearchPage.jsx` | `ARCH-008`, `PERF-005` | `npm run build` eliminates `zxcvbn` chunk warning; `npm run lint` passes cleanly |
| **5.2** | Fix `docker-compose.loadbalance.yml` (add frontend static service/build, TLS or port 80, `TRUST_PROXY=true`, `ENVIRONMENT=production`, AI failover upstream), `render.yaml`, `netlify.toml` (remove unauthenticated `/ai/*` proxy), and `Dockerfile` CPU PyTorch + `HEALTHCHECK` | `load_testing/`, `render.yaml`, `netlify.toml`, `backend/Dockerfile`, `ai-services/Dockerfile`, `frontend/Dockerfile.prod` | `ARCH-009`, `AI-007` | Full `docker compose -f docker-compose.loadbalance.yml up --build` serves SPA, API, and AI healthchecks cleanly |
| **5.3** | Add Prometheus `/metrics`, OpenTelemetry trace propagation, DB pool metrics, and structured Pino logging across controllers; document deploy & rollback runbooks | `backend/shared/observability/`, `ai-services/monitoring/`, `docs/` | `PERF-001`, Observability | `/metrics` endpoint exposes HTTP latency histograms, DB pool gauges, AI inference durations, and payment counters |
| **5.4** | Fix `locustfile.py` (`/api/travel/routes/search`) & `load_test_suite.js` and execute empirical load benchmarks (10, 50, 100, 500, 1,000 VUs) recording RPS, P50/P95/P99, error %, CPU/RAM, and DB threads | `load_testing/locustfile.py`, `load_test_suite.js`, `docs/architecture/` | `PERF-006` | Recorded empirical load results documented without synthetic extrapolation |

---

## Database Migration & Rollback Strategy
1. **Non-Destructive Additive Migrations:** Every schema change (adding missing indexes, `UNIQUE` constraints, foreign keys, `outbox_events` table) will first execute pre-flight duplicate checks (e.g., deduplicating `TrainSchedule(train_number, stop_sequence)` and `Organization(owner_id)`), then apply `ALTER TABLE ... ADD INDEX/CONSTRAINT` via versioned Sequelize migrations with explicit `down()` rollback handlers.
2. **Zero Runtime DDL:** Disable `sync({ alter: true })` and boot-time `ALTER TABLE` statements in `server.js` and `seed_fares.js` once migrations are verified.
3. **Backup Gate:** Require logical `mysqldump --single-transaction --routines --triggers` snapshot prior to running production migrations.
