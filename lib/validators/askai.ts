import { z } from "zod";

const SUPPORTED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
export type SupportedMediaType = typeof SUPPORTED_MEDIA_TYPES[number];

const ConversationMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

export const AskAIRequestSchema = z.object({
  query: z.string().min(0).max(2000),
  imageBase64: z.string().optional(),
  imageMediaType: z.enum(SUPPORTED_MEDIA_TYPES).optional(),
  fileBase64: z.string().optional(),
  fileMediaType: z.string().max(100).optional(),
  conversationHistory: z.array(ConversationMessageSchema).max(10).optional(),
});

export type AskAIRequestInput = z.infer<typeof AskAIRequestSchema>;
