import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";

// Expose Inngest functions — import and add to the array as functions are built
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [],
});
