"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  fileLabel?: string;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
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
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMediaType, setFileMediaType] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [used, setUsed] = useState(initialUsed);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const limitReached = isFree && used >= weeklyLimit;

  // Scroll to bottom on new messages — use scrollTop instead of scrollIntoView
  // to prevent parent containers from scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  // Set up voice recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    setVoiceSupported(true);
    const rec = new SpeechRecognitionAPI();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-IN";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript as string;
      setQuery(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  function processFile(file: File) {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const [prefix, base64] = dataUrl.split(",");
        const mime = prefix.match(/:(.*?);/)?.[1] ?? "image/jpeg";
        const supported = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mime) ? mime : "image/jpeg";
        setImageBase64(base64); setImageMediaType(supported); setImagePreview(dataUrl);
        setFileBase64(null); setFileMediaType(null); setFileLabel(null);
      };
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const [, base64] = dataUrl.split(",");
        setFileBase64(base64); setFileMediaType("application/pdf"); setFileLabel(file.name);
        setImageBase64(null); setImageMediaType(null); setImagePreview(null);
      };
      reader.readAsDataURL(file);
    } else if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setQuery(prev => prev ? `${prev}\n\n${text}` : text);
      };
      reader.readAsText(file);
    }
  }

  function clearAttachment() {
    setImageBase64(null); setImageMediaType(null); setImagePreview(null);
    setFileBase64(null); setFileMediaType(null); setFileLabel(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function toggleVoice() {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() && !imageBase64 && !fileBase64) return;
    setError(null);
    setLoading(true);

    // Snapshot before clearing
    const qText = query.trim();
    const imgB64 = imageBase64; const imgMime = imageMediaType; const imgPrev = imagePreview;
    const fB64 = fileBase64; const fMime = fileMediaType; const fLbl = fileLabel;

    // Optimistic user message
    setMessages(prev => [...prev, { role: "user", content: qText, imagePreview: imgPrev ?? undefined, fileLabel: fLbl ?? undefined }]);

    // Conversation history (last 10 messages before the new one)
    const historyForApi = messages.slice(-10).map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    setQuery("");
    clearAttachment();

    try {
      const res = await fetch("/api/askai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: qText,
          imageBase64: imgB64 ?? undefined,
          imageMediaType: imgMime ?? undefined,
          fileBase64: fB64 ?? undefined,
          fileMediaType: fMime ?? undefined,
          conversationHistory: historyForApi,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        if (json.error === "weekly_limit_reached") {
          setUsed(weeklyLimit);
        } else {
          setError(json.error ?? "Something went wrong");
          setMessages(prev => prev.slice(0, -1));
        }
        return;
      }

      setMessages(prev => [...prev, { role: "assistant", content: json.data.answer, confidence: json.data.confidence }]);
      setUsed(json.data.used);
    } catch {
      setError("Network error — please try again.");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className={`flex-1 min-h-0 overflow-y-auto space-y-4 pb-4 px-1 rounded-lg transition-colors ${isDragging ? "bg-primary/5 ring-2 ring-primary ring-inset" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); }}
      >
        {messages.length === 0 && !loading && (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground select-none">
            <div>
              <p className="text-5xl mb-4">🎓</p>
              <p className="font-semibold text-lg">Ask any board exam doubt</p>
              <p className="text-sm mt-1">Type, speak, or attach a photo / PDF / TXT</p>
              <p className="text-xs text-muted-foreground/50 mt-4">📎 Drag & drop files onto this area</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-primary-foreground space-y-2">
                {msg.imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={msg.imagePreview} alt="Attached image" className="max-h-48 rounded-lg" />
                )}
                {msg.fileLabel && (
                  <div className="flex items-center gap-1.5 text-sm opacity-80">
                    <span>📄</span><span>{msg.fileLabel}</span>
                  </div>
                )}
                {msg.content && (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              </div>
            ) : (
              <div className="max-w-[85%] space-y-1">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-medium text-muted-foreground">EduReach AI</span>
                  {msg.confidence && (
                    <Badge className={`text-[10px] px-1.5 py-0 h-4 ${CONFIDENCE_COLORS[msg.confidence]}`} variant="outline">
                      {msg.confidence}
                    </Badge>
                  )}
                </div>
                <div className="rounded-2xl rounded-tl-sm border bg-muted/40 px-4 py-3">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] space-y-1">
              <span className="px-1 text-xs font-medium text-muted-foreground">EduReach AI</span>
              <div className="rounded-2xl rounded-tl-sm border bg-muted/40 px-4 py-4">
                <div className="flex gap-1 items-center">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area — always at bottom */}
      <div className="shrink-0 border-t pt-3 pb-4 space-y-2">
        {/* Attachment preview strip */}
        {(imagePreview || fileLabel) && (
          <div className="flex items-center gap-2 px-1">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded object-cover border" />
            ) : (
              <div className="flex items-center gap-1.5 rounded border bg-muted px-2 py-1.5 text-sm">
                <span>📄</span><span className="max-w-[16rem] truncate">{fileLabel}</span>
              </div>
            )}
            <button
              type="button"
              onClick={clearAttachment}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-xs text-destructive hover:bg-destructive/20"
            >
              ✕
            </button>
          </div>
        )}

        {error && <p className="px-1 text-sm text-red-500">{error}</p>}

        {limitReached ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
            <p className="font-medium text-amber-900">You&apos;ve used all {weeklyLimit} free questions this week.</p>
            <a href="/student/subscription" className="mt-1 inline-block text-amber-700 underline">Upgrade now →</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder={isDragging ? "Drop file here…" : messages.length > 0 ? "Ask a follow-up… (Enter to send, Shift+Enter for new line)" : "Type your doubt… or drag & drop a photo / PDF"}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onPaste={e => {
                if (!e.clipboardData?.items) return;
                for (const item of Array.from(e.clipboardData.items)) {
                  if (item.kind === "file" && item.type.startsWith("image/")) {
                    e.preventDefault();
                    const f = item.getAsFile();
                    if (f) processFile(f);
                    return;
                  }
                }
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading && (query.trim() || imageBase64 || fileBase64)) handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              rows={2}
              disabled={loading}
              className="resize-none"
            />
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                title="Attach photo, PDF, or TXT file"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                📎
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,text/plain"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }}
              />
              {voiceSupported && (
                <Button
                  type="button"
                  variant={isListening ? "default" : "outline"}
                  size="sm"
                  title={isListening ? "Stop recording" : "Speak your question"}
                  onClick={toggleVoice}
                  disabled={loading}
                  className={isListening ? "animate-pulse" : ""}
                >
                  🎤
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading || (!query.trim() && !imageBase64 && !fileBase64)}
                className="ml-auto"
              >
                {loading ? "Thinking…" : "Send →"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

