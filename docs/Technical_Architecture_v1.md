# EduReach India — Technical Architecture
### Companion Artefact to PRD v7.0
**Version:** 1.0 | **Date:** March 2026 | **Status:** CONFIDENTIAL  
**Audience:** Engineering (Backend, Frontend, Data, ML, DevOps), Technical Leadership  
**Purpose:** Core data model (entity schemas and relationships) and scalability architecture (service boundaries, microservice decomposition, data pipeline, ML training pipeline). These answer *how the system is built* — the PRD answers *what it must do*.

---

## How to Read This Document

This document has two parts:

**Part A — Data Model Architecture:** Core entity definitions, field-level schemas, key relationships, and indexing strategy. This is the authoritative reference for database design. Not every field is listed — the goal is to define the shape and relationships, not to write DDL.

**Part B — Scalability Architecture:** Service boundaries, microservice decomposition, data pipeline architecture, and ML model training pipeline across three scaling phases.

---
---

# PART A — DATA MODEL ARCHITECTURE

---

## A.1 Entity Overview

```
CORE ENTITIES AND RELATIONSHIPS

users (parent table)
  ├─── students (has profile, board, class)
  ├─── parents (linked to students)
  └─── tutors (has profile, TPS, subjects)

content
  ├─── concepts (atomic learning unit)
  ├─── content_objects (video/note/question)
  └─── concept_tags (links content to concepts)

learning
  ├─── mastery_scores (student × concept)
  ├─── practice_attempts (student × question)
  ├─── askai_queries (student × query)
  └─── study_sessions (daily aggregation)

marketplace
  ├─── bookings (student + tutor + time)
  ├─── sessions (completed booking)
  ├─── reviews (student → tutor)
  └─── payments (booking × amount × status)

trust_and_safety
  ├─── safety_flags (any user × incident type)
  ├─── disputes (booking × reason)
  └─── moderation_events (message/photo flagged)
```

---

## A.2 Users Domain

### Table: `users`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key; surrogate key for all user types |
| phone_number | VARCHAR(15) | Unique; OTP-verified; primary identity |
| role | ENUM | `student`, `parent`, `tutor`, `admin` |
| created_at | TIMESTAMP | UTC |
| last_active_at | TIMESTAMP | Updated on each app open |
| account_status | ENUM | `active`, `suspended`, `under_review`, `removed` |
| device_fingerprint | VARCHAR(64) | Hashed; used for fraud detection (Section 11F) |
| aadhaar_verified | BOOLEAN | Tutors only; set by IDfy API |

### Table: `students`

| Column | Type | Notes |
|---|---|---|
| id | UUID | FK → users.id |
| display_name | VARCHAR(100) | First name only; never full name in any tutor-facing surface |
| board | ENUM | `CBSE`, `ICSE`, `Maharashtra`, `UP_Board`, etc. |
| class_year | SMALLINT | 6–12 |
| target_exam_score | SMALLINT | Self-reported goal percentage |
| subscription_tier | ENUM | `free`, `core`, `plus`, `pro` |
| subscription_expires_at | TIMESTAMP | NULL for free tier |
| parent_id | UUID | FK → parents.id; NULL if not linked |
| consent_given_at | TIMESTAMP | DPDP Act compliance; mandatory for minors |
| consent_given_by | UUID | FK → parents.id for minors; students.id for 18+ |
| onboarding_completed | BOOLEAN | True after diagnostic completion |
| is_minor | BOOLEAN | Computed: class_year ≤ 12 OR explicit flag |

### Table: `parents`

| Column | Type | Notes |
|---|---|---|
| id | UUID | FK → users.id |
| display_name | VARCHAR(100) | |
| relationship_to_student | ENUM | `mother`, `father`, `guardian` |
| whatsapp_opt_in | BOOLEAN | Separate consent for WhatsApp messages |
| report_frequency | ENUM | `daily`, `weekly` (default weekly) |

### Table: `tutors`

| Column | Type | Notes |
|---|---|---|
| id | UUID | FK → users.id |
| display_name | VARCHAR(150) | Full name; public-facing |
| tutor_type | ENUM | `marketplace`, `platform_hired` |
| account_status | ENUM | `applicant`, `onboarding`, `active`, `suspended`, `removed` |
| tps_score | DECIMAL(5,2) | Current TPS; recomputed weekly |
| tps_tier | ENUM | `platinum`, `gold`, `silver`, `bronze`, `under_review` |
| commission_rate | DECIMAL(4,3) | Derived from tps_tier; e.g., 0.15 for Gold |
| new_tutor_sessions_remaining | SMALLINT | Commission holiday counter (starts at 5, decrements per session) |
| hourly_rate_min | INTEGER | INR |
| hourly_rate_max | INTEGER | INR; allows range display on profile |
| intro_video_url | VARCHAR(512) | S3 URL; CDN-served |
| child_safety_policy_signed_at | TIMESTAMP | Mandatory; NULL = cannot go live |
| academy_completed_at | TIMESTAMP | NULL = Academy not complete; gate for going live |
| background_check_status | ENUM | `pending`, `passed`, `failed` |
| pan_number | VARCHAR(10) | Encrypted at rest; required for TDS compliance |
| bank_account_verified | BOOLEAN | Razorpay verification |
| gstin | VARCHAR(15) | Optional; required if annual earnings > INR 20L |
| cumulative_financial_year_earnings | INTEGER | INR; reset 1 April each year; for TDS threshold tracking |

---

## A.3 Content Domain

### Table: `concepts`

| Column | Type | Notes |
|---|---|---|
| id | UUID | |
| name | VARCHAR(200) | e.g., "Discriminant applications in Quadratic Equations" |
| board | ENUM | |
| class_year | SMALLINT | |
| subject | VARCHAR(100) | |
| chapter_id | UUID | FK → chapters.id |
| prerequisite_concept_ids | UUID[] | Array of FKs; forms concept dependency graph |
| board_exam_weight | DECIMAL(4,3) | Fraction of marks this concept contributes in typical board paper |
| difficulty_calibrated | DECIMAL(4,3) | 0.0–1.0; updated as practice data accumulates |
| created_at | TIMESTAMP | |
| last_updated_at | TIMESTAMP | Triggers review if > 365 days without syllabus update |

### Table: `content_objects`

| Column | Type | Notes |
|---|---|---|
| id | UUID | |
| type | ENUM | `video`, `notes_pdf`, `practice_question`, `mock_test` |
| concept_id | UUID | FK → concepts.id |
| board | ENUM | |
| class_year | SMALLINT | |
| s3_url | VARCHAR(512) | Encrypted; signed URLs for delivery |
| duration_seconds | INTEGER | Video only; NULL for others |
| difficulty_level | ENUM | `easy`, `medium`, `hard`, `board_authentic` |
| production_status | ENUM | `draft`, `sme_review`, `qc_passed`, `live`, `deprecated` |
| accuracy_last_audited_at | TIMESTAMP | Must be < 365 days for `live` status |
| syllabus_version | VARCHAR(20) | e.g., "CBSE-2024-25"; updated on board circular |

### Table: `mastery_scores`

> Central to the learning science model. Updated after every practice attempt and after every tutoring session.

| Column | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → students.id |
| concept_id | UUID | FK → concepts.id |
| score | DECIMAL(5,2) | 0.00–100.00 |
| accuracy_component | DECIMAL(4,3) | Sub-score input |
| time_efficiency_component | DECIMAL(4,3) | Sub-score input |
| difficulty_progression_component | DECIMAL(4,3) | Sub-score input |
| spaced_repetition_component | DECIMAL(4,3) | Sub-score input |
| tutor_feedback_component | DECIMAL(4,3) | Sub-score input; 0.5 default if no tutor session |
| last_practice_at | TIMESTAMP | For spaced repetition scheduling |
| next_review_due_at | TIMESTAMP | SM-2 computed; NULL if Retained status |
| status | ENUM | `not_started`, `exploring`, `practiced`, `mastered`, `retained` |
| updated_at | TIMESTAMP | Every update tracked |

**Key index:** `(student_id, concept_id)` UNIQUE — one row per student-concept pair, updated in place.  
**Read pattern:** Entire student mastery map loaded as a set by `student_id` for Student Intelligence Card generation and recommendation engine. Must be fast: indexed on `student_id`, stored in Redis cache for active students.

### Table: `practice_attempts`

| Column | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → students.id |
| content_object_id | UUID | FK → content_objects.id (the specific question) |
| concept_id | UUID | FK → concepts.id (denormalised for fast aggregation) |
| is_correct | BOOLEAN | |
| error_type | ENUM | `conceptual`, `procedural`, `careless`, `knowledge_gap`, NULL (if correct) |
| time_taken_seconds | INTEGER | |
| attempted_at | TIMESTAMP | |
| session_context | ENUM | `self_study`, `tutor_session`, `mock_test`, `daily_challenge` |

**Volume:** This is the highest-volume table. At 500k students with 20 attempts/day average: ~10M rows/day. Partitioned by `attempted_at` (monthly partitions). Aggregated into `mastery_scores` in near-real-time; raw rows retained for 2 years then archived to S3.

---

## A.4 Marketplace Domain

### Table: `tutor_availability_slots`

| Column | Type | Notes |
|---|---|---|
| id | UUID | |
| tutor_id | UUID | FK → tutors.id |
| slot_start | TIMESTAMP | UTC; converted to IST in application layer |
| slot_end | TIMESTAMP | UTC |
| state | ENUM | `available`, `available_now`, `in_session`, `blocked`, `pending` |
| booking_id | UUID | FK → bookings.id; NULL if not booked |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**State transitions:** `available` → `pending` (booking request made) → `in_session` (confirmed + session started) → `available` (session ended). Separate `blocked` state for tutor-initiated calendar blocking.

### Table: `bookings`

| Column | Type | Notes |
|---|---|---|
| id | UUID | |
| student_id | UUID | FK → students.id |
| tutor_id | UUID | FK → tutors.id |
| slot_id | UUID | FK → tutor_availability_slots.id |
| booking_type | ENUM | `instant`, `scheduled`, `ai_recommended`, `demo` |
| status | ENUM | See state machine in Marketplace Flow Architecture |
| session_focus | TEXT | Optional; student-provided focus area |
| gross_fee_inr | INTEGER | Rate locked at booking time |
| commission_rate_at_booking | DECIMAL(4,3) | Locked at session completion (not booking) |
| created_at | TIMESTAMP | |
| confirmed_at | TIMESTAMP | When tutor accepted |
| razorpay_order_id | VARCHAR(100) | External reference |
| payment_status | ENUM | `authorized`, `held`, `released`, `refunded`, `dispute_pending` |

### Table: `sessions`

> Created when a booking transitions to COMPLETED state.

| Column | Type | Notes |
|---|---|---|
| id | UUID | |
| booking_id | UUID | FK → bookings.id |
| actual_start_at | TIMESTAMP | When both parties joined |
| actual_end_at | TIMESTAMP | |
| actual_duration_minutes | SMALLINT | |
| verification_status | ENUM | `verified_complete`, `disputed_completion`, `no_show_tutor`, `no_show_student` |
| classroom_live_pct | DECIMAL(4,3) | % of booked duration classroom was live |
| both_present_pct | DECIMAL(4,3) | % of session both parties had active video/audio |
| recording_s3_url | VARCHAR(512) | Encrypted; signed URL for parent access |
| recording_duration_seconds | INTEGER | |
| tutor_post_session_notes | TEXT | From tutor's post-session form |
| tutor_objective_achieved | ENUM | `achieved`, `partially`, `not_achieved` |
| homework_assigned | BOOLEAN | |
| safety_scan_status | ENUM | `clean`, `flagged_for_review`, `escalated` |
| safety_scan_completed_at | TIMESTAMP | |

### Table: `reviews`

| Column | Type | Notes |
|---|---|---|
| id | UUID | |
| session_id | UUID | FK → sessions.id |
| reviewer_id | UUID | FK → users.id (student or parent) |
| reviewer_type | ENUM | `student`, `parent` |
| tutor_id | UUID | FK → tutors.id (denormalised for fast TPS computation) |
| rating | SMALLINT | 1–5 |
| comment | TEXT | Optional; max 500 chars |
| submitted_at | TIMESTAMP | Must be ≥ 2 hours after session end (enforced in application layer) |
| is_visible_to_tutor | BOOLEAN | False until 7 days post-submission (anonymisation window) |
| gaming_flag | BOOLEAN | Set by anti-gaming detection system |

### Table: `payments`

| Column | Type | Notes |
|---|---|---|
| id | UUID | |
| booking_id | UUID | FK → bookings.id; NULL for subscriptions |
| subscription_id | UUID | FK → subscriptions.id; NULL for sessions |
| payment_type | ENUM | `session`, `subscription` |
| gross_amount_inr | INTEGER | |
| commission_amount_inr | INTEGER | Platform's share |
| tds_amount_inr | INTEGER | Deducted from tutor payout; remitted to government |
| net_tutor_amount_inr | INTEGER | What tutor receives |
| razorpay_payment_id | VARCHAR(100) | |
| razorpay_transfer_id | VARCHAR(100) | Tutor payout reference |
| status | ENUM | `authorized`, `captured`, `transferred`, `refunded`, `failed` |
| created_at | TIMESTAMP | |
| transferred_at | TIMESTAMP | When weekly batch payout executed |
| financial_year | VARCHAR(7) | e.g., `2025-26`; for TDS annual tracking |

---

## A.5 Trust & Safety Domain

### Table: `safety_flags`

| Column | Type | Notes |
|---|---|---|
| id | UUID | |
| flagged_entity_id | UUID | FK to users.id or sessions.id depending on type |
| flagged_entity_type | ENUM | `user`, `session`, `message`, `askai_query` |
| flag_type | ENUM | `contact_info_attempt`, `grooming_signal`, `csam_detected`, `conduct_complaint`, `credential_fraud`, `referral_abuse`, `prompt_injection` |
| severity | ENUM | `level_1`, `level_2`, `level_3` |
| detected_by | ENUM | `automated_nlp`, `automated_scan`, `user_report`, `ops_review` |
| status | ENUM | `open`, `under_review`, `resolved_no_action`, `resolved_action_taken` |
| assigned_to | UUID | FK → users.id (Trust & Safety team member) |
| created_at | TIMESTAMP | |
| resolved_at | TIMESTAMP | |
| resolution_notes | TEXT | Internal only; never shown to users |
| retention_flag | ENUM | `standard_30_days`, `elevated_2_years`, `legal_hold_7_years` |

### Table: `disputes`

| Column | Type | Notes |
|---|---|---|
| id | UUID | |
| session_id | UUID | FK → sessions.id |
| filed_by | UUID | FK → users.id |
| dispute_type | ENUM | `duration`, `technical`, `quality`, `conduct` |
| description | TEXT | Max 500 chars |
| status | ENUM | `open`, `under_review`, `resolved_refund`, `resolved_no_refund`, `appealed` |
| refund_amount_inr | INTEGER | 0 if no refund |
| resolution_notes | TEXT | Shared with both parties (plain language) |
| created_at | TIMESTAMP | |
| resolved_at | TIMESTAMP | |
| resolved_by | UUID | FK → users.id (Dispute Resolution team member) |
| appeal_filed_at | TIMESTAMP | NULL if no appeal |
| appeal_resolved_at | TIMESTAMP | |

---

## A.6 Key Relationships Summary

```
students ─── (1:1) ─── users
parents  ─── (1:1) ─── users
tutors   ─── (1:1) ─── users

students ─── (N:1) ─── parents  [many students can have same parent]
students ─── (N:M) ─── tutors   [through bookings]

mastery_scores ─── (N:1) ─── students
mastery_scores ─── (N:1) ─── concepts

practice_attempts ─── (N:1) ─── students
practice_attempts ─── (N:1) ─── content_objects

bookings ─── (N:1) ─── students
bookings ─── (N:1) ─── tutors
bookings ─── (1:1) ─── tutor_availability_slots

sessions ─── (1:1) ─── bookings
reviews  ─── (1:1) ─── sessions
payments ─── (1:1) ─── bookings

safety_flags ─── polymorphic ─── users / sessions / messages
disputes     ─── (N:1) ─── sessions
```

---

## A.7 Indexing Strategy

| Table | Critical Indexes | Reason |
|---|---|---|
| mastery_scores | `(student_id, concept_id)` UNIQUE; `student_id` | Student card generation; entire map loaded per student |
| practice_attempts | `student_id`, `concept_id`, `attempted_at` | Mastery computation; partitioned on `attempted_at` |
| bookings | `student_id`, `tutor_id`, `status`, `slot_id` | Booking lookup; status filtering |
| tutor_availability_slots | `(tutor_id, slot_start, state)` composite | Availability queries for matching |
| reviews | `tutor_id`, `submitted_at`, `gaming_flag` | TPS computation; anti-gaming queries |
| safety_flags | `flagged_entity_id`, `status`, `severity` | Dashboard; real-time alert queries |
| payments | `booking_id`, `status`, `financial_year`, `transferred_at` | Payout batch; TDS reporting |

---

## A.8 Data Retention & DPDP Compliance

| Data Category | Retention | Rationale |
|---|---|---|
| Student learning data (mastery, practice attempts) | Duration of account + 3 years | Learning continuity; longitudinal model training |
| Session recordings | 90 days standard; 2 years if safety flag; 7 years if legal hold | POCSO investigation requirement |
| Payment records | 8 years | Indian accounting standards |
| Safety flag records | 7 years if action taken; 1 year if no action | Legal hold requirement |
| AskAI query history | 2 years | Model training; accuracy auditing |
| Deleted account data | 30 days post-deletion request, then purged | DPDP Act right-to-erasure |

Right-to-erasure implementation: a deletion request triggers a background job that anonymises PII fields (name → `[deleted]`, phone → `[deleted]`), preserves aggregate analytics (mastery score history for model training without PII), and deletes session recordings within 30 days. Financial records are retained per legal obligation.

---
---

# PART B — SCALABILITY ARCHITECTURE

---

## B.1 Service Decomposition

```
PHASE 1 (0–50k MAU): MODULAR MONOLITH
  Single deployable unit with logical module separation
  AWS ECS (single service); RDS PostgreSQL Multi-AZ
  
  Internal modules (deployed together, separated logically):
    ├─ Auth Module (registration, OTP, session management)
    ├─ Content Module (library, delivery, offline packs)
    ├─ Learning Module (mastery engine, practice, AskAI routing)
    ├─ Marketplace Module (tutor search, booking, matching)
    ├─ Session Module (virtual classroom orchestration, recording)
    ├─ Payment Module (Razorpay integration, payout engine)
    ├─ Safety Module (NLP moderation, dispute management)
    └─ Notification Module (push, WhatsApp, email)

  WHY MONOLITH AT PHASE 1:
    - Faster to build and iterate
    - No distributed system complexity (no service discovery, no network latency between services)
    - Single database → simpler transactions (booking + payment in one ACID transaction)
    - Engineering team is small; microservice overhead is disproportionate
    - Deploy and rollback is trivial
    - Module separation now makes Phase 2 extraction straightforward
```

```
PHASE 2 (50k–500k MAU): SELECTIVE EXTRACTION
  Extract highest-load and highest-isolation-need modules as independent services
  Remaining monolith stays for modules with lower load or tighter coupling needs

  Extracted services:
    ├─ AI Service (AskAI LLM + symbolic solver)
    │     Reason: GPU/CPU intensive; independent scaling; fault isolation
    │     Stack: Python FastAPI; separate AWS ECS cluster; auto-scaling on query rate
    │
    ├─ Matching Service (tutor ranking, availability queries)
    │     Reason: latency-critical (< 150ms target); read-heavy; independent scaling
    │     Stack: Python FastAPI; Redis (tutor vectors + availability); Elasticsearch
    │
    ├─ Session Service (classroom orchestration, recording management)
    │     Reason: stateful; WebSocket connections; Agora/100ms webhooks
    │     Stack: Node.js (WebSocket performance); separate DB schema
    │
    └─ Notification Service (push, WhatsApp, email)
          Reason: high volume; async; third-party API rate limits
          Stack: Python worker; SQS queue; independent retry logic

  Remaining in modular monolith:
    Auth, Content, Learning Science Engine, Payment, Safety, Core API

  Database strategy:
    Monolith → PostgreSQL (same RDS; separate schemas per module)
    AI Service → no persistent DB (stateless; reads from Feature Store)
    Matching Service → reads from PostgreSQL (read replica) + Redis
    Session Service → PostgreSQL (separate RDS instance; session-specific schema)
    Notification Service → PostgreSQL (queue table) → async worker
```

```
PHASE 3 (500k–2M MAU): FULL MICROSERVICES + MULTI-AZ
  All major modules extracted as independent services
  Each service owns its data store
  API Gateway (Kong) routes all external traffic
  Service mesh (AWS App Mesh) for internal service-to-service communication

  Service inventory:
    ├─ auth-service         (Auth0 + custom JWT; stateless)
    ├─ content-service      (S3 + CloudFront; CDN-first)
    ├─ learning-service     (mastery engine; writes to mastery_scores)
    ├─ askai-service        (LLM + symbolic solver; stateless inference)
    ├─ matching-service     (tutor ranking; Redis + Elasticsearch)
    ├─ booking-service      (booking lifecycle; owns bookings table)
    ├─ session-service      (classroom; owns sessions table; Agora/100ms)
    ├─ payment-service      (Razorpay; owns payments table)
    ├─ safety-service       (NLP moderation; owns safety_flags table)
    ├─ dispute-service      (dispute workflow; reads from sessions + payments)
    ├─ notification-service (push/WhatsApp/email; async)
    ├─ analytics-service    (dashboard data; reads from all; no writes)
    └─ admin-service        (internal console; cross-service reads)

  Data ownership (each service owns its tables; other services must use APIs, not direct DB queries):
    booking-service:    bookings, tutor_availability_slots
    session-service:    sessions, reviews
    payment-service:    payments, subscriptions
    learning-service:   mastery_scores, practice_attempts, askai_queries
    safety-service:     safety_flags, moderation_events
    dispute-service:    disputes

  Cross-service communication:
    Synchronous (REST/gRPC): booking-service ↔ matching-service, payment-service ↔ booking-service
    Asynchronous (Kafka events): session-completed → learning-service, payment-service, notification-service
```

---

## B.2 Data Pipeline Architecture

```
RAW EVENT INGESTION
  
  Event producers:
    ├─ Student app: practice_attempted, video_watched, askai_query_sent, session_joined
    ├─ Tutor app: session_started, post_session_submitted, availability_updated
    ├─ Payment service: payment_authorized, payment_released, refund_issued
    └─ Safety service: flag_created, flag_resolved

  Transport: Apache Kafka (AWS MSK — managed)
    - Topics: one per event type (e.g., `practice_attempted`, `session_completed`)
    - Retention: 7 days (events consumed within minutes; 7-day window for replay)
    - Partitioning: by student_id (ensures ordering per student)
    - Consumer groups: one per downstream consumer (learning engine, analytics, ML pipeline)

STREAM PROCESSING (real-time path)
  
  Apache Flink (Phase 2+; Phase 1 uses lightweight Python consumers)
    ├─ practice_attempted → compute mastery score delta → write to mastery_scores (PostgreSQL + Redis)
    ├─ session_completed → update tutor TPS components → write to tutor TPS staging table
    └─ safety event → route to safety dashboard → trigger alert if threshold met
  
  Latency target: mastery_score updated within 500ms of practice_attempted event

BATCH PROCESSING (daily path)

  Apache Airflow (scheduled DAGs):
    ├─ Nightly 2 AM: recompute TPS for all tutors (weekly full recompute; daily incremental)
    ├─ Nightly 2 AM: compute Exam Readiness Score for all active students
    ├─ Nightly 2 AM: refresh tutor ranking vectors in Redis (Flow 2A, Marketplace Flow Architecture)
    ├─ Nightly 3 AM: spaced repetition scheduling — compute next_review_due_at for all concepts
    ├─ Weekly Sunday midnight: referral fraud network graph analysis (Section 11F.2)
    └─ Weekly Monday 9 AM: tutor payout batch (aggregate cleared sessions → Razorpay transfer)

ANALYTICAL LAYER (read-only; never queried by transactional services)

  AWS Redshift (Phase 2+; Phase 1 uses dbt on PostgreSQL read replica):
    Raw events → dbt transformations → analytical tables:
      ├─ cohort_retention:        daily/weekly/monthly retention by join cohort
      ├─ funnel_conversions:      free→core→plus→pro conversion by channel and period
      ├─ tutor_performance_agg:   TPS trends, cancellation rates, earnings by tutor
      ├─ content_performance:     completion rates, error rates by concept and board
      └─ marketplace_health:      fill rate, supply/demand ratio, match latency by segment

  Dashboard queries: read from Redshift analytical tables, never from transactional DB
  Data latency: max 6 hours (morning batch loads overnight data into Redshift)
```

---

## B.3 ML Model Training Pipeline

```
DATA PREPARATION

  Training data sources:
    ├─ practice_attempts (labelled: concept, error_type, is_correct, student_mastery_at_time)
    ├─ mastery_scores (historical snapshots; point-in-time correct via dbt)
    ├─ sessions (tutor_id, student_mastery_before, student_mastery_after, rating)
    └─ askai_queries (query_text, concept_tag, confidence_score, human_correction if any)

  Point-in-time correctness (critical for training data quality):
    All training examples must use feature values as they were at the time of the label event,
    not current values. Implemented via dbt temporal joins on PostgreSQL snapshots.
    See PRD Section 10B.4 for specification.

  Feature engineering:
    - Student features: mastery map snapshot, days_since_last_practice per concept,
                        error_type_distribution_30_days, exam_days_remaining
    - Tutor features: TPS snapshot, concept_expertise_scores, session_history_with_this_concept
    - Context features: time_of_day, device_type, days_to_exam

MODEL TRAINING

  Phase 1 (Month 1–18): Rule-based with light ML
    - Mastery score: weighted formula (no ML; deterministic)
    - Tutor ranking: weighted scoring function (no ML; explicit weights)
    - AskAI routing: confidence threshold rules (no ML; explicit thresholds)
    - Content recommendation: rule-based (next concept in dependency graph)
    Tools: none beyond existing application code; no dedicated ML infrastructure

  Phase 2 (Month 18–30): First proprietary models
    Model 1: Tutor-Student Match Quality Predictor
      Task: predict probability that student X will rebook tutor Y given features
      Architecture: gradient-boosted trees (XGBoost); interpretable; fast inference
      Training data: booking outcomes (rebooked=1, churned=0) with features above
      Training frequency: weekly retrain on last 6 months of data
      Infrastructure: AWS SageMaker Training Job (triggered by Airflow weekly)
      Serving: model artefact exported to S3; loaded into matching-service at startup
      
    Model 2: Student Churn Predictor
      Task: predict probability that student churns in next 14 days given engagement signals
      Architecture: logistic regression (interpretable; 10 features; easy to audit)
      Training data: students who churned vs. retained; 14-day label window
      Output: at-risk flag in Student Learning Health Dashboard
      Training frequency: weekly; deployed to batch scoring (nightly)

  Phase 3 (Month 30+): Proprietary LLM fine-tuning
    Base model: open-source LLM (Llama or Mistral class; India-data-friendly licence)
    Fine-tuning data: curated set of (question, correct_board_aligned_answer) pairs
                      derived from 3 years of AskAI queries with human-verified correct answers
    Scale requirement: ~1M high-quality question-answer pairs; available by Month 30
    Infrastructure: AWS SageMaker; multi-GPU training; spot instances for cost efficiency
    Serving: self-hosted inference (replaces OpenAI API calls for core Math/Science subjects)
    Expected improvement: > 97% accuracy on CBSE Math vs. current ~92% with generic LLM

MODEL REGISTRY AND MONITORING

  MLflow (Phase 2+):
    - All model versions tracked (parameters, metrics, artefacts)
    - A/B testing framework: route X% of traffic to new model; compare metrics
    - Rollback: one-click revert to previous version if metrics degrade

  Model monitoring (Phase 2+):
    - Feature drift: weekly check — are student mastery distributions shifting?
    - Prediction drift: are model output distributions changing unexpectedly?
    - Performance decay: is rebook-rate actually increasing for recommended matches?
    - Alert threshold: if model accuracy (on held-out test set) drops > 5% from baseline → alert + human review
```

---

## B.4 Infrastructure Cost Model by Phase

| Component | Phase 1 (Monthly) | Phase 2 (Monthly) | Phase 3 (Monthly) |
|---|---|---|---|
| ECS (compute) | USD 200–400 | USD 800–1,500 | USD 3,000–6,000 |
| RDS PostgreSQL | USD 150–300 | USD 400–800 (+ read replicas) | USD 1,500–3,000 (multi-AZ) |
| Redis (ElastiCache) | USD 50–100 | USD 200–400 | USD 600–1,200 |
| Kafka (MSK) | Not needed | USD 300–500 | USD 800–1,500 |
| Elasticsearch | USD 100–200 | USD 300–600 | USD 800–1,500 |
| S3 + CloudFront | USD 100–200 | USD 300–600 | USD 800–1,500 |
| SageMaker (ML) | Not needed | USD 200–400 | USD 1,000–2,500 |
| Redshift (analytics) | Not needed | USD 300–500 | USD 800–1,500 |
| Agora.io / 100ms | USD 200–500 | USD 1,000–2,000 | USD 3,000–7,000 |
| LLM API (OpenAI/Anthropic) | USD 300–600 | USD 800–1,500 | USD 500–1,000 (replaced by own model) |
| **Total infrastructure** | **USD 1,100–2,300/month** | **USD 4,600–8,800/month** | **USD 12,800–26,700/month** |
| **INR equivalent** | **INR 9–19L/month** | **INR 38–73L/month** | **INR 107–222L/month** |

> Phase 3 infrastructure cost at 500k MAU (USD 13–27k/month) against INR 2 Crore MRR (~USD 240k/month) represents ~5–11% of revenue — within industry-standard range for infrastructure-intensive B2C platforms (8–15%).

---

*EduReach India — Technical Architecture v1.0 | March 2026 | CONFIDENTIAL*
*Companion to PRD v7.0, User Journey Maps v2.0, Marketplace Flow Architecture v2.0, Feature Roadmap v1.0.*
*Audience: Engineering (Backend, Frontend, Data, ML, DevOps), Technical Leadership.*
*Next review: post-Phase 1 launch (Month 7) — update schema with actual production field names; update service decomposition based on observed load patterns.*
