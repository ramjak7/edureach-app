import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";

const SaveAvailabilitySchema = z.object({
  tutorId: z.string().uuid(),
  slots: z.array(
    z.object({
      slotStart: z.string().datetime(),
      slotEnd: z.string().datetime(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SaveAvailabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const { tutorId, slots } = parsed.data;

    // Verify the user owns this tutor profile
    const user = await db.user.findUnique({
      where: { clerkId },
      include: { tutor: true },
    });

    if (!user?.tutor || user.tutor.id !== tutorId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Get date range from slots
    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Delete existing available slots (not booked ones) in the next 2 weeks
    await db.tutorAvailabilitySlot.deleteMany({
      where: {
        tutorId,
        slotStart: { gte: now, lte: twoWeeksLater },
        state: { in: ["available", "available_now"] },
      },
    });

    // Create new slots
    if (slots.length > 0) {
      await db.tutorAvailabilitySlot.createMany({
        data: slots.map((s) => ({
          tutorId,
          slotStart: new Date(s.slotStart),
          slotEnd: new Date(s.slotEnd),
          state: "available",
        })),
      });
    }

    return NextResponse.json({ success: true, slotsCreated: slots.length });
  } catch (error) {
    console.error("[tutor/availability] Error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

// GET: Fetch slots for a tutor (used by students viewing profile)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      return NextResponse.json({ success: false, error: "tutorId required" }, { status: 400 });
    }

    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const slots = await db.tutorAvailabilitySlot.findMany({
      where: {
        tutorId,
        slotStart: { gte: now, lte: twoWeeksLater },
        state: { in: ["available", "available_now"] },
      },
      orderBy: { slotStart: "asc" },
      select: {
        id: true,
        slotStart: true,
        slotEnd: true,
        state: true,
      },
    });

    return NextResponse.json({
      success: true,
      slots: slots.map((s) => ({
        id: s.id,
        slotStart: s.slotStart.toISOString(),
        slotEnd: s.slotEnd.toISOString(),
        state: s.state,
      })),
    });
  } catch (error) {
    console.error("[tutor/availability GET] Error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
