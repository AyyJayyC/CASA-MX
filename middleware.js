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

  // Generate per-request nonce available to responses
  const apiOrigin =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  let apiUrl;
  try {
    apiUrl = new URL(apiOrigin).origin;
  } catch {
    apiUrl = "http://localhost:3001";
  }

  const isProd =
    process.env.VERCEL_ENV === "production" ||
    (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production");

  const response = NextResponse.next();

  if (isProd) {
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `img-src 'self' data: blob: https://*.unsplash.com https://*.tile.openstreetmap.org https://maps.googleapis.com https://*.s3.amazonaws.com https://*.s3.*.amazonaws.com ${apiUrl}`,
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' https://api.stripe.com https://*.tile.openstreetmap.org ${apiUrl}`,
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://hooks.stripe.com",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set(
      "Referrer-Policy",
      "strict-origin-when-cross-origin",
    );
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)",
  ],
};
