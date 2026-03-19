import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { createClassroom } from "@/inngest/functions/create-classroom";
import { releasePayment } from "@/inngest/functions/release-payment";

export const dynamic = "force-dynamic";

const handler = serve({
  client: inngest,
  functions: [createClassroom, releasePayment],
});

export const GET = handler.GET;
export const POST = handler.POST;
export const PUT = handler.PUT;
