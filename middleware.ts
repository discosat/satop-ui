import { currentSession, SessionPayload } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/apply", "/wayf/callback"];

// Authentication middleware
export async function middleware(request: NextRequest) {
  const session = await currentSession();
  const path = request.nextUrl.pathname;

  if (path.startsWith("/api")) {
    return handleAPIRoutes(session, path);
  }

  if (isRouteProtected(session, path))
    return NextResponse.redirect(`${request.nextUrl.origin}/login`);
  return NextResponse.next();
}

function handleAPIRoutes(session: SessionPayload | null, path: string) {
  if (!session && path !== "/api/wayf")
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  return NextResponse.next();
}

function isRouteProtected(session: SessionPayload | null, path: string) {
  if (
    session ||
    publicRoutes.includes(path) ||
    path.startsWith("/_next") ||
    path.startsWith("/assets")
  ) {
    return false;
  }
  return true;
}
