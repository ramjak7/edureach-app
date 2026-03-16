import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { student: true },
  });
  if (!user?.student) {
    return NextResponse.json(
      { success: false, error: "Student profile not found" },
      { status: 404 }
    );
  }

  const { board, classYear } = user.student;

  const questions = await db.contentObject.findMany({
    where: {
      type: "practice_question",
      productionStatus: "live",
      board,
      classYear,
    },
    select: {
      id: true,
      conceptId: true,
      difficultyLevel: true,
      questionText: true,
      options: true,
      // correctOptionId intentionally excluded — computed server-side on submit
      concept: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ conceptId: "asc" }, { difficultyLevel: "asc" }],
  });

  return NextResponse.json({ success: true, data: questions });
}
