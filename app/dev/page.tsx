"use client";

/**
 * DEV ONLY — quick role-switching page for Sprint 4 testing.
 * Access at /dev in development. Not rendered in production.
 */
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DEV_TOOLS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";

export default function DevToolsPage() {
  if (!DEV_TOOLS_ENABLED) {
    return <p className="p-8 text-muted-foreground">Dev tools are not enabled. Set NEXT_PUBLIC_ENABLE_DEV_TOOLS=true to use this page.</p>;
  }

  return <DevTools />;
}

function DevTools() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function callEndpoint(endpoint: string, label: string) {
    setLoading(label);
    setResult(null);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Dev Tools</h1>
        <Badge variant="destructive">Development Only</Badge>
      </div>
      <p className="text-muted-foreground text-sm">
        Use these buttons to promote the currently signed-in Clerk account to a specific role.
        This lets you test both student and tutor flows without waiting for Sprint 8 onboarding.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Make me a Student</CardTitle>
            <CardDescription>
              Creates a Student profile for the signed-in Clerk account. Then visit{" "}
              <Link href="/student/tutors" className="underline">/student/tutors</Link> to browse and book.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => callEndpoint("/api/dev/make-student", "student")}
              disabled={loading !== null}
              className="w-full"
              variant="outline"
            >
              {loading === "student" ? "Promoting..." : "Promote to Student"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Make me a Tutor</CardTitle>
            <CardDescription>
              Creates a Tutor profile for the signed-in Clerk account. Then visit{" "}
              <a href="/tutor/bookings" className="underline">/tutor/bookings</a> to accept bookings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => callEndpoint("/api/dev/make-tutor", "tutor")}
              disabled={loading !== null}
              className="w-full"
            >
              {loading === "tutor" ? "Promoting..." : "Promote to Tutor"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <Link href="/student/tutors" className="text-center border rounded p-2 hover:bg-muted transition-colors">
          → Student: Browse Tutors
        </Link>
        <Link href="/student/bookings" className="text-center border rounded p-2 hover:bg-muted transition-colors">
          → Student: My Bookings
        </Link>
        <Link href="/tutor/bookings" className="text-center border rounded p-2 hover:bg-muted transition-colors">
          → Tutor: Manage Bookings
        </Link>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono">Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted rounded p-3 overflow-auto whitespace-pre-wrap">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
