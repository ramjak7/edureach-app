# EduReach India — Feature Roadmap
### Companion Artefact to PRD v6.0
**Version:** 1.0 | **Date:** March 2026 | **Status:** CONFIDENTIAL  
**Audience:** Product, Engineering, Design, Leadership, Investors  
**Purpose:** Time-phased prioritisation of every significant product feature across 36 months. Shows *what* gets built *when* and *why in that order* — the strategic rationale behind each sequencing decision, not just a list of features with dates.

---

## Roadmap Principles

**1. Sequence by dependency, not desire.**  
A feature that requires another feature to exist first cannot be built first, regardless of how much we want it. The roadmap respects technical and product dependency chains.

**2. Revenue gates before expansion.**  
No new product surface opens until the preceding surface has demonstrated revenue health. Group classes do not launch until 1-on-1 marketplace has proven fill rate. State boards do not launch until CBSE/ICSE subscription churn is < 5%.

**3. Child safety never deferred.**  
The Child Safety Framework is built in full before the first student joins. No "we'll add safety features later" — this is a Day 0 requirement.

**4. Operations must scale with product.**  
No feature ships without the operational team to support it. The roadmap explicitly names which operations team must be ready before each feature launches.

**5. The feature roadmap is not a commitment.**  
Phases 3 and 4 are directional. Phases 1 and 2 are commitments. Any feature not yet started is subject to reprioritisation based on user research and business metrics.

---

## Phase / Legend Key

| Symbol | Meaning |
|---|---|
| 🔴 | Launch blocker — platform cannot go live without this |
| 🟠 | Phase anchor — defines the phase; high strategic priority |
| 🟡 | Important — ships in this phase but not a blocker |
| 🟢 | Enhancement — improves experience; can slip to next phase if needed |
| ⬜ | Deferred — confirmed not in this phase |
| 📊 | Business/monetisation feature |
| 🔒 | Safety/compliance feature |
| 🤖 | AI/ML feature |
| 📱 | Mobile-specific feature |

---

## Timeline Overview

```
PRE-LAUNCH         PHASE 1           PHASE 2          PHASE 3           PHASE 4
Month -3 to 0   |  Month 1–6      |  Month 7–12   |  Month 13–24   |  Month 25–36
────────────────|─────────────────|───────────────|────────────────|──────────────
Supply building |  Foundation      |  Expansion    |  Depth         |  Differentiation
500 tutors      |  CBSE+ICSE      |  State boards |  Classes 6–8   |  Regional + AI moat
Content build   |  Core product   |  Group classes|  Hindi UI      |  Proprietary models
Tech build      |  10k subscribers|  25k paid     |  100k paid     |  500k+ paid
Safety infra    |                 |               |                |
```

---
---

# PRE-LAUNCH (Month -3 to Month 0)

> **Theme:** Build the supply, infrastructure, and safety systems before the first student arrives.  
> **Gate to launch:** All 🔴 items complete. 500 tutors verified + Academy-complete. CBSE/ICSE content for Classes 9–12 core subjects live.

---

## Pre-Launch: Core Infrastructure

| Feature | Priority | Owner | Notes |
|---|---|---|---|
| Cloud infrastructure setup (AWS ap-south-1, ECS, RDS Multi-AZ, Redis, S3+CloudFront) | 🔴 | Engineering | Staged: Phase 1 scale only; no over-provisioning |
| Authentication service (Auth0 + OTP; multi-role: student/parent/tutor/admin) | 🔴 | Engineering | Parent consent flow for minors mandatory |
| DPDP Act compliance: verifiable parental consent module | 🔴 🔒 | Engineering + Legal | Section 9 — consent captured before any minor data processed |
| Child Safety Framework: NLP chat moderation, session recording infrastructure, Trust & Safety admin console | 🔴 🔒 | Engineering + Trust & Safety | Full Section 20 framework; no partial build |
| Razorpay Route integration: nodal account model, subscription billing, marketplace payout | 🔴 📊 | Engineering + Finance | India data residency; GST invoicing; TDS automation |
| Content Delivery Network: S3 + CloudFront for video + PDF; adaptive streaming (240p–1080p) | 🔴 | Engineering | H.265 compression; offline pack support |
| Virtual classroom: Agora.io / 100ms integration; auto-recording; whiteboard | 🔴 | Engineering | Recording mandatory; recording SLA: available within 2 hours |
| Kafka event streaming (learning events pipeline) | 🔴 | Engineering | Mastery engine depends on this; cannot defer |
| Admin console (internal): content management, user management, safety review interface | 🔴 | Engineering | Ops team needs this before launch |
| Phase 1 feature store: Redis (real-time features) + PostgreSQL + dbt (batch features) | 🟠 | Engineering | Mastery score serving requires this |
| Disaster recovery: RDS Multi-AZ, daily snapshots, cross-region backup (weekly) | 🟠 | Engineering | RPO 1hr; RTO 4hr |

---

## Pre-Launch: Content Production

| Feature | Priority | Owner | Notes |
|---|---|---|---|
| CBSE Classes 9–10: Mathematics, Science — concept videos + notes + question banks | 🔴 | Content | ~1,000 content objects; 8-stage production pipeline |
| CBSE Classes 11–12 Science: Physics, Chemistry, Math, Biology | 🔴 | Content | ~1,600 content objects |
| CBSE Classes 11–12 Commerce: Accountancy, Business Studies, Economics | 🟠 | Content | ~960 objects; can be partial at launch |
| ICSE Classes 9–10: Math, Physics, Chemistry, Biology, English | 🔴 | Content | ~1,120 objects |
| ISC Classes 11–12: Science + Commerce | 🟠 | Content | Phase 1.5 completion |
| Previous 10-year board papers with solutions: CBSE + ICSE | 🔴 | Content | High-urgency demand; must be live Day 1 |
| Board marking scheme explainer guides (per subject) | 🟠 | Content | Differentiator; completes Phase 1 |

---

## Pre-Launch: Tutor Supply

| Feature | Priority | Owner | Notes |
|---|---|---|---|
| Tutor application + document verification flow (IDfy API) | 🔴 | Engineering + Tutor Onboarding | 6-step onboarding SLA |
| Subject knowledge test delivery + automated scoring | 🔴 | Engineering + Content | Per subject; board-authentic |
| Demo class submission + QA evaluation workflow | 🔴 | Engineering + Tutor Onboarding | 48-hour SLA; rubric-based |
| Tutor Academy LMS: 5 modules, pass/fail, completion tracking | 🔴 | Engineering + Learning Design | Mandatory before first live session |
| Tutor profile: public-facing (photo, intro video, TPS, reviews, availability) | 🔴 | Engineering | |
| Background verification integration (AuthBridge) | 🔴 🔒 | Engineering + Tutor Onboarding | No exceptions; pre-launch |
| Earnings dashboard: real-time pending + cleared; weekly payout tracker | 🟠 | Engineering | Tutor NPS depends on payment transparency |
| First 100 tutors: INR 15,000/month earnings guarantee (operational programme) | 🔴 | Marketplace Ops | Not a feature; operational commitment |
| 500 tutors verified + Academy-complete before launch | 🔴 | Tutor Onboarding | Gate condition for launch |

---
---

# PHASE 1 — Foundation (Month 1–6)

> **Theme:** Core product proven, first 10,000 paid subscribers, marketplace liquidity established in 3 cities.  
> **Gate to Phase 2:** 10,000 paid subscribers with < 5% monthly churn. Marketplace fill rate > 80%. AskAI math accuracy > 92% HIGH confidence.

---

## Phase 1: Student App

| Feature | Priority | Month | Owner | Gate / Dependency |
|---|---|---|---|---|
| Student onboarding: board/class/subject selection + goal setting | 🔴 | M1 | Product + Engineering | |
| 20-question adaptive diagnostic per subject | 🔴 | M1 | Product + ML | Mastery engine must be live |
| Mastery heatmap (chapter-level visualisation for student) | 🔴 | M1 | Product + Engineering | Diagnostic complete |
| Dynamic learning path: daily study plan + chapter sequence | 🔴 | M1 | Product + ML | Mastery engine + concept graph |
| Content library: video player + progress tracking | 🔴 | M1 | Engineering | CDN live |
| Practice engine: chapter-wise question banks, adaptive difficulty | 🔴 | M1 | Engineering + Content | |
| Error classification post-attempt: Conceptual / Procedural / Careless / Knowledge Gap | 🔴 | M1 | ML + Engineering | Core differentiator |
| AskAI — text query: LLM generation + symbolic solver verification | 🔴 | M1 | Engineering + ML | Section 10A pipeline |
| AskAI — photo query: OCR + LaTeX parsing + LLM + symbolic verification | 🔴 | M1 | Engineering + ML | Handwriting OCR accuracy gate: > 85% |
| AskAI — confidence thresholding + human escalation queue | 🔴 | M1 | Engineering | < 85% → human |
| Tutor discovery: search + filter + profile view | 🔴 | M1 | Product + Engineering | Tutor supply ready |
| Tutor ranking algorithm (Section 11D.2) | 🔴 | M1 | ML + Engineering | Feature store live |
| Free 20-minute demo class booking | 🔴 | M1 | Engineering | Classroom + booking flow |
| Instant booking flow (Flow 3A) | 🔴 | M1 | Engineering | Razorpay Route + session verification |
| Scheduled booking flow (Flow 3B) | 🔴 | M1 | Engineering | |
| AI-recommended booking flow (Flow 3C) | 🟠 | M2 | ML + Engineering | Ranking engine stable first |
| Session rating (1–5 + comment, 2-hour delay) | 🔴 | M1 | Engineering | Anti-gaming: timing constraint |
| Academic planner: weekly calendar + exam dates | 🟠 | M2 | Product + Engineering | |
| School timetable import + homework sync | 🟡 | M3 | Product + Engineering | |
| Exam preparation tools: revision planner + previous year papers | 🔴 | M1 | Content + Engineering | Board papers must be live |
| Offline learning packs: download + local playback + sync-on-reconnect | 🟡 | M3 | Engineering | Tier 3 growth lever |
| Low-RAM mode: UI auto-downgrade for < 2GB RAM devices | 🔴 📱 | M1 | Engineering | 40% of Indian Android devices |
| Shared device PIN-based profile switching | 🟡 📱 | M2 | Engineering | |
| AskAI offline: cache last 50 solutions locally | 🟡 | M3 | Engineering | Offline pack dependency |
| Wellbeing: confidence score display | 🟡 | M3 | Product | |
| Wellbeing: burnout signal detection + structured break recommendation | 🟢 | M5 | ML + Product | Engagement data needed first (M3+ cohort) |
| Exam Readiness Score (per subject, daily update) | 🟠 | M2 | ML | Mastery engine + 30 days of data |
| Referral programme: AskAI watermarked share + credit system | 🟠 | M2 | Engineering + Marketing | K-factor target > 0.3 |
| Daily challenge: 5–10 board-authentic questions | 🟡 | M3 | Content + Engineering | Habit loop feature |
| Spaced repetition engine: review scheduling from forgetting curve | 🔴 | M1 | ML | Core learning science |
| Concept dependency graph: gated concept unlock | 🔴 | M1 | ML + Content | Requires concept-level content tagging |

---

## Phase 1: Parent App

| Feature | Priority | Month | Owner | Gate / Dependency |
|---|---|---|---|---|
| Parent account creation + OTP verification | 🔴 | M1 | Engineering | DPDP consent flow |
| Parent consent screen (plain language, granular) | 🔴 🔒 | M1 | Engineering + Legal | Legal review required |
| Child performance dashboard: weekly summary (plain language) | 🔴 | M1 | Product + Engineering | Translation layer live |
| Parent Learning Translation Layer (mastery → plain English) | 🔴 | M1 | Product + Engineering | Section 6.2A — core parent retention driver |
| Exam Readiness Score (parent view, plain language) | 🔴 | M2 | ML + Engineering | After Mastery data accumulates |
| Session attendance log | 🔴 | M1 | Engineering | |
| Session recording: one-tap access from parent dashboard | 🔴 🔒 | M1 | Engineering | Mandatory; child safety requirement |
| AI session safety summary ("No concerns detected") | 🔴 🔒 | M1 | Engineering + Trust & Safety | Auto-generated post-session |
| Tutor approval flow (mandatory for under-14) | 🔴 🔒 | M1 | Engineering | POCSO compliance |
| Child safety controls: enable/disable AskAI photo upload; set session time restrictions | 🔴 🔒 | M1 | Engineering | |
| Parent chat with tutor (logged; NLP monitored) | 🟠 | M2 | Engineering | |
| Weekly parent report (auto-generated; plain language) | 🔴 | M1 | Engineering + ML | Key retention anchor |
| Push alerts: missed session, score drop, upcoming exam, low engagement | 🟠 | M2 | Engineering | Alert fatigue management required |
| Subscription management: renewal, cancellation, invoice download | 🔴 📊 | M1 | Engineering | Consumer Protection Act compliance |
| Multi-child management (siblings under one parent login) | 🟡 | M4 | Engineering | Phase 1.5 |
| School report card sync (OCR or manual input) | 🟡 | M4 | Engineering + ML | Prediction vs. actual alignment feature |
| Monthly parent-tutor review meeting: prompt + agenda | 🟡 | M4 | Product + Engineering | Requires 3 months of session data first |
| Parent referral programme | 🟠 | M2 | Engineering + Marketing | Highest trust channel |

---

## Phase 1: Tutor App

| Feature | Priority | Month | Owner | Gate / Dependency |
|---|---|---|---|---|
| Pre-session Student Intelligence Card (auto-generated) | 🔴 | M1 | Engineering + ML | Core differentiator; Mastery engine + AskAI doubt history |
| Virtual classroom: HD video, screen share, whiteboard, auto-recording | 🔴 | M1 | Engineering | Agora/100ms integration |
| Post-session form: objective, notes, homework, concerns | 🔴 | M1 | Engineering | Payment trigger requires completion |
| Session management: schedule view, upcoming sessions, cancellation | 🔴 | M1 | Engineering | |
| TPS dashboard: current score, component breakdown, trend | 🔴 | M1 | Engineering + ML | Weekly update |
| TPS component improvement guides: per-component actionable advice | 🟠 | M2 | Product | Drives tutor NPS |
| Earnings dashboard: pending, cleared, weekly payout history, TDS report | 🔴 📊 | M1 | Engineering | Payment trust |
| Student conversion tracker: demo → booked rate | 🟡 | M3 | Engineering | |
| Cancellation rate tracker | 🟠 | M2 | Engineering | Anti-gaming signals |
| Tutor Academy: ongoing monthly board briefings | 🟠 | M2 | Learning Design | Post-launch professional development |
| Optional pedagogy webinars + badge display | 🟡 | M3 | Learning Design | |
| Aggregate student error pattern digest (anonymised, monthly) | 🟡 | M4 | ML + Engineering | Needs 3-month data accumulation |
| Subject knowledge test retake (for new subjects) | 🟡 | M3 | Engineering | |

---

## Phase 1: Platform & Operations Infrastructure

| Feature | Priority | Month | Owner | Gate / Dependency |
|---|---|---|---|---|
| Marketplace Operations Dashboard (real-time; Section 13A.2) | 🔴 | M1 | Engineering + Marketplace Ops | Day 1 operations |
| Child Safety Dashboard (real-time alerts; Section 13A) | 🔴 🔒 | M1 | Engineering + Trust & Safety | Day 1 — no launch without |
| Business Metrics Dashboard (MRR, churn, CAC) | 🔴 📊 | M1 | Engineering | Leadership visibility |
| AI System Health Dashboard (real-time; Section 13A.5) | 🔴 🤖 | M1 | Engineering | AskAI accuracy monitoring |
| Tutor Performance Monitor dashboard (basic TPS display + alerts) | 🔴 | M1 | Engineering | |
| Student Learning Health Dashboard (basic: engagement + retention) | 🟠 | M2 | Engineering + Data | Requires M1 cohort data |
| Anti-gaming system: 5 detection signals + response protocol | 🔴 | M1 | Engineering + Trust & Safety | Active from Day 1 |
| Session verification: presence detection + recording duration check | 🔴 | M1 | Engineering | Payment gate |
| Dispute resolution workflow: duration + technical (automated) | 🔴 | M1 | Engineering + Dispute Resolution | |
| Dispute resolution workflow: quality + conduct (human) | 🔴 🔒 | M1 | Engineering + Trust & Safety | |
| Surge detection + automated tutor notification (commission boost) | 🟠 | M2 | Engineering + Marketplace Ops | Requires M1 session volume data to calibrate |
| Platform tutor backstop activation flow | 🔴 | M1 | Engineering + Marketplace Ops | Liquidity guarantee |
| Tutor cancellation + substitute matching flow | 🔴 | M1 | Engineering | |
| Anti-disintermediation: real-time NLP chat monitoring | 🔴 🔒 | M1 | Engineering + Trust & Safety | |
| Anti-disintermediation: weekly anomaly detection batch job | 🟠 | M2 | Engineering + Trust & Safety | Requires M1 booking data |
| CSAM detection: AWS Rekognition on photo uploads + PhotoDNA | 🔴 🔒 | M1 | Engineering | AskAI photo feature requires this |
| Subscription auto-renew + cancellation flow (CPA 2019 compliant) | 🔴 📊 🔒 | M1 | Engineering + Legal | |
| GST invoice generation (per session + subscription) | 🔴 📊 | M1 | Engineering + Finance | India tax compliance |
| TDS computation + certificate generation | 🔴 📊 | M1 | Engineering + Finance | Tutor payout compliance |

---

## Phase 1: Pricing & Monetisation

| Feature | Priority | Month | Owner | Gate / Dependency |
|---|---|---|---|---|
| Free tier: gated limits (5 AskAI/week, 2 videos/chapter, 1 mock/month) | 🔴 📊 | M1 | Engineering | Free-to-paid conversion engine |
| Core plan (INR 349–549/month): full content + unlimited AskAI | 🔴 📊 | M1 | Engineering | |
| Plus plan (INR 899–1,499/month): Core + 2 marketplace credits | 🔴 📊 | M1 | Engineering | Phase 1 version (group classes deferred to M7) |
| Pro plan (INR 2,199–3,799/month): Plus + 4 sessions/month | 🔴 📊 | M1 | Engineering | |
| Marketplace commission billing: 13–20% per session based on TPS tier | 🔴 📊 | M1 | Engineering + Finance | |
| Free-to-paid upgrade contextual prompts (non-intrusive, contextual) | 🔴 📊 | M1 | Product | AskAI gate, session gate |

---

## Phase 1: Acquisition & Growth

| Feature | Priority | Month | Owner | Gate / Dependency |
|---|---|---|---|---|
| Free mock test: lead magnet (no signup required; gap analysis report delivered) | 🔴 | M1 | Content + Engineering | Board-authentic; CBSE + ICSE |
| Mock test → free account → AskAI trial conversion funnel | 🟠 | M1 | Product + Engineering | Funnel tracking required |
| Telegram community AskAI credit distribution | 🟠 | M1 | Marketing | 20 community partnerships |
| YouTube channel: doubt-solving videos + AskAI link in description | 🔴 | M-2 (pre-launch) | Content + Marketing | SEO + organic takes 6–8 weeks to build |
| Parent webinar series: "How to prepare your child for CBSE boards" | 🟠 | M1 | Marketing | Monthly; Zoom |
| Referral programme: student + parent + tutor incentives | 🟠 | M2 | Engineering + Marketing | K-factor: > 0.3 target |
| WhatsApp school parent group seeding + mock test distribution | 🟠 | M-1 (pre-launch) | Marketing | 100 school groups target |
| Cold-start seeded demand injection: 200 hand-selected students | 🔴 | M1 W1 | Student Success + Marketplace Ops | Supply ready first |
| Segment-by-segment marketplace opening (MVD gate) | 🔴 | M1 | Marketplace Ops | Flow 11E.5 |

---
---

# PHASE 2 — Expansion (Month 7–12)

> **Theme:** Maharashtra Board, group classes, gamification, tutor badge system, B2B pilot, product-led growth loops compounding.  
> **Gate condition for start of Phase 2:** Phase 1 gate met (10,000 paid subscribers, churn < 5%, fill rate > 80%).  
> **Gate to Phase 3:** 25,000 paid subscribers. Student Learning Improvement Rate > 12% (verified). Marketplace GMV > INR 50L/month.

---

## Phase 2: New Boards & Content

| Feature | Priority | Month | Owner | Dependency |
|---|---|---|---|---|
| Maharashtra State Board: Classes 9–10 (Math, Science, English) — full content | 🟠 | M7–M9 | Content | Board prioritisation score: 6.7 |
| Maharashtra State Board: Classes 11–12 | 🟡 | M10–M12 | Content | Follows Classes 9–10 launch |
| Hindi content tracks: CBSE Mathematics + Science (video + notes) | 🟠 | M7–M9 | Content | Phase 1 English-only content prerequisite |
| Full syllabus coverage verification: all Phase 1 boards to 100% | 🟠 | M7 | Content | Phase 1 content gaps closed |

---

## Phase 2: Product Features

| Feature | Priority | Month | Owner | Dependency |
|---|---|---|---|---|
| Group live classes: platform-hired tutors; 6–10 students; scheduled | 🟠 📊 | M8 | Product + Engineering | Agora group session extension; requires platform tutor headcount |
| Gamification: daily streaks + XP system | 🟡 | M7 | Product + Engineering | Engagement data from M1–M6 informs design |
| Achievement badges: milestone-based (first mastered chapter, 30-day streak, etc.) | 🟡 | M8 | Product | |
| Confidence score: per-subject, trending (student view) | 🟡 | M7 | ML + Product | |
| Effort recognition: reward improvement trajectory not just absolute scores | 🟡 | M8 | ML + Product | Counters discouragement for low-baseline students |
| Advanced parent dashboard: full cohort analytics + ERS projection | 🟠 | M7 | Engineering + ML | Requires 6-month data cohort |
| School report card sync: OCR extraction + prediction accuracy display | 🟡 | M8 | Engineering + ML | 6 months of ERS predictions needed to validate accuracy |
| Monthly parent-tutor review meeting: structured agenda, logged summary | 🟠 | M7 | Product + Engineering | |
| Exam Intensive Mode: 30-day countdown with daily personalised plan | 🟠 | M9 | ML + Product | Timed for board exam season (Feb–Mar) |
| Stress-aware scheduling: 2 weeks pre-board, reduced intensity mode | 🟡 | M9 | ML + Product | |
| Hindi UI: full in-app language toggle (Hindi interface) | 🟠 | M9 | Engineering | i18n architecture required from Day 1 |
| Multi-child parent dashboard: siblings under one account | 🟡 | M8 | Engineering | |
| Student Learning Health Dashboard: full cohort + individual risk flags | 🟠 | M7 | Engineering + Data | 6 months of data required |
| Tutor Performance Monitor: anti-gaming signals live | 🟠 | M7 | Engineering + Trust & Safety | M1–M6 baseline data needed to calibrate anomaly thresholds |
| Tutor earnings health analytics (% earning > INR 10k/month) | 🟡 | M8 | Engineering | |
| Content Quality Dashboard (automated) | 🟡 | M8 | Engineering + Content | |
| Predictive supply alerts (marketplace): anticipate surge before it happens | 🟡 🤖 | M10 | ML + Engineering | 6 months of surge pattern data |

---

## Phase 2: Tutor System

| Feature | Priority | Month | Owner | Dependency |
|---|---|---|---|---|
| TPS badge display: Gold/Platinum badging on public profile | 🟠 | M7 | Engineering | TPS system live M1; badges add profile signal |
| TPS tier commission differential live: 13% (Platinum) to 20% (Bronze) | 🟠 | M7 | Engineering + Finance | M1–M6 on flat commission; differentiated from M7 |
| Advance availability incentive: "Preferred" badge for pre-committed weekly availability | 🟡 | M8 | Engineering + Marketplace Ops | |
| Tutor aggregate student error pattern digest (monthly, anonymised) | 🟠 | M7 | ML + Engineering | 6 months of error data needed for statistical reliability |
| Maharashtra Board tutor onboarding: new subject tests + Academy module update | 🟠 | M8 | Tutor Onboarding + Content | Maharashtra launch |

---

## Phase 2: B2B & Growth

| Feature | Priority | Month | Owner | Dependency |
|---|---|---|---|---|
| B2B pilot: school admin dashboard (5–10 pilot schools) | 🟡 📊 | M9 | Product + Engineering + Sales | B2B deferred from Phase 1 by design |
| School referral growth loop: class leaderboard + school-wide engagement signal | 🟡 | M10 | Product + Engineering | Requires 5+ students from same school |
| Tutor referral loop automation: tutor brings existing students → first month free Core | 🟠 | M7 | Engineering + Marketing | High-leverage supply-side growth |
| Content discovery loop: YouTube → AskAI → free tier → paid (funnel optimisation) | 🟠 | M7 | Marketing + Engineering | A/B testing on conversion funnel |

---
---

# PHASE 3 — Depth (Month 13–24)

> **Theme:** Major board expansion, Classes 6–8, Hindi content at scale, JEE bridge track, B2B launch, first proprietary AI model.  
> **Gate to Phase 4:** 100,000 paid subscribers. B2B: 10+ institutional clients. Proprietary recommendation model in production (vs. generic LLM API).

---

## Phase 3: Boards & Content

| Feature | Priority | Month | Owner | Notes |
|---|---|---|---|---|
| UP Board: Classes 9–12 core subjects | 🟠 | M13–M16 | Content | Board score 6.3; Tier 2 city penetration |
| Tamil Nadu State Board: Classes 9–12 core subjects | 🟠 | M14–M17 | Content | Board score 6.4; large population |
| Classes 6–8: CBSE + Maharashtra content build | 🟠 | M13–M18 | Content | Enables full school year continuity |
| Hindi content: full curriculum (Math + Science + Hindi Medium) | 🟠 | M13–M18 | Content | Phase 2 Hindi UI enables this |
| JEE/NEET conceptual extension track: Class 11–12 Science only | 🟡 | M15 | Content + Product | Supplements boards; not a separate JEE product |

---

## Phase 3: AI & Intelligence

| Feature | Priority | Month | Owner | Dependency |
|---|---|---|---|---|
| First proprietary recommendation model: replaces rule-based next-concept engine | 🟠 🤖 | M16–M18 | ML | 18 months of training data required (~10M practice attempts) |
| Error pattern classifier (proprietary): error type prediction at question level | 🟡 🤖 | M18 | ML | Training data: 12M+ labelled error instances |
| AskAI accuracy improvement: prompt engineering tuned on 18 months of wrong answer logs | 🟠 🤖 | M14 | ML + Engineering | Wrong answer log from M1–M12 |
| AI handwritten answer evaluation: subjective practice marking (Class 10–12) | 🟡 🤖 | M18 | ML + Engineering | High complexity; OCR + scoring model |
| Phase 2 Feature Store migration: Feast + DynamoDB (replaces Redis + PostgreSQL at scale) | 🟠 | M16 | Engineering | Triggered when MAU exceeds 500k |
| Engagement risk predictor: identify at-risk students 2 weeks before they churn | 🟡 🤖 | M15 | ML | Requires 12-month longitudinal data |

---

## Phase 3: Product & Platform

| Feature | Priority | Month | Owner | Dependency |
|---|---|---|---|---|
| School partnership programme: full B2B product launch | 🟠 📊 | M13 | Product + Sales + Engineering | B2B pilot validated in Phase 2 |
| B2B: school LMS integration (Google Classroom, Microsoft Teams) | 🟡 | M16 | Engineering + B2B | School partnership agreements |
| Classes 6–8 student app: adaptive learning path + content | 🟠 | M16 | Product + Engineering | Content must be ready first |
| Olympiad + scholarship preparation track | 🟡 | M18 | Content + Product | Content production estimate: 400 objects |
| Student peer learning: study groups (same board + class + city) | 🟡 | M18 | Product + Engineering | Safety review required before launch |
| NRI student marketplace expansion (timezone-aware matching) | 🟡 | M17 | Engineering + Marketplace Ops | |
| Advanced marketplace: concept-level tutor tagging + concept-outcome matching | 🟠 🤖 | M14 | ML + Engineering | Concept expertise data from M1–M12 |
| Multi-region infrastructure: active-active (if MAU exceeds 500k) | 🟡 | M18 | Engineering | Triggered by scale, not by date |

---
---

# PHASE 4 — Differentiation (Month 25–36)

> **Theme:** Regional languages, Classes 1–5, AI-generated content at scale, proprietary LLM fine-tuning, data moat activation.  
> **Exit state (Month 36):** 500k+ paid subscribers. Proprietary domain-specific LLM for AskAI (replacing generic API). Data moat tangible — irreproducible learning dataset. EBITDA positive or approaching.

---

## Phase 4: Regional Scale

| Feature | Month | Notes |
|---|---|---|
| Marathi content: CBSE + Maharashtra Board | M25–M27 | Language expansion; major Maharashtra market unlock |
| Tamil content: Tamil Nadu Board | M26–M28 | |
| Kannada + Telugu content: Karnataka + AP/Telangana | M28–M32 | |
| Regional language UI: Marathi, Tamil, Kannada, Telugu | M25–M30 | Phased by content readiness |
| Classes 1–5: CBSE + Maharashtra content | M25–M30 | Full K-12 coverage completion |

---

## Phase 4: AI Moat Activation

| Feature | Month | Notes |
|---|---|---|
| Proprietary LLM fine-tuning: AskAI domain-specific model (CBSE/ICSE Math + Science) | M28–M33 | Replaces generic LLM API; requires 3-year dataset (~100M practice attempts, ~10M AskAI queries) |
| AI-generated board-calibrated practice papers: personalised full papers | M26 | System generates papers targeting student's specific weak concept cluster |
| Predictive parent analytics: "Aryan is likely to struggle with Class 11 Vectors based on his Class 10 trajectory" | M28 | Longitudinal data + ML required |
| Longitudinal trajectory prediction: 2-year ahead learning gap prediction | M30 | Year 5 data moat milestone |
| Research partnership with IITs/IIMs: anonymised learning dataset licensing | M30+ | Proprietary dataset becomes externally valuable |

---

## Phase 4: Experience & Expansion

| Feature | Month | Notes |
|---|---|---|
| AR/VR science lab simulations: Class 11–12 Physics + Chemistry | M28 | Hardware-dependent; pilot for premium Pro users |
| Voice-based AskAI: spoken question → audio step-by-step solution | M26 | Accessibility + rural use case |
| Offline AI: on-device lightweight model for basic AskAI (no internet required) | M30 | Technical prerequisite: small on-device model (e.g., distilled from proprietary model) |
| EduReach for Schools: full institutional platform (ERP-grade) | M28 | B2B Phase 3 → full product |
| International expansion pilot: Bangladesh + Sri Lanka (English medium boards) | M33 | CBSE curriculum exported internationally |

---
---

# Feature Dependency Map

> Key dependencies that cannot be violated without causing cascading failure.

```
FOUNDATIONAL LAYER (must exist before anything else):
  Mastery Engine + Feature Store
    ↑ required by: Dynamic Learning Path, Exam Readiness Score, Tutor Ranking,
                   Student Intelligence Card, Parent Translation Layer,
                   Engagement Risk Predictor, Proprietary Recommendation Model

  Child Safety Framework
    ↑ required by: AskAI photo upload, Live tutoring sessions, Parent App,
                   Any feature that involves student-adult interaction

  Razorpay Route + Session Verification
    ↑ required by: Marketplace commission, Subscription billing, Dispute resolution

LEARNING LAYER:
  Concept Dependency Graph + Content (CBSE/ICSE 9–12)
    ↑ required by: Dynamic Learning Path, Spaced Repetition, Exam Intensive Mode

  AskAI Symbolic Solver Pipeline (Section 10A)
    ↑ required by: AskAI photo query, AskAI math accuracy > 92%

MARKETPLACE LAYER:
  Tutor Supply (500 verified + Academy complete)
    ↑ required by: Tutor Discovery, Booking Flows, Cold-Start Seeded Demand

  Tutor Ranking Algorithm
    ↑ required by: AI-Recommended Booking, Tutor Discovery relevance

  Anti-Gaming System
    ↑ required by: TPS tier commission differentiation (cannot be gameable before launch)

DATA / AI LAYER:
  12 months of learning event data
    ↑ required by: First proprietary recommendation model (Phase 3)

  24 months of data (~100M practice attempts)
    ↑ required by: Error pattern classifier, Engagement risk predictor, LLM fine-tuning

  3 years of longitudinal data
    ↑ required by: Predictive trajectory model, Proprietary LLM for AskAI
```

---

# Deferred Features — Confirmed Not in Phase 1

These features are frequently requested or expected. They are explicitly deferred and the reason is documented.

| Feature | Deferred To | Reason |
|---|---|---|
| Group live classes | Phase 2 (M8) | Requires platform tutor headcount scaling; engineering complexity; Phase 1 focus is 1-on-1 |
| JEE/NEET track | Phase 3 (M15) | Avoids PW competition; board-first positioning must be established first |
| Classes 1–8 content | Phase 3 (M13) for 6–8; Phase 4 for 1–5 | Content production capacity constraint; board exam urgency is in 9–12 |
| State boards beyond Maharashtra | Phase 3 (M13+) | Board prioritisation scoring; CBSE/ICSE PMF first |
| B2B/School channel | Phase 2 pilot (M9); Phase 3 launch | B2B sales cycle would distract from B2C PMF in Phase 1 |
| Regional language UI | Phase 2 Hindi; Phase 4 others | i18n architecture from Day 1 but content production gated |
| AI-generated content | Phase 4 (M26) | Requires proprietary model; cannot do this on generic LLM |
| AR/VR labs | Phase 4 (M28) | Hardware dependency; niche until Phase 4 scale |
| On-device / offline AI | Phase 4 (M30) | Requires proprietary distilled model |
| Peer study groups | Phase 3 (M18) | Trust & Safety must be mature before enabling student-to-student interaction |
| NRI expansion | Phase 3 (M17) | Timezone-aware matching adds complexity; domestic PMF first |
| International expansion | Phase 4 (M33) | India market far from saturated at Phase 1–3 |

---

# KPI Gates Between Phases

> Every phase transition requires demonstrated business health, not just feature completion.

```
PRE-LAUNCH → PHASE 1 LAUNCH:
  ✅ 500 tutors: verified + Academy-complete + profile live
  ✅ All 🔴 features complete (no exceptions)
  ✅ Child Safety Framework: Trust & Safety team staffed (≥ 2 FTE)
  ✅ CBSE Classes 9–12 core content: ≥ 80% of Phase 1 content scope complete
  ✅ Marketplace: fill rate test (10 internal test bookings: ≥ 8 successful)

PHASE 1 → PHASE 2 (Month 7):
  ✅ Paid subscribers: ≥ 10,000
  ✅ Monthly subscription churn: < 5%
  ✅ Marketplace fill rate: > 80%
  ✅ AskAI math accuracy (HIGH confidence): > 92%
  ✅ Student/Parent NPS: > 55
  ✅ Child Safety: zero Level 3 incidents unresolved > 24 hours

PHASE 2 → PHASE 3 (Month 13):
  ✅ Paid subscribers: ≥ 25,000
  ✅ Marketplace GMV: > INR 50L/month
  ✅ Verified Learning Improvement Rate: > 12% (60-day cohort)
  ✅ Tutor NPS: > 45
  ✅ Maharashtra Board fill rate: > 80%

PHASE 3 → PHASE 4 (Month 25):
  ✅ Paid subscribers: ≥ 100,000
  ✅ B2B clients: ≥ 10 institutional contracts
  ✅ Proprietary recommendation model: live in production (vs. rule-based)
  ✅ Monthly churn: < 4%
  ✅ Unit economics: contribution margin > 60%
```

---

# Engineering Sprint Load Estimate

> Rough relative effort to help engineering plan sprint capacity. Not a precise estimate — a directional input.

| Phase | Engineering Effort | Complexity Driver |
|---|---|---|
| Pre-Launch | ~40% of total 36-month effort | Core infrastructure, safety systems, mastery engine — all built from scratch |
| Phase 1 | ~30% of total effort | Feature depth; AskAI verification pipeline; marketplace flows; payment system |
| Phase 2 | ~15% of total effort | Incremental on solid Phase 1 base; group classes is the most complex addition |
| Phase 3 | ~10% of total effort | Proprietary ML models; B2B integrations; regional content infrastructure |
| Phase 4 | ~5% of total effort | Primarily ML/data science; most infrastructure already exists |

> Pre-launch and Phase 1 together account for ~70% of total engineering effort over 36 months. This is intentional — it reflects the depth of the foundation being built.

---

*EduReach India — Feature Roadmap v1.0 | March 2026 | CONFIDENTIAL*  
*Companion to PRD v6.0, User Journey Maps v1.0, and Marketplace Flow Architecture v1.0.*  
*Supersedes no prior artefacts (first issue).*  
*Audience: Product, Engineering, Design, Leadership, Investors.*  
*Next review: post-Phase 1 launch (Month 7) — Phases 2–4 subject to reprioritisation based on Phase 1 user research.*
