# ADR-001: Next.js 16.2 Full-Stack Architecture

## Status
**Accepted** — 2026-04-08

## Context
We need a tech stack for an MVP event RSVP platform targeting tech communities. Key requirements:
- Fast time-to-ship (MVP scope)
- Server-side rendering for SEO (public event pages)
- Type-safe data mutations
- Simple deployment story
- Single developer / small team

## Decision
Use **Next.js 16.2** as a full-stack framework with App Router, React Server Components, and Server Actions. No separate backend.

## Alternatives Considered

### Option A: NestJS + React SPA
- **Pros:** Clear separation of concerns, backend scales independently, familiar REST/GraphQL patterns.
- **Cons:** Two repos/deploys, API contract maintenance, more boilerplate for CRUD, CORS configuration, auth token management between services.
- **Rejected because:** Overkill for MVP. The added complexity doesn't pay off until we need a mobile app or third-party API consumers.

### Option B: Remix
- **Pros:** Similar full-stack approach, excellent form handling, nested routes.
- **Cons:** Smaller ecosystem than Next.js, fewer hosting options with first-class support, less community momentum.
- **Rejected because:** Next.js has a larger ecosystem, better tooling (Vercel, shadcn/ui), and more community resources for rapid development.

### Option C: Astro + API
- **Pros:** Excellent static performance, island architecture.
- **Cons:** Less mature for dynamic/interactive features, would still need a separate API for mutations.
- **Rejected because:** Our app is primarily dynamic (RSVP actions, auth, admin panel). Static-first doesn't fit.

## Consequences

### Positive
- **Single codebase:** Frontend and backend in one repo. Shared types, no API contract drift.
- **Server Actions:** Type-safe mutations without REST endpoint boilerplate. Forms submit directly to server functions.
- **Server Components:** Data fetching at the component level, no client-side state management needed for server data.
- **Ecosystem:** shadcn/ui, NextAuth, Prisma all have first-class Next.js integration.
- **Deployment:** Single deploy target (Vercel, Docker, or any Node.js host).

### Negative
- **Coupling:** Frontend and backend are tightly coupled. Adding a mobile app later requires extracting an API layer.
- **Vendor alignment:** Heavy investment in React/Next.js ecosystem. Migration to another framework is costly.
- **Server Action limitations:** No built-in rate limiting, webhook support, or background job processing.

### Mitigations
- Repository pattern isolates data access — extracting a REST API later means wrapping repository calls, not rewriting business logic.
- Keep business logic in `src/lib/` (framework-agnostic), not in page/component files.
