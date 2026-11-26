# AEVORA (TravelIQ) — Database, Booking Lifecycle & Payment Integrity Audit

**Audit Date:** 2026-11-26  
**Scope:** MySQL 8.0 `schema.sql`, `backend/config/db.js`, `backend/migrations/*`, 59 Sequelize models (`backend/models/*`), booking lifecycle, Razorpay payment/webhook/refund flows, and hotel inventory reservation integrity.

---

## 1. Confirmed Database, Schema & Transaction Defects

### `DB-001` — Severe Schema Drift Between `schema.sql`, Sequelize Models, & Controllers
- **Severity:** Critical
- **Affected File & Line:**
  - `Ai travel assistant/schema.sql:39-47,71-85,125-206,317-349,412-466,631-632`
  - `Ai travel assistant/backend/models/{User,Booking,Train,TrainSchedule,TrainFare,Station,SupportTicket,SupportMessage,SupportAttachment,Organization}.js`
  - `Ai travel assistant/backend/controllers/{adminController,profileController,authController,securityController}.js`
  - `Ai travel assistant/backend/services/n8nService.js:230,352,416` & `emailService.js:192`
- **Actual Technical Problem:** `schema.sql` and Sequelize models describe incompatible schemas:
  1. **Table Naming Casing:** `schema.sql` uses lowercase (`users`, `bookings`, `security_alerts`), while 20+ Sequelize models omit `tableName` (defaulting to `'Users'`, `'Bookings'`, `'SecurityAlerts'`) and `Organization.js:18` references `'Users'`. On Linux MySQL (`lower_case_table_names=0`), Sequelize queries hit different tables than `schema.sql`.
  2. **Booking Payment/Status Defaults:** `schema.sql:84-85` defaults `bookings.payment_status` to `'Paid'` and `booking_status` to `'Confirmed'`, and lacks all 5 columns from migration `001_booking_lifecycle_integrity.js` (`booking_reference`, `journey_date`, `transport_type`, `idempotency_key`, `expires_at`).
  3. **`User` Schema & Column Drift:** `schema.sql:44,632` uses `role VARCHAR(50) DEFAULT 'User'` / `'Admin'` vs `User.js:178` `ENUM('user', 'admin')`, and omits 15 security/profile columns. Furthermore, `n8nService.js`, `emailService.js:192`, and `securityController.js:544` read `user.phone` instead of `user.phone_number`.
  4. **Dangerous SQL Trigger & Procedure:** `schema.sql:457-466` (`trg_after_booking_cancel`) logs `event_type = 'FAILED'` on valid cancellations; `sp_process_refund` (`:412-447`) inserts negative-amount `transactions` rows without locking or `Paid` checks.
  5. **Controller Column Errors:** `adminController.js` writes `passenger_details` (non-existent) to `Booking`, `travel_date`/`status` (non-existent) to `Trip`, `target_user_id` to `AdminLog` (column is `target_id`), `is_resolved` to `SecurityAlert` (column is `resolved`), and queries `LoginHistory` ordered by `created_at` (table uses `login_time`, no `created_at`) and `SearchAnalytics.transport_type` (column missing). `profileController.getTrips` (`:283`) allows sorting by non-existent `trip_name`, `travel_date`, `status`.
- **Recommended Solution:** Establish one canonical migration-managed schema (lowercase `tableName` and `underscored: true` across all models), remove `trg_after_booking_cancel` / `sp_process_refund`, repair invalid controller column references, and standardize `user.phone_number`.
- **Implementation Status:** Open (Confirmed)

### `DB-002` — Double-Refund Race Condition & Dangerous State Revert on Failure
- **Severity:** Critical
- **Affected File & Line:** `Ai travel assistant/backend/controllers/paymentController.js:853-1038` (`executeRefundCore`)
- **Actual Technical Problem:**
  1. Phase 1 (`:881,904,923`) permits entering refund execution when status is already `'Refund Pending'` and only blocks concurrency if `transaction.refund_id` is non-null (`:923`). Because `refund_id` is written only in Phase 3 (`:1002`), two parallel refund/cancel calls both commit Phase 1 and **both call Razorpay `/v1/payments/{id}/refund`**, risking double customer refunds.
  2. If Phase 2 fails on an **expired** booking with late capture (`booking_status: 'Expired'`, `payment_status: 'Refund Pending'`), `:980` unconditionally reverts the booking to `{ payment_status: 'Paid', booking_status: 'Confirmed' }`, silently confirming an expired hold!
  3. Phase 3 (`:999-1023`) updates `Transaction` and `Booking` without `LOCK.UPDATE`.
  4. No gateway idempotency key is sent to Razorpay, and `refundAmount === 0` (`LESS_THAN_4H_NO_REFUND`) creates synthetic `rfnd_sim_...` IDs (`:995`) and reports `gateway_confirmed: true` (`:1036`).
- **Recommended Solution:** Reject concurrent synchronous calls when already `'Refund Pending'` (or acquire an atomic DB lease/lock token before external gateway call), never revert `'Expired'` bookings to `'Confirmed'`, apply `LOCK.UPDATE` in Phase 3, and delegate retry recovery to an outbox/reconciliation worker.
- **Implementation Status:** Partially Implemented (Phase 1 — fixed concurrent double-refund race, preserved `Expired` status on rollback, locked Phase 3 rows; remaining: automated background Razorpay reconciliation cron)

### `DB-003` — Expired-Booking Captured Webhooks Claim `refund_initiated: true` Without Refunding
- **Severity:** Critical
- **Affected File & Line:** `Ai travel assistant/backend/controllers/paymentController.js:561-653` (`handlePaymentWebhook`)
- **Actual Technical Problem:** When a captured payment webhook arrives after booking expiration (`Expired`), `handlePaymentWebhook` marks `Transaction` and `Booking` `'Refund Pending'` and responds `200` `{ refund_initiated: true }`, **without calling Razorpay's refund API, inserting a `BookingEvent`, or scheduling any reconciliation job**. Furthermore, `:615-622` fails if `lockedBooking.payment_status === 'Failed'` (`ALLOWED_PAYMENT_TRANSITIONS['Failed']` forbids `'Refund Pending'`).
- **Recommended Solution:** Insert an authoritative refund outbox/event atomically within the webhook transaction and build a reconciliation cron/worker to refund all `Refund Pending` transactions via Razorpay.
- **Implementation Status:** Open (Confirmed)

### `DB-004` — Webhook Deduplication Bypass (`refund.*` / `payment.failed`) & Out-of-Order Corruption
- **Severity:** Critical
- **Affected File & Line:** `Ai travel assistant/backend/controllers/paymentController.js:457-525,655-782` (`handlePaymentWebhook`)
- **Actual Technical Problem:**
  1. `refund.processed`, `refund.created`, and `payment.failed` return at lines `457-484` **before** `event_id` extraction (`:502`) and `ProcessedWebhookEvent` deduplication (`:516`).
  2. `payment.failed` updates all `'Pending'` transactions for `booking_id` without matching `order_id`/`payment_id`, allowing a delayed webhook from Order #1 to mark Order #2's active retry transaction `'Failed'`.
  3. `refund.processed`/`refund.created` unconditionally marks the entire `Booking` and all `Transaction`s `'Refunded'` without `LOCK.UPDATE`, `transitionBookingState`, or checking partial refund amounts.
  4. `:502` ignores `req.headers['x-razorpay-event-id']` (`payload.event_id || evt_${paymentEntity.id}`), colliding distinct events for the same `payment_id` and failing with `500` on unique-constraint races (`:774-782`) instead of `200`.
  5. `:452,503-513` never inspect `payload.payload?.order?.entity` for `order.paid` events lacking `payment.entity`, and `:667-679` early-returns without writing `ProcessedWebhookEvent`.
- **Recommended Solution:** Read `req.headers['x-razorpay-event-id']` first, write `ProcessedWebhookEvent` inside the locked transaction for every event type, return `200` on unique constraint duplicate races, and scope `payment.failed` / `refund.*` mutations strictly to matching `order_id`/`payment_id` and partial vs full amounts.
- **Implementation Status:** Implemented & Verified (Phase 1)

### `DB-005` — Split-Brain `HotelService` In-Memory Cache, Async DB Writes, & Startup Crash Risk
- **Severity:** Critical
- **Affected File & Line:** `Ai travel assistant/backend/services/hotelService.js:40,302-335,736-758,861-992,1008-1095,1196-1198`, `Ai travel assistant/backend/controllers/hotelController.js:99-138,194`
- **Actual Technical Problem:**
  1. `createReservation` checks room availability against process-local `reservationsCache` only, runs `HotelReservation.create(...)` unawaited with `.catch()`, returns `201 Created` before DB persistence, and falls back to `user_id: parseInt(userId) || 1`.
  2. `loadHotelData` hydrates `reservationsCache` from MySQL on boot **without `pricing` or `paymentStatus`**, causing `cancelReservation` (`:1062`) to crash with `TypeError` on `reservation.pricing.grandTotal`.
  3. `getReservationById` never queries MySQL (returning `404` across replicas or after restarts for non-active stays).
  4. `createReservation` matches hotel names via loose substring inclusion (`cur.includes(target)`), while `calculateAuthoritativePricing` falls back to `searchResult.hotels[0]` or `1200` INR; storing raw `data.roomType` instead of `resolvedRoomName` bypasses room-type capacity checks (`:897`).
  5. Non-`Pay at Property` stays enter `status: 'PENDING'` with zero payment flow and never expire, locking room inventory forever.
- **Recommended Solution:** Persist hotels and room inventory in MySQL, verify overlapping availability via transactional `SELECT ... FOR UPDATE`, await `HotelReservation.create`, match hotels/rooms strictly by canonical IDs, and support Razorpay confirmation + `expires_at` hold expiration.
- **Implementation Status:** Open (Confirmed)

### `DB-006` — Booking State Machine Inconsistencies (`'Pending'` vs `'Unpaid'`) & Admin Bypass
- **Severity:** High
- **Affected File & Line:**
  - `Ai travel assistant/backend/controllers/adminController.js:1023-1077` (`updateBooking`)
  - `Ai travel assistant/backend/models/Booking.js:24-27`
  - `Ai travel assistant/backend/controllers/profileController.js:754-773,815,885-969` (`createBooking`, `cancelBooking`)
  - `Ai travel assistant/backend/services/bookingLifecycleService.js:12-38` (`ALLOWED_PAYMENT_TRANSITIONS`)
  - `Ai travel assistant/backend/controllers/paymentController.js:63,194-345` (`createOrder`, `createTransaction`)
- **Actual Technical Problem:**
  1. `adminController.updateBooking` bypasses `transitionBookingState` and `LOCK.UPDATE`, allowing unpaid/expired bookings to be marked `Confirmed` and paid bookings cancelled without refunding.
  2. `Booking.js:26` defaults `payment_status` to `'Pending'` while `profileController.createBooking:815` sets `'Unpaid'`. Cancelling a `'Pending'`-payment booking (`profileController.cancelBooking:927`) tries transitioning `'Pending' -> 'Unpaid'`, which throws `400 Illegal payment state transition` (`ALLOWED_PAYMENT_TRANSITIONS['Pending']` omits `'Unpaid'`).
  3. `createOrder` and `createTransaction` never verify `booking.expires_at < new Date()`, allowing expired holds to be paid before the 60s expiry worker sweeps them; `createOrder` lacks locking (allowing multiple active orders per booking); `createTransaction` rejects checkout with `400` if the webhook confirmed first, and accepts unsigned `status: 'Failed'` mutations from clients.
  4. `createBooking` saves cluster station codes instead of `journeyFareData.sourceStationCode`/`destStationCode`, causing `computeCancellationRefund` (`paymentController.js:816`) to miss `TrainSchedule` stops and default departure to `'00:00:00'`.
- **Recommended Solution:** Standardize booking `payment_status` on `'Unpaid'`, unify transitions in `bookingLifecycleService.js`, route admin edits through `transitionBookingState`, enforce `expires_at` and `LOCK.UPDATE` inside `createOrder`/`createTransaction`, make `createTransaction` idempotent if webhook arrived first, and store exact matched boarding/alighting station codes.
- **Implementation Status:** Partially Implemented (Phase 1 — changed `Booking.js` default `payment_status` to `'Unpaid'`, aligned `ALLOWED_PAYMENT_TRANSITIONS`, and enforced `expires_at < new Date()` in `createOrder`/`createTransaction`; remaining: `adminController.updateBooking` lock/transition routing & saving exact matched corridor station codes)

### `DB-007` — Missing Indexes, Missing Unique Constraints, Missing FKs, & Runtime `sync({ alter: true })`
- **Severity:** High
- **Affected File & Line:**
  - `Ai travel assistant/backend/server.js:318-326` & `seeders/seed_fares.js:20` & `sync_db.js:4` & `migrate_admin_db.js:24`
  - `Ai travel assistant/backend/models/{Booking,Transaction,ProcessedWebhookEvent,HotelReservation,Organization,ApiKey,ApiUsageLog,TrainSchedule,BookingEvent,IdempotencyKey,Analytics,UserLoyalty,FavoriteRoute}.js`
  - `Ai travel assistant/backend/seeders/trainSeeder.js:317-318,1162`
- **Actual Technical Problem:**
  1. `seed_fares.js:20` executes `TrainFare.sync({ alter: true })` on every boot; `server.js:318-326` toggles `SET FOREIGN_KEY_CHECKS = 0/1` across a 25-connection pool (leaving session-scoped FK checks disabled on pooled connections); `001_booking_lifecycle_integrity.js` is never run on boot; and `sequelizerc` points to missing `config/config.json`.
  2. Critical tables lack composite indexes and unique constraints:
     - `Booking`: no index on `user_id`, `(user_id, booking_status)`, `(booking_status, expires_at)`, `idempotency_key`; `trip_id` lacks `UNIQUE`.
     - `Transaction`: no index on `booking_id`, `user_id`, `(booking_id, status)`.
     - `ProcessedWebhookEvent`: no index on `payment_id` or `order_id`.
     - `HotelReservation`: no index on `user_id`, `status`, `(hotel_name, status, check_in_date, check_out_date)` and no FK to `users`.
     - `Organization`: missing `UNIQUE` on `owner_id` (required `dedupe_orgs.js`).
     - `TrainSchedule`: missing `UNIQUE` on `(train_number, stop_sequence)`, causing `bulkCreate({ ignoreDuplicates: true })` to insert duplicate stops (e.g., train `15126` defines both `DDU` and `MGS` at `stop_sequence: 2` in `trainSeeder.js:317-318`).
     - `Analytics.user_id`, `UserLoyalty.user_id`, and `FavoriteRoute(user_id, source_code, dest_code)` lack `UNIQUE` constraints.
- **Recommended Solution:** Remove runtime `sync({ alter: true })` and pooled `FOREIGN_KEY_CHECKS` toggles, deduplicate `trainSeeder.js:317-318`, and deploy formal Sequelize migrations adding all missing foreign keys, composite indexes, and unique constraints.
- **Implementation Status:** Open (Confirmed)

### `DB-008` — `BookingEvent` Side-Effect Race, False `'DELIVERED'` Status, & Lost Updates
- **Severity:** High
- **Affected File & Line:** `Ai travel assistant/backend/services/bookingConfirmationService.js:10-141`, `Ai travel assistant/backend/controllers/supportController.js:43-45`
- **Actual Technical Problem:**
  1. `BookingEvent` is inserted *after* payment commit (crash drops notifications). Concurrent triggers catch the unique violation, re-fetch the `'PROCESSING'` row (`:71-74`), and still re-run emails/Analytics/webhooks because only `delivery_status === 'DELIVERED'` exits early.
  2. `Analytics` updates (`:79-98`) use non-locked `findOne`/`save` (race loses increments).
  3. `:123-131` marks `delivery_status = 'DELIVERED'` even when email and n8n fail (`n8nService.triggerBookingWebhook` swallows failures and returns `{ success: true, delivered: false }`).
- **Recommended Solution:** Implement a genuine Transactional Outbox (`BookingEvent` written inside the confirmation DB transaction), process asynchronously via a queue/poller with `SKIP LOCKED` and exponential backoff, and use atomic `Analytics.increment`.
- **Implementation Status:** Open (Confirmed)

### `DB-009` — Dead / Unused Database Models (`Route`, `Transport`, `Coupon`, Orphan Food Tables)
- **Severity:** Low
- **Affected File & Line:** `Ai travel assistant/backend/models/{Route,Transport,Coupon}.js`, `Ai travel assistant/schema.sql:209-314`
- **Actual Technical Problem:** `Route` has zero runtime queries; `Transport` is seeded once and never queried; `Coupon` has admin CRUD (`adminController.js:1164-1227`) but is ignored by train and hotel checkout (`hotelService.js:775` hardcodes promos); `food_favorites`, `food_reviews`, `cuisines`, `station_foods` exist in `schema.sql` with zero models or backend code.
- **Recommended Solution:** Wire `Coupon` into authoritative checkout pricing or remove dead tables/models cleanly via migration.
- **Implementation Status:** Open (Confirmed)

---

## 2. Potential Database & Lifecycle Architectural Risks

1. **Absence of Train/Bus/Flight Seat Inventory Ledger:** Train and multimodal bookings (`createBooking`) validate route schedules and pending-booking caps (5 per user) without tracking per-train/date/class seat capacity (`SELECT ... FOR UPDATE` on inventory), leaving physical seat allocation unmodeled.
2. **No Automated Reconciliation Against Razorpay Gateway:** Without a periodic cron fetching unsettled `Pending`/`Refund Pending` orders/payments from Razorpay's API, network drops between gateway completion and DB commit remain permanently inconsistent.
3. **Multi-Instance Booking Expiry Worker Contention:** Every Express worker executes `setInterval(expirePendingBookings, 60000)` (`server.js:385-394`) without `LIMIT`, `SKIP LOCKED`, or leader election, and fails to clean up dangling `Pending` `Transaction` rows or clear the interval on `shutdown()`.
4. **No Automated Backup/PITR Verification:** Repository contains no MySQL backup/restore runbook or binary-log retention checks.
