/**
 * POST /api/sessions/[sessionId]/post-session
 * Tutor submits post-session notes, objective outcome, and homework flag.
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { TutorObjectiveAchieved } from "@prisma/client";

const schema = z.object({
  objectiveAchieved: z.nativeEnum(TutorObjectiveAchieved),
  notes: z.string().max(500).optional().default(""),
  homeworkAssigned: z.boolean(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const { objectiveAchieved, notes, homeworkAssigned } = result.data;

    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: {
            tutor: { include: { user: { select: { clerkId: true } } } },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    if (session.booking.tutor.user.clerkId !== clerkId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await db.session.update({
      where: { id: sessionId },
      data: {
        tutorObjectiveAchieved: objectiveAchieved,
        tutorPostSessionNotes: notes,
        homeworkAssigned,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[session/post-session]", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
