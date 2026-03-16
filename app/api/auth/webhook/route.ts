import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { syncClerkUser, deactivateClerkUser } from "@/lib/auth-sync";
import type { UserRole } from "@/types";

// POST /api/auth/webhook
// Receives Clerk webhook events (user.created, user.updated, user.deleted)
// and keeps our `users` table in sync.
export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { success: false, error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Verify the Svix signature
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { success: false, error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload: unknown = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id: clerkId, phone_numbers, public_metadata } = event.data;

    const primaryPhone = phone_numbers?.find(
      (p) => p.id === event.data.primary_phone_number_id
    );
    const phoneNumber = primaryPhone?.phone_number ?? "";

    // Role is set in Clerk public_metadata at onboarding.
    // Default to "student" when not yet set (first sign-up).
    const role = (public_metadata?.role as UserRole | undefined) ?? "student";

    await syncClerkUser({ clerkId, phoneNumber, role });
  }

  if (event.type === "user.deleted") {
    const { id: clerkId } = event.data;
    if (clerkId) await deactivateClerkUser(clerkId);
  }

  return NextResponse.json({ success: true });
}
