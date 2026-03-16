// PRD Section 11.2 — Tutor Performance Score Formula
// TPS = 0.30×StudentRating + 0.25×RetentionRate + 0.20×SessionCompletion
//     + 0.15×StudentLearningImprovement + 0.10×ComplaintRatio(inverted)
//
// TPS tier → commission rate:
//   Platinum (85–100): 13%
//   Gold     (70–84):  15%
//   Silver   (55–69):  18%
//   Bronze   (0–54):   20%
//
// Recomputed weekly via Inngest scheduled function (every Monday 2 AM IST).
// Do NOT recompute on every session.

export type TpsTier = "platinum" | "gold" | "silver" | "bronze";

export interface TpsComponents {
  studentRating: number; // 0–1 (normalised from 1–5 scale)
  retentionRate: number; // 0–1
  sessionCompletion: number; // 0–1
  studentLearningImprovement: number; // 0–1
  complaintRatioInverted: number; // 0–1 (1 = no complaints)
}

export function computeTps(components: TpsComponents): number {
  const score =
    0.3 * components.studentRating +
    0.25 * components.retentionRate +
    0.2 * components.sessionCompletion +
    0.15 * components.studentLearningImprovement +
    0.1 * components.complaintRatioInverted;

  return Math.round(score * 100);
}

export function getTpsTier(tps: number): TpsTier {
  if (tps >= 85) return "platinum";
  if (tps >= 70) return "gold";
  if (tps >= 55) return "silver";
  return "bronze";
}

export function getCommissionRate(tier: TpsTier): number {
  const rates: Record<TpsTier, number> = {
    platinum: 0.13,
    gold: 0.15,
    silver: 0.18,
    bronze: 0.2,
  };
  return rates[tier];
}
