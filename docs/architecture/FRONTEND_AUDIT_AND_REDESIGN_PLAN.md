# TravelIQ — Frontend Architectural Audit & 3D Redesign Plan

**Date:** 2026-11-28  
**Scope:** Complete frontend architecture audit, route and API integration mapping, unused/duplicate code catalog, and Dark Luxury Glass 3D transformation plan.

---

## 1. Current Frontend Architecture

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React / React DOM | `^19.2.6` | Modern component-based UI with React 19 concurrent features |
| **Routing** | React Router DOM | `^7.15.1` | Client-side SPA routing, role-based route guards (`ProtectedRoute`, `AdminRoute`) |
| **Build Tooling** | Vite / Rollup | `^8.0.12` | ESM bundler with custom manual chunk splitting in `vite.config.js` |
| **Styling** | Tailwind CSS / PostCSS | `^4.3.0` | Utility-first styling with custom design tokens |
| **3D Rendering** | Three.js / R3F / Drei | `^0.184.0` / `^9.6.1` / `^10.7.7` | WebGL 3D canvas, globe visualization, station models, and cinematic hero |
| **Motion** | Framer Motion & GSAP | `^12.39.0` / `^3.12.5` | Layout transitions, page fades, glass physics, and scroll-driven kinematics |
| **Smooth Scroll** | Lenis | `^1.1.18` | Smooth momentum scrolling for cinematic storytelling |
| **Geospatial Maps** | Leaflet / React-Leaflet | `^1.9.4` / `^5.0.0` | Open-source route mapping and transport network lines |
| **Charts** | Recharts | `^3.8.1` | Analytics, budget breakdown, emissions, and pricing trends |
| **Icons** | Lucide React | `^1.16.0` | Clean, modern vector icon system |
| **Biometrics & Security** | SimpleWebAuthn / Turnstile | `^14.0.0` / `^1.5.3` | FIDO2 WebAuthn biometric passkeys & Cloudflare Turnstile anti-bot challenge |

---

## 2. Existing Page Inventory & Route Map

### A. Public & Authentication Routes
1. `/` — `LandingPage.jsx` (Hero, route search, popular corridors, feature showcases, footer)
2. `/login` — `Login.jsx` (Email/password, passkey WebAuthn, 2FA challenge, Turnstile)
3. `/signup` — `Signup.jsx` (Registration, zxcvbn password entropy, Turnstile challenge)
4. `/admin/login` — `AdminLogin.jsx` (Admin authentication with privilege checks)
5. `/admin/signup` — `AdminSignup.jsx` (Admin onboarding with registration code)

### B. Travel Discovery & Booking Routes
6. `/destinations` — `DestinationsDirectoryPage.jsx` (Curated destination directory)
7. `/destinations/:cityName` — `DestinationPage.jsx` (Detailed destination guide, hotel/food recommendations, weather)
8. `/hotels` — `HotelsView.jsx` (Hotel inventory search, room tier selection, reservation modal)
9. `/dashboard` — `Dashboard.jsx` (Multi-modal route search, filter panel, train/flight/bus results, booking trigger)
10. `/dashboard/my-trips` — `MyTripsPage.jsx` (User bookings, cancellation, ticket view)
11. `/support` — `SupportPage.jsx` (Customer support ticket submission & history)
12. `/support/ticket/:id` — `TicketDetail.jsx` (Interactive support message thread & admin responses)

### C. Advanced Intelligence, Tracking & 3D
13. `/dashboard/track` — `LiveTrackingPage.jsx` (Real-time train schedule progress and status)
14. `/dashboard/station-3d` — `Station3DView.jsx` (Interactive 3D railway station terminal visualizer)
15. `/dashboard/3d-globe` — `Globe3DPage.jsx` (Three.js WebGL interactive world travel globe)
16. `/dashboard/ai-workspace` — `AIWorkspace.jsx` (AI travel assistant planning environment)
17. `/dashboard/agentic-planner` — `AgenticPlannerPage.jsx` (Autonomous multi-agent trip schedule builder)
18. `/dashboard/ai-predictions` — `AIPredictionsPage.jsx` (Delay, crowd, fare, and demand forecasting charts)
19. `/dashboard/rag` — `RAGSearchPage.jsx` (Document retrieval-augmented generation search)
20. `/dashboard/voice-assistant` — `VoiceAssistantPage.jsx` (Native speech recognition voice travel agent)
21. `/dashboard/knowledge-graph` — `KnowledgeGraphPage.jsx` (Transport entity graph visualizer)
22. `/dashboard/food` — `FoodPage.jsx` (Culinary recommendations by city and budget)
23. `/dashboard/eco` — `EcoTrackerPage.jsx` (Carbon footprint metrics, rail vs flight savings)

### D. User Account & Security
24. `/dashboard/profile` — `ProfilePage.jsx` (Profile details, avatar upload, password change)
25. `/dashboard/settings` — `SettingsPage.jsx` (Notification preferences, currency, display)
26. `/dashboard/security` — `SecurityDashboard.jsx` (2FA TOTP QR setup, passkey management, active alerts)
27. `/dashboard/devices` — `DevicesPage.jsx` (Trusted browser devices, biometric bindings)
28. `/dashboard/sessions` — `ActiveSessions.jsx` (Active JWT sessions, remote revocation)
29. `/dashboard/activity` — `ActivityLog.jsx` (Audit trail of user logins and actions)
30. `/developer` & `/dashboard/developer` — `DeveloperPortal.jsx` (B2B API key provisioning, rate limits, quota top-ups)

### E. Admin Dashboard (`/admin/*`)
31. `/admin/dashboard` — `AdminDashboardHome.jsx` (KPI counters, revenue, server metrics, SOS alerts)
32. `/admin/users` — `UsersPage.jsx` (User directory, roles, suspensions)
33. `/admin/travel-data` — `TravelDataPage.jsx` (Data freshness, station counts, database sync)
34. `/admin/trains` — `TrainsPage.jsx` (Train schedules, routes, stops, live tracking modal)
35. `/admin/destinations` — `DestinationsPage.jsx` (Destination catalog CRUD)
36. `/admin/transport` — `TransportPage.jsx` (Flight, bus, and ferry fleet status)
37. `/admin/ai` — `AIAssistantPage.jsx` (AI query volume, latency, feedback)
38. `/admin/ai-knowledge` — `AIKnowledgePage.jsx` (Chatbot knowledge base entries)
39. `/admin/searches` — `SearchActivityPage.jsx` (Search analytics, popular corridors, zero-result queries)
40. `/admin/reports` — `ReportsPage.jsx` (Support ticket triage, export reports)
41. `/admin/security-alerts` & `/admin/sos` — `SecurityAlertsPage.jsx` (Emergency SOS dispatch and tracking)
42. `/admin/analytics` — `AnalyticsPage.jsx` (Platform revenue, traffic curves, conversions)
43. `/admin/system-health` — `SystemHealthPage.jsx` (Express server, MySQL, Python FastAPI status)
44. `/admin/notifications` — `NotificationsPage.jsx` (Broadcast system announcements)
45. `/admin/admins` — `AdminManagementPage.jsx` (RBAC admin role assignment, super_admin only)
46. `/admin/logs` — `AuditLogsPage.jsx` (Security audit logs with CSV export)
47. `/admin/settings` — `SettingsPage.jsx` (Global security policies, maintenance mode)
48. `/admin/api-keys` — `AdminApiKeysPage.jsx` (Enterprise B2B API keys, organization quotas)

---

## 3. Backend API Integration Map

The frontend communicates with Express (`http://127.0.0.1:5000/api`) and FastAPI via the following endpoints:

| Endpoint | Method | Consumed By | Purpose |
| :--- | :--- | :--- | :--- |
| `/auth/login` | POST | `Login.jsx` | JWT authentication + 2FA challenge response |
| `/auth/register` | POST | `Signup.jsx` | User account creation with Turnstile validation |
| `/auth/refresh` | POST | `api.js` (Interceptor) | Silent rotation of expired access tokens |
| `/auth/passkey/login-options` | GET | `Login.jsx` | FIDO2 authentication challenge |
| `/auth/passkey/login-verify` | POST | `Login.jsx` | Biometric signature verification |
| `/auth/2fa/verify` | POST | `Login.jsx` | TOTP 6-digit code verification |
| `/travel/routes/search` | POST | `Dashboard.jsx`, `LandingPage.jsx` | Multi-modal train, flight, bus, ferry search |
| `/travel/stations/autocomplete` | GET | `StationAutocomplete.jsx` | Railway station autocomplete |
| `/hotels/search` | GET | `HotelsView.jsx`, `DestinationPage.jsx` | Hotel stays by city, price, rating |
| `/hotels/reserve` | POST | `HotelBookingModal.jsx` | Hotel reservation creation |
| `/payment/create-order` | POST | `BookingModal.jsx` | Razorpay order creation for rail tickets |
| `/payment/create-transaction` | POST | `BookingModal.jsx` | Gateway payment verification & booking confirmation |
| `/developer/keys` | GET/POST | `DeveloperPortal.jsx` | B2B API key provisioning and management |
| `/developer/payment/initiate` | POST | `DeveloperPaymentModal.jsx` | Quota booster pack checkout |
| `/security/active-sessions` | GET | `ActiveSessions.jsx` | Active device and session listing |
| `/security/sos` | POST | `EmergencySOSModal.jsx` | Emergency alert dispatch with GPS coords |
| `/ai/chat` | POST | `AIChatbot.jsx`, `AIWorkspace.jsx` | Travel assistant conversations via FastAPI |
| `/ai/rag/query` | POST | `RAGSearchPage.jsx` | Retrieval-augmented travel knowledge queries |
| `/admin/*` | GET/POST/PUT/DELETE | `src/pages/admin/*` | Full admin management and analytics suite |

---

## 4. Codebase Audit & Cleanup Catalog

### Category 1: Safe to Delete (Verified Zero References)
These files have 0 static, dynamic, or route references:

1. `src/pages/admin/ActivityTimeline.jsx` — Duplicate of `src/components/admin/ActivityTimeline.jsx` (pageRef = 0).
2. `src/pages/admin/AdminLayout.jsx` — Duplicate of `src/components/admin/AdminLayout.jsx` (pageRef = 0).
3. `src/pages/admin/AdminNavbar.jsx` — Duplicate of `src/components/admin/AdminNavbar.jsx` (pageRef = 0).
4. `src/pages/admin/AdminSearch.jsx` — Duplicate of `src/components/admin/AdminSearch.jsx` (pageRef = 0).
5. `src/pages/admin/AdminSidebar.jsx` — Duplicate of `src/components/admin/AdminSidebar.jsx` (pageRef = 0).
6. `src/pages/admin/ChartCard.jsx` — Duplicate of `src/components/admin/ChartCard.jsx` (pageRef = 0).
7. `src/pages/admin/ConfirmDialog.jsx` — Duplicate of `src/components/admin/ConfirmDialog.jsx` (pageRef = 0).
8. `src/pages/admin/DataTable.jsx` — Duplicate of `src/components/admin/DataTable.jsx` (pageRef = 0).
9. `src/pages/admin/EmptyState.jsx` — Duplicate of `src/components/admin/EmptyState.jsx` (pageRef = 0).
10. `src/pages/admin/ErrorState.jsx` — Duplicate of `src/components/admin/ErrorState.jsx` (pageRef = 0).
11. `src/pages/admin/LoadingSkeleton.jsx` — Duplicate of `src/components/admin/LoadingSkeleton.jsx` (pageRef = 0).
12. `src/pages/admin/Modal.jsx` — Duplicate of `src/components/admin/Modal.jsx` (pageRef = 0).
13. `src/pages/admin/Pagination.jsx` — Duplicate of `src/components/admin/Pagination.jsx` (pageRef = 0).
14. `src/pages/admin/StatCard.jsx` — Duplicate of `src/components/admin/StatCard.jsx` (pageRef = 0).
15. `src/pages/admin/StatusBadge.jsx` — Duplicate of `src/components/admin/StatusBadge.jsx` (pageRef = 0).
16. `src/pages/admin/UserAvatar.jsx` — Duplicate of `src/components/admin/UserAvatar.jsx` (pageRef = 0).
17. `src/components/HotelsView.jsx` — 1-line re-export stub (`export { default } from '../pages/HotelsView'`). All imports reference `pages/HotelsView` directly.
18. `src/assets/react.svg` — Unused Vite default starter asset.
19. `src/assets/vite.svg` — Unused Vite default starter asset.
20. `src/App.css` — 1-line unimported CSS file.

### Category 2: Needs Further Verification / Integration
- `src/pages/RestaurantDetails.jsx` — Imported in `App.jsx:29` but route `<Route path="/food/restaurant/:id">` was never declared. **Action:** Connect to router under `/food/restaurant/:id` to preserve feature.
- `src/components/{CrowdPredictionCard,DelayPredictionCard,FareForecastCard,ModelHealthCard,RiskAnalysisCard,SeatAvailabilityCard}.jsx` — Individual prediction display cards built for AI predictions. **Action:** Re-integrate into `AIPredictionsPage.jsx` and `AIWorkspace.jsx` as modular cards.

### Category 3: Must Be Preserved (Protected Core Assets)
- All context providers (`AuthContext.jsx`, `ThemeContext.jsx`).
- All utility clients (`api.js`, `adminApi.js`, `hotelInvoiceGenerator.js`).
- All active route components (50+ pages listed above).
- Booking and payment verification logic (`BookingModal.jsx`, `DeveloperPaymentModal.jsx`, `HotelBookingModal.jsx`).
- Public assets in `public/` (brand logos, SVG markers, favicon, `_redirects`).

---

## 5. Dark Luxury Glass 3D Transformation Plan

### A. Design Tokens
```css
--color-bg-main: #0B100D;         /* Deep obsidian forest */
--color-bg-secondary: #111A14;    /* Rich night-forest base */
--color-bg-card: #17221A;         /* Translucent foliage card */
--color-bg-elevated: #1D2A21;     /* Elevated glass tier */
--color-primary-green: #315B40;   /* Deep emerald luxury green */
--color-sage: #91B39A;            /* Soft sage accent */
--color-muted-green: #6F8D76;     /* Subdued natural green */
--color-text-primary: #F1F3ED;    /* Crisp ivory white */
--color-text-secondary: #A6B1A7;  /* Muted silver-sage text */
--color-gold: #C4A77D;            /* Subtle champagne gold accent */
--color-border-glass: rgba(255, 255, 255, 0.10); /* Ultra-fine glass border */
--color-border-accent: rgba(196, 167, 125, 0.25); /* Subtle gold border */
```

### B. Typography
- **Headings:** `Manrope` (clean, contemporary luxury grotesk).
- **Body & Controls:** `Inter` (neutral, legible UI sans).
- **Editorial Callouts:** `DM Serif Display` (refined cinematic quotes, hero titles).

### C. 3D Cinematic Landscape Hero
- Built with React Three Fiber (`Canvas`), Three.js shaders, and Drei helpers.
- Features procedural volumetric mountain ridges, atmospheric forest fog (`fogExp2`), natural directional moonlight/sunlight, ambient particles, and floating translucent glass panels for the search bar.
- WebGL feature detection with elegant static photo-realistic fallback for low-end mobile devices and `prefers-reduced-motion`.
- Smooth page transitions and momentum scrolling driven by Lenis and Framer Motion.
