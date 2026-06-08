# Backend Security Configuration — TODO for casa-mx-backend

> Apply these changes to the Fastify backend repository before production launch.

---

## 1. Rate Limiting

Install and configure `@fastify/rate-limit` (MIT license, open source):

```bash
npm install @fastify/rate-limit
```

### Configuration (add to your Fastify server setup):

```typescript
import rateLimit from '@fastify/rate-limit';

await server.register(rateLimit, {
  global: true,
  max: 200,
  timeWindow: '1 minute',
  keyGenerator: (request) => request.ip,
  redis: redisClient, // Use Redis so limits survive server restarts
});

// Then override specific routes:
server.route({
  method: 'POST',
  url: '/auth/login',
  config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  handler: loginHandler,
});

server.route({
  method: 'POST',
  url: '/auth/register',
  config: { rateLimit: { max: 3, timeWindow: '1 minute' } },
  handler: registerHandler,
});

server.route({
  method: 'GET',
  url: '/properties',
  config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
  handler: getPropertiesHandler,
});

server.route({
  method: 'POST',
  url: '/properties',
  config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  handler: createPropertyHandler,
});

server.route({
  method: 'GET',
  url: '/maps/*',
  config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  handler: mapsProxyHandler,
});
```

### Rate limits summary:

| Route | Max Requests | Window |
|---|---|---|
| POST /auth/login | 5 | 60s |
| POST /auth/register | 3 | 60s |
| POST /auth/refresh | 10 | 60s |
| GET /properties | 100 | 60s |
| POST /properties | 20 | 60s |
| GET /maps/* | 30 | 60s |
| Global | 200 | 60s |

### Redis dependency:

If Redis is unavailable, rate limiting falls back to in-memory (works but resets on deploy). Redis is strongly recommended for production.

---

## 2. CORS Hardening

Replace any open CORS configuration with strict settings:

```typescript
import cors from '@fastify/cors';

await server.register(cors, {
  origin: process.env.FRONTEND_URL, // Exact match — "https://casa-mx.com"
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-csrf-token'],
  maxAge: 86400, // 24 hours
  // Do NOT set origin to '*', true, or any wildcard
});
```

### Verify in production:

```bash
# Should return the exact origin, NOT '*'
curl -H "Origin: https://casa-mx.com" -I https://api.casa-mx.com/health | grep Access-Control

# Should NOT include Access-Control-Allow-Origin
curl -H "Origin: https://evil.com" -I https://api.casa-mx.com/health | grep Access-Control
```

---

## 3. CSRF Token Verification

Ensure the backend verifies the CSRF token VALUE, not just its presence:

```typescript
// With @fastify/csrf-protection:
await server.register(csrfProtection, {
  cookieKey: '_csrf',
  cookieOpts: {
    httpOnly: false, // Must be readable by JS to send as header
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  },
});
```

The frontend already sends `x-csrf-token` header on non-GET requests. Verify the backend rejects requests where the header value doesn't match the cookie value.

---

## 4. Cookie Security

All cookies set by the backend should use these flags:

```typescript
// Access token cookie
{ httpOnly: true, secure: true, sameSite: 'strict', path: '/' }

// Refresh token cookie
{ httpOnly: true, secure: true, sameSite: 'strict', path: '/auth/refresh' }

// CSRF cookie
{ httpOnly: false, secure: true, sameSite: 'strict', path: '/' }
```

### Verify:

```bash
# Login response should have Set-Cookie with HttpOnly; Secure; SameSite=Strict
curl -X POST https://api.casa-mx.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  -I | grep -i set-cookie
```

---

## 5. Google Maps API Key Protection

### Current problem:

If `NEXT_PUBLIC_MAPS_API_KEY` or similar exists in the frontend, the Google Maps API key is exposed in the browser bundle and can be stolen.

### Required fix:

1. **Remove ALL Google Maps API keys from the frontend** (`.env.local`, `.env.production`, Vercel env vars)
2. **Route all geocoding/autocomplete through the backend**:

```typescript
// Frontend calls:
fetch(`${API_URL}/maps/autocomplete?input=roma+norte&session_token=xxx`)

// Backend proxies to Google:
server.get('/maps/autocomplete', async (request, reply) => {
  const { input, session_token } = request.query;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:mx&key=${process.env.GOOGLE_MAPS_API_KEY}&sessiontoken=${session_token}`;
  const response = await fetch(url);
  return response.json();
});
```

3. **In Google Cloud Console**, restrict the API key:
   - API restrictions: Places API, Geocoding API only
   - Application restrictions: HTTP referrers → your backend URL only
   - Set quota limits to prevent bill shock

---

## 6. File Upload Security

Before storing files to S3:

```typescript
// 1. Validate file type by magic bytes, not extension
import { fileTypeFromBuffer } from 'file-type';
const type = await fileTypeFromBuffer(buffer);
const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
if (!type || !allowed.includes(type.mime)) {
  throw new Error('Tipo de archivo no permitido');
}

// 2. Size limit (enforced server-side, not trusting client)
if (buffer.length > 10 * 1024 * 1024) { // 10MB
  throw new Error('El archivo excede 10MB');
}

// 3. Strip metadata from images using sharp
import sharp from 'sharp';
const stripped = await sharp(buffer)
  .rotate() // auto-orient based on EXIF
  .toBuffer();

// 4. Upload to S3 with content-type set explicitly
// 5. Return SIGNED URL (expires in 1 hour), never the raw S3 URL
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
  Bucket: bucketName,
  Key: fileKey,
}), { expiresIn: 3600 });
```

### Open-source tools (already available):
- `lovell/sharp` — MIT license, image processing
- `sindresorhus/file-type` — MIT license, magic byte detection

---

## 7. Database Indexes

Run this migration on the backend database:

```sql
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON "Property"("listingType");
CREATE INDEX IF NOT EXISTS idx_properties_status ON "Property"("status");
CREATE INDEX IF NOT EXISTS idx_properties_estado ON "Property"("estado");
CREATE INDEX IF NOT EXISTS idx_properties_ciudad ON "Property"("ciudad");
CREATE INDEX IF NOT EXISTS idx_properties_colonia ON "Property"("colonia");
CREATE INDEX IF NOT EXISTS idx_properties_price ON "Property"("price");
CREATE INDEX IF NOT EXISTS idx_properties_monthly_rent ON "Property"("monthlyRent");
CREATE INDEX IF NOT EXISTS idx_properties_condition ON "Property"("condition");
CREATE INDEX IF NOT EXISTS idx_properties_seller ON "Property"("sellerId");
CREATE INDEX IF NOT EXISTS idx_properties_type_estado_ciudad ON "Property"("listingType", "estado", "ciudad");
```

---

## 8. Audit Log Table

Add to Prisma schema:

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String   // 'login', 'register', 'logout', 'roleChange', 'propertyPublish', 'paymentAttempt', 'adminAction'
  details   Json?
  ip        String?
  createdAt DateTime @default(now())
}
```

Log on:
- Login attempts (success and failure)
- Registration
- Role changes
- Property publishing
- Payment attempts
- Admin actions (approvals, rejections)

---

## 9. Health Check Endpoints

```typescript
server.get('/health', async () => ({ status: 'ok' }));

server.get('/health/ready', async () => {
  try {
    await db.$queryRaw`SELECT 1`;
    await redis.ping();
    return { status: 'ok', db: 'connected', redis: 'connected' };
  } catch {
    return { status: 'degraded', db: 'connected', redis: 'disconnected' };
  }
});

server.get('/health/live', async () => ({ status: 'ok' }));
```

---

## 10. JWT Configuration

Ensure these are set in backend environment variables:

```bash
JWT_SECRET=<256-bit random hex string>   # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

---

## Priority Order (Apply in This Sequence)

1. Cookie security (item 4) — production safety
2. CORS hardening (item 2) — prevents data theft
3. CSRF verification (item 3) — prevents form forgery
4. Rate limiting (item 1) — prevents abuse
5. Google Maps proxy (item 5) — prevents API key theft
6. Database indexes (item 7) — performance
7. File upload security (item 6) — prevents malware
8. Audit log (item 8) — compliance
9. Health checks (item 9) — monitoring
10. JWT config (item 10) — verify during audit
