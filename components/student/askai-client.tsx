"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface HistoryItem {
  query: string;
  answer: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  hasImage: boolean;
}

interface AskAIClientProps {
  initialUsed: number;
  isFree: boolean;
  weeklyLimit: number;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  HIGH: "bg-green-100 text-green-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  LOW: "bg-red-100 text-red-800",
};

export function AskAIClient({ initialUsed, isFree, weeklyLimit }: AskAIClientProps) {
  const [query, setQuery] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMediaType, setImageMediaType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [used, setUsed] = useState(initialUsed);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limitReached = isFree && used >= weeklyLimit;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const [prefix, base64] = dataUrl.split(",");
      // Extract media type from data URI prefix, fall back to jpeg
      const mime = prefix.match(/:(.*?);/)?.[1] ?? "image/jpeg";
      const supported = ["image/jpeg","image/png","image/gif","image/webp"].includes(mime) ? mime : "image/jpeg";
      setImageBase64(base64);
      setImageMediaType(supported);
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() && !imageBase64) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/askai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), imageBase64: imageBase64 ?? undefined, imageMediaType: imageMediaType ?? undefined }),
      });
      const json = await res.json();

      if (!json.success) {
        if (json.error === "weekly_limit_reached") {
          setUsed(weeklyLimit);
          setError(null);
        } else {
          setError(json.error ?? "Something went wrong");
        }
        return;
      }

      setHistory((prev) => [
        { query: query.trim(), answer: json.data.answer, confidence: json.data.confidence, hasImage: !!imageBase64 },
        ...prev,
      ]);
      setUsed(json.data.used);
      setQuery("");
      setImageBase64(null);
      setImageMediaType(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Usage counter */}
      {isFree && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Weekly questions used</span>
            <span>
              {used} / {weeklyLimit}
            </span>
          </div>
          <Progress value={(used / weeklyLimit) * 100} />
        </div>
      )}

      {/* Upgrade prompt */}
      {limitReached ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-5">
            <p className="font-medium text-amber-900">You&apos;ve used all {weeklyLimit} free questions this week.</p>
            <p className="mt-1 text-sm text-amber-700">Upgrade to Core or above for unlimited AskAI.</p>
            <Button className="mt-3" size="sm" variant="outline" asChild>
              <a href="/student/subscription">Upgrade now</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Input form */
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Type your doubt here… e.g. 'Explain the quadratic formula with an example.'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            disabled={loading}
          />

          {imagePreview && (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Uploaded question" className="max-h-40 rounded border" />
              <button
                type="button"
                className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white"
                onClick={() => { setImageBase64(null); setImageMediaType(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              📷 Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button type="submit" disabled={loading || (!query.trim() && !imageBase64)} className="ml-auto">
              {loading ? "Thinking…" : "Ask"}
            </Button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      )}

      {/* Loading skeleton */}
      {loading && (
        <Card>
          <CardContent className="space-y-2 pt-5">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.map((item, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.hasImage ? "📷 " : ""}
                {item.query || "(photo question)"}
              </CardTitle>
              <Badge className={`shrink-0 text-xs ${CONFIDENCE_COLORS[item.confidence]}`} variant="outline">
                {item.confidence}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{item.answer}</ReactMarkdown>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
