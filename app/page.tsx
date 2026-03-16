// ClerkProvider in the root layout requires a valid key even during prerender —
// force dynamic so this page is always server-rendered at request time.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">EduReach India</h1>
      <p className="mt-4 text-muted-foreground">
        AI-powered K-12 tutoring platform — scaffold ready.
      </p>
    </main>
  );
}
