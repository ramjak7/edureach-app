# CLAUDE.md — EduReach India
## Persistent Context File for AI Coding Agents

**Read this file completely before writing any code.**  
This file is the single source of truth for how this project is built. It exists so that every AI agent session starts with full context rather than starting from zero.

---

## What This Project Is

**EduReach India** is an AI-powered K-12 tutoring and coaching platform for Indian students (CBSE, ICSE, Maharashtra State Board). It serves students (Classes 6–12), their parents, and marketplace tutors.

**The four apps:**
- **Student App** — learning path, AskAI doubt resolution, tutor booking, practice
- **Parent App** — child progress monitoring, session oversight, payments
- **Tutor App** — session management, earnings, student intelligence card
- **Admin Console** — internal operations, safety review, content management

**The product vision:** Board-exam-first, parent-trusted, science-backed adaptive learning with a two-sided tutoring marketplace. NOT a content platform. NOT exam coaching. The core IP is the Mastery Score engine — every feature serves that.

---

## Repository Structure

```
edureach-app/
├── app/                          # Next.js App Router
│   ├── (student)/                # Student app routes (route group)
│   ├── (parent)/                 # Parent app routes
│   ├── (tutor)/                  # Tutor app routes
│   ├── (admin)/                  # Admin console routes
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # Clerk webhooks
│   │   ├── mastery/              # Mastery score computation
│   │   ├── marketplace/          # Tutor search, booking flows
│   │   ├── askai/                # AskAI query handling
│   │   ├── sessions/             # Virtual classroom orchestration
│   │   ├── payments/             # Razorpay webhooks
│   │   └── safety/               # Moderation webhooks
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui components (do not modify)
│   ├── student/                  # Student-specific components
│   ├── parent/                   # Parent-specific components
│   ├── tutor/                    # Tutor-specific components
│   └── shared/                   # Cross-app components
├── lib/
│   ├── db.ts                     # Prisma client (singleton)
│   ├── redis.ts                  # Upstash Redis client
│   ├── clerk.ts                  # Clerk server helpers
│   ├── razorpay.ts               # Razorpay client
│   ├── askai.ts                  # Anthropic Claude API client
│   ├── mastery.ts                # Mastery score computation engine
│   ├── tps.ts                    # Tutor Performance Score computation
│   └── validators/               # Zod schemas (shared frontend + backend)
├── prisma/
│   ├── schema.prisma             # Single source of truth for database schema
│   └── migrations/               # Never edit manually; use `prisma migrate dev`
├── inngest/
│   └── functions/               # Background jobs (TPS recompute, spaced repetition, payouts)
├── public/
└── types/                        # TypeScript type definitions
```

---

## Tech Stack (Non-Negotiable)

Full stack with versions, reasoning, and agent guidance: **`EduReach_Tech_Stack_v2.md`** — that document is the single source of truth for all technology decisions.

**Do not introduce any technology not listed here without explicit instruction.**  
If a task seems to require a new technology, stop and ask — do not add it unilaterally.

---

## Database Schema Overview

The full schema is in `prisma/schema.prisma`. Key entities:

```
users          → base user (student/parent/tutor/admin)
students       → extends users; has board, class, subscription_tier
parents        → extends users; linked to students
tutors         → extends users; has TPS, commission_rate, onboarding_status
concepts       → atomic learning unit (board + subject + chapter + concept)
mastery_scores → student × concept score (0–100); updated in real-time
practice_attempts → every question answered by every student
bookings       → student + tutor + time slot
sessions       → completed booking with verification data
reviews        → student/parent rating of a tutor session
payments       → Razorpay payment records; includes TDS and commission
safety_flags   → any flagged content/user/session
disputes       → filed dispute on a session
```

For full schema with all fields, see: `prisma/schema.prisma`

---

## Core Business Logic — Read Before Touching These Files

### Mastery Score (`lib/mastery.ts`)
```
M = 0.35×Accuracy + 0.15×TimeEfficiency + 0.25×DifficultyProgression 
  + 0.15×SpacedRepetitionScore + 0.10×TutorFeedback
```
- Computed after every `practice_attempt` event
- Stored in `mastery_scores` table (one row per student×concept, updated in place)
- Also cached in Redis: key `mastery:{student_id}:{concept_id}` TTL 1 hour
- Mastery status thresholds: 0–20 Not Started, 21–45 Exploring, 46–65 Practiced, 66–84 Mastered, 85–100 Retained
- **Never recompute from scratch on every read** — read from Redis/DB; only recompute on new practice_attempt

### Tutor Performance Score (`lib/tps.ts`)
```
TPS = 0.30×StudentRating + 0.25×RetentionRate + 0.20×SessionCompletion 
    + 0.15×StudentLearningImprovement + 0.10×ComplaintRatio(inverted)
```
- Recomputed weekly via Inngest scheduled function (every Monday 2 AM IST)
- NOT recomputed on every session — that would be wrong and expensive
- TPS tier determines commission rate: Platinum 13%, Gold 15%, Silver 18%, Bronze 20%
- Commission holiday: first 5 sessions → 0% commission (tracked via `new_tutor_sessions_remaining`)

### AskAI Pipeline (`app/api/askai/route.ts`)
1. Input classification (check for prompt injection patterns)
2. Image safety scan if photo (Google Vision Safe Search)
3. Call Claude API with board-specific system prompt
4. If math: call SymPy microservice to verify answer
5. Confidence scoring: HIGH / MEDIUM / LOW / ESCALATED
6. If LOW or ESCALATED: route to human tutor queue (do not serve to student)
7. Store in `askai_queries` table

**Never bypass the safety check pipeline.** Never serve a LOW confidence answer without a disclaimer.

### Session Verification
A session is VERIFIED_COMPLETE only when ALL conditions are met:
- Classroom live ≥ 85% of booked duration
- Both parties present (video/audio) ≥ 75% of session
- Recording file exists, duration ≥ 80% of booked time
- No pre-session cancellation filed

This is checked via 100ms session analytics webhook. Do not mark sessions complete without this check.

### Payment Flow
1. Booking created → Razorpay order created → payment authorized (held in nodal account)
2. Session occurs → session verification runs
3. 2-hour dispute window after session end
4. If no dispute: Inngest job releases payment to tutor payout batch
5. Weekly Monday batch: all cleared sessions → Razorpay Route transfer to tutor bank account
6. TDS deducted if cumulative FY earnings > INR 30,000 (tracked in `tutors.cumulative_financial_year_earnings`)

---

## Critical Rules — Never Violate

### Child Safety (Non-Negotiable)
- Every session is auto-recorded. Recording cannot be disabled by tutor or student.
- All in-app messages are scanned for contact information (phone, email, social, UPI).
- Parent must approve tutor for students under 14.
- Photo uploads go through Google Vision Safe Search before any processing.
- Safety flags are retained for 7 years minimum.
- Any Level 3 safety event (CSAM) triggers immediate account suspension — no manual review needed first.

### Data Privacy (DPDP Act 2023)
- Never store student full name in tutor-facing surfaces — use `display_name` (first name only).
- Parental consent must be recorded in `students.consent_given_at` before any student data is processed.
- Right-to-erasure requests anonymise PII fields — they do not delete financial records (retained 8 years).
- Feature data used for ML requires explicit consent — captured at onboarding.

### Payment Integrity
- Never release payment to tutor before session verification is complete.
- Never allow commission rate to be set by tutor — it is derived from TPS tier only.
- Never skip TDS computation for tutors above the INR 30,000 annual threshold.

### Anti-Gaming
- Student ratings cannot be submitted within 2 hours of session end.
- Tutors cannot see which student gave which rating until 7 days after submission.
- The anti-gaming detection job runs nightly — never disable it.

---

## Environment Variables

All environment variables are in `.env.local` (development) and Vercel dashboard (production). Never hardcode secrets. The required variables are:

```bash
# Database
DATABASE_URL=                    # Supabase PostgreSQL connection string
DIRECT_URL=                      # Supabase direct connection (for migrations)

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Cache
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI
ANTHROPIC_API_KEY=
GOOGLE_CLOUD_VISION_API_KEY=     # For OCR + Safe Search
WOLFRAM_ALPHA_APP_ID=            # For complex math verification

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Video
HMS_ACCESS_KEY=                  # 100ms
HMS_SECRET=
HMS_TEMPLATE_ID=

# Storage
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_ENDPOINT=

# Background jobs
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Communications
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
RESEND_API_KEY=
WATI_API_KEY=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=

# Internal
SYMPY_SERVICE_URL=               # Railway-deployed SymPy microservice
SYMPY_SERVICE_SECRET=            # Shared secret for internal service auth
```

---

## How to Run Locally

```bash
# Install dependencies
npm install

# Set up database (first time)
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev

# Run Inngest dev server (for background jobs) — separate terminal
npx inngest-cli@latest dev

# Database studio (view data)
npx prisma studio
```

---

## Coding Conventions

**File naming:** kebab-case for files, PascalCase for components.  
**API routes:** Always validate input with Zod before processing.  
**Error handling:** All API routes return `{ success: boolean, data?: T, error?: string }`.  
**Database queries:** Always use Prisma — never raw SQL unless explicitly required.  
**Sensitive operations:** Always check authentication AND authorisation (not just "is logged in" but "is this user allowed to do this specific thing to this specific resource").  
**Comments:** Write comments for business logic, not for obvious code. If you're implementing something from the PRD, reference the section: `// PRD Section 11F.1 — Credential fraud detection`.

**TypeScript:** Strict mode. No `any` types. If you don't know the type, define an interface.

---

## Key Reference Documents

When you need context beyond this file, reference:

| Need | Document |
|---|---|
| Product requirements | `PRD_v8.0.md` |
| User experience flows | `User_Journey_Maps_v2.md` |
| Marketplace transaction flows | `Marketplace_Flow_Architecture_v2.md` |
| What to build when | `Feature_Roadmap_v1.md` |
| Database schema reference | `Technical_Architecture_v1.md` Part A |
| Infrastructure architecture | `Technical_Architecture_v1.md` Part B |
| Technology decisions | `Tech_Stack_v2.md` |
| Sprint-by-sprint build plan | `Execution_Roadmap_v1.md` |

---

## Current Sprint

**Update this section at the start of every session.**

```
Sprint: Sprint 5 — Virtual Classroom (complete)
Goal: 100ms-powered video classroom for confirmed bookings

Last completed:
- Sprint 1: Student onboarding (registration, 20-question diagnostic, mastery heatmap)
- Sprint 2: AskAI core (Claude API, 5-question free limit, photo OCR stub)
- Sprint 3: Tutor profiles & discovery (/student/tutors, filters, individual profile page)
- Sprint 4: Full booking flow — slot picker, subject selector, Razorpay create-order/verify/webhook,
            /student/bookings, /tutor/bookings, BookingsManager (Accept/Decline), subject badge in tutor view
- Sprint 5: Virtual classroom — 100ms room creation via Inngest at T-5min, token API, shared Classroom
            component (hms-video-store), /student/classroom/[sessionId], /tutor/classroom/[sessionId],
            "Join Session" button on both booking pages when hmsRoomId is set

Sprint 5 notes (100ms):
  SDK choice: @100mslive/server-sdk (server-side) + @100mslive/hms-video-store (client, vanilla JS).
  roomkit-react was tried and rejected — incompatible with React 19.
  Role mapping: tutor → "host", student → "guest" (must match 100ms dashboard template role names exactly).
  Required env vars: HMS_ACCESS_KEY + HMS_SECRET (from 100ms dashboard → Developer → Keys).
  Inngest fires "booking/confirmed" event on tutor accept → createClassroom function sleeps until T-5min,
  then creates 100ms room and upserts Session record with hmsRoomId.
  Required Inngest env vars in Vercel: INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY.
  SessionVerificationStatus enum has "pending" as initial state (added via migration).

  ⚠️  VIDEO NOT YET INTEGRATED (placeholder active):
  components/shared/classroom.tsx is currently a placeholder page (dark screen with session info
  + "End Session" button). The full HMSReactiveStore implementation is written and ready but
  commented out / replaced pending 100ms dashboard setup. To activate real video:
    1. Create a room template in 100ms dashboard with roles "host" (tutor) and "guest" (student)
    2. Add HMS_ACCESS_KEY + HMS_SECRET to .env.local and Vercel env vars
    3. Restore the HMSReactiveStore implementation in components/shared/classroom.tsx
       (full code is in git history — Sprint 5 commit before "placeholder" commit)
  All server-side infrastructure (lib/hms.ts, /api/sessions/create-room, /api/sessions/[id]/token,
  inngest create-classroom function) is fully built and untouched.

Auth deviation (important):
  Phone/OTP sign-in was deferred during Sprint 1 due to Clerk phone config issues (Indian carrier
  SMS setup not completed). Clerk is currently configured with EMAIL as the primary identifier.
  All auth (sign-up, sign-in) works via email + password. Phone/OTP will be restored in a later
  sprint when Clerk phone settings and SMS delivery are configured properly.
  → The PRD and Execution Roadmap still describe phone OTP as the target — that is still the plan.
  → Do NOT build any feature assuming email is the permanent auth method.

Dev tooling added (Sprint 4):
  /dev page + /api/dev/make-tutor + /api/dev/make-student
  → Promote any signed-in Clerk account to tutor or student.
  → Guarded by env var: ENABLE_DEV_TOOLS=true (server) + NEXT_PUBLIC_ENABLE_DEV_TOOLS=true (client page).
  → Works on both localhost AND Vercel when those vars are set.
  → Remove these env vars (or set to false) before real user launch.
  → /dev page shows a safe message when the var is not set — no security risk if accidentally visited.

Deployment:
  Vercel production URL: https://edureach-app.vercel.app
  → App is deployed on Vercel (connected to GitHub main branch, auto-deploys on push).
  → All env vars from .env.local must also be set in Vercel → Settings → Environment Variables.
  → Clerk: add edureach-app.vercel.app to allowed origins/redirect URLs in Clerk dashboard → Domains.
  → Clerk webhook: set endpoint to https://edureach-app.vercel.app/api/auth/webhook in Clerk dashboard.
  → Clerk email verification: use OTP code (not magic link) — magic links are device-bound and break
    cross-device testing (e.g. sign in on PC, click link on phone → "invalid for this device" error).
  → /api/dev/* routes return 403 on Vercel when ENABLE_DEV_TOOLS is not set — no security risk.

Clerk session token customization (PERMANENT — do not remove):
  In Clerk dashboard → Configure → Sessions → Customize session token, the following is set:
    { "metadata": "{{user.public_metadata}}" }
  This embeds publicMetadata (including the user's role) into every JWT Clerk issues.
  The middleware reads role from sessionClaims.metadata.role for ALL role-based routing.
  Without this, sessionClaims.metadata is always undefined and every user defaults to "student",
  breaking tutor/parent/admin routing entirely. This must also be set on the production Clerk
  instance when created.

In progress: —
Blocked by: —
```

### Setup Week file map (for next agent session)
| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Complete DB schema — 19 models, all indexes |
| `middleware.ts` | Clerk auth + role-based route guard |
| `app/api/auth/webhook/route.ts` | Syncs Clerk user.created/updated/deleted → DB |
| `lib/auth-sync.ts` | `syncClerkUser()` / `deactivateClerkUser()` |
| `lib/mastery.ts` | Mastery formula + Redis/DB read-write helpers |
| `lib/tps.ts` | TPS formula + tier/commission helpers |
| `lib/db.ts` | Prisma singleton |
| `lib/redis.ts` | Upstash Redis client |
| `lib/clerk.ts` | `getAuthUser()` / `getAuthUserId()` server helpers |
| `inngest/client.ts` + `app/api/inngest/route.ts` | Inngest client + serve handler |
| `types/index.ts` | `UserRole`, `Board`, `SubscriptionTier`, `ApiResponse<T>` |
| `.env.local` | All 23 env var keys (values empty — fill before running) |

---

*This file is read by AI agents at the start of every session. Keep it accurate. Update it when the stack changes, when conventions change, or when a sprint completes.*
