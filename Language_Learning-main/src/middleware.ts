import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/vocabulary",
  "/grammar",
  "/speaking",
  "/writing",
  "/tutor",
  "/progress",
  "/lessons",
  "/achievements",
  "/certificates",
  "/settings",
];

// Routes that logged-in users should NOT see (redirect to dashboard)
const AUTH_ONLY_PREFIXES = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("auth-session")?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage  = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  // Unauthenticated user trying to access a protected page → /login
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login/register → /dashboard
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
