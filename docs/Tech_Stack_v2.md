# EduReach India — Tech Stack Decision Document
**Version:** 2.0 | **Date:** March 2026 | **For:** Solo founder + AI agent development  
**Rule:** Every technology in this document is a decision, not a suggestion. When instructing an AI agent to build anything, reference this document. Agents must not introduce technologies outside this stack without explicit approval and an update to this document.

---

## The Governing Principle

You are a solo non-coder building with AI agents. This means:

- **Fewer technologies, not more.** Every additional technology is a debugging surface you cannot navigate alone.
- **Managed services over self-hosted.** You cannot maintain infrastructure. Pay for managed.
- **TypeScript everywhere.** One language across frontend, backend, and scripts. Agents write better code when the whole stack shares a language.
- **Hosted platforms over self-built.** Auth, payments, video, file storage — use best-in-class APIs. Do not build what can be bought.
- **Postgres for everything relational.** One database type. Not MongoDB + Postgres + Redis for different things. Redis is cache only.

---

## Layer 1: Frontend (Student App, Parent App, Tutor App)

| Decision | Technology | Reason |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Full-stack in one repo; server components reduce API boilerplate; AI agents write excellent Next.js; Vercel deployment is one command. Next.js 16 is the current stable release (as of March 2026). |
| Language | **TypeScript** | Strict types catch agent errors before runtime; same language as backend |
| Styling | **Tailwind CSS v4** | Utility-first; v4 released January 2025 — CSS-first config, no tailwind.config.js, ~5x faster builds. **Breaking change from v3: configuration is now done in CSS via `@theme`, not in JS.** shadcn/ui is fully updated for v4. |
| Component library | **shadcn/ui** | Copy-paste components; no npm dependency to maintain; fully customisable; AI agents know it well; fully updated for Tailwind v4 + React 19 |
| State management | **Zustand** | Simpler than Redux; agents make fewer mistakes; sufficient for this app's complexity |
| Forms | **React Hook Form + Zod** | Type-safe form validation; Zod schemas shared with backend for consistency |
| Data fetching | **TanStack Query (React Query)** | Caching, background refetch, optimistic updates; reduces boilerplate |
| Charts (dashboards) | **Recharts** | Simple API; sufficient for mastery heatmaps, progress charts |
| Mobile | **Phase 1: Progressive Web App (PWA) · Phase 2: Flutter** | See decision note below. |

**Mobile Strategy — PWA Phase 1, Flutter Phase 2:**

Phase 1 ships as a PWA. A well-built PWA is installable on Android (95% of your target market), works offline, and shares 100% of the codebase with the web app. For Indian edtech users on Chrome for Android, an installed PWA is functionally indistinguishable from a native app.

Flutter is the right Phase 2 mobile strategy — not React Native. Flutter produces a genuine native Android and iOS app from a single Dart codebase. For EduReach specifically: camera access for AskAI photo uploads is smoother native than via browser, push notifications are more reliable, offline storage cannot be cleared by the browser, and a Play Store listing builds trust with Indian parents. Flutter also has strong India CDN and developer community presence.

**Why not Flutter in Phase 1:** Flutter is a separate codebase in Dart — a different language from your TypeScript stack. Every feature must be built twice (Next.js + Flutter). AI agents write good Flutter but the context-switching adds significant overhead for a solo founder. Build the web product, validate product-market fit, then commission the Flutter app for Phase 2 when you have revenue and possibly a technical hire.

**What to avoid: React Native.** React Native shares the JavaScript language with your stack but produces an inferior experience to Flutter on Android, has a more complex build toolchain, and AI agents produce less consistent React Native code than Flutter code. If you are going native in Phase 2, Flutter is the correct choice.

---

## Layer 2: Backend (API)

| Decision | Technology | Reason |
|---|---|---|
| Framework | **Next.js API Routes / Route Handlers** | Same repo as frontend; no separate server to deploy; agents write it in the same codebase |
| Language | **TypeScript** | Same as frontend |
| ORM | **Prisma** | Type-safe database queries; auto-generates TypeScript types from schema; agents write excellent Prisma; migrations are straightforward |
| Validation | **Zod** | Shared schemas between frontend forms and backend API validation |
| Background jobs | **Inngest** | Serverless background jobs; handles retries, delays, fan-out; no separate worker infrastructure to manage; TypeScript-native |
| File uploads | **Uploadthing** | Purpose-built for Next.js; handles large files (video uploads for demo classes); S3 under the hood |
| Email | **Resend** | Simple API; React email templates; excellent documentation |
| WhatsApp/SMS | **Twilio** (SMS) + **WATI or 360dialog** (WhatsApp Business API) | Twilio for OTP; WhatsApp Business for notifications |

**Note on architecture:** For Phase 1, the entire application — frontend, API, background jobs — lives in **one Next.js monorepo**. This is not a limitation; it is intentional. You cannot manage microservices as a solo non-technical founder. The Technical Architecture document describes a Phase 3 microservice decomposition. Do not attempt it in Phase 1. One repo, one deploy.

---

## Layer 3: Database

| Decision | Technology | Reason |
|---|---|---|
| Primary database | **PostgreSQL** via **Supabase** | Managed Postgres; built-in auth (use for admin only); real-time subscriptions; Row Level Security for data isolation; generous free tier for development; Mumbai region available |
| ORM | **Prisma** (see backend) | |
| Cache / real-time features | **Upstash Redis** | Serverless Redis; pay-per-request; no cluster to manage; used for mastery score hot cache, tutor availability state, rate limiting |
| Search | **Algolia** or **Typesense Cloud** | Tutor search with filters; full-text search on content; do not build search in Postgres — it will not scale. Typesense is cheaper; Algolia has better documentation. Start with Typesense. |
| File storage | **Cloudflare R2** | S3-compatible; zero egress fees (critical for video); cheaper than AWS S3 for India traffic; Cloudflare CDN included |

**Supabase vs raw AWS RDS:** Supabase gives you Postgres + auth + storage + real-time + dashboard in one managed platform. As a solo non-coder, the Supabase dashboard alone saves you from needing database admin tools. The trade-off (vendor lock-in on some features) is worth the operational simplicity at Phase 1 scale.

---

## Layer 4: Authentication

| Decision | Technology | Reason |
|---|---|---|
| Auth provider | **Clerk** | Best-in-class DX; handles OTP/phone auth (India primary); multi-role support (student/parent/tutor/admin); organisations for multi-child families; React components included; agents write Clerk integration quickly |
| Phone OTP | Built into Clerk | Clerk handles Indian phone number OTP via SMS |
| Parental consent flow | Custom + Clerk | Clerk handles the auth; custom Prisma tables handle consent records (DPDP Act compliance) |

**Why not Supabase Auth for everything:** Supabase Auth is sufficient for simple apps. For EduReach's multi-role model (student linked to parent, tutor with onboarding states, admin with sub-roles), Clerk's organisation and role management is meaningfully better and saves weeks of custom auth logic.

---

## Layer 5: AI / ML

| Decision | Technology | Reason |
|---|---|---|
| LLM for AskAI | **Anthropic Claude API** (claude-sonnet-4-6) | Best reasoning on board-exam-style problems; strong at step-by-step explanations; controllable via system prompt |
| LLM orchestration | **Vercel AI SDK** | TypeScript-native; streaming support; works in Next.js API routes without extra infrastructure; unified API across providers |
| Symbolic solver (math verification) | **Sympy via Python microservice** | SymPy is Python-only; deploy as a separate lightweight FastAPI microservice on Railway or Render; Next.js calls it via HTTP |
| WolframAlpha API | **WolframAlpha Short Answers API** | For complex queries SymPy cannot handle; pay-per-call |
| OCR (handwritten questions) | **Google Cloud Vision API** | Best handwriting OCR available; pay-per-call; no infrastructure |
| Image safety scanning | **Google Cloud Vision Safe Search** | CSAM and explicit content detection on AskAI photo uploads; mandatory before any image reaches the LLM |
| Vector embeddings (Phase 2+) | **OpenAI text-embedding-3-small** | For semantic tutor-student concept matching when you have enough data; not needed Phase 1 |

**The SymPy microservice:** This is the one exception to the "everything in Next.js" rule. SymPy requires Python. Deploy it as a single-file FastAPI app on Railway (free tier is sufficient for Phase 1). Your Next.js backend calls it via a single HTTP endpoint: `POST /verify-math { expression, expected_answer }`. Agents can build this entire microservice in one session.

---

## Layer 6: Virtual Classroom

| Decision | Technology | Reason |
|---|---|---|
| Video calling | **100ms.live** | India CDN presence; WebRTC-based; React SDK available; whiteboard add-on; session recording built-in; simpler pricing than Agora for Phase 1 |
| Recording storage | Automatic → **Cloudflare R2** via 100ms webhook | 100ms can push recordings to your R2 bucket automatically |
| Whiteboard | **100ms Whiteboard** (built-in) or **Excalidraw embed** | 100ms whiteboard is simpler; Excalidraw is open source and more feature-rich; start with 100ms built-in |

---

## Layer 7: Payments

| Decision | Technology | Reason |
|---|---|---|
| Payment gateway | **Razorpay** | India-first; supports UPI, cards, net banking, wallets; Route product for marketplace payouts; subscription billing; GST invoice generation |
| Marketplace payouts | **Razorpay Route** | Nodal account model; no separate escrow licence required; weekly batch payouts to tutors |
| Subscription management | **Razorpay Subscriptions** | Auto-renew; mandate-based; handles failed payment retries |

---

## Layer 8: Deployment & Infrastructure

| Decision | Technology | Reason |
|---|---|---|
| Frontend + API hosting | **Vercel** | Zero-config Next.js deployment; preview deployments on every branch; global CDN; environment variable management; free tier generous |
| SymPy microservice | **Railway** | One-click Python deployment; free tier; auto-deploys from GitHub |
| Redis | **Upstash** (serverless) | No cluster; per-request pricing; works with Vercel edge |
| Database | **Supabase** (see Layer 3) | |
| File storage + CDN | **Cloudflare R2 + Cloudflare CDN** | |
| Domain + DNS | **Cloudflare** | Free DNS; free DDoS protection; proxy for all traffic |
| Email | **Resend** (see Layer 2) | |
| Error monitoring | **Sentry** | Captures errors in production; free tier sufficient for Phase 1; agents can add Sentry to any Next.js app in 5 minutes |
| Analytics | **PostHog** | Product analytics + session recording + feature flags; self-hostable; free tier; replaces Mixpanel/Amplitude; agents write PostHog event tracking quickly |
| Uptime monitoring | **Better Uptime** or **UptimeRobot** | Free; alerts you if the platform goes down |

**Why not AWS directly:** AWS requires DevOps knowledge to configure correctly. A misconfigured security group or IAM role is a security incident. Vercel + Supabase + Upstash + Cloudflare R2 gives you the equivalent of AWS infrastructure with zero server management. You can migrate to AWS in Phase 3 if you hire an engineering team.

---

## Layer 9: Communication & Notifications

| Decision | Technology | Reason |
|---|---|---|
| Push notifications | **Firebase Cloud Messaging (FCM)** | Free; works for PWA (web push) + future native apps |
| WhatsApp | **WATI** | WhatsApp Business API wrapper; India-focused; template message management; no-code UI for ops team; connects to your phone number |
| SMS (OTP) | **Twilio Verify** | Dedicated OTP product; handles delivery, expiry, retry; 10 free verifications in dev |
| In-app notifications | Custom (Supabase real-time) | Real-time channel in Supabase; no extra service needed |

---

## Layer 10: Internal Operations Tooling

| Decision | Technology | Reason |
|---|---|---|
| Admin dashboard | **Retool** (Phase 1) | No-code internal tools builder; connects to your Postgres/Supabase; build tutor review, dispute management, safety dashboard without code; free tier available |
| Tutor Academy LMS | **Teachable** or **TalentLMS** (Phase 1) | Do not build an LMS from scratch; buy one; connect via API or embed; build custom LMS only in Phase 2 when you know what you actually need |
| Customer support | **Freshdesk** | Ticketing; email/WhatsApp channel; INR 3–8L/year; free tier for first agents |
| Document signing (Child Safety Policy) | **Digilocker** or **DocuSign** | Tutors sign Child Safety Policy digitally; stored with timestamp |

---

## Technology Decisions — What NOT to Use

| Avoid | Use Instead | Reason |
|---|---|---|
| AWS directly (EC2, RDS, ECS) | Vercel + Supabase | Cannot manage without DevOps knowledge |
| MongoDB | PostgreSQL via Supabase | Postgres handles everything; avoid schema flexibility that makes AI-generated code inconsistent |
| Redux | Zustand | Redux is over-engineered for this app; agents write poor Redux |
| GraphQL | REST (Next.js route handlers) | GraphQL adds complexity without benefit at Phase 1 scale; agents generate inconsistent GraphQL schemas |
| Docker (locally) | GitHub Codespaces or local Node.js | Docker adds environment management overhead you cannot debug |
| React Native | PWA (Phase 1) → Flutter (Phase 2) | React Native is worse than Flutter on Android; produces inconsistent results with AI agents; do not use at any phase |
| Custom video infrastructure | 100ms.live | Real-time video at scale is a 10-engineer problem; use an API |
| Self-hosted LLM | Anthropic API | Model hosting requires GPU servers and MLOps; use API until Phase 3 revenue justifies it |
| Microservices (Phase 1) | Monorepo Next.js | Distributed systems require senior engineers to debug; do not attempt until Phase 3 |

---

## Development Environment

| Tool | Purpose |
|---|---|
| **Cursor** | Primary AI coding agent; best for building features in Next.js; use with all context files loaded |
| **Claude** (claude.ai or API) | Architecture decisions, PRD interpretation, planning, debugging logic |
| **GitHub** | Version control; every change committed; Vercel deploys from GitHub automatically |
| **GitHub Codespaces** | If local setup is too complex; full dev environment in the browser |
| **Postman** | Testing API endpoints without writing test code |
| **TablePlus** | GUI for viewing your Supabase Postgres database; free tier |
| **Supabase Dashboard** | Database, auth, and storage management in the browser |

---

## Package Versions — Current Stable (March 2026)

These are the current stable versions as of March 2026. **Do not pin these in your prompts.** Instead, scaffold the project first (`npx create-next-app@latest`), then update this table to match what was actually installed in your `package.json`. The project's lock file is the authoritative version source — this table just reflects the current landscape so you know what to expect.

| Package | Current Stable | Notes |
|---|---|---|
| `next` | **16.x** | Major jump from 14. Caching is now opt-in (`"use cache"` directive). Routing overhaul. Uses React 19.2. Run `npx @next/codemod@canary upgrade latest` to upgrade existing projects. |
| `react` | **19.x** | React 19 is current. Removes `forwardRef` (now implicit). `use()` hook, improved Server Actions. shadcn/ui is updated for React 19. |
| `typescript` | **5.x** | No major breaking changes from 5.x. Stable. |
| `prisma` | **6.x** | Prisma 6 released late 2024. Some schema syntax changes from v5. Agents should use Prisma 6 docs. |
| `@clerk/nextjs` | **6.x** | Significant API changes from v5. Use Clerk's own migration guide. |
| `tailwindcss` | **4.x** | ⚠️ **Breaking change.** v4 removes `tailwind.config.js` entirely. Configuration is now CSS-only via `@theme {}` in your globals.css. No more `content` array. `tailwindcss-animate` is deprecated — use `tw-animate-css` instead. If an agent writes v3 config syntax, correct it. |
| `zod` | **3.x** | Stable. No breaking changes expected. |
| `zustand` | **5.x** | Zustand 5 released 2024. Some API changes from v4 — `create` import path changed. |
| `@tanstack/react-query` | **5.x** | Stable at v5. No major changes expected imminently. |
| `react-hook-form` | **7.x** | Stable. |
| `inngest` | **3.x** | Stable. |

**The right instruction to give agents regarding versions:**

> "Use the package versions installed in this project's package.json. Do not upgrade or downgrade any package without being asked. If you are unsure of the API for a specific version, check the official docs before writing code."

**The two versions that need special agent attention:**

`tailwindcss` v4 has the most breaking changes — agents trained primarily on v3 will write `tailwind.config.js` and `@tailwind base/components/utilities` directives that are wrong for v4. Always tell agents explicitly: *"We are using Tailwind CSS v4. Configuration is in globals.css via `@import "tailwindcss"` and `@theme {}`. There is no tailwind.config.js."*

`next` v16 has a new caching model — implicit caching from v14 App Router is gone. All caching is now opt-in. Agents writing v14-style `fetch` caching headers may produce code that doesn't cache as expected. Tell agents: *"We are using Next.js 16. Caching is opt-in via the `'use cache'` directive. Do not use v14-style fetch cache options."*

---

*EduReach India — Tech Stack v2.0 | March 2026*  
*v2.0 changes: Next.js upgraded 14→16; Tailwind upgraded 3→4 (breaking change noted); React 18→19; Prisma 5→6; Clerk 5→6; Zustand 4→5. Mobile strategy updated: Flutter added as Phase 2 native app; React Native removed from consideration. Package version section replaced with current stable reference table and agent guidance.*  
*This document must be updated whenever a new technology is introduced. AI agents must reference this document at the start of every build session.*
