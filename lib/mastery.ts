import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

// PRD Section 10A — Mastery Score Formula
// M = 0.35×Accuracy + 0.15×TimeEfficiency + 0.25×DifficultyProgression
//   + 0.15×SpacedRepetitionScore + 0.10×TutorFeedback
//
// Mastery thresholds:
//   0–20:   Not Started
//   21–45:  Exploring
//   46–65:  Practiced
//   66–84:  Mastered
//   85–100: Retained

export type MasteryStatus =
  | "not_started"
  | "exploring"
  | "practiced"
  | "mastered"
  | "retained";

export function getMasteryStatus(score: number): MasteryStatus {
  if (score <= 20) return "not_started";
  if (score <= 45) return "exploring";
  if (score <= 65) return "practiced";
  if (score <= 84) return "mastered";
  return "retained";
}

export interface MasteryComponents {
  accuracy: number; // 0–1
  timeEfficiency: number; // 0–1
  difficultyProgression: number; // 0–1
  spacedRepetitionScore: number; // 0–1
  tutorFeedback: number; // 0–1
}

export function computeMasteryScore(components: MasteryComponents): number {
  const score =
    0.35 * components.accuracy +
    0.15 * components.timeEfficiency +
    0.25 * components.difficultyProgression +
    0.15 * components.spacedRepetitionScore +
    0.1 * components.tutorFeedback;

  return Math.round(score * 100);
}

/**
 * Reads mastery score from Redis cache first, then falls back to database.
 * Never recomputes from scratch on read — only recomputes on new practice_attempt.
 */
export async function getMasteryScore(
  studentId: string,
  conceptId: string
): Promise<number | null> {
  const cacheKey = `mastery:${studentId}:${conceptId}`;

  try {
    const cached = await redis.get<number>(cacheKey);
    if (cached !== null) return cached;
  } catch {
    // Redis not configured in dev — fall through to DB
  }

  const record = await db.masteryScore.findUnique({
    where: { studentId_conceptId: { studentId, conceptId } },
    select: { score: true },
  });

  if (!record) return null;

  try {
    await redis.set(cacheKey, record.score.toNumber(), { ex: 3600 });
  } catch {
    // No-op
  }
  return record.score.toNumber();
}

/**
 * Upserts the mastery score in the database and updates the Redis cache.
 * Called only after a new practice_attempt event — never on reads.
 */
export async function upsertMasteryScore(
  studentId: string,
  conceptId: string,
  score: number,
  components: MasteryComponents,
  status: MasteryStatus
): Promise<void> {
  await db.masteryScore.upsert({
    where: { studentId_conceptId: { studentId, conceptId } },
    update: {
      score,
      accuracyComponent: components.accuracy,
      timeEfficiencyComponent: components.timeEfficiency,
      difficultyProgressionComponent: components.difficultyProgression,
      spacedRepetitionComponent: components.spacedRepetitionScore,
      tutorFeedbackComponent: components.tutorFeedback,
      status,
      lastPracticeAt: new Date(),
      updatedAt: new Date(),
    },
    create: {
      studentId,
      conceptId,
      score,
      accuracyComponent: components.accuracy,
      timeEfficiencyComponent: components.timeEfficiency,
      difficultyProgressionComponent: components.difficultyProgression,
      spacedRepetitionComponent: components.spacedRepetitionScore,
      tutorFeedbackComponent: components.tutorFeedback,
      status,
      lastPracticeAt: new Date(),
    },
  });

  try {
    await redis.set(`mastery:${studentId}:${conceptId}`, score, { ex: 3600 });
  } catch {
    // No-op — Redis not configured in dev
  }
}
