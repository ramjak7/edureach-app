# EduReach India — Marketplace Flow Architecture
### Companion Artefact to PRD v6.0
**Version:** 2.0 | **Date:** March 2026 | **Status:** CONFIDENTIAL  
**Audience:** Engineering, Product, UX Design, Marketplace Operations  
**Purpose:** Step-by-step operational flows for all marketplace transactions — booking, matching, payment, disputes, and surge handling. These flows define *how it works*, not *what it must do* (the PRD) or *how it feels* (the Journey Maps).

**v2.0 Changes from v1.0:** Added scaling note to Flow 2 (ranking at 100k+ tutors); added race condition design decision note to Flow 3C; added Service Boundary Overview (Appendix A). Session verification mechanism was already fully specified in Flow 4 — reviewer claim of omission was incorrect.

---

## How to Read These Flows

Each flow uses the following notation:

```
Actor → Action → System Response → Outcome

Decision points:   ├─ YES path
                   └─ NO path

Automated steps:   [AUTO]
Human steps:       [HUMAN]
Time SLA:          {< N minutes/hours}
```

All flows are presented at the level of detail an engineering team needs to design system components and API contracts — not pseudocode, but unambiguous enough to derive data models and service boundaries.

---

## Flow Index

| # | Flow | Primary Actor | Complexity |
|---|---|---|---|
| 1 | Student Onboarding → First Tutor Discovery | Student | Medium |
| 2 | Tutor Search & Smart Matching | Student + System | High |
| 3A | Instant Booking Flow | Student + Tutor | Medium |
| 3B | Scheduled Booking Flow | Student + Tutor | Medium |
| 3C | AI-Recommended Booking Flow | Student + System + Tutor | High |
| 4 | Session Lifecycle (Pre → During → Post) | Student + Tutor + System | High |
| 5 | Payment & Escrow Flow | Student + Razorpay + Tutor | High |
| 6A | Dispute Flow — Duration / Technical | Student/Parent + System | Low |
| 6B | Dispute Flow — Quality Complaint | Student/Parent + Trust & Safety | Medium |
| 6C | Dispute Flow — Conduct / Child Safety | Parent + Trust & Safety | Critical |
| 7 | Surge Demand Handling | System + Marketplace Ops | Medium |
| 8 | Platform Tutor Backstop Activation | System + Platform Tutor + Marketplace Ops | Medium |
| 9 | Tutor Cancellation & Student Recovery | Tutor + System + Student | High |
| 10 | Anti-Disintermediation Detection | System + Trust & Safety | Medium |

---
---

## Flow 1 — Student Onboarding → First Tutor Discovery

> Entry point: new student completes diagnostic. Exit point: student has viewed ≥ 1 tutor profile.

```
STUDENT COMPLETES ONBOARDING DIAGNOSTIC
  ↓ [AUTO]
  System computes initial Mastery Scores per subject/chapter
  System builds initial Student Intelligence Card
  System identifies top 3 "at-risk" chapters (lowest Mastery Score, highest board exam weight)
  ↓
STUDENT ARRIVES ON HOME SCREEN (first time)
  ↓ [AUTO] — triggered if ≥ 1 subject has Mastery Score < 50 in a chapter
  In-app card surfaces: "Your [Subject] has some gaps worth addressing. 
  Here are tutors who specialise in helping CBSE Class [X] students 
  with exactly this."
  ↓
STUDENT TAPS "See Tutors" (or navigates to Tutor Discovery independently)
  ↓
  → go to Flow 2 (Tutor Search & Smart Matching)
```

**Data required at this stage:**
- Student Mastery Scores (from diagnostic engine)
- Board + Class + Subject selection
- Schedule preference (set during onboarding)
- Budget range (optional; collected during onboarding or deferred)

---

## Flow 2 — Tutor Search & Smart Matching

> Entry: student arrives on Tutor Discovery screen. Exit: student views a ranked list of up to 10 tutors.

```
STUDENT OPENS TUTOR DISCOVERY
  ↓
  System reads from student profile:
    - Board, Class, Subject
    - Current chapter(s) with Mastery Score < 65 (candidates for session focus)
    - Schedule preference
    - Budget range (if set)
    - Learning style tag (if set)
  ↓ [AUTO — computed in < 2 seconds]

HARD FILTER PASS (pre-ranking)
  System queries tutor index:
    Filter 1: Board + Class + Subject exact match (mandatory)
    Filter 2: Tutor status = Active (no suspension; TPS ≥ 40)
    Filter 3: At least 1 available slot within student's schedule window
    Filter 4: Hourly rate ≤ student's budget max (if budget set)
  ↓
  Result: eligible tutor pool (may be 0 → go to Backstop, Flow 8)
  ↓ [if eligible pool > 0]

RANKING SCORE COMPUTATION (per tutor in eligible pool)
  R = 0.50 × Relevance + 0.30 × Quality + 0.15 × Availability + 0.05 × Diversity
  
  Relevance (50%):
    ├─ Subject-Board-Class exactness:    20% — binary (exact = 1.0; class ±1 = 0.5)
    ├─ Mastery alignment:               15% — cosine similarity between student's weak 
    │                                          concept tags and tutor's concept expertise tags
    └─ Learning style match:            15% — declared student style vs. tutor style tags
  
  Quality (30%):
    ├─ TPS normalised [0–1]:            20% — TPS / 100
    └─ Concept-outcome score:           10% — avg mastery improvement for students this 
                                               tutor has taught in the specific concept cluster
                                               (null → 0.5 default for new tutors)
  
  Availability (15%):
    ├─ Schedule overlap score:          10% — number of compatible slots / 7 (days)
    └─ Response rate score:              5% — bookings accepted within SLA / total requests
  
  Diversity injection (5%):
    └─ New tutor boost:                  5% — if tutor has < 10 completed sessions:
                                               inject into position 2, 4, or 6 of results
                                               (rotated; not always the same position)
  ↓

RESULTS DISPLAY (ranked list, max 10)
  Each tutor card shows:
    - Name, photo, Tutor Academy badge(s)
    - TPS score + tier badge (Bronze / Silver / Gold / Platinum)
    - Subjects + boards + classes taught
    - Hourly rate range
    - Number of verified reviews + average rating
    - Next available slot (closest matching student's schedule)
    - "Free 20-min demo" label (if student has not yet had a demo with this tutor)
  ↓

STUDENT APPLIES FILTERS (optional — any combination):
    - Price range slider
    - Gender preference
    - Teaching style (structured / conversational / exam-focused)
    - Rating minimum
    - Availability: "Available Now" toggle
  ↓
  Filtered results re-rendered in < 1 second (client-side filter on returned set)
  ↓

STUDENT TAPS A TUTOR CARD → full profile view
  Profile shows (in order):
    (1) 2-minute intro video (auto-plays muted; tap for sound)
    (2) "For Students" section: teaching philosophy, specialisation
    (3) "For Parents" section: background verification status, session recording policy
    (4) Recent verified reviews (parent reviews filterable)
    (5) Availability calendar (next 14 days; slots shown as open / unavailable)
    (6) TPS breakdown (visible to student/parent — shows sub-scores but not formula)
    (7) CTA: "Book Free Demo" (if not yet done) or "Book Session"
  ↓
  → go to Flow 3A, 3B, or 3C depending on booking mode
```

**System components involved:**
- Tutor Index (Elasticsearch — enables fast filtered queries)
- Ranking Engine (Python microservice; reads from Feature Store: tutor concept expertise, student mastery map, student schedule)
- Availability Service (PostgreSQL; tutor calendar slots with state management)
- Tutor Profile CDN (static profile data + video)

> **⚠️ Scaling Note (v2.0):** The real-time ranking algorithm described above is designed for Phase 1–2 scale (< 3,000 tutors, < 50k MAU). At Phase 3 scale (8,000+ tutors, 100k+ MAU), the following architectural changes are required before engineering begins Phase 3:
>
> **(1) Caching layer:** Pre-computed ranking vectors per student (recalculated hourly or on mastery change events), served from Redis instead of computed on-demand per request. Target: ranking lookup < 50ms from cache vs. ~2 seconds current computation.
>
> **(2) Pre-computed tutor expertise index:** Concept-expertise tag vectors for all tutors pre-computed nightly (Spark batch job), stored in Elasticsearch dense vector fields, queried via approximate nearest neighbour (ANN) search (HNSW algorithm). Eliminates real-time cosine similarity computation.
>
> **(3) Availability pre-indexing:** Tutor availability states updated in Redis sorted sets (not queried from PostgreSQL at read time) — critical for instant booking performance at scale.
>
> **(4) Result caching:** Rankings for common student profiles (CBSE Class 10 Math, evening availability, INR 400–600) can be cached for 5-minute windows — high cache hit rate expected in Phase 3.
>
> This is an **engineering Phase 3 prerequisite**, not a current action item. The current design is intentionally simple for Phase 1. Do not over-engineer ranking at launch.

---

## Flow 3A — Instant Booking Flow

> Scenario: student wants a session in the next 30–60 minutes. Tutor has "Available Now" status.

```
STUDENT TAPS "Available Now" TOGGLE on discovery screen
  ↓ [AUTO]
  System filters to tutors with availability_state = "Available Now"
  Ranking re-run with Availability weight boosted to 40% (schedule urgency mode)
  ↓

STUDENT SELECTS TUTOR → taps "Book Now — Today"
  ↓
  STUDENT SELECTS TIME SLOT:
    - Platform shows: "Available in the next 60 minutes" time blocks (30-min increments)
    - If no slots in 60 min → system offers earliest slot in next 2 hours
  ↓
  STUDENT CONFIRMS SESSION DETAILS:
    - Duration: 30 min or 60 min
    - Session focus (optional): "Quadratic Equations — discriminant problems" (pre-filled from mastery map)
    - Price confirmation (locked at booking)
  ↓ [AUTO]
  Payment authorization triggered → funds held in Razorpay nodal account {< 30 seconds}
  Booking record created with status: PENDING_TUTOR_CONFIRMATION
  ↓

TUTOR RECEIVES INSTANT BOOKING REQUEST
  Push notification (iOS/Android) + in-app alert
  Notification: "New session request from [Student name redacted], Class [X] CBSE [Subject]. 
                 Starts in 45 minutes. Tap to accept."
  Tutor sees: student's first name, board, class, subject, session focus, duration, fee
  Tutor does NOT see: student's full name, photo, contact details, parent info
  ↓

  ├─ TUTOR ACCEPTS {within 5 minutes}
  │     Booking status → CONFIRMED
  │     Both parties receive confirmation push + WhatsApp
  │     Student receives: session link + countdown timer
  │     Tutor receives: full Student Intelligence Card auto-generated
  │     Tutor availability status → IN_SESSION (blocked for duration + 15 min buffer)
  │     → go to Flow 4 (Session Lifecycle)
  │
  └─ TUTOR DOES NOT RESPOND {> 5 minutes} or DECLINES
        Booking status → TUTOR_UNRESPONSIVE
        [AUTO] System immediately queries next-ranked eligible tutor
        Original tutor's response rate score decremented (affects future ranking)
        Student notification: "Finding you another tutor — just a moment."
        ↓
        ├─ NEXT TUTOR ACCEPTS → same CONFIRMED flow above
        └─ NO ELIGIBLE TUTORS in 15 minutes
              → Platform tutor backstop activated (Flow 8)
              OR student offered earliest available slot with notification
```

---

## Flow 3B — Scheduled Booking Flow

> Scenario: student wants to book a recurring or future-dated session.

```
STUDENT SELECTS TUTOR → taps "Book Session"
  ↓
  STUDENT SEES TUTOR AVAILABILITY CALENDAR (next 14 days)
    - Open slots shown in green; blocked in grey
    - Student's own school schedule overlaid (if timetable imported) — conflicts shown
    - System pre-highlights: "Based on your study plan, Wednesday 7 PM works best this week"
  ↓
  STUDENT SELECTS DATE + TIME SLOT
  ↓
  BOOKING OPTIONS:
    ├─ One-time session
    └─ Recurring weekly session (same slot every week — bundle booking)
          If recurring: discount display ("Save 5% on 4-session monthly bundle")
  ↓
  STUDENT CONFIRMS + PAYS
    - One-time: full payment authorized and held
    - Recurring: first session payment authorized; subsequent sessions authorized 24 hours before each
  ↓ [AUTO]
  Booking record created with status: PENDING_TUTOR_CONFIRMATION
  Tutor notified immediately
  ↓

TUTOR RESPONDS TO SCHEDULED BOOKING REQUEST {within 24 hours SLA}
  ├─ TUTOR CONFIRMS (most common — calendar is up to date)
  │     Status → CONFIRMED
  │     Both parties notified
  │     Slot locked in tutor calendar (cannot be double-booked)
  │     
  ├─ TUTOR PROPOSES ALTERNATIVE TIME {within 24 hours}
  │     System shows student the alternative slot
  │     Student accepts or declines (24-hour window)
  │     ├─ Student accepts → CONFIRMED
  │     └─ Student declines → booking cancelled; payment authorization released; no charge
  │
  └─ TUTOR DOES NOT RESPOND {> 24 hours}
        Booking auto-cancelled
        Payment authorization released
        Student notified: "Tutor was unavailable. Here are 3 alternatives with similar availability."
        Tutor's calendar compliance score decremented
```

---

## Flow 3C — AI-Recommended Booking Flow

> Scenario: student does not specify a tutor — requests "Find me the best tutor." This is the primary first-booking flow for new students who don't know which tutor to choose.

```
STUDENT TAPS "Find Me a Tutor" (on discovery screen or from mastery stall nudge)
  ↓
  STUDENT INPUTS (or system pre-fills from profile):
    - Subject: Mathematics
    - Focus chapter: Trigonometry (pre-filled from mastery map)
    - Schedule preference: "Weekday evenings after 6 PM"
    - Budget: "Up to INR 600/hr" (or "No preference")
  ↓ [AUTO — < 3 seconds]
  Ranking Engine runs full scoring for all eligible tutors
  Top 3 tutors selected
  System sends simultaneous "session enquiry" to all 3 tutors
  ↓

ALL 3 TUTORS RECEIVE ENQUIRY SIMULTANEOUSLY
  Notification: "A student needs help with Trigonometry (CBSE Class 10). 
                 [Weekday evenings after 6 PM]. Are you available? First to confirm gets the booking."
  Each tutor sees: subject, chapter, class, board, schedule window, approximate rate
  ↓

RACE CONDITION RESOLUTION:
  ├─ FIRST TUTOR CONFIRMS {within 30 minutes}
  │     System immediately assigns this tutor
  │     Other 2 tutors notified: "This session was filled"
  │     Assigned tutor's booking created → student notified
  │     Student sees: "We've matched you with [Tutor name]. 
  │                    Here's why: TPS 82, CBSE specialist, 
  │                    matches your Trigonometry gap perfectly."
  │     Student proceeds to confirm + pay → Flow 3B from CONFIRMED state
  │
  ├─ 2+ TUTORS CONFIRM simultaneously {within < 1 second of each other}
  │     System awards to higher-ranked tutor (Ranking Score as tiebreaker)
  │     Second tutor notified: "Session filled by another tutor. Next request is yours."
  │
  └─ NO TUTOR RESPONDS {> 30 minutes}
        Student notified: "We couldn't find an immediate match.
                           Here are 3 options you can book directly."
        Standard tutor cards shown → student picks manually
        OR platform tutor offered immediately if available (Flow 8)
```

> **⚙️ Design Decision — Race Condition Fairness (v2.0):**
>
> An alternative to "first-to-accept wins" is a **weighted lottery** among the top 3 tutors — each tutor is assigned a probability of winning based on their ranking score (e.g., Rank 1: 60%, Rank 2: 30%, Rank 3: 10%). Any tutor who confirms within the 30-minute window is entered into the lottery.
>
> **Why first-to-accept is kept for Phase 1:**
> - Simpler to build and explain to tutors
> - Creates healthy responsiveness incentive (quick responders earn more bookings)
> - Lottery fairness advantage is marginal when only 3 tutors compete per request
>
> **Fairness mitigation added:** Any tutor who was the top-ranked candidate and lost a race condition receives a "priority next" flag. For the next 5 AI-Recommended requests where this tutor is in the eligible pool, they are notified 60 seconds before the other 2 tutors (a head-start, not a guarantee). This is not disclosed to students — they continue to see "first to confirm gets the session."
>
> **Phase 3 revisit:** At 8,000+ tutors, the race condition fairness concern grows. Evaluate weighted lottery at Phase 3 scale — especially if tutor churn analysis shows top-ranked tutors dominating AI-Recommended wins disproportionately.

---

## Flow 4 — Session Lifecycle (Pre → During → Post)

```
═══════════════════════════════════════════
PRE-SESSION (T-60 min to T-0)
═══════════════════════════════════════════

T-60 min: [AUTO]
  Student receives push notification + WhatsApp: "Your session with [Tutor] starts in 1 hour."
  Link to virtual classroom included
  Student prompted: "Any specific topics you want to cover?" (optional text input)

T-30 min: [AUTO]
  Tutor receives push notification: "Session in 30 minutes."
  Tutor Student Intelligence Card is auto-generated and displayed:
    ├─ Student's mastery scores (all concepts in session subject)
    ├─ Top 3 chapters with lowest Mastery Score
    ├─ Error type distribution (last 30 days): Conceptual X% / Procedural X% / Careless X%
    ├─ Last 5 AskAI doubts raised by student (topic + concept)
    ├─ Previous session notes (if any prior sessions exist)
    ├─ Recommended session focus: "Chapter 8, Trigonometry — discriminant applications 
    │   (student has 60% Conceptual errors here; 3 AskAI doubts on same topic this week)"
    └─ Student's upcoming exam dates (if entered in academic planner)

T-5 min: [AUTO]
  Both parties receive "Session starting in 5 minutes" alert
  Classroom link becomes active

═══════════════════════════════════════════
SESSION START (T=0)
═══════════════════════════════════════════

STUDENT JOINS CLASSROOM
  ↓ [AUTO — technical verification begins immediately]
  System records: join time, audio presence, video presence
  Recording starts automatically — cannot be disabled by either party
  "Recording in progress" indicator shown prominently to both parties
  ↓

TUTOR JOINS CLASSROOM {within 5 minutes SLA}
  ↓
  ├─ TUTOR JOINS within 5 minutes → session proceeds normally
  │
  └─ TUTOR DOES NOT JOIN {> 5 minutes}
        Student sees: "Your tutor is slightly delayed — if they don't join in 
                       10 minutes, you won't be charged and we'll find an alternative."
        Marketplace Ops alerted at T+5 min [AUTO]
        ↓
        ├─ TUTOR JOINS at T+6 to T+10 → session proceeds; late join flagged in TPS
        └─ TUTOR STILL ABSENT at T+10 → TUTOR NO-SHOW protocol
              Student: 100% refund; alternative session offered
              Tutor: 0 payment; strike recorded; TPS Session Completion score decremented
              Marketplace Ops: [HUMAN] contacts tutor within 30 min

═══════════════════════════════════════════
DURING SESSION
═══════════════════════════════════════════

CONTINUOUS [AUTO — every 60 seconds]:
  System monitors:
    ├─ Video feed presence (both parties) — binary flag per minute
    ├─ Audio activity (both parties) — binary flag per minute
    └─ Whiteboard activity (any input) — binary flag per minute
  
  Anomaly detection:
    ├─ ONE party's video/audio drops for > 3 consecutive minutes
    │     → In-app alert to both: "Connection issue detected. 
    │       Session continues if reconnection within 10 minutes."
    ├─ BOTH parties' presence drops simultaneously for > 2 minutes
    │     → Session flagged as POSSIBLE_EARLY_END; monitoring continues
    └─ NLP moderation running on any in-session text chat:
          Contact info detected → message quarantined; both parties warned
          Grooming signal detected → session flagged for immediate Trust & Safety review

═══════════════════════════════════════════
SESSION END
═══════════════════════════════════════════

SESSION ENDS (either party clicks "End Session" or scheduled time expires)
  ↓ [AUTO — within 30 seconds]
  System computes Session Verification result:
    ✅ VERIFIED COMPLETE if:
      - Classroom live ≥ 85% of booked duration
      - Both parties present (video/audio) ≥ 75% of session
      - Recording file exists; duration ≥ 80% of booked time
      - No pre-session cancellation filed
    ⚠️ DISPUTED COMPLETION if any condition fails → go to Flow 6A
  ↓

POST-SESSION ACTIONS [AUTO — within 10 minutes of session end]:

  FOR STUDENT:
    ├─ Session rating prompt: 1–5 stars + optional text comment
    │     Appears after 2-hour delay (not immediately — reduces tutor pressure)
    ├─ "View session recording" link (available within 2 hours)
    └─ Homework/notes from tutor (if tutor submitted — see below)

  FOR TUTOR:
    ├─ Post-session form (must complete to trigger payment):
    │     (1) Session objective: achieved / partially / not achieved
    │     (2) Notes for student (text, max 500 chars) — visible to student + parent
    │     (3) Homework assigned: Y/N + description (if yes)
    │     (4) Recommended next topic
    │     (5) Any concerns to flag (optional — private to platform)
    └─ Earnings update: session fee appears as "Pending" in earnings dashboard

  FOR PARENT [AUTO — within 2 hours]:
    ├─ Push notification: "Aryan's session with [Tutor] has completed."
    ├─ Session summary in Parent App (plain language):
    │     - Duration, attendance, tutor name/badge
    │     - Session objective + notes (from tutor's post-session form)
    │     - Homework assigned
    │     - Safety summary: "No concerns detected" or "[Review requested]"
    └─ Session recording available (one-tap access)

  PAYMENT TRIGGER [AUTO — 2 hours after session end, if no dispute filed]:
    ↓ → go to Flow 5 (Payment & Escrow)

  MASTERY SCORE UPDATE [AUTO — within 24 hours]:
    System computes updated Mastery Score for concepts covered in session
    Input: tutor's "objective achieved" flag + any practice completed post-session
    Updated scores visible to student and parent
```

---

## Flow 5 — Payment & Escrow Flow

```
═══════════════════════════════════════════
SESSION BOOKING (T = booking time)
═══════════════════════════════════════════

STUDENT CONFIRMS BOOKING
  ↓
  Payment authorization request sent to Razorpay
  Student selects: UPI / Credit Card / Debit Card / Net Banking / Razorpay Wallet
  ↓
  Razorpay authorizes payment
  Funds moved to Razorpay-managed nodal account (NOT to EduReach operating account)
  Booking record updated: payment_status = AUTHORIZED; payment_held = true
  Student receives booking confirmation + payment receipt (GST invoice)

═══════════════════════════════════════════
POST-SESSION WINDOW (T = session end to T+2 hours)
═══════════════════════════════════════════

  ├─ STUDENT / PARENT FILES DISPUTE {within 2 hours}
  │     payment_status → DISPUTE_PENDING
  │     Funds remain in nodal account
  │     → go to Flow 6A, 6B, or 6C depending on dispute type
  │
  └─ NO DISPUTE FILED {2 hours pass}
        [AUTO] Payment release trigger fires
        ↓

═══════════════════════════════════════════
PAYMENT RELEASE (if no dispute)
═══════════════════════════════════════════

  [AUTO] Platform computes tutor payout:
    Gross session fee
    minus commission (13% Platinum / 15% Gold / 18% Silver / 20% Bronze)
    minus TDS (Section 194J, 10%, applied on gross above INR 30,000/year threshold)
    = Net payout amount

  Payout status → CLEARED (added to tutor's weekly payout batch)
  Tutor earnings dashboard updated: session moves from "Pending" to "Cleared"

  Weekly payout batch [AUTO — every Monday at 9 AM IST]:
    All "Cleared" sessions from the past 7 days
    Razorpay Route batch transfer → tutor's registered bank account
    Tutor receives payout notification with itemised breakdown
    TDS certificate generated quarterly

═══════════════════════════════════════════
SUBSCRIPTION PAYMENT (separate flow)
═══════════════════════════════════════════

STUDENT/PARENT SUBSCRIBES (Core / Plus / Pro)
  ↓
  Razorpay subscription created (recurring mandate — student/parent authorizes once)
  First charge: immediate
  Auto-renewal: same date monthly
  7-day advance renewal reminder: push + email + WhatsApp, showing:
    - Renewal amount
    - Renewal date
    - "Cancel anytime" link (one tap; no confirmation maze)
  
  If payment fails (insufficient funds / card expired):
    Day 0: notification to parent; retry in 24 hours
    Day 1: retry; second notification
    Day 3: retry; access downgraded to Free tier with data preserved
    Day 7: final retry; subscription lapses; student moved to Free tier
    All content access and data preserved (no deletion)
```

---

## Flow 6A — Dispute Flow: Duration / Technical Issue

> Fastest resolution path. Session analytics are definitive; most resolutions are automated.

```
STUDENT / PARENT TAPS "Report an Issue" {within 2 hours of session end}
  ↓
  Selects dispute reason: DURATION or TECHNICAL
  Optional description (500 chars)
  ↓ [AUTO — within 5 minutes]
  Case ID generated; acknowledgment sent to both student/parent and tutor
  Funds remain held in nodal account
  ↓ [AUTO — within 30 minutes]
  Evidence package assembled:
    - Session recording (with duration metadata)
    - Classroom analytics: presence data per minute, video/audio activity log
    - Tutor's post-session form submission (if filed)
    - Platform technical log (if any errors recorded)
  ↓

DURATION DISPUTE:
  [AUTO] System compares claimed vs. actual session duration from classroom analytics
  ├─ Analytics confirm short session (< agreed duration) and tutor was absent/left early:
  │     Refund calculated per partial refund rules (PRD Section 12A.3)
  │     [AUTO] Refund processed; tutor payment adjusted
  │     Both parties notified with outcome + rationale {< 2 hours total}
  │
  └─ Analytics confirm full session delivered:
        [AUTO] No refund; tutor paid in full
        Both parties notified {< 2 hours total}

TECHNICAL DISPUTE (platform fault):
  [AUTO] System checks platform technical log for that session time window
  ├─ Platform error confirmed (server failure, classroom crash attributable to EduReach):
  │     100% refund to student
  │     50% goodwill payment to tutor (platform absorbs the cost)
  │     [AUTO] Both resolved {< 2 hours}
  │
  └─ No platform error found; issue appears to be student/tutor connection:
        [HUMAN] Dispute Resolution team reviews within 4 hours
        Decision communicated with reasoning

APPEAL (one per party per 90-day period):
  Either party can appeal within 48 hours of decision
  Senior Trust & Safety member reviews {within 24 hours}
  Final decision is binding
```

---

## Flow 6B — Dispute Flow: Quality Complaint

```
STUDENT / PARENT TAPS "Report an Issue"
  Selects: QUALITY
  Optional description: "Tutor didn't follow what I asked for / explained incorrectly / session was unhelpful"
  ↓ [AUTO — within 5 minutes]
  Case ID generated; funds held
  Tutor notified of quality complaint (reason given; student name withheld if minor)
  ↓ [AUTO — within 30 minutes]
  Evidence package assembled:
    - Full session recording
    - Classroom analytics (presence, duration)
    - Tutor's Student Intelligence Card that was shown pre-session
    - Tutor's post-session form
    - Student's mastery scores before and after session (to detect outcome impact)
    - Tutor's TPS history and prior quality complaints
  ↓ [HUMAN — Trust & Safety reviewer] {within 2 hours of evidence assembly}
  
  Reviewer watches:
    - First 10 minutes of recording (how did tutor open? Did they reference student's weak areas?)
    - Last 10 minutes (was session concluded professionally? homework assigned?)
    - 2–3 random middle segments (check for engagement, pacing, accuracy)
  ↓

  OUTCOME OPTIONS:

  A. Tutor clearly at fault (didn't use student card; taught wrong topic; left early):
      Full or partial refund to student (per PRD Section 12A.3 duration rules)
      Tutor TPS quality penalty applied
      Written warning issued to tutor
      Outcome communicated to both parties {< 24 hours from complaint}

  B. Quality is subjective (style mismatch, preference issue, tutor did teach but student didn't engage):
      No refund
      Student offered: "Book a free 20-min demo with a different tutor — our recommendation"
      Tutor: no penalty; feedback note added to profile internally
      Outcome communicated {< 24 hours}

  C. Disputed — cannot determine from recording alone:
      Both parties asked for additional information (written statements, 48-hour window)
      Final decision at reviewer's discretion; outcome communicated within 24 hours of final input
      Either party may appeal once (→ senior reviewer)
```

---

## Flow 6C — Dispute Flow: Conduct / Child Safety

> Highest-priority flow. Any child safety complaint supersedes all other operations.

```
PARENT / STUDENT REPORTS CONDUCT CONCERN
  Method: 
    ├─ In-app: "Report a safety concern" (separate from quality dispute)
    ├─ Parent App: "I have a concern about this session"
    └─ Direct email to safety@edureach.in (monitored 24/7)
  ↓ [HUMAN — Trust & Safety on-call, within 1 hour at any hour]

IMMEDIATE ACTIONS (within 1 hour of report):
  ├─ Tutor account: SUSPENDED (no new bookings; in-progress sessions cannot be initiated)
  ├─ All funds involving this tutor: FROZEN
  ├─ Session recording preserved with elevated retention flag (2-year hold)
  ├─ Student and parent contacted by phone (not just notification) within 1 hour
  └─ Case escalated to Head of Trust & Safety immediately

INCIDENT LEVEL CLASSIFICATION:
  
  LEVEL 1 — Conduct / Professional Misconduct
    (rude, unprofessional, ignoring guidelines; no child safety element)
    ├─ Trust & Safety reviews recording fully {within 24 hours}
    ├─ Decision: warning / suspension / removal based on severity
    └─ Tutor notified; student/parent given outcome {within 48 hours}
  
  LEVEL 2 — Harassment / Grooming Attempt
    (attempted contact info exchange, inappropriate personal questions, 
     boundary violations, requests to meet offline)
    ├─ Full recording reviewed {within 4 hours}
    ├─ Parent call (not just notification) within 2 hours
    ├─ Internal investigation with full chat history + session history review
    ├─ Police complaint recommended to parent (not filed by platform; parent's choice)
    ├─ Tutor removed from platform permanently
    └─ All affected students notified of tutor removal (without details)
  
  LEVEL 3 — CSAM / Sexual Exploitation
    ├─ IMMEDIATE: session recording preserved; CSAM detection triggered {< 1 hour}
    ├─ Tutor account terminated immediately — no reinstatement possible
    ├─ Mandatory report to NCPCR and local police within 24 hours (IT Act + POCSO obligation)
    ├─ Legal team engaged immediately
    ├─ Student and family receive dedicated case handler (named person, direct phone)
    └─ Platform-wide audit of tutor's complete session history

CASE CLOSURE:
  Written outcome to parent with: timeline of events, actions taken, outcome
  Any refund owed to student/parent processed within 24 hours of case closure
  Case documentation retained for 7 years (legal hold)
```

---

## Flow 7 — Surge Demand Handling

> Triggered when: session booking requests > available tutor capacity in any segment for a 30-minute window.

```
SURGE DETECTION [AUTO — monitored every 5 minutes by Marketplace Ops dashboard]
  Trigger condition: Supply-demand ratio < 1.3x in any segment for 2 consecutive 5-min windows
  ↓ [AUTO — within 5 minutes of trigger]
  Slack alert to Marketplace Ops on-call: 
    "SURGE DETECTED: CBSE Class 10 Mathematics, Delhi NCR. 
     Supply/demand: 1.1x. 12 open booking requests. 4 available tutors."
  ↓

RESPONSE TIER 1 — Tutor-Side Supply Boost [AUTO]:
  All tutors teaching the surge subject who are currently "Available" but not "Available Now":
    → Receive push: "High demand for [Subject] right now. 
                     Open your availability for the next 2 hours and earn 10% more 
                     (your commission drops from 20% to 10% for sessions booked in next 2 hours)."
  Tutors in the surge window who are between sessions (free for > 30 min):
    → Same notification
  ↓

RESPONSE TIER 2 — Platform Tutor Reallocation [HUMAN + AUTO]:
  Marketplace Ops reviews platform-hired tutor schedule
  Any platform tutor with a gap in the surge window is offered an additional session
  Platform tutor backstop activated for the segment (Flow 8)
  ↓

RESPONSE TIER 3 — Student-Side Demand Management [AUTO]:
  Students in the surge segment who are searching for instant sessions:
    → See: "High demand right now — tutors filling fast. Book in the next 
             20 minutes to secure your slot."
  Students who cannot be matched immediately:
    → Offered waitlist: "Add to waitlist — we'll confirm your session within 60 minutes."
    → Waitlist position shown; ETA shown
  ↓

RESPONSE TIER 4 — AskAI Buffer [AUTO — board exam season surge only]:
  During extreme surge (fill rate < 70% for > 30 min, board exam period):
    AskAI confidence escalation threshold raised: < 75% (not the standard < 85%)
    Frees human tutor capacity from escalation queue
    Students in escalation queue notified: "High demand on tutors today. 
                                            We'll get to your question within 3 hours."
  ↓

SURGE RESOLVED when: Supply-demand ratio returns to > 1.5x for 2 consecutive 5-min windows
  Marketplace Ops receives "Surge cleared" notification
  Commission reduction reverted for new bookings (in-progress sessions keep the reduced commission)
```

---

## Flow 8 — Platform Tutor Backstop Activation

> Triggered when marketplace matching fails (no marketplace tutor available within SLA).

```
TRIGGER CONDITIONS (any of the following):
  ├─ Instant booking: no marketplace tutor accepts within 15 minutes
  ├─ AI-Recommended: no marketplace tutor responds within 30 minutes
  ├─ Segment MVD below threshold (< 3 available tutors in peak window)
  └─ Surge Tier 2 activated (Flow 7)
  ↓ [AUTO — within 2 minutes of trigger]

PLATFORM TUTOR AVAILABILITY CHECK:
  System queries platform-hired tutor roster for:
    - Board + Class + Subject match
    - Available within student's stated window
    - Not currently in session or within 15-min buffer
  ↓
  ├─ PLATFORM TUTOR AVAILABLE:
  │     Platform tutor assigned automatically (no request/confirm race — guaranteed availability)
  │     Student notified: "We've matched you with one of our staff educators — [Name]. 
  │                         Same quality guarantee."
  │     Session booked at platform-set rate (included in Plus/Pro; or marketplace rate for Free/Core)
  │     → go to Flow 4 (Session Lifecycle)
  │
  └─ NO PLATFORM TUTOR AVAILABLE:
        Student notified: "All tutors are busy right now. 
                            We'll send you 3 options as soon as a tutor becomes available — 
                            usually within 60 minutes."
        Student added to priority queue
        Next available tutor (marketplace or platform) matched automatically
        Student receives notification when match is confirmed
```

---

## Flow 9 — Tutor Cancellation & Student Recovery

> Covers both advance cancellations (> 4 hours) and last-minute cancellations (< 4 hours).

```
TUTOR INITIATES CANCELLATION
  ↓
  System checks: time until session start
  ↓
  ├─ ADVANCE CANCELLATION (> 4 hours before session):
  │     Cancellation accepted without penalty (up to 2/month)
  │     If > 2 cancellations in 30 days: TPS Session Completion score decremented
  │     Student refund: full, immediate authorization release
  │     Student notified: "Your session has been cancelled. Would you like to:
  │                         (A) Book a new session with [same tutor] at another time
  │                         (B) See other available tutors"
  │     Student Intelligence Card retained for next booking (no data loss)
  │
  └─ LAST-MINUTE CANCELLATION (< 4 hours before session):
        ↓
        EMERGENCY SUBSTITUTE PROTOCOL [AUTO — within 5 minutes]:
          System searches for substitute tutor:
            Same board + class + subject
            Available within 30 minutes of original session start
            TPS ≥ 70 (Gold or Platinum) — quality maintained
          ↓
          ├─ SUBSTITUTE FOUND:
          │     Student notified: "Your original tutor had an emergency. 
          │                         We've found [Substitute Name] (Gold Tutor) to replace them.
          │                         Same time, no extra charge."
          │     Original tutor: TPS Session Completion score decremented; 
          │                      3rd last-minute cancellation in 90 days → suspension review
          │     Student: no charge change; seamless continuation
          │     Substitute tutor receives: Student Intelligence Card (auto-generated)
          │
          └─ NO SUBSTITUTE AVAILABLE:
                Student: 100% refund + INR 100 platform credit (goodwill)
                Student offered: earliest available slot (within 24 hours)
                Marketplace Ops notified: last-minute no-cover incident logged
                Original tutor: TPS decremented; formal warning issued
```

---

## Flow 10 — Anti-Disintermediation Detection

> Continuous background process. Detects attempts to move student-tutor interactions off platform.

```
═══════════════════════════════════════════
REAL-TIME MONITORING (runs on every message sent via in-app chat)
═══════════════════════════════════════════

IN-APP MESSAGE SENT (by either party)
  ↓ [AUTO — NLP pipeline, < 200ms]
  Message scanned for:
    ├─ Phone number patterns (Indian mobile: 10-digit starting 6–9; with/without country code)
    ├─ Email address patterns (standard regex)
    ├─ Social media usernames (@handle patterns; common platform name mentions)
    ├─ UPI ID patterns (name@upi, name@okaxis, etc.)
    └─ Indirect contact solicitation ("my WhatsApp", "message me on", "find me on")
  ↓
  ├─ NO MATCH → message delivered normally
  │
  └─ MATCH DETECTED:
        Message quarantined (not delivered to recipient)
        Sender receives: "This message was blocked. EduReach does not allow 
                          sharing contact information to protect student safety."
        [AUTO] Strike logged against sender's account
        [AUTO] Trust & Safety Slack alert: "Contact info attempt — [account type, date, 
                                            subject match] — reviewing."
        ↓
        Reviewer checks context {within 2 hours}:
          ├─ Legitimate context (e.g., reference to a textbook's website) → message released
          └─ Confirmed contact solicitation:
                FIRST OFFENCE: formal warning email to tutor/student; strike recorded
                SECOND OFFENCE: 7-day session suspension; warning escalated
                THIRD OFFENCE: permanent removal from platform
                                All affected student accounts reviewed

═══════════════════════════════════════════
WEEKLY ANOMALY DETECTION (batch job, every Sunday midnight)
═══════════════════════════════════════════

Signals computed for each tutor:
  ├─ Off-platform detection signal:
  │     High session ratings from student + no rebooking on platform
  │     (Possible sign: moved to WhatsApp tutoring; still rating on EduReach)
  ├─ Earnings anomaly:
  │     Tutor has high TPS score but declining session volume (possible off-platform migration)
  └─ Booking pattern anomaly:
        Regular weekly sessions suddenly stop; student account still active

Threshold: ≥ 2 signals triggered for same tutor → [HUMAN] Marketplace Ops review
Action after confirmed off-platform:
  Tutor: permanent removal
  Student: proactive outreach ("we noticed you haven't had a session in a while — 
            here are 3 tutors matching your profile")
  Refund audit: check if student paid any sessions outside platform (no refund possible, 
                but evidence documented)
```

---

## Flows Cross-Reference to Operations Teams

| Flow | Primary Team | On-Call? | Dashboard Reference |
|---|---|---|---|
| 1–3 (Booking) | Marketplace Ops | No | Marketplace Ops Dashboard (Section 13A.2) |
| 4 (Session Lifecycle) | Engineering (automated) | Standby | AI System Health Dashboard (Section 13A.5) |
| 5 (Payment) | Finance Ops | No | Business Metrics Dashboard |
| 6A (Duration/Technical) | Dispute Resolution | No | Dispute workflow tool |
| 6B (Quality) | Trust & Safety | No | Dispute workflow tool |
| 6C (Child Safety) | Trust & Safety | **Yes — 24/7** | Child Safety Dashboard (Section 13A) |
| 7 (Surge) | Marketplace Ops | **Yes — peak hours** | Marketplace Ops Dashboard (real-time) |
| 8 (Backstop) | Marketplace Ops | **Yes — peak hours** | Marketplace Ops Dashboard |
| 9 (Cancellation) | Student Success + Marketplace Ops | No | Session cancellation report |
| 10 (Anti-Disintermediation) | Trust & Safety | No | Weekly anomaly report |

---

## State Machine: Booking Record

```
All bookings are tracked with a booking_status field. 
Valid transitions shown below:

CREATED ──────────────────────────────────────────→ EXPIRED (payment not completed in 10 min)
    │
    ↓ (payment authorized)
PAYMENT_HELD
    │
    ├─ Tutor accepts → CONFIRMED
    │                      │
    │                      ├─ Session happens → COMPLETED
    │                      │                       │
    │                      │                       ├─ No dispute → PAYMENT_RELEASED
    │                      │                       └─ Dispute filed → DISPUTE_PENDING
    │                      │                                              │
    │                      │                                              ├─ Resolved → PAYMENT_RELEASED (full/partial)
    │                      │                                              └─ Refunded → REFUNDED
    │                      │
    │                      └─ Session cancelled by tutor → TUTOR_CANCELLED
    │                                                          │
    │                                                          ├─ Substitute found → CONFIRMED (new tutor)
    │                                                          └─ No substitute → REFUNDED
    │
    └─ Tutor rejects / no response within SLA → AUTO_CANCELLED → REFUNDED
```

---

## State Machine: Tutor Account

```
APPLICANT → (documents verified + subject test passed + demo passed + Academy complete)
    ↓
ACTIVE [Bronze]
    ↓ (TPS improves)
ACTIVE [Silver] → ACTIVE [Gold] → ACTIVE [Platinum]
    ↓ (TPS drops or gaming detected)
ACTIVE [Bronze]
    ↓ (TPS < 40 for 4 weeks)
UNDER_REVIEW
    ├─ Resolved → ACTIVE (Bronze)
    └─ Unresolved / confirmed violation → SUSPENDED
                                              │
                                              ├─ Temporary (30 days) → ACTIVE (Bronze)
                                              └─ Permanent → REMOVED
```

---

*EduReach India — Marketplace Flow Architecture v2.0 | March 2026 | CONFIDENTIAL*  
*Companion to PRD v7.0 and User Journey Maps v2.0. Supersedes Marketplace Flow Architecture v1.0.*  
*Audience: Engineering, Product Management, UX Design, Marketplace Operations, Trust & Safety.*  
*Next review: post-Phase 1 launch (Month 7) — update with real session volume data and edge cases.*

---

## Appendix A — Service Boundary Overview (v2.0)

> This appendix gives engineering the service decomposition needed to start system design. It is not a full microservices specification — that belongs in the engineering wiki. It shows service responsibilities and the key API contracts between them.

```
SERVICE MAP — EDUREACH MARKETPLACE

┌─────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY (Kong)                             │
│  Routes: /student, /tutor, /parent, /admin, /internal                  │
│  Auth: JWT validation + rate limiting                                   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
       ┌───────────────────────┼────────────────────────────┐
       ↓                       ↓                            ↓
┌────────────────┐   ┌─────────────────────┐   ┌──────────────────────┐
│  USER SERVICE  │   │  LEARNING SERVICE   │   │  MARKETPLACE SERVICE │
│                │   │                     │   │                      │
│  - Auth/OTP    │   │  - Mastery engine   │   │  - Booking CRUD      │
│  - Profiles    │   │  - Diagnostic       │   │  - Matching/ranking  │
│  - Consent     │   │  - Learning path    │   │  - Availability mgmt │
│  - Multi-role  │   │  - Spaced rep       │   │  - Surge detection   │
│                │   │  - ERS computation  │   │  - Fill rate monitor │
│  DB: PostgreSQL│   │  DB: PostgreSQL     │   │  DB: PostgreSQL      │
│                │   │  Cache: Redis       │   │  Index: Elasticsearch│
└────────────────┘   └─────────────────────┘   └──────────────────────┘
       │                       │                            │
       └───────────────────────┼────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         KAFKA EVENT BUS                                 │
│  Topics: learning_events, session_events, payment_events, safety_events │
└──────────┬──────────────────┬────────────────────┬────────────────────┬─┘
           ↓                  ↓                    ↓                    ↓
┌──────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐
│  ASKASAI SERVICE │ │ PAYMENT SERVICE │ │ SAFETY SERVICE  │ │CONTENT SERVICE │
│                  │ │                 │ │                 │ │                │
│  - LLM router    │ │ - Razorpay Route│ │ - NLP moderation│ │ - Video/PDF CDN│
│  - Symbolic solve│ │ - Escrow logic  │ │ - Session record│ │ - Offline packs│
│  - Confidence    │ │ - TDS/GST calc  │ │ - CSAM detection│ │ - Content index│
│  - OCR/LaTeX     │ │ - Payout batch  │ │ - Incident mgmt │ │                │
│  - Input moderat.│ │ - Dispute resol.│ │ - Admin console │ │ DB: S3+CloudFr.│
│                  │ │                 │ │                 │ │                │
│  External: LLM   │ │ External:       │ │ External: AWS   │ │ External: Agora│
│  API, SymPy,     │ │ Razorpay        │ │ Rekognition,    │ │ / 100ms        │
│  WolframAlpha    │ │                 │ │ PhotoDNA        │ │                │
└──────────────────┘ └─────────────────┘ └─────────────────┘ └────────────────┘
           │                  │                    │                    
           └──────────────────┼────────────────────┘                    
                              ↓
                   ┌─────────────────────┐
                   │   DATA PIPELINE     │
                   │                     │
                   │  - Feature store    │
                   │    (Redis + PG ph1) │
                   │  - dbt transforms   │
                   │  - Airflow batch    │
                   │  - ML training data │
                   │                     │
                   │  DB: S3 (raw),      │
                   │  PostgreSQL (feats) │
                   └─────────────────────┘
```

**Key API contracts (minimum viable):**

| Consumer | Provider | Contract | Notes |
|---|---|---|---|
| Marketplace Service | Learning Service | `GET /student/{id}/mastery-map` | Used for tutor ranking; returns concept-level scores |
| AskAI Service | Learning Service | `POST /learning/askai-context` | Student's mastery + doubt history for personalised answers |
| Payment Service | Marketplace Service | `POST /bookings/{id}/verify` | Session verification result before payout trigger |
| Safety Service | All services | `POST /safety/flag` | Any service can flag a safety event; Safety Service routes |
| Marketplace Service | User Service | `GET /tutor/{id}/availability` | Real-time availability state for matching |
| Data Pipeline | All services | Kafka subscription | All services emit events; pipeline consumes for feature computation |

**Phase 1 deployment note:** Phase 1 can deploy these as separate Django/FastAPI apps within a monorepo — true microservice separation (separate deployments, separate DBs) is not required until Phase 2 MAU exceeds 50k. The service boundary map above defines the *logical* separation, which must be respected from Day 1 even if physical deployment is monolithic. This prevents the coupling that makes microservice extraction painful later.
```
