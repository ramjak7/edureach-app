import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { UserRole } from "@/types";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/auth/webhook(.*)",
]);

// Route home for each role — used for redirects after login
const roleHomeMap: Record<UserRole, string> = {
  student: "/student/dashboard",
  parent: "/parent/dashboard",
  tutor: "/tutor/dashboard",
  admin: "/admin/dashboard",
};

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // For "/" — redirect to role home if signed in, else to sign-in
  if (pathname === "/") {
    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.redirect(new URL("/sign-in", request.url));
    const role =
      (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ??
      "student";
    return NextResponse.redirect(new URL(roleHomeMap[role], request.url));
  }

  if (isPublicRoute(request)) return NextResponse.next();

  // Protect all non-public routes — redirects to sign-in if unauthenticated
  const { sessionClaims } = await auth.protect();

  const role =
    (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ??
    "student";


  // Prevent cross-role access (e.g. a student hitting /tutor/*)
  const routeRole = pathname.split("/")[1] as UserRole;
  const ownedRoles = Object.keys(roleHomeMap) as UserRole[];
  if (ownedRoles.includes(routeRole) && routeRole !== role) {
    return NextResponse.redirect(new URL(roleHomeMap[role], request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
