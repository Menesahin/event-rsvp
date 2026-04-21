# Event RSVP - Security Specification

## Authentication

### Magic Link Flow

```
User enters email
    │
    ▼
Server Action: requestMagicLink(email)
    │
    ├─── Production: Resend sends email with signed callback URL
    │
    └─── Dev/Demo: URL stored in VerificationToken, returned to client
    │
    ▼
User clicks magic link (GET /api/auth/callback/resend?token=...)
    │
    ▼
NextAuth verifies token + creates session
    │
    ▼
Session cookie set (httpOnly, secure, sameSite: lax)
    │
    ▼
User redirected to callback URL or /dashboard
```

### Session Management

| Property | Value |
|----------|-------|
| Strategy | Database sessions (not JWT) |
| Cookie | `httpOnly`, `secure` (prod), `sameSite: lax` |
| Expiry | 30 days (configurable) |
| Rotation | New session token on each request (NextAuth default) |
| CSRF | Protected by NextAuth's built-in CSRF token |

### Token Security

- Magic link tokens expire after **24 hours**
- Tokens are **single-use** — consumed on first verification
- Tokens are stored hashed in the database
- Only the latest token per email is valid

---

## Authorization (RBAC)

### Role Hierarchy

```
ADMIN > ORGANIZER > ATTENDEE > Visitor (unauthenticated)
```

### Permission Matrix

| Action | Visitor | Attendee | Organizer | Admin |
|--------|---------|----------|-----------|-------|
| View event listing | ✓ | ✓ | ✓ | ✓ |
| View event detail | ✓ | ✓ | ✓ | ✓ |
| RSVP to event | ✗ | ✓ | ✓ | ✓ |
| Cancel own RSVP | ✗ | ✓ | ✓ | ✓ |
| Create event | ✗ | ✗ | ✓ | ✓ |
| Edit own event | ✗ | ✗ | ✓ | ✓ |
| Cancel own event | ✗ | ✗ | ✓ | ✓ |
| Submit for review | ✗ | ✗ | ✓ | ✓ |
| Approve/reject events | ✗ | ✗ | ✗ | ✓ |
| Access admin panel | ✗ | ✗ | ✗ | ✓ |

### Implementation

Guards are composable functions called at the top of pages and server actions:

```
requireAuth()       → Redirects to /sign-in if not authenticated
requireRole(role)   → Redirects to /dashboard if insufficient role
requireOwnership()  → Checks user owns the resource (event)
```

**Double-check principle:** Guards run in both:
1. **Layout/Page level** — prevents rendering unauthorized UI
2. **Server Action level** — prevents unauthorized mutations even if UI is bypassed

---

## Input Validation

### Strategy

All user input is validated at the **server action boundary** using Zod schemas. Client-side validation is optional UX enhancement only — never trusted.

### Validation Rules

| Field | Validation |
|-------|-----------|
| Email | `z.string().email()` |
| Event title | `z.string().min(1).max(120)` |
| Event description | `z.string().min(1).max(5000)` |
| Event date | `z.string().datetime()`, must be in the future (for new events) |
| Location | `z.string().min(1).max(200)` |
| Capacity | `z.number().int().min(1).max(10000)` |
| Cover image URL | `z.string().url().optional()` |
| Speaker name | `z.string().min(1).max(100)` |
| Speaker title | `z.string().max(100).optional()` |
| Speaker bio | `z.string().max(500).optional()` |
| Speaker avatar URL | `z.string().url().optional()` |

### XSS Prevention

- All user-generated content is rendered through React's built-in escaping
- Event descriptions: if markdown is supported, use a sanitization library (e.g., `sanitize-html`) before rendering
- URL fields: validated as proper URLs, rendered in `href` attributes only
- No `dangerouslySetInnerHTML` without sanitization

---

## Data Protection

### What We Store

| Data | Sensitivity | Retention |
|------|------------|-----------|
| Email address | PII | Until account deletion |
| Display name | PII | Until account deletion |
| Avatar URL | Low | Until changed/deleted |
| RSVP records | Low | Permanent (event history) |
| Session tokens | High | Auto-expire after 30 days |
| Magic link tokens | High | Auto-expire after 24 hours |

### What We Don't Store

- Passwords (passwordless auth)
- Payment information
- IP addresses (beyond what hosting provider logs)
- Detailed access logs

### Data Exposure

| Endpoint | What's Exposed | To Whom |
|----------|---------------|---------|
| Event detail page | Event data, speaker data, attendee count | Everyone |
| Attendee info | Only count (e.g., "24/50") | Everyone |
| User email | Never shown publicly | Only in admin panel + own dashboard |
| Organizer name | Shown on event page | Everyone |

---

## Rate Limiting

Not implemented in MVP. Future considerations:
- Magic link requests: max 5 per email per hour
- RSVP actions: max 20 per user per hour
- Event creation: max 10 per user per day

---

## Environment Variables

| Variable | Required | Sensitivity | Notes |
|----------|----------|------------|-------|
| `DATABASE_URL` | Yes | High | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | High | NextAuth signing key. Generate with `npx auth secret` |
| `AUTH_RESEND_KEY` | Prod only | High | Resend API key for sending emails |
| `DEV_MODE` | Dev only | Low | Enables magic link bypass |

### Security Rules
- Never commit `.env` files
- Use `.env.example` with placeholder values
- `AUTH_SECRET` must be at least 32 characters
- Rotate `AUTH_SECRET` if compromised (invalidates all sessions)

---

## Threat Model (MVP Scope)

| Threat | Mitigation |
|--------|-----------|
| CSRF on mutations | NextAuth CSRF tokens + Server Actions (POST-only) |
| Session hijacking | httpOnly + secure cookies, session rotation |
| Privilege escalation | Server-side role checks on every action |
| Duplicate RSVP | Database unique constraint + Serializable transaction |
| Race condition (waitlist) | Serializable isolation level |
| XSS via event content | React escaping + markdown sanitization |
| Broken magic links | Token expiration + single-use |
| Enumeration (user emails) | Same response for existing/non-existing emails |
