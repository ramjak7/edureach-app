import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function TutorDashboard() {
  const { userId } = await auth();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
      <p className="text-muted-foreground mt-2">Clerk ID: {userId}</p>
      <p className="text-muted-foreground text-sm mt-1">
        Sprint 8 — Tutor Onboarding coming later.
      </p>
    </main>
  );
}
