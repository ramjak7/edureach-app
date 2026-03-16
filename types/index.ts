// Global TypeScript type definitions for EduReach India.
// Add shared interfaces here; domain-specific types live alongside their feature files.

export type UserRole = "student" | "parent" | "tutor" | "admin";

// Must match Prisma schema enum Board exactly
export type Board = "CBSE" | "ICSE" | "Maharashtra" | "UP_Board";

export type SubscriptionTier = "free" | "core" | "plus" | "pro";

export type ApiResponse<T = null> =
  | { success: true; data: T }
  | { success: false; error: string };
