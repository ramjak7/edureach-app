import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { createClassroom } from "@/inngest/functions/create-classroom";
import { releasePayment } from "@/inngest/functions/release-payment";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [createClassroom, releasePayment],
});
