import { z } from "zod";

export const StudentRegistrationSchema = z.object({
  displayName: z.string().min(2).max(50),
  board: z.enum(["CBSE", "ICSE", "Maharashtra", "UP_Board"]),
  classYear: z.coerce.number().int().min(6).max(12),
  targetExamScore: z.coerce.number().int().min(1).max(100).optional(),
});

export const DiagnosticSubmitSchema = z.object({
  attempts: z
    .array(
      z.object({
        contentObjectId: z.string().min(1).max(100),
        conceptId: z.string().min(1).max(100),
        selectedOptionId: z.string().max(10),
        timeTakenSeconds: z.number().int().min(0).max(600),
      })
    )
    .min(1)
    .max(20),
});

export type StudentRegistrationInput = z.infer<typeof StudentRegistrationSchema>;
export type DiagnosticSubmitInput = z.infer<typeof DiagnosticSubmitSchema>;
