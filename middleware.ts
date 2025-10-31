import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login"];
  const isPublicRoute = publicRoutes.includes(path);
  
  // Get the session
  const session = await auth0.getSession(request);
  
  // If user is authenticated and trying to access login page, redirect to platform
  if (session && path === "/login") {
    return NextResponse.redirect(new URL("/platform", request.url));
  }
  
  // If user is not authenticated and trying to access protected route, redirect to login
  if (!session && !isPublicRoute && !path.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Let Auth0 middleware handle its routes and maintain session
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};