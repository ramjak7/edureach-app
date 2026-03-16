import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Returns the current Clerk user object from the server-side auth context.
 * Throws if called outside an authenticated request.
 */
export async function getAuthUser() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated");
  return user;
}

/**
 * Returns the Clerk userId from the server-side auth context.
 * Throws if called outside an authenticated request.
 */
export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  return userId;
}
