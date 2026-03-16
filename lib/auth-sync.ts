import { db } from "@/lib/db";
import type { UserRole } from "@/types";

/**
 * Ensures a Clerk user exists in our `users` table.
 * Called on first sign-in (via the webhook) and also guarded at sign-up.
 * Safe to call multiple times — uses upsert.
 */
export async function syncClerkUser({
  clerkId,
  email,
  phoneNumber,
  role,
}: {
  clerkId: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
}) {
  return db.user.upsert({
    where: { clerkId },
    update: { lastActiveAt: new Date() },
    create: {
      clerkId,
      email: email ?? null,
      phoneNumber: phoneNumber ?? null,
      role,
    },
  });
}

/**
 * Marks a user as removed when Clerk fires a user.deleted event.
 * Preserves the row (and all related data) — only sets accountStatus.
 */
export async function deactivateClerkUser(clerkId: string) {
  return db.user.updateMany({
    where: { clerkId },
    data: { accountStatus: "removed" },
  });
}
