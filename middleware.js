import { NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/admin",
  "/publish-property",
  "/settings",
  "/credits",
  "/reviews",
  "/upload",
  "/requested",
  "/notifications",
];

const PUBLIC_ONLY = ["/login", "/register", "/forgot-password"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has("accessToken");
  const hasRefreshToken = request.cookies.has("refreshToken");
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const isPublicOnly = PUBLIC_ONLY.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicOnly && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)",
  ],
};
