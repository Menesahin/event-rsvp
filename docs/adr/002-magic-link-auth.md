# ADR-002: Magic Link Authentication with Demo Bypass

## Status
**Accepted** — 2026-04-08

## Context
We need an authentication system for the event RSVP platform. Requirements:
- Minimal friction for tech community users
- No password management overhead
- Must work in demo/development without email infrastructure
- MVP scope — implement quickly

## Decision
Use **magic link (passwordless email)** authentication via NextAuth v5 with Resend provider. In development/demo mode, bypass actual email delivery and display the magic link directly in the UI.

## Alternatives Considered

### Option A: Email + Password
- **Pros:** Users are familiar with it, works offline, no external dependency.
- **Cons:** Password hashing, reset flows, strength validation, breach liability. Significant implementation overhead for MVP.
- **Rejected because:** Adds complexity without value. Tech-savvy users prefer passwordless.

### Option B: Social Login Only (Google/GitHub OAuth)
- **Pros:** Zero-friction for users who have Google/GitHub accounts. Very fast to implement.
- **Cons:** Requires OAuth app registration per provider, users without those accounts can't sign in, privacy concerns for some users.
- **Rejected because:** Excludes users without Google/GitHub. Also, OAuth requires callback URL configuration that complicates local development.

### Option C: Social Login + Magic Link (Hybrid)
- **Pros:** Maximum flexibility, users choose their preferred method.
- **Cons:** More UI complexity, more auth providers to configure and maintain.
- **Rejected because:** Over-scoped for MVP. Can add social login in v1.4.

## Demo Bypass Design

```
Production Flow:
  Email input → Resend sends email → User clicks link → Authenticated

Demo/Dev Flow:
  Email input → Token stored in DB → URL returned to client → Shown as button → Click → Authenticated
```

The bypass works by:
1. Intercepting the `sendVerificationRequest` callback in NextAuth config
2. When `DEV_MODE=true`, storing the callback URL instead of sending an email
3. The server action reads the stored URL and returns it to the client
4. The verify-request page renders a clickable "Open Magic Link" button

This means:
- No Resend API key needed for development
- No email inbox checking during demos
- Instant sign-in for testing all three roles
- The exact same auth flow runs in production (just with actual emails)

## Consequences

### Positive
- **Zero passwords:** No password storage, no reset flows, no breach liability.
- **Simple UX:** One input field (email), one button. Done.
- **Demo-friendly:** Show the platform without email infrastructure.
- **Secure:** Tokens are single-use, time-limited, and stored hashed.

### Negative
- **Email dependency (production):** Requires Resend account and API key for production.
- **Delivery delays:** Email can take seconds to arrive, adding friction vs. instant social login.
- **No offline auth:** Users need email access to sign in (no cached credentials).
- **Demo bypass risk:** Must ensure `DEV_MODE` is never `true` in production.

### Mitigations
- Resend free tier (3000 emails/month) is sufficient for MVP scale.
- `DEV_MODE` defaults to `false` — must be explicitly enabled.
- Future: add social login as an additional sign-in method (non-breaking change).
