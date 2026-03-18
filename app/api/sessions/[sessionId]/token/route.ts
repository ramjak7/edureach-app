/**
 * GET /api/sessions/[sessionId]/token
 * Generates a 100ms auth token for the signed-in student or tutor to join the classroom.
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { generateHmsToken } from "@/lib/hms";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: {
            student: { include: { user: { select: { id: true, clerkId: true } } } },
            tutor: { include: { user: { select: { id: true, clerkId: true } } } },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    if (!session.hmsRoomId) {
      return NextResponse.json(
        { success: false, error: "Classroom not ready yet" },
        { status: 425 } // Too Early
      );
    }

    const studentClerkId = session.booking.student.user.clerkId;
    const tutorClerkId = session.booking.tutor.user.clerkId;

    let role: "student" | "tutor";
    let userId: string;

    if (clerkId === studentClerkId) {
      role = "student";
      userId = session.booking.student.user.id;
    } else if (clerkId === tutorClerkId) {
      role = "tutor";
      userId = session.booking.tutor.user.id;
    } else {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const token = await generateHmsToken({
      roomId: session.hmsRoomId,
      role,
      userId,
    });

    return NextResponse.json({ success: true, token, role });
  } catch (err) {
    console.error("[session-token]", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
