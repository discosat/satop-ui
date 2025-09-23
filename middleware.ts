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

  const redirectURL =
    session?.role === "applicant"
      ? `${request.nextUrl.origin}/apply`
      : `${request.nextUrl.origin}/login`;
  if (isRouteProtected(session, path))
    return NextResponse.redirect(redirectURL);
  return NextResponse.next();
}

function handleAPIRoutes(session: SessionPayload | null, path: string) {
  if (!session && path !== "/api/wayf")
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  return NextResponse.next();
}

function isRouteProtected(session: SessionPayload | null, path: string) {
  if (
    publicRoutes.includes(path) ||
    path.startsWith("/_next") ||
    path.startsWith("/assets")
  ) {
    return false;
  }
  if (session?.role === "applicant" && path != "/apply") {
    return true;
  }
  if (session) {
    return false;
  }
  return true;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
}
