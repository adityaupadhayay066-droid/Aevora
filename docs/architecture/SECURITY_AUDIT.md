# AEVORA (TravelIQ) — OWASP-Oriented Security Audit Report

**Audit Date:** 2026-11-26  
**Scope:** Authentication, Session Management, RBAC, IDOR, Input Validation, WebAuthn, CORS/CSRF/CSP, File Uploads, B2B API Key Governance, Payment/Webhook Security, and Microservice/n8n Boundaries.

---

## 1. Confirmed Security Vulnerabilities

### `SEC-001` — Broken 2FA Enforcement & Admin 2FA Bypass (`User` vs `UserSecurity` Mismatch)
- **Severity:** Critical (OWASP A07: Identification & Authentication Failures)
- **Affected File & Line:**
  - `Ai travel assistant/backend/controllers/securityController.js:100-120` (`toggle2FA`)
  - `Ai travel assistant/backend/controllers/authController.js:463-471` (`loginUser`), `:635-641` (`adminLogin`), `:812-822` (`registerAdmin`)
- **Actual Technical Problem:** `toggle2FA` updates `User.two_factor_enabled`, and `registerAdmin` sets `two_factor_enabled: true` solely on `User` without creating a `UserSecurity` row. However, `loginUser` and `adminLogin` read 2FA status exclusively from `UserSecurity.two_factor_enabled`.
- **Reproduction / Evidence:**
  ```js
  // securityController.js:107-108
  user.two_factor_enabled = !user.two_factor_enabled;
  await user.save();
  // authController.js:466-469
  const sec = await UserSecurity.findOne({ where: { user_id: user.id } });
  if (sec) { isTwoFactorEnabled = sec.two_factor_enabled; }
  ```
  Users enabling 2FA via the Security Dashboard and newly registered admins log in without any OTP challenge.
- **Recommended Solution:** Consolidate `UserSecurity.two_factor_enabled` as the single source of truth (or atomically sync both inside a transaction in `toggle2FA`, `registerAdmin`, and `seedAdmin`), and mandate 2FA for all `admin` logins in production.
- **Implementation Status:** Implemented & Verified (Phase 1 — synced `User` & `UserSecurity` in `toggle2FA`, `registerAdmin`, `loginUser`, and `adminLogin`)

### `SEC-002` — Unauthenticated SSRF & Secret Exposure in `n8n` Workflows and Service Bridge
- **Severity:** Critical (OWASP A10: SSRF / A02: Cryptographic Failures)
- **Affected File & Line:**
  - `Ai travel assistant/backend/services/n8nService.js:214,331,405,469,486,501`
  - `Ai travel assistant/n8n/workflows/*.json:12,22,47,63`
  - `Ai travel assistant/n8n/docker-compose.yml:9,13-15`
  - `Ai travel assistant/backend/controllers/n8nController.js:37-105`
- **Actual Technical Problem:**
  1. `n8nService.js` includes `secret: process.env.N8N_WEBHOOK_SECRET` inside the JSON request body logged in n8n execution history.
  2. All three n8n webhook nodes accept unauthenticated HTTP POSTs on port `5678`, hardcode `'traveliq_n8n_secret_token_2026'` as fallback secret, and issue outbound POSTs to arbitrary caller-supplied `body.callback_url` (SSRF).
  3. `n8nController.handleSupportReply` accepts unvalidated `req.body.status`, allowing inbound webhook callers to set `SupportTicket.status` to `'Closed'`/`'Resolved'` and misattribute `'Admin'` messages/logs to `ticket.user_id`.
- **Recommended Solution:** Strip `secret` from JSON bodies, enable n8n webhook authentication + basic auth/TLS, hardcode allowlisted backend callback URLs via n8n env vars instead of trusting `body.callback_url`, sign n8n->backend callbacks with HMAC + timestamp, and restrict `handleSupportReply` status transitions to `'In Progress'`/`'Needs Review'`.
- **Implementation Status:** Partially Implemented (Phase 1 — stripped `secret` from payloads, removed hardcoded fallback & `body.callback_url` SSRF from workflow JSONs, locked `handleSupportReply` statuses; remaining: n8n HTTP webhook auth & HMAC signing)

### `SEC-003` — B2B Enterprise Tier Upgrade via Unverified 6-Digit OTP Without Payment Settlement
- **Severity:** Critical (OWASP A04: Insecure Design / Business Logic Abuse)
- **Affected File & Line:** `Ai travel assistant/backend/controllers/apiKeyController.js:259-483` (`pendingPaymentIntents`, `initiateDeveloperPayment`, `verifyDeveloperPayment`), `Ai travel assistant/backend/routes/apiKeyRoutes.js:26-27`
- **Actual Technical Problem:** `initiateDeveloperPayment` generates a 6-digit `challengeCode` stored in local RAM (`pendingPaymentIntents`) without delivering it via email/SMS, and `verifyDeveloperPayment` accepts `verification_code` with **zero failed-attempt limits** and no Razorpay/Stripe settlement, granting `enterprise` plan (`100,000` quota, `600 req/min`) or `25,000` top-up quota using synthetic `TIQ-DEV-VERIFIED-*` transaction IDs.
- **Recommended Solution:** Replace the OTP simulation with actual Razorpay order creation + HMAC-SHA256 signature & webhook verification, enforce strict rate limits/attempt caps, verify `org.is_active`, and use atomic SQL quota increments.
- **Implementation Status:** Partially Implemented (Phase 1 — enforced email delivery, 5-attempt lockout, production Razorpay HMAC signature requirement, `org.is_active` check, atomic quota increment; remaining: DB persistence for B2B payment intents)

### `SEC-004` — Cloudflare Turnstile CAPTCHA Bypass When Token Is Omitted
- **Severity:** High (OWASP A07: Identification & Authentication Failures)
- **Affected File & Line:** `Ai travel assistant/backend/controllers/authController.js:35-47` (`verifyTurnstile`), `:281-286` (`registerUser`), `:368-373` (`loginUser`)
- **Actual Technical Problem:** `if (!process.env.TURNSTILE_SECRET_KEY || !token) return true;` returns `true` whenever `turnstileToken` is missing or empty, completely neutralizing CAPTCHA even when `TURNSTILE_SECRET_KEY` is configured.
- **Recommended Solution:** Enforce `if (!token || typeof token !== 'string') return false;` whenever `process.env.TURNSTILE_SECRET_KEY` is configured.
- **Implementation Status:** Implemented & Verified (Phase 1)

### `SEC-005` — Pre-Authentication Account Verification/Reactivation & `suspended` Status Bypass
- **Severity:** High (OWASP A07: Identification & Authentication Failures)
- **Affected File & Line:** `Ai travel assistant/backend/controllers/authController.js:383-396,426` (`loginUser`), `:602-604` (`adminLogin`), `Ai travel assistant/backend/middleware/authMiddleware.js:54-69` (`protect`)
- **Actual Technical Problem:** Before `user.matchPassword(password)` executes, `loginUser` mutates `pending_verification` -> `active` + `email_verified = true` (`await user.save()`) and flips `deactivated` -> `active` (persisted at line `426` even on failed password attempts!). Additionally, neither `loginUser`, `adminLogin`, `refreshSession`, nor `protect` blocks `account_status === 'suspended'`.
- **Recommended Solution:** Only reactivate deactivated accounts *after* successful password + 2FA verification, require explicit email/OTP verification for `pending_verification`, and reject `account_status === 'suspended'` across auth and `protect`.
- **Implementation Status:** Implemented & Verified (Phase 1)

### `SEC-006` — Missing RBAC Guards Across ~60 Admin Endpoints & `support_admin` Privilege Escalation
- **Severity:** High (OWASP A01: Broken Access Control)
- **Affected File & Line:** `Ai travel assistant/backend/routes/adminRoutes.js:97-196`, `Ai travel assistant/backend/controllers/adminController.js:252-268` (`ROLE_HIERARCHY`, `getRoleLevel`)
- **Actual Technical Problem:**
  1. `User.js:183` defines `admin_role` `'support_admin'`, while `ROLE_HIERARCHY` defines `'support_agent': 20`. Because `ROLE_HIERARCHY['support_admin']` is `undefined`, `getRoleLevel` falls back to `ROLE_HIERARCHY.admin` (`50`), silently elevating `support_admin` above `data_manager` (`30`).
  2. Only `PUT /admins/:id/role` (`adminRoutes.js:149`) attaches `requireAdminRole`. ~60 destructive/sensitive admin endpoints (`DELETE /users/:id`, password resets, PII CSV exports, security settings, B2B org/key overrides, session termination) allow any `data_manager` or `support_admin`.
- **Recommended Solution:** Fix `'support_admin': 20` in `ROLE_HIERARCHY` (fail closed at `0` for unknown roles) and apply granular `requireAdminRole([...])` middleware across every admin route group.
- **Implementation Status:** Implemented & Verified (Phase 1)

### `SEC-007` — Wildcard PaaS CORS Subdomain Matching + `SameSite=None` Cookies Without CSRF Protection
- **Severity:** High (OWASP A05: Security Misconfiguration / CSRF)
- **Affected File & Line:** `Ai travel assistant/backend/server.js:181-206` (`cors`), `Ai travel assistant/backend/controllers/authController.js:72-88,932-938,1267-1281`
- **Actual Technical Problem:**
  1. `TRUSTED_DEPLOYMENT_REGEX` matches `/^https:\/\/(?:aevora|traveliq)(?:-[a-z0-9]+)?\.(?:netlify\.app|onrender\.com|vercel\.app)$/i` with `credentials: true` — any third party registering an unclaimed subdomain (e.g., `https://aevora-login.netlify.app`) gains credentialed cross-origin API access. Non-prod `origin.includes('.devtunnels.ms')` allows suffix bypasses.
  2. Production sets `sameSite: 'none'` cookies without CSRF tokens or `Origin`/`Sec-Fetch-Site` enforcement on cookie-authenticated POST/PUT/DELETE routes.
- **Recommended Solution:** Replace regex PaaS domain matching with an explicit `ALLOWED_ORIGINS` allowlist; use `sameSite: 'lax'` where same-site hosting applies and enforce double-submit CSRF tokens + strict `Origin` checks on mutations.
- **Implementation Status:** Open (Confirmed)

### `SEC-008` — WebAuthn `devtunnels.ms` Origin Bypass in Production & Lockout Bypass
- **Severity:** High (OWASP A07: Identification & Authentication Failures)
- **Affected File & Line:** `Ai travel assistant/backend/utils/webauthn.js:42-75`, `Ai travel assistant/backend/controllers/authController.js:1080-1113`
- **Actual Technical Problem:** `getExpectedOrigins` accepts `http://localhost:*`, `127.0.0.1:*`, and `u.hostname.endsWith('devtunnels.ms')` (missing leading dot and `NODE_ENV !== 'production'` guard) in production, `getRpId` falls back to spoofable `req.headers.host`, and `passkeyLoginVerify` sets `requireUserVerification: false` without checking `user.suspended_until`.
- **Recommended Solution:** Require explicit `WEBAUTHN_RP_ID` and `WEBAUTHN_ORIGIN` in production, restrict dev origins to non-production, enforce `requireUserVerification: true` where UV is required, and check `suspended_until`/`account_status`.
- **Implementation Status:** Open (Confirmed)

### `SEC-009` — Support Ticket Arbitrary Status Manipulation & Broken Admin Ticket Reply Route
- **Severity:** Medium (OWASP A01: Broken Access Control)
- **Affected File & Line:** `Ai travel assistant/backend/controllers/supportController.js:101-144,166-183`, `Ai travel assistant/backend/routes/adminRoutes.js:162`
- **Actual Technical Problem:** Ticket owners can supply arbitrary `status` strings in `POST /api/support/:id/reply` (`supportController.js:124`) and `PUT /api/support/:id` (`:166-183`), bypassing admin triage workflows. Meanwhile, `adminRoutes.js:162` binds `:ticketId` while `replyToTicket` reads `req.params.id` (always 404).
- **Recommended Solution:** Restrict status mutations in `replyToTicket` and `updateTicket` to authorized admins with enum validation, and unify `:ticketId` / `:id`.
- **Implementation Status:** Implemented & Verified (Phase 1)

### `SEC-010` — B2B API Key Security Gaps: Unhashed `key_hash` Disclosure, 4xx Quota Refund Bypass, & Missing Validation
- **Severity:** High (OWASP A01 / A04)
- **Affected File & Line:** `Ai travel assistant/backend/middleware/apiKeyMiddleware.js:79-81`, `Ai travel assistant/backend/controllers/apiKeyController.js:567,639-704`, `Ai travel assistant/backend/routes/v1PublicRoutes.js:184,212-283`
- **Actual Technical Problem:**
  1. `apiKeyMiddleware.js:79-81` refunds monthly quota on **every `res.statusCode >= 400`** inside an unawaited `finish` callback, allowing free keys to hit 400/404 validation errors indefinitely without quota cost.
  2. `updateApiKey` and `adminUpdateApiKey` return full `ApiKey` model objects including `key_hash`.
  3. `adminUpdateApiKey`/`adminUpdateOrganization` lack type/range validation (calling `name.trim()` crashes 500 on non-strings; permits negative quotas/rate limits).
- **Recommended Solution:** Only refund quota on downstream 5xx failures, strip `key_hash` via Sequelize `attributes: { exclude: ['key_hash'] }`, and validate all B2B admin/public inputs with Zod.
- **Implementation Status:** Partially Implemented (Phase 1 — restricted `refundQuota` to `>= 500`, stripped `key_hash` in key update DTOs, added validation to `adminUpdateApiKey` & `adminUpdateOrganization`; remaining: `v1PublicRoutes.js` Zod schemas)

### `SEC-011` — Unsafe `pickle.load`, Unbounded Inputs, Raw Exception Disclosure & Gemini Key in URL
- **Severity:** High (OWASP A03 / A05 / A08)
- **Affected File & Line:**
  - `Ai travel assistant/ai-services/main.py:115-116,219-385,696,701,998,1006,1186-1191,1344-1365,1401-1637`
  - `Ai travel assistant/ai-services/rag_engine.py:178,203-206`
  - `Ai travel assistant/backend/controllers/chatbotController.js:35,62` & `deterministicRoutingService.js:375,384`
  - `Ai travel assistant/backend/controllers/{apiKeyController,agentController,fraudController,knowledgeGraphController,travelController,ragController,profileController}.js`
- **Actual Technical Problem:**
  1. `encoders.pkl` uses unsafe `pickle.load` (`main.py:116`).
  2. `main.py` endpoints lack Pydantic bounds (`hour_of_day`, `month`, `current_fare`, unbounded strings) and return raw `str(e)` details to HTTP callers.
  3. `GEMINI_API_KEY` is passed in URL query strings (`?key=...`) across `main.py:696,1006`, `chatbotController.js:35,62`, and `deterministicRoutingService.js:384`.
  4. Prompt injection defenses are incomplete: `rag_engine.py:203` misses closing `</untrusted` tags; `deterministicRoutingService.js:375` interpolates raw `userMessage` without XML delimiters or `system_instruction`.
  5. `main.py:1345,1364` calls `os.path.islink()` *after* `os.path.realpath()` has already resolved symlinks; `ragController.js:156` checks `startsWith(allowedUploadsDir)` without `+ path.sep`.
  6. Production Express controllers leak `err.message` in HTTP 500 responses (`agentController.js:406`, `fraudController.js:60`, `apiKeyController.js:81`, etc.).
- **Recommended Solution:** Replace `encoders.pkl` with JSON vocabulary mappings; add strict Pydantic bounds; strip `?key=` URL params (use `x-goog-api-key` header only); escape closing tags case-insensitively and use `system_instruction`; fix symlink/path-boundary checks; and standardize generic 500 error payloads in production.
- **Implementation Status:** Open (Confirmed)

### `SEC-012` — Unfiltered Admin CSV Upload, Missing Magic-Byte Verification, & `MulterError` 500s
- **Severity:** Medium (OWASP A04 / A05)
- **Affected File & Line:** `Ai travel assistant/backend/routes/adminRoutes.js:8-11`, `ragRoutes.js:36-42`, `supportRoutes.js:31-38`, `middleware/uploadMiddleware.js:29-39`, `controllers/adminDestinationController.js:108-119`
- **Actual Technical Problem:** `csvUpload` (`adminRoutes.js:8-11`) lacks any `fileFilter` (accepting executables/HTML up to 10 MB); `ragRoutes.js` checks file extensions without MIME checks; none verify magic bytes; Multer rejections bubble to `server.js:307` as HTTP 500; and `adminDestinationController.updateDestination` performs unrestricted `{ ...req.body }` mass assignment.
- **Recommended Solution:** Add extension + MIME + magic-byte checks across all Multer uploaders, return HTTP `400` on `MulterError`, and explicitly allowlist `updateDestination` fields.
- **Implementation Status:** Partially Implemented (Phase 1 — added `.csv` extension/MIME `fileFilter` on `csvUpload` and explicit `ALLOWED_FIELDS` allowlist in `adminDestinationController.updateDestination`; remaining: MIME/magic-byte checks on RAG/support/avatar uploaders & `MulterError` `400` handler)

### `SEC-013` — Cryptographic Key Coupling, Silent Plaintext PII Fallback, & Hardcoded Secrets
- **Severity:** Medium (OWASP A02: Cryptographic Failures)
- **Affected File & Line:**
  - `Ai travel assistant/backend/server.js:53-66`
  - `Ai travel assistant/backend/models/User.js:7-15,27-43`
  - `Ai travel assistant/backend/models/RefreshToken.js:14-18`
  - `Ai travel assistant/backend/controllers/paymentController.js:1288,1414` (`'traveliq_ticket_seal'`)
  - `Ai travel assistant/ai-services/tests/test_all_route_auth.py:65` & `ai-services/main.py:46-48`
- **Actual Technical Problem:**
  1. `server.js` does not validate `JWT_REFRESH_SECRET` or `ENCRYPTION_KEY` at production startup.
  2. `User.js` falls back to `sha256(JWT_SECRET)` for AES-GCM PII encryption and silently returns **plaintext** if `encrypt()` throws!
  3. `RefreshToken.token` stores raw JWT strings instead of SHA-256 hashes.
  4. `paymentController.js` signs digital ticket seals with hardcoded `'traveliq_ticket_seal'`.
  5. `render.yaml` and `docker-compose.yml` omit `ENVIRONMENT=production` on FastAPI, bypassing `INTERNAL_SERVICE_KEY` startup enforcement.
- **Recommended Solution:** Validate all mandatory secrets (`JWT_REFRESH_SECRET`, 64-hex `ENCRYPTION_KEY`, `TICKET_SEAL_SECRET`, `INTERNAL_SERVICE_KEY`) at startup in production, fail closed on encryption errors, hash `RefreshToken.token` before DB storage, and set `ENVIRONMENT=production` across deploy templates.
- **Implementation Status:** Open (Confirmed)

### `SEC-014` — CSP `'unsafe-inline'`, `TRUST_PROXY` Mismatch, & Logging Redaction Gaps
- **Severity:** Medium (OWASP A05 / A09)
- **Affected File & Line:** `Ai travel assistant/backend/server.js:72-75,100-127`, `middleware/rateLimiter.js:7-20`, `config/logger.js:11-46,69-75`, `middleware/antiScrapingMiddleware.js:48-50,69-109,248-257`
- **Actual Technical Problem:** CSP allows `'unsafe-inline'` scripts; `rateLimiter.js` fails to parse non-numeric `TRUST_PROXY` strings (`'loopback'`, CIDRs) supported by `server.js`, causing rate limiters to fall back to the proxy socket IP; `logger.js` `REDACT_PATHS` omits `x-api-token`, `x-refresh-token`, `adminSecret`, `verification_code`, and accepts unsanitized `x-request-id`; and `X-Client-Shield` accepts unkeyed/future tokens when `CLIENT_SHIELD_SECRET` is unset and logs warnings without blocking.
- **Recommended Solution:** Migrate CSP scripts to nonces/hashes, unify client IP resolution with `req.ip`, expand Pino redaction paths + sanitize `x-request-id`, and do not treat `X-Client-Shield` as a security boundary.
- **Implementation Status:** Open (Confirmed)

---

## 2. Architectural Security Risks

1. **Cluster-Wide Bypass of In-Memory Rate Limiters, Anti-Scraping Bans & Backup Codes:** Running multiple Express instances multiplies per-IP rate limits by `N` replicas, isolates honeypot bans to one node, and leaves `verify2FA` backup codes (`authController.js:882-896`) vulnerable to concurrent single-use replay without `LOCK.UPDATE`.
2. **Unencrypted PII & Medical Data in Browser `localStorage`:** `EmergencySOSModal.jsx:62-66,98-100` stores blood group, medical conditions, and emergency contacts in plaintext `localStorage`, increasing the blast radius of any XSS vulnerability.
3. **Inconsistent Password Policy Enforcement & Missing Reset Flow:** `security_settings.json` (`min_password_length: 10`, `check_pwned_passwords: true`) is ignored by `validationMiddleware.js` (`min(6)`), `authController.js` (8 chars unless `ENFORCE_PWNED_CHECK=true`), and `profileController.js` (always checks HIBP without timeout), while `emailService.sendPasswordResetEmail` is dead code.
4. **Cross-Scope `JWT_SECRET` Reuse:** Access tokens, 2FA challenge tokens (`authController.js:511,679`), trusted device cookies (`:929`), and fallback PII encryption all share one secret key.
