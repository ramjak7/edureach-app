# EduReach India — Execution Roadmap
### Solo Founder + AI Agent Build Plan
**Version:** 1.0 | **Date:** March 2026  
**Audience:** You (the founder) + your AI coding agents  
**Purpose:** Sprint-by-sprint build sequence from zero to live product. This is NOT the product feature roadmap (that's in Artefact 3). This answers: what do you actually do on each day/week to go from nothing to a working platform?

---

## The Governing Principle

**Build the thinnest working vertical slice first, then expand.**

This means: get one student through the full journey — sign up → diagnostic → AskAI → tutor booking → session → payment — before building anything else. That one working path proves the architecture. Everything else is expansion on a proven base.

**Every sprint has a Definition of Done.** A sprint is not done when the code is written. It is done when the feature works end-to-end in a browser, the data is correctly in the database, and you have manually tested it yourself.

---

## Before You Write Any Code — Setup Week (Days 1–7)

This week is entirely setup and configuration. No features. No UI. Just getting the environment ready so that every future AI agent session starts from a working base.

### Day 1 — Accounts and Services
Create accounts (free tiers) in this order:

| Service | What to do | Cost |
|---|---|---|
| **GitHub** | Create account; create private repo `edureach` | Free |
| **Vercel** | Sign up with GitHub; connect the `edureach` repo | Free |
| **Supabase** | Create project; choose `ap-south-1` (Mumbai) region; save connection strings | Free |
| **Upstash** | Create Redis database; save REST URL and token | Free |
| **Clerk** | Create application; enable Phone Number as primary identifier; save API keys | Free |
| **Cloudflare** | Add your domain (or buy one); create R2 bucket named `edureach-media` | Free / ~$10/yr |
| **Sentry** | Create Next.js project; save DSN | Free |
| **PostHog** | Create project; save API key | Free |

### Day 2 — Project Scaffold
Open Cursor. Give it this exact prompt:

> "Create a new Next.js 16 project with App Router, TypeScript in strict mode, Tailwind CSS v4, and shadcn/ui. The project is called 'edureach-app'. Set up the folder structure exactly as described in CLAUDE.md. Install these packages: prisma, @prisma/client, @clerk/nextjs, @upstash/redis, zod, zustand, @tanstack/react-query, react-hook-form, @hookform/resolvers, inngest, recharts, lucide-react. Create the .env.local file with all environment variable keys from CLAUDE.md (empty values). Do not write any features yet — just the scaffold."

After it finishes: paste all your API keys from Day 1 into `.env.local`.

### Day 3 — Database Schema
Give Cursor this prompt (with `CLAUDE.md` and `Technical_Architecture_v1.md` attached):

> "Using the data model in Technical_Architecture_v1.md Part A and the conventions in CLAUDE.md, create the complete Prisma schema in prisma/schema.prisma. Include all tables: users, students, parents, tutors, concepts, content_objects, mastery_scores, practice_attempts, askai_queries, bookings, tutor_availability_slots, sessions, reviews, payments, safety_flags, disputes. Add all indexes specified in Section A.7 of the Technical Architecture. Then run prisma migrate dev to create the database."

### Day 4 — Auth Setup
> "Set up Clerk authentication for a Next.js 16 App Router project. There are four user roles: student, parent, tutor, admin. Phone number (OTP) is the primary sign-in method. After a user signs in for the first time, check if they exist in the Prisma `users` table — if not, create them. Create a Clerk webhook handler at `/api/auth/webhook` that syncs user creation/deletion to the database. Create middleware.ts that protects all routes except `/`, `/sign-in`, `/sign-up`."

### Day 5 — Verify Everything Works
Manually test:
- [ ] Can you sign up with a phone number?
- [ ] Does the user appear in your Supabase database?
- [ ] Does Vercel deploy successfully when you push to GitHub?
- [ ] Does Sentry receive a test error?

If anything doesn't work, fix it before moving forward. A broken foundation makes every future sprint harder.

### Days 6–7 — Rest / Read
Read through the PRD Sections 1–6 and the User Journey Maps. Understand Aryan's journey deeply. You are about to build it.

---

## Phase 0: Walking Skeleton (Weeks 2–5)

**Goal:** One student can complete the full core journey end-to-end. No polish. No edge cases. Just proof that the architecture works.

**What "done" means:** A test student account can: register → complete diagnostic → see mastery map → ask AskAI a question → see a tutor profile → (mock) book a session.

---

### Sprint 1 — Student Onboarding (Week 2)

**What you're building:** Registration flow → diagnostic test → mastery map generation.

**Prompt sequence for Cursor:**

**Prompt 1 (Registration):**
> "Build the student registration flow. After phone OTP via Clerk, the student sees a form asking: name (first name only), board (CBSE/ICSE dropdown), class (6–12 dropdown), target score (optional). On submit, create a record in the `students` table. Store consent timestamp in `students.consent_given_at`. Redirect to `/student/diagnostic` after completion. Use shadcn/ui Card, Input, Select, Button components. Tailwind for layout."

**Prompt 2 (Diagnostic):**
> "Build a 20-question diagnostic test. Questions are fetched from the `content_objects` table where `type = 'practice_question'` and `board` matches the student's board. Show 4 questions per concept, 5 concepts. Show one question at a time with a Next button. Record each answer in `practice_attempts` table with `session_context = 'diagnostic'`. When all 20 questions are answered, call the mastery computation function in `lib/mastery.ts` for each attempted concept. Redirect to `/student/dashboard` when done."

**Prompt 3 (Mastery computation):**
> "In `lib/mastery.ts`, implement the mastery score formula: M = 0.35×Accuracy + 0.15×TimeEfficiency + 0.25×DifficultyProgression + 0.15×SpacedRepetitionScore + 0.10×TutorFeedback. For the diagnostic (first attempt), TimeEfficiency, DifficultyProgression, SpacedRepetition, and TutorFeedback all default to 0.5. Only Accuracy is computed from actual answers. Upsert into `mastery_scores` table. Cache result in Upstash Redis at key `mastery:{studentId}:{conceptId}` with 1 hour TTL."

**Prompt 4 (Mastery heatmap):**
> "Build the student dashboard at `/student/dashboard`. Show a mastery heatmap: a grid where each cell represents one concept the student has been assessed on. Cell colour: red (0–45), amber (46–65), green (66–100). Clicking a cell shows concept name and score. Fetch mastery scores from Redis first; fall back to database. Use Recharts or a custom Tailwind grid — whichever the agent recommends for a heatmap."

**Sprint 1 done when:** You can register a test account, complete the diagnostic, and see your mastery heatmap.

---

### Sprint 2 — AskAI Core (Week 3)

**What you're building:** The doubt-resolution feature. Student types or photos a question → gets a step-by-step answer.

**Prompt 1 (AskAI API route):**
> "Build the AskAI API route at `/api/askai`. It receives: `{ query: string, imageBase64?: string, studentId: string, board: string, classYear: number }`. Pipeline: (1) Check for prompt injection patterns (regex: 'ignore previous', 'you are now', 'system prompt', 'DAN', 'jailbreak') — if detected, return 400 with message 'I can only help with board exam questions'. (2) If imageBase64 present, call Google Vision Safe Search API — if adult/violent content detected, return 400. (3) Call Anthropic Claude API (claude-sonnet-4-6) with this system prompt: 'You are an expert Indian K-12 board exam tutor. You only answer questions related to CBSE, ICSE, and state board curricula for Classes 6–12. Explain step-by-step as a patient teacher would. Reference the specific board and class in your answer. If the question is not about board exam curriculum, say: I can only help with your board exam subjects.' (4) Store the query and response in `askai_queries` table. (5) Return response with `{ success: true, answer: string, confidence: 'HIGH' | 'MEDIUM' | 'LOW' }`."

**Prompt 2 (AskAI UI):**
> "Build the AskAI screen at `/student/askai`. It has: a text input field, a camera/upload button for photos, a Submit button, and a scrollable history of previous questions and answers in this session. Show a loading skeleton while the API responds (streaming not needed yet). Show the answer in a styled card with markdown rendering (use react-markdown). Add a free-tier limit counter: 'X of 5 questions used this week' (fetch from `askai_queries` count for this student in last 7 days). If limit reached, show upgrade prompt instead of text input."

**Prompt 3 (Photo OCR):**
> "Extend the AskAI API to handle photo inputs. When `imageBase64` is provided: (1) Run Google Vision Safe Search. (2) Run Google Vision TEXT_DETECTION to extract text from the image. (3) Combine extracted text with any typed query from the student. (4) Pass combined text to Claude API as the query."

**Sprint 2 done when:** You can type a CBSE Maths question, get a step-by-step answer, and see it stored in the database. The 5-question free limit works.

---

### Sprint 3 — Tutor Profiles & Discovery (Week 4)

**What you're building:** Tutor profile cards, search/filter, individual tutor profile page.

> "Build the tutor discovery screen at `/student/tutors`. It shows a list of tutor cards. Each card shows: display_name, tps_tier badge (Platinum/Gold/Silver/Bronze), subjects, hourly_rate_min–hourly_rate_max, short intro (first 100 chars of bio). Add filters: Subject, Board, Max hourly rate (slider), Available Now toggle. Fetch from the `tutors` table where `account_status = 'active'`. For now, skip the ranking algorithm — just order by `tps_score` descending. Build the individual tutor profile page at `/student/tutors/[tutorId]` showing: full profile, intro video (100ms or just a placeholder), all reviews, availability calendar placeholder, and a 'Book a Session' button."

**Sprint 3 done when:** You can browse tutors and view a profile.

---

### Sprint 4 — Booking Flow (Week 5)

**What you're building:** The complete booking flow — slot selection → payment → confirmation.

**Prompt 1 (Availability):**
> "Build a weekly availability calendar component. Tutors set their available slots (30-min increments, 6 AM–10 PM IST). Build the tutor availability management page at `/tutor/availability`. Store slots in `tutor_availability_slots` table. Build the student-facing slot picker on the tutor profile page — show available slots for the next 7 days, grey out booked ones."

**Prompt 2 (Booking + Payment):**
> "Build the booking flow. When student selects a slot and clicks 'Confirm Booking': (1) Create a `bookings` record with status PENDING. (2) Create a Razorpay order for the session fee. (3) Open Razorpay checkout (use Razorpay's React SDK). (4) On payment success callback: update booking to PAYMENT_HELD, update slot state to PENDING, send notification to tutor. (5) Tutor confirms within 24 hours → booking moves to CONFIRMED. Build the tutor confirmation screen at `/tutor/bookings` where tutor sees pending requests and taps Accept/Decline."

**Sprint 4 done when:** You can book a session with a test tutor account, pay via Razorpay test mode, and the tutor can accept.

*Razorpay Testing*
Razorpay's official test credentials:
Card Number	        Type	    Result
4012 8888 8888 1881	Visa Credit	✅ Success
5267 3181 8797 5449	Mastercard	✅ Success
5104 0600 0000 0008	Mastercard	✅ Success

UPI test: -In the Razorpay checkout, switch to UPI tab and enter:
success@razorpay → simulates successful payment
failure@razorpay → simulates failed payment

---

## Phase 1: Core Product (Weeks 6–18)

Now you have a working skeleton. Phase 1 builds everything needed for real students and real tutors.

---

### Sprint 5 — Virtual Classroom (Week 6–7)

> "Integrate 100ms.live for virtual classroom. When a booking moves to CONFIRMED and the session start time is within 5 minutes: auto-create a 100ms room using the 100ms API. Generate join tokens for both student and tutor. Send both parties a 'Join now' push notification. Build the classroom page at `/student/classroom/[sessionId]` and `/tutor/classroom/[sessionId]` embedding the 100ms React SDK. Enable: video, audio, screen share (tutor only), and whiteboard. Enable auto-recording — configure 100ms to push recording to Cloudflare R2 when session ends."

---

### Sprint 6 — Post-Session Flow (Week 7)

> "Build the post-session flow. When 100ms sends a session-ended webhook to `/api/sessions/webhook`: (1) Compute actual duration from join/leave timestamps. (2) Check session verification conditions (PRD Section 12A.2): classroom live ≥ 85%, both parties present ≥ 75%, recording exists. (3) Set `sessions.verification_status` accordingly. (4) Send post-session summary to student (in-app + WhatsApp if opted in). (5) Send post-session form to tutor at `/tutor/post-session/[sessionId]` — tutor logs: objective achieved (yes/partial/no), homework assigned (yes/no), notes. (6) Start 2-hour dispute window Inngest delay job."

**Implementation note (as-built deviation):**
The HMS webhook trigger described above is deferred until 100ms credentials are configured.
Sprint 6 was built with tutor-triggered completion instead:
- Tutor taps "Mark Session Complete" on the classroom placeholder page → redirected to post-session notes form
- `sessions.actualStartAt` and `sessions.actualEndAt` are NOT set by the placeholder (no HMS events)
- When real HMS video is restored (see Sprint 5 notes in CLAUDE.md), add `/api/sessions/webhook`
  to populate those two timestamps from HMS join/leave events — Sprint 6 logic is otherwise untouched

---

### Sprint 7 — Parent App (Week 8–9)

> "Build the parent app at `/parent`. Key screens: (1) Dashboard — child's mastery heatmap (read-only), Exam Readiness Score, recent session summary. (2) Session history — list of past sessions with tutor name, subject, duration, rating. (3) Recording access — tap any session to play recording (fetch signed URL from Cloudflare R2). (4) Subscription management — current plan, upgrade/cancel button. (5) Safety controls — approve/deny a tutor for their child (for students under 14). The parent dashboard must use plain language — no jargon. 'Aryan has mastered 4 of 14 Algebra topics. His weakest area is Quadratic Equations (score: 31/100).'"

---

### Sprint 8 — Tutor Onboarding Pipeline (Week 9–10)

> "Build the tutor application and onboarding flow. (1) Tutor application form at `/apply`: name, phone, subjects, boards, classes, hourly rate, Aadhaar number, degree certificate upload. Store in `tutors` table with `account_status = 'applicant'`. (2) Subject knowledge test: 20 questions fetched by subject from `content_objects`, 70% pass required, results stored. (3) Demo class submission: tutor uploads a recorded demo class video (max 30 min) to Cloudflare R2. (4) Tutor Academy: embed TalentLMS (or build a 5-screen flow) with module completion tracking. (5) Admin review console at `/admin/tutors` showing all applicants in pipeline with approve/reject actions."

---

### Sprint 9 — Student Intelligence Card (Week 10)

> "Build the Student Intelligence Card. This is auto-generated before each session (T-30 minutes via Inngest scheduled job). For a given student, compile: (1) Mastery heatmap for the session's subject (all concepts, current scores). (2) Top 3 error types from last 30 days of practice attempts (conceptual/procedural/careless). (3) Last 5 AskAI questions in this subject. (4) Last session summary if repeat student. Output as a PDF-like view at `/tutor/session-prep/[bookingId]`. Send the tutor a push notification 30 minutes before session: 'Your session with [student first name] starts in 30 minutes. Their preparation card is ready.' The card is the tutor's primary prep tool."

---

### Sprint 10 — Dispute Resolution (Week 11)

> "Build the dispute workflow. (1) Student/parent can tap 'Report an issue' on any session within 2 hours of session end. Form: select reason (quality/duration/technical/conduct), optional description (max 500 chars). Creates `disputes` record. (2) For technical/duration disputes: auto-resolve using session analytics data (actual vs. claimed duration). Compute refund per PRD Section 12A.3 partial refund table. (3) For quality/conduct disputes: add to Dispute Resolution team queue in Retool admin dashboard. (4) Inngest job handles the 2-hour payment release: if no dispute filed, trigger Razorpay Route transfer to tutor's weekly payout batch."

---

### Sprint 11 — TPS Engine + Anti-Gaming (Week 12)

> "Build the Tutor Performance Score system. (1) In `lib/tps.ts`, implement: TPS = 0.30×StudentRating + 0.25×RetentionRate + 0.20×SessionCompletion + 0.15×StudentLearningImprovement + 0.10×ComplaintRatio(inverted). Each component must be computed from the correct data source (see PRD Section 11.2). (2) Create an Inngest scheduled function that runs every Monday at 2 AM IST, recomputing TPS for all active tutors and updating `tutors.tps_score` and `tutors.tps_tier`. (3) Implement anti-gaming detection signals (PRD Section 11C.2): rating distribution anomaly, session completion vs. mastery correlation, rating velocity. Flag tutors who trigger 2+ signals in 30 days for admin review."

---

### Sprint 12 — Notifications & Comms (Week 12–13)

> "Build the full notification system. (1) Push notifications via Firebase FCM: integrate for PWA web push. Send for: booking confirmed, session in 30 min, session in 5 min, new review received, payout processed. (2) WhatsApp via WATI API: send for: new booking (tutor), session summary (parent), weekly progress report (parent). Build WATI template messages for each. (3) SMS via Twilio Verify: OTP only (already done via Clerk — verify it's working correctly). (4) In-app notifications: create a Supabase real-time channel; push notification objects to `notifications` table; subscribe on frontend."

---

### Sprint 13 — Spaced Repetition Engine (Week 13)

> "Implement the spaced repetition system. (1) In `lib/mastery.ts`, after every mastery score update, compute `next_review_due_at` using an SM-2 derivative algorithm: if mastery ≥ 85 (Retained), interval = 14 days. If 66–84 (Mastered), interval = 7 days. If 46–65 (Practiced), interval = 3 days. If < 46, interval = 1 day. Store in `mastery_scores.next_review_due_at`. (2) Create an Inngest scheduled function running nightly at 3 AM IST: for each active student, find concepts where `next_review_due_at <= NOW()`. Add them to the student's 'due today' list. (3) On student dashboard, show a 'Review Today' section with concepts due for review."

---

### Sprint 14 — Referral Programme (Week 14)

> "Build the referral programme. (1) Each student gets a unique referral code on sign-up (store in `students.referral_code`). (2) Referral link: `edureach.in/join?ref=CODE`. (3) When a referred user signs up and completes diagnostic, record the referral in a `referrals` table. (4) Fraud check: if referee and referrer share the same device fingerprint or created accounts from the same IP within 24 hours, flag the referral as suspected fraud — do not issue credit automatically. (5) When referee completes 3 AskAI uses OR books a demo session (qualifying event), create an Inngest delay job for 7 days. After 7 days (if no fraud flag), credit both referrer and referee: 7-day AskAI unlimited pass. (6) Show referral status in student dashboard."

---

### Sprint 15 — Subscription Billing & Upgrade Flows (Week 15)

> "Build subscription management. (1) Create Razorpay Subscription plans: Free (INR 0), Core (INR 349/month), Plus (INR 699/month), Pro (INR 1,199/month). (2) Build upgrade flow: when a free-tier student hits a gate (AskAI limit, tutor booking), show an upgrade modal with the plan comparison. (3) Build subscription management page at `/student/subscription`: current plan, next billing date, usage stats, upgrade/downgrade/cancel buttons. (4) Build Inngest job for subscription renewal handling: on successful renewal, extend `students.subscription_expires_at`. On failed renewal, downgrade to free after 3-day grace period with notification."

---

### Sprint 16 — Admin & Ops Dashboards (Week 16–17)

> "Build the admin console at `/admin`. Use Retool (connected to Supabase) for the operational dashboards — do not build these from scratch in code. Set up in Retool: (1) User Management: search users, view profile, change status, link parent to student. (2) Tutor Pipeline: view all applicants with status, approve/reject with notes, view demo class recording. (3) Safety Dashboard: all open safety flags with severity, assignment, resolution status. (4) Dispute Queue: open disputes with session details, session analytics, resolution actions. (5) Marketplace Health: fill rate, supply/demand ratio by city/subject. Use Retool's built-in charts and tables — configure, don't code."

---

### Sprint 17 — Surge Handling & Platform Tutor Backstop (Week 17)

> "Build the surge handling system. (1) Inngest scheduled job runs every 15 minutes: calculate current demand (bookings per hour) vs. supply (available tutor slots per hour) by subject/city segment. If demand/supply ratio > 1.5 (surge threshold): trigger surge mode. (2) In surge mode: reduce commission for available tutors by 10% for bookings made in the next 2 hours; show 'High demand — tutors filling quickly' banner to students. (3) Platform tutor backstop: if a student's booking request is not accepted within the SLA (5 min for Instant, 24hr for Scheduled), automatically assign a platform-hired tutor (tutor_type = 'platform_hired'). Student sees 'We've found you a certified EduReach tutor' — no mention of backstop."

---

### Sprint 18 — Pre-Launch QA & Hardening (Week 18)

No new features. Hardening only.

**Checklist for Cursor:**
> "Audit the entire codebase for these issues and fix all of them: (1) Every API route must validate input with Zod before processing. (2) Every database query must check that the requesting user has permission to access that resource (no cross-user data leaks). (3) Every page that should be role-restricted must check the user's role in the Clerk session. (4) All environment variables must be accessed via a validated config object — not directly via `process.env` (create a `lib/config.ts` that throws on missing required variables). (5) Add Sentry error boundaries around all major page components. (6) Test all Razorpay webhook handlers with Razorpay's test event simulator."

---

## Phase 2: Launch Readiness (Weeks 19–22)

### Sprint 19 — Performance & Mobile (Week 19)

> "Optimise for mobile and slow networks. (1) Run Lighthouse audit on all key pages (student dashboard, AskAI, tutor discovery, booking flow). Fix all issues scoring < 80. (2) Implement PWA manifest and service worker: the app should be installable on Android Chrome and work offline for the student dashboard and previously-loaded content. (3) Implement adaptive video streaming in the virtual classroom: detect connection speed and adjust 100ms video quality settings. (4) Ensure all images are WebP format and lazy-loaded. (5) Ensure the app is usable on a 2GB RAM Android phone — test by throttling Chrome DevTools to 'Low-end mobile' preset."

### Sprint 20 — Content Loading & Seed Data (Week 20)

> "Build the content management pipeline. (1) Create a CSV import tool at `/admin/content/import` that bulk-imports content objects from a spreadsheet (columns: title, board, class, subject, chapter, concept_id, type, s3_url, difficulty). (2) Build a content object editor at `/admin/content/[id]` for updating metadata. (3) Write a database seed script in `prisma/seed.ts` that creates: 5 test students, 5 test tutors with full profiles, 50 sample concepts across CBSE Math and Science, 200 sample practice questions. Running `npx prisma db seed` should give you a fully populated test environment."

### Sprint 21 — Beta Testing (Weeks 21–22)

No new development. Recruit 10–20 real students and 5 real tutors. Observe them using the platform. Fix everything that breaks or confuses them. Document every bug. Fix them in priority order: anything that breaks a payment or a session is P0; anything confusing in UX is P1; cosmetic issues are P2.

---

## Phase 3: Post-Launch Expansion (Month 7+)

These sprints begin only after the Phase 1 KPI gates are met (10,000 paid subscribers, < 5% churn, fill rate > 80%).

| Sprint | Feature | PRD Reference |
|---|---|---|
| 21 | Maharashtra State Board content | PRD Section 9 |
| 22 | Hindi UI (i18n implementation) | PRD Section 6.1 |
| 23 | Group live classes (6–10 students) | PRD Section 6.2 |
| 24 | Gamification (streaks, XP, badges) | PRD Section 6.1 |
| 25 | B2B school dashboard | PRD Section 18 |
| 26 | Exam Intensive Mode | PRD Section 6.1 |
| 27 | Advanced parent dashboard + school sync | PRD Section 7 |
| 28 | Predictive supply alerts | PRD Section 11D |
| 29 | First proprietary recommendation model | PRD Section 10B |
| 30 | Classes 6–8 content + student app | PRD Section 9 |

---

## How to Run a Sprint with AI Agents

For prompting templates, the debugging ladder, commit discipline, and weekly rhythm: **`EduReach_Solo_Founder_AI_Dev_Guide.md`**.

---

## Timeline Summary

| Period | What You're Building | Milestone |
|---|---|---|
| Week 1 | Setup and scaffold | Empty working app deployed on Vercel |
| Weeks 2–5 | Walking skeleton | End-to-end journey works (no polish) |
| Weeks 6–17 | Full feature build | All Phase 1 features complete |
| Week 18 | Hardening + QA | Production-ready |
| Weeks 19–20 | Performance + content | Mobile-optimised; content loaded |
| Weeks 21–22 | Beta test | 10–20 real users |
| Month 6 | **LAUNCH** | First paying students |
| Month 7+ | Expansion sprints | Based on KPI gate data |

---

*EduReach India — Execution Roadmap v1.0 | March 2026*  
*For use by: solo founder with AI coding agents.*  
*This document is a living document. Update sprint status after each session.*
