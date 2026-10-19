import * as Sentry from "@sentry/nextjs";

// Server/edge error reporting. No-op unless a DSN is set.
// Server reads the private SENTRY_DSN; the public one is a fallback.
export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  Sentry.init({
    dsn,
    environment:
      process.env.SENTRY_ENVIRONMENT ||
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
      process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    enabled: Boolean(dsn),
  });
}
