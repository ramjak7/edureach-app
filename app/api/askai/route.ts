import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { ContentBlockParam } from "@anthropic-ai/sdk/resources";

import { db } from "@/lib/db";
import { anthropic } from "@/lib/askai";
import { AskAIRequestSchema, type SupportedMediaType } from "@/lib/validators/askai";

const VISION_API_KEY = process.env.GOOGLE_CLOUD_VISION_API_KEY!;
const VISION_ENDPOINT = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

type Likelihood = "UNKNOWN" | "VERY_UNLIKELY" | "UNLIKELY" | "POSSIBLE" | "LIKELY" | "VERY_LIKELY";
const UNSAFE: Likelihood[] = ["LIKELY", "VERY_LIKELY"];

interface VisionResult {
  safetyPass: boolean;
  extractedText: string;
}

async function analyseImage(base64: string): Promise<VisionResult> {
  const body = {
    requests: [{
      image: { content: base64 },
      features: [
        { type: "SAFE_SEARCH_DETECTION", maxResults: 1 },
        { type: "TEXT_DETECTION", maxResults: 1 },
      ],
    }],
  };

  const res = await fetch(VISION_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[vision] API error", res.status);
    // Fail open — don’t block student if Vision is down
    return { safetyPass: true, extractedText: "" };
  }

  const data = await res.json();
  const response = data.responses?.[0];

  // Safe Search check
  const ss = response?.safeSearchAnnotation ?? {};
  const safetyPass = !(UNSAFE.includes(ss.adult) || UNSAFE.includes(ss.violence) || UNSAFE.includes(ss.racy));

  // OCR
  const extractedText: string = response?.textAnnotations?.[0]?.description ?? "";

  return { safetyPass, extractedText };
}

export const dynamic = "force-dynamic";

// Prompt injection patterns — PRD Section 8.2
const INJECTION_PATTERNS = [
  /ignore\s+previous/i,
  /you\s+are\s+now/i,
  /system\s+prompt/i,
  /\bDAN\b/,
  /jailbreak/i,
  /forget\s+(all\s+)?instructions/i,
  /act\s+as\s+if/i,
];

function detectPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(text));
}

const SYSTEM_PROMPT = `You are an expert Indian K-12 board exam tutor. \
You only answer questions related to CBSE, ICSE, and state board curricula for Classes 6–12. \
Explain step-by-step as a patient teacher would. \
Reference the specific board and class in your answer. \
If the question is not about board exam curriculum, say: \
"I can only help with your board exam subjects."`;

// Free-tier weekly limit (PRD Section 6.1)
const FREE_TIER_WEEKLY_LIMIT = 5;

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { student: true },
  });
  if (!user?.student) {
    return NextResponse.json(
      { success: false, error: "Student profile not found" },
      { status: 404 }
    );
  }

  const { student } = user;

  // Enforce free-tier limit
  if (student.subscriptionTier === "free") {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const usedThisWeek = await db.askAIQuery.count({
      where: { studentId: student.id, createdAt: { gte: weekAgo } },
    });
    if (usedThisWeek >= FREE_TIER_WEEKLY_LIMIT) {
      return NextResponse.json(
        { success: false, error: "weekly_limit_reached", used: usedThisWeek, limit: FREE_TIER_WEEKLY_LIMIT },
        { status: 429 }
      );
    }
  }

  const body = await req.json();
  const parsed = AskAIRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { query, imageBase64, imageMediaType } = parsed.data;

  // 1. Prompt injection check
  const injectionDetected = detectPromptInjection(query);
  if (injectionDetected) {
    await db.askAIQuery.create({
      data: {
        studentId: student.id,
        queryText: query,
        responseText: "Prompt injection detected.",
        confidence: "LOW",
        board: student.board,
        classYear: student.classYear,
        promptInjection: true,
      },
    });
    return NextResponse.json(
      { success: false, error: "I can only help with board exam questions." },
      { status: 400 }
    );
  }

  // 2. Google Vision — Safe Search + OCR (when image provided)
  let extractedText = "";
  let imageSafetyPass: boolean | null = null;

  if (imageBase64) {
    const vision = await analyseImage(imageBase64);
    imageSafetyPass = vision.safetyPass;
    if (!vision.safetyPass) {
      return NextResponse.json(
        { success: false, error: "The uploaded image could not be processed. Please upload a photo of your textbook or question paper." },
        { status: 400 }
      );
    }
    extractedText = vision.extractedText;
  }

  // 3. Build message content for Claude
  const content: ContentBlockParam[] = [];

  if (imageBase64) {
    const mediaType: SupportedMediaType = imageMediaType ?? "image/jpeg";
    content.push({
      type: "image",
      source: { type: "base64", media_type: mediaType, data: imageBase64 },
    });
  }

  // Combine typed query + OCR text
  const combinedQuery = [query.trim(), extractedText.trim()].filter(Boolean).join("\n\n[Text extracted from image:]\n");
  const fullQuery = `Board: ${student.board} | Class: ${student.classYear}\n\n${combinedQuery}`;
  content.push({ type: "text", text: fullQuery });

  // 3. Call Anthropic Claude
  let responseText: string;
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });
    const firstBlock = message.content[0];
    responseText = firstBlock.type === "text" ? firstBlock.text : "";
  } catch (err) {
    console.error("[askai] Claude error:", err);
    return NextResponse.json(
      { success: false, error: "AI service unavailable. Please try again." },
      { status: 502 }
    );
  }

  // 4. Compute simple confidence based on response length
  const confidence =
    responseText.length > 400 ? "HIGH" : responseText.length > 150 ? "MEDIUM" : "LOW";

  // 5. Persist query
  await db.askAIQuery.create({
    data: {
      studentId: student.id,
      queryText: query || "(photo question)",
      extractedText: extractedText || null,
      responseText,
      confidence,
      board: student.board,
      classYear: student.classYear,
      promptInjection: false,
      imageSafetyPass,
    },
  });

  // 6. Weekly usage count for UI
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const used = await db.askAIQuery.count({
    where: { studentId: student.id, createdAt: { gte: weekAgo }, promptInjection: false },
  });

  return NextResponse.json({
    success: true,
    data: {
      answer: responseText,
      confidence,
      used,
      limit: student.subscriptionTier === "free" ? FREE_TIER_WEEKLY_LIMIT : null,
    },
  });
}
