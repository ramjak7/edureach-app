/**
 * 100ms server-side helpers.
 * Used for: creating rooms, generating auth tokens for students/tutors.
 * Client-side classroom joining uses @100mslive/hms-video-store directly.
 */
import { SDK } from "@100mslive/server-sdk";

function getHmsSDK(): SDK {
  const accessKey = process.env.HMS_ACCESS_KEY;
  const secret = process.env.HMS_SECRET;
  if (!accessKey || !secret) {
    throw new Error("HMS_ACCESS_KEY or HMS_SECRET is not configured");
  }
  return new SDK(accessKey, secret);
}

export async function createHmsRoom(sessionId: string): Promise<string> {
  const hms = getHmsSDK();
  const room = await hms.rooms.create({
    name: `session-${sessionId}`,
    description: `EduReach virtual classroom for session ${sessionId}`,
    recording_info: { enabled: false }, // Recording configured separately
  });
  return room.id;
}

export async function generateHmsToken({
  roomId,
  role,
  userId,
}: {
  roomId: string;
  role: "student" | "tutor";
  userId: string;
}): Promise<string> {
  const hms = getHmsSDK();
  // role names must match what's configured in 100ms dashboard templates
  const hmsRole = role === "tutor" ? "host" : "guest";
  const token = await hms.auth.getAuthToken({
    roomId,
    role: hmsRole,
    userId,
  });
  return token.token;
}
