import { z } from "zod";

const SUPPORTED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
export type SupportedMediaType = typeof SUPPORTED_MEDIA_TYPES[number];

export const AskAIRequestSchema = z.object({
  query: z.string().min(0).max(2000),
  imageBase64: z.string().optional(),
  imageMediaType: z.enum(SUPPORTED_MEDIA_TYPES).optional(),
});

export type AskAIRequestInput = z.infer<typeof AskAIRequestSchema>;
