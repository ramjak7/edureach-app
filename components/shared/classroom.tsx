"use client";

/**
 * PLACEHOLDER â€” 100ms video not yet integrated (credentials pending).
 * Replace this component with the real HMSReactiveStore-based implementation
 * once HMS_ACCESS_KEY and HMS_SECRET are added and a room template is configured.
 * See CLAUDE.md â†’ Sprint 5 notes for full implementation details.
 */import { useState } from "react";import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, User, BookOpen } from "lucide-react";

interface ClassroomProps {
  sessionId: string;
  role: "student" | "tutor";
  displayName: string;
  otherPartyName: string;
  subject: string | null;
  slotStart: string | null; // ISO string
  slotEnd: string | null;   // ISO string
  backHref: string;
}

export function Classroom({
  sessionId,
  role,
  displayName,
  otherPartyName,
  subject,
  slotStart,
  slotEnd,
  backHref,
}: ClassroomProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    setCompleteError(null);
    const res = await fetch(`/api/sessions/${sessionId}/complete`, { method: "POST" });
    if (res.ok) {
      router.push(`/tutor/post-session/${sessionId}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setCompleteError(data.error ?? "Failed to complete session");
      setIsCompleting(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 space-y-6 text-center">
        {/* Icon */}
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Video className="h-8 w-8 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">Session Room</h1>
          <p className="text-gray-400 text-sm mt-1">Video classroom coming soon</p>
        </div>

        {/* Session info */}
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
            <User className="h-4 w-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">{role === "student" ? "Tutor" : "Student"}</p>
              <p className="font-medium">{otherPartyName}</p>
            </div>
          </div>

          {subject && (
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
              <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Subject</p>
                <p className="font-medium">{subject}</p>
              </div>
            </div>
          )}

          {slotStart && slotEnd && (
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Scheduled time</p>
                <p className="font-medium text-sm">{formatTime(slotStart)} â†’ {formatTime(slotEnd)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
            <span className="text-xs text-gray-400">Session ID</span>
            <Badge variant="outline" className="font-mono text-xs">{sessionId.slice(0, 8)}â€¦</Badge>
          </div>
        </div>

        <div className="bg-yellow-900/40 border border-yellow-700/50 rounded-lg px-4 py-3 text-sm text-yellow-300 text-left">
          Video calling is being integrated. Use an external video link (Google Meet, Zoom) for this session.
        </div>

        {completeError && (
          <p className="text-sm text-red-400">{completeError}</p>
        )}

        {role === "tutor" ? (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleMarkComplete}
            disabled={isCompleting}
          >
            {isCompleting ? "Completing…" : "Mark Session Complete"}
          </Button>
        ) : (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => router.push(backHref)}
          >
            End Session
          </Button>
        )}
      </div>
    </div>
  );
}
