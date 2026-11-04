import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_KEYS } from "@/constants/cookies.constants";

const ROLE_ROUTES: Record<string, string> = {
  STUDENT: "/student",
  LECTURER: "/lecturer",
  DEPARTMENT_ADMIN: "/dept-admin",
  SUPER_ADMIN: "/admin",
};

/**
 * Next.js 16 Proxy Network Boundary
 * Handles edge-level authentication, RBAC authorization, and redirects
 * to eliminate client-side screen flickers.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_KEYS.AUTH_TOKEN)?.value;
  const userCookie = request.cookies.get(COOKIE_KEYS.USER)?.value;

  let role: string | null = null;

  // 1. Resolve role from user cookie
  if (userCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(userCookie));
      role = parsed?.role || null;
    } catch {
      // fallback to jwt decoding
    }
  }

  // 2. Fallback: decode JWT payload if cookie parse failed
  if (!role && token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1], "base64").toString("utf8"),
        );
        role = payload?.role || null;
      }
    } catch {
      // invalid token
    }
  }

  const isAuthenticated = Boolean(token && role);
  const targetDashboard =
    role && ROLE_ROUTES[role] ? ROLE_ROUTES[role] : "/auth/login";

  const isAuthRoute = pathname.startsWith("/auth");
  const isLandingPage = pathname === "/" || pathname === "/login";
  const isStudentRoute = pathname.startsWith("/student");
  const isLecturerRoute = pathname.startsWith("/lecturer");
  const isDeptAdminRoute = pathname.startsWith("/dept-admin");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute =
    isStudentRoute || isLecturerRoute || isDeptAdminRoute || isAdminRoute;

  // Case A: Root/home url or /login alias -> redirect to role dashboard (if authenticated) or auth screen (if unauthenticated)
  if (isLandingPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Case B: Unauthenticated user accessing protected route -> Redirect to Login with redirect param
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Case C: Authenticated user accessing auth routes -> Redirect directly to role workspace
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // Case C: Authenticated user attempting cross-role boundary access -> Redirect to authorized Workspace
  if (isAuthenticated) {
    let isAuthorized = true;
    if (isStudentRoute && role !== "STUDENT") isAuthorized = false;
    if (isLecturerRoute && role !== "LECTURER") isAuthorized = false;
    if (isDeptAdminRoute && role !== "DEPARTMENT_ADMIN") isAuthorized = false;
    if (isAdminRoute && role !== "SUPER_ADMIN") isAuthorized = false;

    if (!isAuthorized) {
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
  }

  return NextResponse.next();
}

// Support both Next.js 16 proxy convention and middleware alias
export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets with extensions (png, svg, jpg, webp, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
