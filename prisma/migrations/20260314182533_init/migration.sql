-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'parent', 'tutor', 'admin');

-- CreateEnum
CREATE TYPE "UserAccountStatus" AS ENUM ('active', 'suspended', 'under_review', 'removed');

-- CreateEnum
CREATE TYPE "Board" AS ENUM ('CBSE', 'ICSE', 'Maharashtra', 'UP_Board');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('free', 'core', 'plus', 'pro');

-- CreateEnum
CREATE TYPE "TutorType" AS ENUM ('marketplace', 'platform_hired');

-- CreateEnum
CREATE TYPE "TutorAccountStatus" AS ENUM ('applicant', 'onboarding', 'active', 'suspended', 'removed');

-- CreateEnum
CREATE TYPE "TpsTier" AS ENUM ('platinum', 'gold', 'silver', 'bronze', 'under_review');

-- CreateEnum
CREATE TYPE "BackgroundCheckStatus" AS ENUM ('pending', 'passed', 'failed');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('video', 'notes_pdf', 'practice_question', 'mock_test');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('easy', 'medium', 'hard', 'board_authentic');

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('draft', 'sme_review', 'qc_passed', 'live', 'deprecated');

-- CreateEnum
CREATE TYPE "MasteryStatus" AS ENUM ('not_started', 'exploring', 'practiced', 'mastered', 'retained');

-- CreateEnum
CREATE TYPE "ErrorType" AS ENUM ('conceptual', 'procedural', 'careless', 'knowledge_gap');

-- CreateEnum
CREATE TYPE "SessionContext" AS ENUM ('self_study', 'tutor_session', 'mock_test', 'daily_challenge', 'diagnostic');

-- CreateEnum
CREATE TYPE "SlotState" AS ENUM ('available', 'available_now', 'in_session', 'blocked', 'pending');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('instant', 'scheduled', 'ai_recommended', 'demo');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'payment_held', 'confirmed', 'in_session', 'completed', 'cancelled_by_student', 'cancelled_by_tutor', 'no_show_student', 'no_show_tutor', 'disputed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('authorized', 'held', 'released', 'refunded', 'dispute_pending');

-- CreateEnum
CREATE TYPE "SessionVerificationStatus" AS ENUM ('verified_complete', 'disputed_completion', 'no_show_tutor', 'no_show_student');

-- CreateEnum
CREATE TYPE "TutorObjectiveAchieved" AS ENUM ('achieved', 'partially', 'not_achieved');

-- CreateEnum
CREATE TYPE "SafetyScanStatus" AS ENUM ('clean', 'flagged_for_review', 'escalated');

-- CreateEnum
CREATE TYPE "ReviewerType" AS ENUM ('student', 'parent');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('session', 'subscription');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('authorized', 'captured', 'transferred', 'refunded', 'failed');

-- CreateEnum
CREATE TYPE "FlaggedEntityType" AS ENUM ('user', 'session', 'message', 'askai_query');

-- CreateEnum
CREATE TYPE "FlagType" AS ENUM ('contact_info_attempt', 'grooming_signal', 'csam_detected', 'conduct_complaint', 'credential_fraud', 'referral_abuse', 'prompt_injection');

-- CreateEnum
CREATE TYPE "FlagSeverity" AS ENUM ('level_1', 'level_2', 'level_3');

-- CreateEnum
CREATE TYPE "FlagDetectedBy" AS ENUM ('automated_nlp', 'automated_scan', 'user_report', 'ops_review');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('open', 'under_review', 'resolved_no_action', 'resolved_action_taken');

-- CreateEnum
CREATE TYPE "FlagRetention" AS ENUM ('standard_30_days', 'elevated_2_years', 'legal_hold_7_years');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('duration', 'technical', 'quality', 'conduct');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('open', 'under_review', 'resolved_refund', 'resolved_no_refund', 'appealed');

-- CreateEnum
CREATE TYPE "RelationshipToStudent" AS ENUM ('mother', 'father', 'guardian');

-- CreateEnum
CREATE TYPE "ReportFrequency" AS ENUM ('daily', 'weekly');

-- CreateEnum
CREATE TYPE "AskAIConfidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'ESCALATED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'past_due', 'cancelled', 'expired');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "clerk_id" VARCHAR(100) NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account_status" "UserAccountStatus" NOT NULL DEFAULT 'active',
    "device_fingerprint" VARCHAR(64),
    "aadhaar_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "board" "Board" NOT NULL,
    "class_year" SMALLINT NOT NULL,
    "target_exam_score" SMALLINT,
    "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'free',
    "subscription_expires_at" TIMESTAMP(3),
    "parent_id" TEXT,
    "consent_given_at" TIMESTAMP(3),
    "consent_given_by" TEXT,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "is_minor" BOOLEAN NOT NULL DEFAULT true,
    "referral_code" VARCHAR(20) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "relationship_to_student" "RelationshipToStudent" NOT NULL,
    "whatsapp_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "report_frequency" "ReportFrequency" NOT NULL DEFAULT 'weekly',

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutors" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" VARCHAR(150) NOT NULL,
    "tutor_type" "TutorType" NOT NULL DEFAULT 'marketplace',
    "account_status" "TutorAccountStatus" NOT NULL DEFAULT 'applicant',
    "tps_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tps_tier" "TpsTier" NOT NULL DEFAULT 'bronze',
    "commission_rate" DECIMAL(4,3) NOT NULL DEFAULT 0.20,
    "new_tutor_sessions_remaining" SMALLINT NOT NULL DEFAULT 5,
    "hourly_rate_min" INTEGER NOT NULL,
    "hourly_rate_max" INTEGER NOT NULL,
    "bio" TEXT,
    "subjects" TEXT[],
    "boards" "Board"[],
    "class_years" INTEGER[],
    "intro_video_url" VARCHAR(512),
    "child_safety_policy_signed_at" TIMESTAMP(3),
    "academy_completed_at" TIMESTAMP(3),
    "background_check_status" "BackgroundCheckStatus" NOT NULL DEFAULT 'pending',
    "pan_number" VARCHAR(10),
    "bank_account_verified" BOOLEAN NOT NULL DEFAULT false,
    "gstin" VARCHAR(15),
    "cumulative_financial_year_earnings" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tutors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "board" "Board" NOT NULL,
    "class_year" SMALLINT NOT NULL,
    "subject" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concepts" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "board" "Board" NOT NULL,
    "class_year" SMALLINT NOT NULL,
    "subject" VARCHAR(100) NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "prerequisite_concept_ids" TEXT[],
    "board_exam_weight" DECIMAL(4,3) NOT NULL,
    "difficulty_calibrated" DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_objects" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "concept_id" TEXT NOT NULL,
    "board" "Board" NOT NULL,
    "class_year" SMALLINT NOT NULL,
    "s3_url" VARCHAR(512) NOT NULL,
    "duration_seconds" INTEGER,
    "difficulty_level" "DifficultyLevel" NOT NULL,
    "production_status" "ProductionStatus" NOT NULL DEFAULT 'draft',
    "accuracy_last_audited_at" TIMESTAMP(3),
    "syllabus_version" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mastery_scores" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "concept_id" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "accuracy_component" DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    "time_efficiency_component" DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    "difficulty_progression_component" DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    "spaced_repetition_component" DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    "tutor_feedback_component" DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    "last_practice_at" TIMESTAMP(3),
    "next_review_due_at" TIMESTAMP(3),
    "status" "MasteryStatus" NOT NULL DEFAULT 'not_started',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mastery_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_attempts" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "content_object_id" TEXT NOT NULL,
    "concept_id" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "error_type" "ErrorType",
    "time_taken_seconds" INTEGER NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_context" "SessionContext" NOT NULL,

    CONSTRAINT "practice_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "askai_queries" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "query_text" TEXT NOT NULL,
    "image_s3_url" VARCHAR(512),
    "extracted_text" TEXT,
    "response_text" TEXT NOT NULL,
    "confidence" "AskAIConfidence" NOT NULL,
    "board" "Board" NOT NULL,
    "class_year" SMALLINT NOT NULL,
    "prompt_injection" BOOLEAN NOT NULL DEFAULT false,
    "image_safety_pass" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "askai_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_availability_slots" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "slot_start" TIMESTAMP(3) NOT NULL,
    "slot_end" TIMESTAMP(3) NOT NULL,
    "state" "SlotState" NOT NULL DEFAULT 'available',
    "booking_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "slot_id" TEXT,
    "booking_type" "BookingType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "session_focus" TEXT,
    "gross_fee_inr" INTEGER NOT NULL,
    "commission_rate_at_booking" DECIMAL(4,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "razorpay_order_id" VARCHAR(100),
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'authorized',

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "actual_start_at" TIMESTAMP(3),
    "actual_end_at" TIMESTAMP(3),
    "actual_duration_minutes" SMALLINT,
    "verification_status" "SessionVerificationStatus" NOT NULL,
    "classroom_live_pct" DECIMAL(4,3),
    "both_present_pct" DECIMAL(4,3),
    "recording_s3_url" VARCHAR(512),
    "recording_duration_seconds" INTEGER,
    "tutor_post_session_notes" TEXT,
    "tutor_objective_achieved" "TutorObjectiveAchieved",
    "homework_assigned" BOOLEAN,
    "safety_scan_status" "SafetyScanStatus" NOT NULL DEFAULT 'clean',
    "safety_scan_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "reviewer_type" "ReviewerType" NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_visible_to_tutor" BOOLEAN NOT NULL DEFAULT false,
    "gaming_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT,
    "subscription_id" TEXT,
    "payment_type" "PaymentType" NOT NULL,
    "gross_amount_inr" INTEGER NOT NULL,
    "commission_amount_inr" INTEGER NOT NULL,
    "tds_amount_inr" INTEGER NOT NULL DEFAULT 0,
    "net_tutor_amount_inr" INTEGER NOT NULL,
    "razorpay_payment_id" VARCHAR(100),
    "razorpay_transfer_id" VARCHAR(100),
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'authorized',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transferred_at" TIMESTAMP(3),
    "financial_year" VARCHAR(7) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "razorpay_sub_id" VARCHAR(100),
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_flags" (
    "id" TEXT NOT NULL,
    "flagged_entity_id" TEXT NOT NULL,
    "flagged_entity_type" "FlaggedEntityType" NOT NULL,
    "flag_type" "FlagType" NOT NULL,
    "severity" "FlagSeverity" NOT NULL,
    "detected_by" "FlagDetectedBy" NOT NULL,
    "status" "FlagStatus" NOT NULL DEFAULT 'open',
    "assigned_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "retention_flag" "FlagRetention" NOT NULL DEFAULT 'standard_30_days',

    CONSTRAINT "safety_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "filed_by" TEXT NOT NULL,
    "dispute_type" "DisputeType" NOT NULL,
    "description" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'open',
    "refund_amount_inr" INTEGER NOT NULL DEFAULT 0,
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "appeal_filed_at" TIMESTAMP(3),
    "appeal_resolved_at" TIMESTAMP(3),

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referred_id" TEXT NOT NULL,
    "credit_issued" BOOLEAN NOT NULL DEFAULT false,
    "fraud_suspected" BOOLEAN NOT NULL DEFAULT false,
    "qualified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_referral_code_key" ON "students"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "parents_user_id_key" ON "parents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tutors_user_id_key" ON "tutors"("user_id");

-- CreateIndex
CREATE INDEX "mastery_scores_student_id_idx" ON "mastery_scores"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "mastery_scores_student_id_concept_id_key" ON "mastery_scores"("student_id", "concept_id");

-- CreateIndex
CREATE INDEX "practice_attempts_student_id_idx" ON "practice_attempts"("student_id");

-- CreateIndex
CREATE INDEX "practice_attempts_concept_id_idx" ON "practice_attempts"("concept_id");

-- CreateIndex
CREATE INDEX "practice_attempts_attempted_at_idx" ON "practice_attempts"("attempted_at");

-- CreateIndex
CREATE INDEX "askai_queries_student_id_idx" ON "askai_queries"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_availability_slots_booking_id_key" ON "tutor_availability_slots"("booking_id");

-- CreateIndex
CREATE INDEX "tutor_availability_slots_tutor_id_slot_start_state_idx" ON "tutor_availability_slots"("tutor_id", "slot_start", "state");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_slot_id_key" ON "bookings"("slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_razorpay_order_id_key" ON "bookings"("razorpay_order_id");

-- CreateIndex
CREATE INDEX "bookings_student_id_idx" ON "bookings"("student_id");

-- CreateIndex
CREATE INDEX "bookings_tutor_id_idx" ON "bookings"("tutor_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_booking_id_key" ON "sessions"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_session_id_key" ON "reviews"("session_id");

-- CreateIndex
CREATE INDEX "reviews_tutor_id_idx" ON "reviews"("tutor_id");

-- CreateIndex
CREATE INDEX "reviews_submitted_at_idx" ON "reviews"("submitted_at");

-- CreateIndex
CREATE INDEX "reviews_gaming_flag_idx" ON "reviews"("gaming_flag");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_financial_year_idx" ON "payments"("financial_year");

-- CreateIndex
CREATE INDEX "payments_transferred_at_idx" ON "payments"("transferred_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_razorpay_sub_id_key" ON "subscriptions"("razorpay_sub_id");

-- CreateIndex
CREATE INDEX "subscriptions_student_id_idx" ON "subscriptions"("student_id");

-- CreateIndex
CREATE INDEX "safety_flags_flagged_entity_id_idx" ON "safety_flags"("flagged_entity_id");

-- CreateIndex
CREATE INDEX "safety_flags_status_idx" ON "safety_flags"("status");

-- CreateIndex
CREATE INDEX "safety_flags_severity_idx" ON "safety_flags"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referred_id_key" ON "referrals"("referred_id");

-- CreateIndex
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutors" ADD CONSTRAINT "tutors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_objects" ADD CONSTRAINT "content_objects_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_scores" ADD CONSTRAINT "mastery_scores_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_scores" ADD CONSTRAINT "mastery_scores_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_content_object_id_fkey" FOREIGN KEY ("content_object_id") REFERENCES "content_objects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "askai_queries" ADD CONSTRAINT "askai_queries_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_availability_slots" ADD CONSTRAINT "tutor_availability_slots_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_availability_slots" ADD CONSTRAINT "tutor_availability_slots_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_flags" ADD CONSTRAINT "safety_flags_flagged_user_fkey" FOREIGN KEY ("flagged_entity_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_flags" ADD CONSTRAINT "safety_flags_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_filed_by_fkey" FOREIGN KEY ("filed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
