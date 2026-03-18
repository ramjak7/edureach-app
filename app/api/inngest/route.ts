import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { createClassroom } from "@/inngest/functions/create-classroom";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [createClassroom],
});
