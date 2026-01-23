# NotRenewing - Production Readiness Progress

## Critical (Must Fix Before Launch)

- [x] **Password Reset** - Forgot password flow added
- [x] **Error Pages** - Custom 404/500 pages added
- [x] **Transfer Confirmation UI** - Buyers can confirm receipt and open disputes
- [x] **Refund Process** - Stripe refunds integrated into dispute resolution
- [x] **Rate Limiting** - In-memory rate limiter for API endpoints
- [x] **Security Headers** - CSP, X-Frame-Options, etc. added via middleware

## High Priority

- [x] **SEO** - sitemap.xml and robots.txt added
- [ ] **Seller Payouts** - Payment captured but no payout execution to sellers
- [ ] **Email Verification** - Users can sign up without verifying email
- [ ] **Dispute UI** - Admin can view disputes, resolution workflow needed
- [ ] **Error Monitoring** - No Sentry or similar for tracking errors

## Completed

- [x] Authentication (login/signup)
- [x] Password reset flow
- [x] Stripe payments (checkout, webhooks)
- [x] Email notifications (6 different email types)
- [x] Domain verification via DNS
- [x] Admin panel (domains, sellers, disputes, pages)
- [x] Mobile responsive design
- [x] Database with proper security (RLS)
- [x] Hero section UI improvements
- [x] Staff Pick feature
- [x] FAQ page with accordion
- [x] Custom 404 page
- [x] Custom 500/error page
- [x] sitemap.xml (dynamic)
- [x] robots.txt
- [x] Transfer confirmation page for buyers
- [x] Dispute opening flow
- [x] Stripe refund processing
- [x] Rate limiting middleware
- [x] Security headers (CSP, X-Frame-Options, etc.)

## Recently Added

### Password Reset Flow
- `/forgot-password` - Request password reset email
- `/reset-password` - Set new password after clicking email link
- Added "Forgot password?" link on login page

### Error Pages
- `/not-found.tsx` - Custom 404 page
- `/error.tsx` - Custom 500/error page with retry button

### SEO
- `/robots.ts` - Blocks admin, API, dashboard from crawlers
- `/sitemap.ts` - Dynamic sitemap with all active domain listings

### Transfer Confirmation
- `/transfer/[token]` - Buyer can confirm receipt or open dispute
- `/api/transfers/confirm` - API to mark transfer complete
- `/api/transfers/dispute` - API to open a dispute

### Refund Process
- `/api/transfers/refund` - Admin can process refunds
- `/api/admin/disputes` - Updated to process Stripe refunds when resolving disputes
- Automatic listing re-activation after refund

### Rate Limiting
- `/src/lib/rate-limit.ts` - In-memory rate limiter
- `/src/lib/api-utils.ts` - Helper functions for API routes
- Applied to domain submission (5/hour) and verification (20/min) endpoints

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Content-Security-Policy: Configured for Stripe and Supabase

## Remaining Items

### High Priority
- Seller Payouts via Stripe Connect
- Email verification on signup
- Error monitoring (Sentry integration)

### Nice to Have
- Two-factor authentication
- Automated transfer deadline enforcement
- Comprehensive payment history UI
- CI/CD pipeline
