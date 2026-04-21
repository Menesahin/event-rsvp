---
name: event-rsvp-dev
description: "Event RSVP — Next.js 16.2 + React 19 + Prisma + PostgreSQL full-stack skill. Spec-driven development, enterprise patterns, staff-level best practices. Her development task'inda invoke et."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch
user-invocable: true
metadata:
  author: muhammedenessahin
  stack: "Next.js 16.2, React 19.2, Prisma 6, PostgreSQL 16, shadcn/ui, Tailwind CSS 4"
---

# Event RSVP Development Skill

## Project Detection

On every invocation, read the following to establish context:

1. `docs/overview.md` — project vision, scope, roles
2. `docs/spec.md` — feature specs, user stories, acceptance criteria
3. `docs/tasks.md` — current task breakdown and progress
4. `docs/roadmap.md` — phase status
5. `package.json` — dependencies and scripts
6. `prisma/schema.prisma` — data model (if exists)

If any of these are missing, warn the user immediately.

---

## Spec-Driven Workflow (MANDATORY)

This project follows spec-driven development. Documentation is the source of truth.

### Before Starting Any Task

1. Read `docs/tasks.md` — find the relevant task, understand dependencies
2. Read `docs/spec.md` — find the feature spec (F1-F7), review acceptance criteria
3. Read related docs:
   - Database work → `docs/database-schema.md`
   - API/action work → `docs/api-spec.md`
   - UI work → `docs/ui-wireframes.md`
   - Auth/security work → `docs/security.md`
   - Architecture decisions → `docs/adr/*.md`

### During Task Execution

- If implementation deviates from spec, **update the spec first**, then implement
- If a new architectural decision is made, create `docs/adr/NNN-title.md`
- Log any discovered edge cases in `docs/spec.md` under the relevant feature

### After Completing Any Task

1. **Update `docs/tasks.md`** — mark task as `[x]` completed
2. **Update `docs/roadmap.md`** — mark phase items as `[x]` if all tasks in that phase are done
3. **Update affected spec docs:**
   - Schema changed → update `docs/database-schema.md`
   - New action/endpoint → update `docs/api-spec.md`
   - UI changed → update `docs/ui-wireframes.md`
   - Security impact → update `docs/security.md`
4. **Never leave docs out of sync with code**

### Update-Docs Mode

When invoked with `/event-rsvp-dev update-docs`:
1. Scan all src/ files for changes not reflected in docs/
2. Compare prisma/schema.prisma with docs/database-schema.md
3. Compare src/lib/actions/ with docs/api-spec.md
4. Report discrepancies and fix them

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 16.2 | App Router, Server Components, Server Actions |
| UI Library | React | 19.2 | useActionState, use(), ref as prop |
| Language | TypeScript | 5.x | strict mode, no `any` |
| ORM | Prisma | 6.x | With Serializable transactions |
| Database | PostgreSQL | 16 | Native enums, ACID transactions |
| Auth | NextAuth.js | v5 | Magic link + dev bypass |
| UI Components | shadcn/ui | latest | Radix UI + Tailwind |
| Styling | Tailwind CSS | 4.x | Light theme only |
| Validation | Zod | latest | Schema + type inference |
| Logging | Pino | latest | Structured JSON logging |
| Icons | Lucide React | latest | Tree-shakeable |
| Toast | Sonner | latest | Action feedback |

---

## Directory Structure

```
src/
  app/
    layout.tsx                    # Root layout
    page.tsx                      # Homepage
    (public)/                     # Public layout (Navbar + Footer)
    (auth)/                       # Centered card layout
    (dashboard)/                  # Authenticated sidebar layout
    (admin)/                      # Admin sidebar layout
    api/auth/[...nextauth]/       # NextAuth handler
  lib/
    db.ts                         # Prisma singleton
    logger.ts                     # Pino logger
    utils.ts                      # cn() utility
    errors/                       # Custom error classes
      base.error.ts
      index.ts
    result.ts                     # Result<T, E> type
    utils/
      slug.ts                     # generateSlug()
      date.ts                     # formatEventDate(), isUpcoming()
    validations/
      event.ts                    # Zod schemas
    repositories/
      event.repository.ts
      rsvp.repository.ts
      speaker.repository.ts
      user.repository.ts
    actions/
      auth.ts
      event.ts
      rsvp.ts
      admin.ts
    guards/
      require-auth.ts
      require-role.ts
  components/
    ui/                           # shadcn/ui primitives
    layout/                       # navbar, footer, sidebar
    shared/                       # event-card, badges, empty-state
    landing/                      # hero-section, upcoming-events
    events/                       # event-detail, speaker-card, rsvp-button
    dashboard/                    # event-form, my-events, my-rsvps
    admin/                        # pending-events, approve-reject
    auth/                         # sign-in-form, magic-link-display
docs/
  overview.md                     # Vision, scope, roles
  spec.md                         # Feature specs (F1-F7)
  tech-stack.md                   # Stack decisions
  database-schema.md              # ER diagram, models
  api-spec.md                     # Server Actions spec
  ui-wireframes.md                # ASCII wireframes
  security.md                     # Auth, RBAC, threats
  roadmap.md                      # MVP phases
  tasks.md                        # Task breakdown
  adr/                            # Architecture Decision Records
```

---

## Working Principles

### Next.js 16.2 Rules

1. **Caching is opt-in.** Nothing is cached by default. Use `"use cache"` directive explicitly at file, function, or component level. Enable with `cacheComponents: true` in next.config.ts.
2. **Always await async APIs.** `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are all async — must be awaited. This is enforced, not optional.
   ```ts
   // Page props type
   type Props = { params: Promise<{ slug: string }> };
   export default async function Page({ params }: Props) {
     const { slug } = await params;
   }
   ```
3. **Use `proxy.ts` not `middleware.ts`.** Proxy runs on Node.js (full API access). Middleware is deprecated.
4. **Cache invalidation in Server Actions:** Use `updateTag(tag)` for instant read-your-writes. Use `revalidateTag(tag, profile)` only in webhooks/route handlers. Use `refresh()` for uncached dynamic data.
5. **`revalidateTag()` requires second argument.** Always pass a cacheLife profile name or `{ expire: N }`.
6. **All parallel route slots need `default.js`.** Build fails without it.
7. **Error boundaries:** Prefer `unstable_retry()` over `reset()` — it re-fetches server data, not just re-renders.
8. **`useActionState` is from `'react'`**, not `'react-dom'`. (React 19.2 change shipped with Next.js 16).
9. **No AMP, no `next lint`, no `serverRuntimeConfig`/`publicRuntimeConfig`.** All removed in 16.
10. **Use `images.remotePatterns`**, not `images.domains` (removed).

### React 19 Rules

11. **Server Components by default.** Add `'use client'` only when hooks, browser APIs, or event handlers are needed.
12. **`ref` is a regular prop.** No `forwardRef` needed. Destructure `ref` from props directly.
13. **Use `<Context value={x}>` not `<Context.Provider>`.** Provider syntax is deprecated.
14. **Use `useActionState` for form mutations.** Returns `[state, action, isPending]`. Don't manage pending/error state manually.
15. **Use `useOptimistic` for instant UI feedback.** State auto-reverts on action failure.
16. **Use `use(promise)` for client-side data suspension.** Create promise in Server Component, pass to Client Component.
17. **`useFormStatus` must be in a child** of `<form>`, not the same component.
18. **React Compiler handles memoization.** Don't add `useMemo`/`useCallback`/`React.memo` unless profiler proves a need.

### Architecture & Patterns

19. **Repository pattern for all DB access.** Pages and actions call repositories, never Prisma directly. Each repository exports a plain object with async methods.
20. **Guard pattern for auth/authz.** `requireAuth()` and `requireRole()` at the top of every protected page and server action. Double-check: guard in BOTH layout AND action.
21. **Server Actions are public POST endpoints.** Treat all arguments as hostile. Always: validate (Zod) → authenticate → authorize → execute.
22. **Zod as single source of truth.** Define schema once, infer TypeScript type with `z.infer<>`. No separate interface.
23. **`import 'server-only'`** on every DAL/repository file. Build fails if imported client-side.
24. **Early returns / guard clauses.** Handle invalid cases at the top. Happy path runs last, flat, no nesting.
25. **Custom error hierarchy.** `AppError` base class with `statusCode`, `code`, `isOperational`. Subclasses: `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`.
26. **Result pattern for domain logic.** `Result<T, E> = { ok: true; value: T } | { ok: false; error: E }`. Return errors, don't throw in business logic.
27. **Structured logging with Pino.** Module-scoped child loggers: `logger.child({ module: 'UserService' })`. Log levels: trace < debug < info < warn < error < fatal.
28. **KISS:** Don't add features/abstractions not currently needed. Three similar lines > premature abstraction.
29. **DRY without over-abstracting (AHA).** Duplicate 2-3x before abstracting. Only abstract when the pattern is clear and stable.
30. **SOLID in practice:** Single responsibility per file. Open for extension via interfaces. Depend on abstractions (repository interfaces), not concretions (Prisma directly).

### Code Quality

31. **TypeScript strict mode.** No `any` — use `unknown` + type guards. No `as` casts unless narrowing from `unknown`.
32. **Discriminated unions** for variant types. Use `type` field for exhaustive switch.
33. **Named exports only.** No default exports (except Next.js page/layout conventions).
34. **Conventional commits:** `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
35. **No unused code.** Delete dead code, don't comment it out.

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
| `docs/roadmap.md` | MVP phases, post-MVP features |
| `docs/database-schema.md` | ER diagram, models, indexes, query patterns |
| `docs/api-spec.md` | Server Actions, repositories, error handling |
| `docs/ui-wireframes.md` | ASCII wireframes for all pages |
| `docs/security.md` | Auth flow, RBAC, input validation, threat model |
| `docs/tech-stack.md` | Stack decisions and rationale |
| `docs/adr/*.md` | Architecture Decision Records |

---

## Operational Modes

### `plan` — Design a feature or change
1. Read relevant spec docs (spec.md, database-schema.md, api-spec.md)
2. Identify affected files and components
3. Design the implementation approach
4. List tasks in order of execution
5. Identify edge cases from spec.md

### `implement` — Execute a task
1. Read task from docs/tasks.md
2. Read relevant spec docs for acceptance criteria
3. Implement following Working Principles
4. Run linter/formatter after edits
5. **Update docs/** to reflect changes
6. Mark task as completed in tasks.md

### `fix` — Debug and patch
1. Reproduce the issue
2. Read relevant spec to understand expected behavior
3. Identify root cause (don't guess)
4. Apply minimal fix following Working Principles
5. Verify fix doesn't break acceptance criteria
6. Update docs/ if fix changes behavior

### `review` — Code review
1. Read the changed files
2. Check against Working Principles (all 35 rules)
3. Check against Anti-Pattern Table
4. Verify spec alignment (does code match spec?)
5. Check for spec drift (are docs still accurate?)
6. Report: violations found, severity, suggested fixes

### `analyze` — Investigation
1. Read spec docs to understand design intent
2. Explore codebase for the area in question
3. Report findings with file paths and line numbers
4. Identify gaps between spec and implementation

### `update-docs` — Sync documentation
1. Scan prisma/schema.prisma → compare with docs/database-schema.md
2. Scan src/lib/actions/ → compare with docs/api-spec.md
3. Scan src/app/ routes → compare with route structure in spec
4. Scan src/components/ → compare with docs/ui-wireframes.md
5. Report and fix all discrepancies
6. Update tasks.md progress markers

---

## Anti-Pattern Table

| ID | Severity | Anti-Pattern | Correct Pattern |
|----|----------|-------------|-----------------|
| AP-01 | BLOCKER | Sync `params`/`searchParams`/`cookies()`/`headers()` | Always `await` — async in Next.js 16 |
| AP-02 | BLOCKER | Using `middleware.ts` | Use `proxy.ts` (Node.js runtime) |
| AP-03 | BLOCKER | `any` type | `unknown` + type guards |
| AP-04 | BLOCKER | Prisma calls in pages/components directly | Use repository pattern (src/lib/repositories/) |
| AP-05 | BLOCKER | Server Action without auth check | Always: validate → authenticate → authorize → execute |
| AP-06 | BLOCKER | Missing `import 'server-only'` on DAL/repository files | Add to prevent client-side import |
| AP-07 | BLOCKER | Docs out of sync with code | Update docs/ after every code change |
| AP-08 | MAJOR | `forwardRef` usage | `ref` as regular prop (React 19) |
| AP-09 | MAJOR | `<Context.Provider>` | `<Context value={x}>` |
| AP-10 | MAJOR | `useFormState` from `react-dom` | `useActionState` from `react` |
| AP-11 | MAJOR | `revalidateTag(tag)` single arg | `revalidateTag(tag, profile)` — requires second arg |
| AP-12 | MAJOR | Manual `useMemo`/`useCallback` without profiler proof | Trust React Compiler for memoization |
| AP-13 | MAJOR | Nested if-else pyramid | Early returns / guard clauses |
| AP-14 | MAJOR | Throwing errors in business logic | Return `Result<T, E>` from domain functions |
| AP-15 | MAJOR | `console.log` for logging | Use Pino logger with proper levels |
| AP-16 | MAJOR | Missing Zod validation in Server Actions | Validate all input at the action boundary |
| AP-17 | MAJOR | `images.domains` in next.config | Use `images.remotePatterns` |
| AP-18 | MINOR | Default exports (non-page files) | Named exports only |
| AP-19 | MINOR | `useContext` in conditional branches | `use(Context)` — works after early returns |
| AP-20 | MINOR | Premature abstraction (DRY too early) | AHA: duplicate 2-3x first, then abstract |
| AP-21 | MINOR | `reset()` in error.tsx | `unstable_retry()` — re-fetches server data |
| AP-22 | MINOR | Comments on obvious code | Only comment non-obvious logic |
| AP-23 | MINOR | Spec not read before starting task | Always read relevant docs/ first |

---

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Files (components) | kebab-case | `event-card.tsx`, `rsvp-button.tsx` |
| Files (lib) | kebab-case | `event.repository.ts`, `require-auth.ts` |
| Components | PascalCase | `EventCard`, `RSVPButton` |
| Functions | camelCase | `createEvent`, `getUpcoming` |
| Variables | camelCase | `goingCount`, `eventSlug` |
| Constants | UPPER_SNAKE | `MAX_CAPACITY`, `DEFAULT_PAGE_SIZE` |
| Types/Interfaces | PascalCase | `EventStatus`, `CreateEventInput` |
| Enums (Prisma) | PascalCase | `UserRole`, `RSVPStatus` |
| Enum values | UPPER_SNAKE | `GOING`, `WAITLISTED`, `CANCELLED` |
| CSS classes | kebab-case | Tailwind utilities |
| Route slugs | kebab-case | `/events/nextjs-conf-2026` |
| Database tables | PascalCase (Prisma) | `Event`, `RSVP`, `Speaker` |
| Git branches | kebab-case | `feat/rsvp-waitlist`, `fix/auth-redirect` |
| Commit messages | conventional | `feat: add RSVP waitlist promotion` |

---

## Quick Reference

### Dev Commands

```bash
pnpm dev                          # Start dev server (Turbopack)
pnpm build                        # Production build
pnpm start                        # Start production server
pnpm lint                         # Run ESLint
```

### Database Commands

```bash
pnpm prisma generate              # Generate Prisma Client
pnpm prisma migrate dev           # Create + apply migration
pnpm prisma migrate dev --name X  # Named migration
pnpm prisma db seed               # Run seed script
pnpm prisma studio                # Open Prisma Studio GUI
pnpm prisma db push               # Push schema without migration
```

### shadcn/ui Commands

```bash
pnpm dlx shadcn@latest add button # Add component
pnpm dlx shadcn@latest add card input label badge dialog separator progress
```

### Auth Commands

```bash
npx auth secret                   # Generate AUTH_SECRET
```

### Environment Variables

```
DATABASE_URL=postgresql://user:pass@localhost:5432/event_rsvp
AUTH_SECRET=...
AUTH_RESEND_KEY=re_xxx            # Production only
DEV_MODE=true                     # Demo: show magic link directly
```
