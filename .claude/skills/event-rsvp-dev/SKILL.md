---
name: event-rsvp-dev
description: "Event RSVP — Next.js 16.2 + React 19 + Prisma 7 + PostgreSQL + Docker full-stack skill. Spec-driven development, enterprise patterns, staff-level best practices. MVP complete + dockerized. Her development task'inda invoke et."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch
user-invocable: true
metadata:
  author: muhammedenessahin
  stack: "Next.js 16.2.3, React 19.2, Prisma 7, PostgreSQL 16, Docker, shadcn/ui, Tailwind CSS 4"
  repo: "https://github.com/Menesahin/event-rsvp"
  status: "MVP complete + containerized"
---

# Event RSVP Development Skill

## Current State (as of 2026-04)

MVP is **feature-complete and dockerized**. All 8 phases shipped, 6 ADRs written, 9 commits on GitHub.

- **Repo:** https://github.com/Menesahin/event-rsvp (public)
- **Phases:** 1-8 all ✅ (foundation → auth → public → RSVP → dashboard → admin → polish → Docker)
- **Routes:** 14 (homepage, events, auth, dashboard, admin, API)
- **Test accounts (seeded):** admin@eventrsvp.dev, organizer@eventrsvp.dev, attendee@eventrsvp.dev

New work is typically: post-MVP features, bug fixes, polish, or maintenance.

---

## Project Detection

On every invocation, read the following to establish context:

1. `docs/overview.md` — project vision, scope, roles
2. `docs/spec.md` — feature specs (F1-F7), user stories, acceptance criteria
3. `docs/tasks.md` — current task breakdown and progress
4. `docs/roadmap.md` — phase status (all 8 MVP phases complete)
5. `docs/adr/*.md` — 6 architectural decision records
6. `package.json` — dependencies and scripts
7. `prisma/schema.prisma` — data model
8. `docker-compose.yml` — deployment topology

If any of these are missing, warn the user immediately.

---

## Spec-Driven Workflow (MANDATORY)

Documentation is the source of truth. **AP-07 is BLOCKER:** docs must never drift from code.

### Before Starting Any Task

1. Read `docs/tasks.md` — find the relevant task, understand dependencies
2. Read `docs/spec.md` — find the feature spec (F1-F7), review acceptance criteria
3. Read related docs:
   - Database work → `docs/database-schema.md`
   - API/action work → `docs/api-spec.md`
   - UI work → `docs/ui-wireframes.md`
   - Auth/security work → `docs/security.md`
   - Architecture decisions → `docs/adr/*.md`
   - Deployment work → `docs/adr/006-docker-deployment.md`

### During Task Execution

- If implementation deviates from spec, **update the spec first**, then implement
- If a new architectural decision is made, create `docs/adr/NNN-title.md`
- Log any discovered edge cases in `docs/spec.md` under the relevant feature

### After Completing Any Task

1. **Update `docs/tasks.md`** — mark task as `[x]` completed
2. **Update `docs/roadmap.md`** — mark phase items if all tasks done
3. **Update affected spec docs:**
   - Schema changed → `docs/database-schema.md`
   - New action/endpoint → `docs/api-spec.md`
   - UI changed → `docs/ui-wireframes.md`
   - Security impact → `docs/security.md`
   - Infra change → update ADR + tech-stack.md
4. **Never leave docs out of sync with code.**

### Update-Docs Mode

When invoked with `/event-rsvp-dev update-docs`:
1. Scan prisma/schema.prisma → compare with docs/database-schema.md
2. Scan src/lib/actions/ → compare with docs/api-spec.md
3. Scan src/app/ routes → compare with route structure
4. Scan src/components/ → compare with docs/ui-wireframes.md
5. Report and fix all discrepancies
6. Update tasks.md progress markers

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 16.2.3 | App Router, Turbopack default, standalone output |
| UI Library | React | 19.2 | useActionState, use(), ref as prop |
| Language | TypeScript | 5.9 | strict mode, no `any` |
| ORM | Prisma | 7.7 | **Requires PrismaPg adapter**, url in prisma.config.ts |
| DB Adapter | @prisma/adapter-pg | latest | Required by Prisma 7 PrismaClient |
| Database | PostgreSQL | 16 alpine | Native enums, ACID, Serializable transactions |
| Auth | NextAuth.js | v5 beta | Magic link + dev bypass, `AUTH_TRUST_HOST` for Docker |
| UI Components | shadcn/ui | latest | Radix UI + Tailwind (Base UI primitives) |
| Styling | Tailwind CSS | 4.2 | v4 syntax (@import "tailwindcss"), light theme only |
| Validation | Zod | latest | Schema + type inference |
| Logging | Pino | latest | Structured JSON (prod), pino-pretty (dev) |
| Icons | Lucide React | latest | Tree-shakeable |
| Toast | Sonner | latest | Action feedback |
| Container | Docker | 24+ | Multi-stage, Node 22 alpine |
| Orchestration | Docker Compose | v2 | postgres + migrate + app |

---

## Directory Structure

```
event-rsvp/
  Dockerfile                        # Multi-stage: base → deps → builder → runner
  docker-compose.yml                # postgres + migrate (one-shot) + app
  .dockerignore                     # Excludes docs, .git, node_modules
  .env.example                      # Local dev template
  .env.docker.example               # Docker Compose template
  next.config.ts                    # output: "standalone" for Docker
  prisma.config.ts                  # DATABASE_URL (Prisma 7 requirement)
  prisma/
    schema.prisma                   # No `url` field (moved to prisma.config.ts)
    migrations/
    seed.ts                         # 3 roles + 22 attendees + 4 events

  src/
    generated/prisma/               # Generated Prisma client (gitignored)
    app/
      layout.tsx                    # Root (Geist font, Sonner, metadata)
      page.tsx                      # Homepage (hero + Suspense events)
      not-found.tsx                 # Custom 404 (with navbar/footer)
      (public)/                     # Public routes (navbar + footer)
        layout.tsx
        events/
          page.tsx                  # Events listing (upcoming + past)
          loading.tsx
          [slug]/
            page.tsx                # Event detail + RSVP + speakers
            error.tsx               # Error boundary
      (auth)/                       # Centered card with home logo link
        layout.tsx
        sign-in/page.tsx
        verify-request/page.tsx
        error/page.tsx              # Expired magic link handling
      (dashboard)/                  # Auth-gated, mobile tabs + desktop sidebar
        layout.tsx
        dashboard/
          page.tsx                  # My Events (status-grouped) + My RSVPs
          loading.tsx
          events/
            new/page.tsx            # Organizer-only (requireRole)
            [id]/
              page.tsx              # Event manage (stats, actions)
              edit/page.tsx         # Approved: locked fields
      (admin)/                      # ADMIN-only, mobile tabs + sidebar
        layout.tsx
        admin/
          page.tsx                  # Stats cards (total/pending/approved/cancelled)
          loading.tsx
          events/
            page.tsx                # Pending events + approve/reject
      api/auth/[...nextauth]/
        route.ts

    auth.ts                         # NextAuth v5 config
    types/next-auth.d.ts            # Session extension (id + role)

    lib/
      db.ts                         # Prisma singleton + PrismaPg adapter
      logger.ts                     # Pino logger
      utils.ts                      # cn() utility
      result.ts                     # Result<T,E> — USED in rsvp actions
      errors/
        base.error.ts               # AppError abstract class
        index.ts                    # ValidationError, UnauthorizedError,
                                    # ForbiddenError, NotFoundError, ConflictError
                                    # — USED via handleActionError in event actions
      utils/
        slug.ts                     # generateUniqueSlug with collision suffix
        date.ts                     # formatEventDate, formatEventTime,
                                    # formatEventDateTime, isUpcoming, isPast,
                                    # formatRelativeDate
      validations/
        event.ts                    # Zod: createEventSchema, updateEventSchema,
                                    # approvedEventUpdateSchema + dateTimeString refine
      repositories/                 # ALL server-only
        event.repository.ts         # getBySlug, getUpcoming, getPast,
                                    # getByOrganizer, getPending, getById,
                                    # create, update, updateStatus
        rsvp.repository.ts          # getUserRSVP, getGoingCount,
                                    # getFirstWaitlisted, getUserRSVPs
        user.repository.ts          # getById (used in auth session callback)
      actions/
        auth.ts                     # requestMagicLink (with callbackUrl)
        event.ts                    # createEvent, updateEvent,
                                    # submitForReview, cancelEvent
                                    # — uses handleActionError + eventRepository
        rsvp.ts                     # createRSVP, cancelRSVP
                                    # — Serializable transactions, Result<T,E>
        admin.ts                    # approveEvent, rejectEvent
      guards/
        require-auth.ts             # redirect to /sign-in (no header sniffing)
        require-role.ts             # Role hierarchy check
        require-ownership.ts        # resource owner or ADMIN

    components/
      ui/                           # shadcn/ui primitives
      layout/
        navbar.tsx                  # Server, auth-aware
        user-menu.tsx               # Client dropdown (signout, dashboard, admin)
        footer.tsx
        dashboard-nav.tsx           # Client, mobile tabs + desktop sidebar
        admin-nav.tsx               # Client, same pattern for admin
        sign-out-button.tsx         # Client standalone (available for use)
      shared/
        event-card.tsx              # Uses formatRelativeDate, isPast util
        empty-state.tsx             # Reusable
        copy-link-button.tsx        # Client, with try/catch
      landing/
        hero-section.tsx            # Gradient bg + dot pattern + accent color
        upcoming-events.tsx         # Async Server Component
      events/
        speaker-card.tsx
        rsvp-button.tsx             # 6 states, useTransition, slug param
      dashboard/
        event-form.tsx              # Dynamic speakers, field errors,
                                    # Save Draft + Submit for Review
        event-actions.tsx           # Submit/Cancel with Dialog + router.refresh
      admin/
        approve-reject-buttons.tsx  # Client + router.refresh
      auth/
        sign-in-form.tsx            # useActionState + inline magic link

  docs/
    overview.md                     # Vision, scope, roles
    spec.md                         # F1-F7 feature specs
    tech-stack.md                   # Stack rationale
    database-schema.md              # ER diagram, models, indexes
    api-spec.md                     # Server Actions spec
    ui-wireframes.md                # ASCII wireframes
    security.md                     # Auth flow, RBAC, threat model
    roadmap.md                      # Phases + post-MVP
    tasks.md                        # Task breakdown
    adr/
      001-nextjs-fullstack.md
      002-magic-link-auth.md
      003-rsvp-waitlist-model.md
      004-admin-approval-flow.md
      005-prisma-7-adapter.md       # Why url is in prisma.config.ts
      006-docker-deployment.md      # Docker architecture rationale
```

---

## Working Principles

### Next.js 16.2 Rules

1. **Caching is opt-in.** Nothing is cached by default. Use `"use cache"` directive explicitly at file, function, or component level. Enable with `cacheComponents: true` in next.config.ts.
2. **Always await async APIs.** `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are all async — must be awaited.
   ```ts
   type Props = { params: Promise<{ slug: string }> };
   export default async function Page({ params }: Props) {
     const { slug } = await params;
   }
   ```
3. **Use `proxy.ts` not `middleware.ts`.** Proxy runs on Node.js (full API access). Middleware is deprecated.
4. **Cache invalidation in Server Actions:** Use `updateTag(tag)` for instant read-your-writes. Use `revalidateTag(tag, profile)` in webhooks/route handlers. Use `refresh()` for uncached dynamic data.
5. **`revalidateTag()` requires second argument.** Always pass a cacheLife profile name or `{ expire: N }`.
6. **All parallel route slots need `default.js`.**
7. **Error boundaries:** Prefer `unstable_retry()` over `reset()` — re-fetches server data.
8. **`useActionState` is from `'react'`**, not `'react-dom'` (React 19.2 change).
9. **No AMP, no `next lint`, no `serverRuntimeConfig`/`publicRuntimeConfig`.** Removed in 16.
10. **Use `images.remotePatterns`**, not `images.domains` (removed).
11. **`next.config.ts` has `output: "standalone"`** — do not remove (required for Docker).

### Prisma 7 Rules

12. **No `url` in `datasource db {}`** — it's in `prisma.config.ts`. Violating this breaks `prisma generate`.
13. **PrismaClient requires `adapter`** — we use `PrismaPg` from `@prisma/adapter-pg`. Never `new PrismaClient()` without args.
14. **Generated client has no index** — import from `@/generated/prisma/client`, not `@/generated/prisma`.

### React 19 Rules

15. **Server Components by default.** Add `'use client'` only when hooks, browser APIs, or event handlers are needed.
16. **`ref` is a regular prop.** No `forwardRef`.
17. **Use `<Context value={x}>` not `<Context.Provider>`.**
18. **Use `useActionState` for form mutations.** Returns `[state, action, isPending]`.
19. **Use `useOptimistic` for instant UI feedback.**
20. **Use `use(promise)` for client-side data suspension.**
21. **`useFormStatus` must be in a child** of `<form>`, not the same component.
22. **React Compiler handles memoization.** Don't add `useMemo`/`useCallback`/`React.memo` unless proven needed.

### Architecture & Patterns

23. **Repository pattern for ALL DB access.** Pages and actions call repositories (`eventRepository`, `rsvpRepository`, `userRepository`), never Prisma directly (except in complex transactions where `tx` is passed).
24. **Guard pattern for auth/authz.** Three guards: `requireAuth()`, `requireRole()`, `requireOwnership()`. Double-check: guard in BOTH layout AND action.
25. **Server Actions are public POST endpoints.** Treat all arguments as hostile. Always: validate (Zod) → authenticate → authorize → execute.
26. **Zod as single source of truth.** Define schema once, infer TypeScript type with `z.infer<>`.
27. **`import 'server-only'`** on every repository file.
28. **Early returns / guard clauses.** Handle invalid cases at the top.
29. **Custom error hierarchy in use.** Event actions use `handleActionError(error: unknown)` utility that catches `UnauthorizedError`, `ForbiddenError`, `NotFoundError` and returns `{ success: false, error }`.
30. **Result<T, E> pattern is used in RSVP actions.** `ok({ status })` / `err("message")`. Consumer: `if (result.ok) ... else ...`.
31. **Structured logging with Pino.** Module-scoped child loggers: `logger.child({ module: 'EventActions' })`.
32. **KISS:** Three similar lines > premature abstraction.
33. **DRY without over-abstracting (AHA).** Duplicate 2-3x first, then abstract.
34. **SOLID in practice.**

### Client Component Rules

35. **`router.refresh()` after mutations in client components.** After a successful server action, call `router.refresh()` to re-render server components with fresh data. Pattern used in `EventActions`, `ApproveRejectButtons`.
36. **Pass `slug` to revalidation-sensitive actions.** RSVP actions need `slug` to `revalidatePath("/events/{slug}")` for capacity counter updates.

### Code Quality

37. **TypeScript strict mode.** No `any` — use `unknown` + type guards.
38. **Discriminated unions** for variant types.
39. **Named exports only** (except Next.js page/layout conventions).
40. **Conventional commits:** `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
41. **Don't delete unused code — wire it in.** If a utility/class exists but is unused, integrate it where appropriate. Only delete if truly obsolete (e.g., removed feature).

---

## Reference Files

| File | Purpose |
|------|---------|
| `.claude/skills/event-rsvp-dev/reference/nextjs-16-practices.md` | Next.js 16.2 detailed rules, code examples, breaking changes |
| `.claude/skills/event-rsvp-dev/reference/react-19-practices.md` | React 19 hooks, patterns, deprecations |
| `.claude/skills/event-rsvp-dev/reference/enterprise-patterns.md` | Repository, error handling, logging, SOLID, guard patterns |
| `docs/overview.md` | Project vision, target audience, scope |
| `docs/spec.md` | Feature specs F1-F7, user stories, acceptance criteria |
| `docs/tasks.md` | Implementation tasks, progress tracking |
| `docs/roadmap.md` | MVP phases (all complete) + post-MVP features |
| `docs/database-schema.md` | ER diagram, models, indexes, query patterns |
| `docs/api-spec.md` | Server Actions, repositories, error handling |
| `docs/ui-wireframes.md` | ASCII wireframes for all pages |
| `docs/security.md` | Auth flow, RBAC, input validation, threat model |
| `docs/tech-stack.md` | Stack decisions and rationale |
| `docs/adr/001-nextjs-fullstack.md` | Why Next.js full-stack over NestJS+SPA |
| `docs/adr/002-magic-link-auth.md` | Why magic link + dev bypass |
| `docs/adr/003-rsvp-waitlist-model.md` | Serializable transaction + FIFO waitlist |
| `docs/adr/004-admin-approval-flow.md` | Event lifecycle + editing restrictions |
| `docs/adr/005-prisma-7-adapter.md` | Prisma 7 PrismaPg adapter + url in prisma.config.ts |
| `docs/adr/006-docker-deployment.md` | Multi-stage Docker + compose architecture |

---

## Operational Modes

### `plan` — Design a feature or change
1. Read relevant spec docs
2. Identify affected files and components
3. Design the implementation approach
4. List tasks in order of execution
5. Identify edge cases from spec.md

### `implement` — Execute a task
1. Read task from docs/tasks.md
2. Read relevant spec docs for acceptance criteria
3. Implement following Working Principles
4. Run `pnpm build` to verify after edits
5. **Update docs/** to reflect changes
6. Mark task as completed in tasks.md

### `fix` — Debug and patch
1. Reproduce the issue
2. Read relevant spec to understand expected behavior
3. Identify root cause (don't guess)
4. Apply minimal fix
5. Verify fix doesn't break acceptance criteria
6. Update docs/ if behavior changes

### `review` — Code review
1. Read the changed files
2. Check against Working Principles (all 41 rules)
3. Check against Anti-Pattern Table
4. Verify spec alignment
5. Check for spec drift
6. Report: violations found, severity, suggested fixes

### `analyze` — Investigation
1. Read spec docs to understand design intent
2. Explore codebase for the area in question
3. Report findings with file paths and line numbers
4. Identify gaps between spec and implementation

### `update-docs` — Sync documentation
1. Scan prisma/schema.prisma → docs/database-schema.md
2. Scan src/lib/actions/ → docs/api-spec.md
3. Scan src/app/ routes → route structure in spec
4. Scan src/components/ → docs/ui-wireframes.md
5. Report and fix discrepancies
6. Update tasks.md progress markers

### `deploy` — Docker operations
1. Verify `.env.docker` exists with `AUTH_SECRET` set
2. `docker compose --env-file .env.docker up -d`
3. Check health: `docker compose ps` (postgres + app should be healthy)
4. Migrate service runs once and exits cleanly
5. App available on http://localhost:3000
6. Logs: `docker compose logs -f app`
7. Shutdown: `docker compose down` (or `down -v` to clear DB)

---

## Anti-Pattern Table

| ID | Severity | Anti-Pattern | Correct Pattern |
|----|----------|-------------|-----------------|
| AP-01 | BLOCKER | Sync `params`/`searchParams`/`cookies()`/`headers()` | Always `await` — async in Next.js 16 |
| AP-02 | BLOCKER | Using `middleware.ts` | Use `proxy.ts` (Node.js runtime) |
| AP-03 | BLOCKER | `any` type | `unknown` + type guards |
| AP-04 | BLOCKER | Prisma calls in pages/components directly | Use repository pattern |
| AP-05 | BLOCKER | Server Action without auth check | validate → authenticate → authorize → execute |
| AP-06 | BLOCKER | Missing `import 'server-only'` on repository files | Add to prevent client-side import |
| AP-07 | BLOCKER | Docs out of sync with code | Update docs/ after every code change |
| AP-08 | BLOCKER | `url` in `datasource db {}` (Prisma 7) | Must be in `prisma.config.ts` |
| AP-09 | BLOCKER | `new PrismaClient()` without adapter (Prisma 7) | Pass `PrismaPg` adapter |
| AP-10 | BLOCKER | Import from `@/generated/prisma` | Use `@/generated/prisma/client` |
| AP-11 | BLOCKER | `corepack enable` in Dockerfile | Use `npm install -g pnpm@VERSION` (keyid bug) |
| AP-12 | MAJOR | `forwardRef` usage | `ref` as regular prop (React 19) |
| AP-13 | MAJOR | `<Context.Provider>` | `<Context value={x}>` |
| AP-14 | MAJOR | `useFormState` from `react-dom` | `useActionState` from `react` |
| AP-15 | MAJOR | `revalidateTag(tag)` single arg | `revalidateTag(tag, profile)` |
| AP-16 | MAJOR | Manual `useMemo`/`useCallback` without profiler proof | Trust React Compiler |
| AP-17 | MAJOR | Nested if-else pyramid | Early returns / guard clauses |
| AP-18 | MAJOR | Throwing errors in business logic | Return `Result<T, E>` or `{ success, error }` |
| AP-19 | MAJOR | `console.log` for logging | Pino logger with proper levels |
| AP-20 | MAJOR | Missing Zod validation in Server Actions | Validate all input at boundary |
| AP-21 | MAJOR | `images.domains` in next.config | `images.remotePatterns` |
| AP-22 | MAJOR | Client mutation without `router.refresh()` | Call `router.refresh()` after successful action |
| AP-23 | MAJOR | Missing `revalidatePath` for specific slug | Pass slug, revalidate both listing and detail |
| AP-24 | MAJOR | Deleting unused utility code | Wire it into codebase — integrate, don't remove |
| AP-25 | MINOR | Default exports (non-page files) | Named exports only |
| AP-26 | MINOR | `useContext` in conditional branches | `use(Context)` — works after early returns |
| AP-27 | MINOR | Premature abstraction | AHA: duplicate 2-3x first |
| AP-28 | MINOR | `reset()` in error.tsx | `unstable_retry()` |
| AP-29 | MINOR | Spec not read before starting task | Always read relevant docs/ first |
| AP-30 | MINOR | Removing `output: "standalone"` from next.config | Required for Docker — keep it |
| AP-31 | MINOR | Hardcoded `bg-white`, `text-gray-*` | Use design tokens (`bg-background`, `text-muted-foreground`) |

---

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Files (components) | kebab-case | `event-card.tsx`, `rsvp-button.tsx` |
| Files (lib) | kebab-case | `event.repository.ts`, `require-auth.ts` |
| Components | PascalCase | `EventCard`, `RSVPButton` |
| Functions | camelCase | `createEvent`, `getUpcoming` |
| Variables | camelCase | `goingCount`, `eventSlug` |
| Constants | UPPER_SNAKE | `MAX_CAPACITY`, `STATUS_ORDER` |
| Types/Interfaces | PascalCase | `EventStatus`, `CreateEventInput` |
| Enums (Prisma) | PascalCase | `UserRole`, `RSVPStatus` |
| Enum values | UPPER_SNAKE | `GOING`, `WAITLISTED`, `CANCELLED` |
| Tailwind tokens | semantic | `bg-background`, `text-destructive` |
| Route slugs | kebab-case | `/events/nextjs-conf-2026` |
| Database tables | PascalCase (Prisma) | `Event`, `RSVP`, `Speaker` |
| Git branches | kebab-case | `feat/rsvp-waitlist`, `fix/auth-redirect` |
| Commit messages | conventional | `feat: add RSVP waitlist promotion` |

---

## Quick Reference

### Dev Commands

```bash
pnpm dev                          # Dev server (Turbopack)
pnpm build                        # Production build (standalone output)
pnpm start                        # Start production server (after build)
pnpm lint                         # ESLint
```

### Database Commands

```bash
pnpm prisma generate              # Generate Prisma client to src/generated/prisma
pnpm prisma migrate dev           # Create + apply migration
pnpm prisma migrate dev --name X  # Named migration
pnpm prisma migrate deploy        # Apply migrations (prod)
pnpm db:seed                      # Run seed script (npx tsx prisma/seed.ts)
pnpm db:studio                    # Open Prisma Studio GUI
```

### Docker Commands

```bash
# Setup
cp .env.docker.example .env.docker
# Edit .env.docker — set AUTH_SECRET (npx auth secret)

# Run full stack (app + postgres + auto-migrate + seed)
docker compose --env-file .env.docker up -d

# Logs
docker compose logs -f app
docker compose logs -f postgres

# Shell into app
docker compose exec app sh

# Shutdown (keep data)
docker compose down

# Shutdown (wipe DB volume)
docker compose down -v

# Rebuild after code changes
docker compose build app
docker compose up -d app
```

### shadcn/ui Commands

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card input label badge dialog separator progress
```

### Auth Commands

```bash
npx auth secret                   # Generate AUTH_SECRET
```

### Git / Deployment

```bash
git push                          # Push to github.com/Menesahin/event-rsvp
```

### Environment Variables

**Local dev (`.env`):**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/event_rsvp
AUTH_SECRET=...                   # npx auth secret
AUTH_RESEND_KEY=                  # Empty for dev (bypass via DEV_MODE)
AUTH_TRUST_HOST=true              # Required for non-localhost
DEV_MODE=true                     # Show magic link inline in UI
```

**Docker (`.env.docker`):**
```
POSTGRES_USER=event_rsvp
POSTGRES_PASSWORD=event_rsvp_dev_password
POSTGRES_DB=event_rsvp
DATABASE_URL=postgresql://event_rsvp:event_rsvp_dev_password@postgres:5432/event_rsvp
AUTH_SECRET=...                   # GENERATE FRESH — never commit
AUTH_TRUST_HOST=true
DEV_MODE=true
NODE_ENV=production
```

---

## Test Accounts (from seed)

| Email | Role | Usage |
|-------|------|-------|
| `admin@eventrsvp.dev` | ADMIN | Approve/reject events, admin panel |
| `organizer@eventrsvp.dev` | ORGANIZER | Create/edit events |
| `attendee@eventrsvp.dev` | ATTENDEE | RSVP to events |

In `DEV_MODE=true`, magic link is shown inline in the sign-in form (no email sent).

---

## Seed Data Scenarios

Four events covering all states:
- **Next.js Conf Istanbul** — APPROVED, 50 capacity, 2 speakers, 3 RSVPs
- **React Meetup Istanbul** — PENDING (awaiting admin approval)
- **GraphQL Workshop** — DRAFT (not submitted)
- **TypeScript Deep Dive** — APPROVED, 20 capacity, 20 GOING + 2 WAITLISTED (waitlist demo)
