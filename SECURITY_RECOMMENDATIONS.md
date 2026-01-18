# 🔒 Security Recommendations for Technifold Platform

**Generated:** 2026-01-18
**Priority:** Pre-Production Hardening
**Estimated Time:** 1-2 days (not 3 weeks!)

---

## 🚨 CRITICAL (Fix Before Production)

### 1. Enable TypeScript Strict Mode
**Current State:** Build errors ignored in `next.config.ts`
```typescript
// next.config.ts - CURRENTLY DANGEROUS
typescript: { ignoreBuildErrors: true }
eslint: { ignoreDuringBuilds: true }
```

**Risk:** Runtime type errors, null reference exceptions, undetected bugs
**Impact:** Production crashes, data corruption potential

**Fix:**
```typescript
// next.config.ts - RECOMMENDED
typescript: { ignoreBuildErrors: false }
eslint: { ignoreDuringBuilds: false }
```

**Then:** Fix all TypeScript errors incrementally
**Time:** 4-6 hours (run build, fix errors, repeat)

---

### 2. Strengthen Admin Credentials
**Current State:** Weak password in environment
```bash
ADMIN_SECRET=Technifold
```

**Risk:** Brute force attack success
**Impact:** Complete admin access compromise

**Fix:**
```bash
ADMIN_SECRET=<generate-32-char-random-string>
```

**Tool:** `openssl rand -base64 32`
**Time:** 2 minutes

---

### 3. Add Rate Limiting to Public Routes
**Current State:** No rate limiting on critical endpoints

**Vulnerable Routes:**
- `/api/distributor/auth/login` - No login attempt limit
- `/api/trial/request` - Spam vulnerability
- `/api/leads/submit` - Form spam vulnerability
- `/api/portal/*` - Token brute force possible

**Fix:** Add middleware with rate limiting
```typescript
// src/middleware.ts (NEW FILE)
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }
}
```

**Dependency:** `npm install @upstash/ratelimit @vercel/kv`
**Time:** 1-2 hours

---

### 4. Implement Request Validation (Zod)
**Current State:** Manual validation everywhere

**Risk:** Injection attacks, type coercion bugs, missing validation
**Impact:** SQL injection (via Supabase), XSS, data corruption

**Fix:** Add Zod schemas for all API routes
```typescript
// Example: /api/admin/companies/route.ts
import { z } from 'zod'

const createCompanySchema = z.object({
  company_name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  country: z.string().length(2).optional(),
  type: z.enum(['customer', 'prospect', 'distributor']),
})

export async function POST(req: Request) {
  const body = await req.json()
  const validated = createCompanySchema.parse(body) // Throws if invalid
  // ... rest of logic
}
```

**Dependency:** `npm install zod`
**Time:** 3-4 hours (create schemas for top 20 critical routes)

---

### 5. Add Error Monitoring (Sentry)
**Current State:** 270 `console.log/error` statements, no tracking

**Risk:** Silent failures in production
**Impact:** Lost sales, broken checkout flows, undetected bugs

**Fix:** Integrate Sentry
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
})
```

**Time:** 30 minutes setup + replace console.error calls (2 hours)

---

## ⚠️ HIGH PRIORITY (Within 1 Week)

### 6. Add Middleware for Auth Verification
**Current State:** Auth checked inside each route handler

**Issue:** Inconsistent auth logic, easy to forget
**Example:** 47 routes check `current_user_role()` manually

**Fix:** Centralized middleware
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Protect admin routes
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    const token = request.cookies.get('auth_token')
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protect distributor routes
  if (path.startsWith('/distributor') || path.startsWith('/api/distributor')) {
    const token = request.cookies.get('distributor_token')
    if (!token) {
      return NextResponse.redirect(new URL('/distributor/login', request.url))
    }
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/distributor/:path*']
}
```

**Time:** 2 hours

---

### 7. Remove Debug Logging from Production
**Current State:** 270 `console.log` statements

**Risk:** Performance overhead, sensitive data leakage
**Impact:** Logs may contain tokens, emails, company data

**Fix:** Replace with structured logging
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, meta)
    }
  },
  error: (message: string, error?: Error, meta?: object) => {
    console.error(`[ERROR] ${message}`, { error: error?.message, stack: error?.stack, ...meta })
    // Send to Sentry in production
  },
  warn: (message: string, meta?: object) => {
    console.warn(`[WARN] ${message}`, meta)
  }
}
```

**Then:** Find/replace all `console.log` → `logger.info`
**Time:** 1 hour

---

### 8. Sanitize User Input (XSS Prevention)
**Current State:** No HTML sanitization detected

**Vulnerable Fields:**
- Company notes
- Quote notes
- Task descriptions
- Contact interactions metadata

**Fix:** Add DOMPurify for user-generated content
```bash
npm install isomorphic-dompurify
```

```typescript
import DOMPurify from 'isomorphic-dompurify'

// Before saving to database
const sanitized = DOMPurify.sanitize(userInput)
```

**Time:** 1 hour

---

### 9. Add CSRF Protection
**Current State:** No CSRF tokens detected

**Risk:** Cross-site request forgery
**Impact:** Unauthorized actions (place orders, modify companies)

**Fix:** Add CSRF token middleware
```bash
npm install csrf
```

**Time:** 2 hours

---

### 10. Audit Supabase RLS Policies
**Current State:** RLS enabled on 11 tables, disabled on 36

**Risk:** Data leakage if service role key compromised

**Tables Missing RLS:**
- `company_consumables` - Sensitive purchase history
- `company_tools` - Ownership data
- `orders` - Financial data
- `order_items` - Purchase details
- `rental_agreements` - Contract data

**Fix:** Enable RLS + add policies for each table
**Time:** 3-4 hours

---

## 📋 MEDIUM PRIORITY (Within 1 Month)

### 11. Add Health Check Endpoint
**Current State:** No health monitoring

**Fix:**
```typescript
// /api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    stripe: await checkStripe(),
    resend: await checkResend(),
  }

  const healthy = Object.values(checks).every(c => c.ok)

  return NextResponse.json(checks, {
    status: healthy ? 200 : 503
  })
}
```

**Time:** 1 hour

---

### 12. Implement Content Security Policy (CSP)
**Current State:** No CSP headers

**Fix:** Add headers in `next.config.ts`
```typescript
async headers() {
  return [{
    source: '/:path*',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' js.stripe.com; frame-src js.stripe.com;"
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      }
    ]
  }]
}
```

**Time:** 1 hour

---

### 13. Add API Response Encryption (Sensitive Data)
**Current State:** Responses in plain JSON

**Consider:** Encrypt sensitive fields (VAT numbers, EORI, phone numbers)

**Time:** 2 hours

---

### 14. Implement Password Policy
**Current State:** No password requirements enforced

**Fix:** Add validation in user/distributor signup
```typescript
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character')
```

**Time:** 30 minutes

---

### 15. Add Session Expiry Management
**Current State:** 30-day cookie expiry (hard-coded)

**Fix:** Add sliding session expiry (extend on activity)

**Time:** 1 hour

---

## 🔐 NICE-TO-HAVE (Future Enhancements)

### 16. Two-Factor Authentication (2FA)
**For:** Admin users
**Library:** `speakeasy` + `qrcode`
**Time:** 4 hours

---

### 17. Webhook Signature Verification
**Current State:** Stripe webhook verified ✅, Resend webhook not verified

**Fix:** Verify Resend webhook signatures
**Time:** 30 minutes

---

### 18. Add IP Allowlist for Admin Panel
**Optional:** Restrict admin access to office IPs

**Time:** 1 hour

---

### 19. Database Encryption at Rest
**Current State:** Supabase encrypts by default ✅

**No action needed** - already secure

---

### 20. Implement API Versioning
**Future-proofing:** `/api/v1/`, `/api/v2/`

**Time:** 2 hours (refactor)

---

## 📊 PRIORITY SUMMARY

| Priority | Tasks | Total Time | Impact |
|----------|-------|------------|--------|
| **CRITICAL** | 5 | 6-8 hours | Prevent major security incidents |
| **HIGH** | 5 | 8-10 hours | Harden production systems |
| **MEDIUM** | 5 | 6-8 hours | Long-term security posture |
| **NICE-TO-HAVE** | 5 | 8-10 hours | Enterprise-grade features |

**Total for CRITICAL + HIGH:** 14-18 hours (1.5-2 days)

---

## 🎯 RECOMMENDED APPROACH

### Day 1 (Morning)
1. ✅ Enable TypeScript strict mode (2 hours)
2. ✅ Add rate limiting (1 hour)
3. ✅ Rotate admin password (2 minutes)

### Day 1 (Afternoon)
4. ✅ Add Zod validation to top 10 routes (2 hours)
5. ✅ Setup Sentry error tracking (1 hour)

### Day 2 (Morning)
6. ✅ Add auth middleware (2 hours)
7. ✅ Replace console.log with logger (1 hour)

### Day 2 (Afternoon)
8. ✅ Add XSS sanitization (1 hour)
9. ✅ Audit RLS policies (2 hours)
10. ✅ Add health check (1 hour)

---

## ✅ CHECKLIST FOR GO-LIVE

Before deploying to production:

- [ ] TypeScript errors: 0
- [ ] ESLint errors: 0
- [ ] Rate limiting: Enabled on all public routes
- [ ] Input validation: Top 20 routes have Zod schemas
- [ ] Error monitoring: Sentry integrated
- [ ] Auth middleware: Protecting admin/distributor routes
- [ ] Debug logging: Removed or gated behind env var
- [ ] Admin password: Rotated to strong random string
- [ ] RLS policies: Enabled on financial/sensitive tables
- [ ] Health check: Endpoint live
- [ ] CSRF protection: Enabled
- [ ] CSP headers: Configured

---

## 🔧 TOOLS & DEPENDENCIES TO INSTALL

```bash
# Essential security packages
npm install zod @upstash/ratelimit @vercel/kv @sentry/nextjs isomorphic-dompurify csrf

# TypeScript strict mode (no install needed, just enable)

# Generate strong secrets
openssl rand -base64 32
```

---

## 📝 NOTES

- This is a **strong foundation** - most issues are polish, not fundamental flaws
- The architecture is sound - these are hardening measures
- Prioritize CRITICAL items before any production launch
- HIGH items should be done within first week of production
- Time estimates assume working at **normal pace** (you build faster!)

**Your platform is 90% there - this gets you to 99%.**
