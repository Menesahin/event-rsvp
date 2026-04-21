# Event RSVP - Tech Stack

## Stack Summary

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 16.2.3 | App Router, Turbopack default |
| Language | TypeScript | 5.9.3 | strict mode |
| ORM | Prisma | 7.7.0 | Requires PrismaPg adapter, url in prisma.config.ts |
| DB Adapter | @prisma/adapter-pg | latest | Required by Prisma 7 PrismaClient |
| Database | PostgreSQL | 16 | Native enums, ACID |
| Auth | NextAuth.js (Auth.js) | v5 beta | Prisma adapter |
| Email (prod) | Resend | latest | Magic link delivery |
| UI Components | shadcn/ui | latest | Radix UI primitives |
| Styling | Tailwind CSS | 4.2.2 | Light theme only |
| Icons | Lucide React | latest | Tree-shakeable |
| Validation | Zod | latest | Schema + type inference |
| Toast | Sonner | latest | Action feedback |
| Logging | Pino | latest | Structured JSON, pino-pretty in dev |
| Container | Docker | 24+ | Multi-stage build, standalone output |
| Orchestration | Docker Compose | v2 | App + PostgreSQL + migrate service |

## Why Next.js 16.2?

See [ADR-001](adr/001-nextjs-fullstack.md) for full rationale.

- **App Router** with React Server Components for optimal performance
- **Server Actions** for type-safe mutations without API boilerplate
- Full-stack in a single repo — no separate backend needed for MVP
- Built-in image optimization, metadata API, and streaming
- Massive ecosystem and community support

## Why Prisma?

- Type-safe database access with auto-generated types
- Declarative schema with migrations
- Excellent Next.js integration
- Transaction support (Serializable isolation for RSVP logic)
- Prisma Studio for quick data inspection during development

## Why PostgreSQL?

- Robust transactional guarantees (critical for RSVP waitlist logic)
- Native enum support (UserRole, EventStatus, RSVPStatus)
- Excellent indexing for the query patterns we need
- Free tier available on Neon, Supabase, or Railway for deployment

## Why NextAuth v5?

- First-class Next.js App Router support
- Built-in magic link / email provider
- Prisma adapter for session persistence
- Session callback for extending session with custom fields (role)
- Handles CSRF, secure cookies, token rotation automatically

## Why shadcn/ui?

- Not a dependency — components are copied into the project
- Full control over styling and behavior
- Built on Radix UI primitives (accessible, composable)
- Tailwind CSS native — no CSS-in-JS overhead
- Consistent, modern design system out of the box

## Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Linting (Next.js config) |
| Prettier | Code formatting |
| Prisma Studio | Database GUI |
| pnpm | Package manager |

## Key Architectural Patterns

### Server Components First
All components are Server Components by default. Only add `"use client"` when interactivity is required (form inputs, click handlers, hooks).

### Repository Pattern
Data access is encapsulated in repository files (`src/lib/repositories/`). Pages and server actions call repositories, never Prisma directly.

### Server Actions for Mutations
All write operations use Server Actions (`"use server"` functions in `src/lib/actions/`). No REST API endpoints for mutations.

### Guard Functions
Authentication and authorization checks are composable guard functions (`requireAuth()`, `requireRole()`) called at the top of pages and server actions.

### Zod Validation
All user input is validated with Zod schemas at the server action boundary. Client-side validation is optional UX sugar.

## Not Using (and Why)

| Technology | Why Not |
|-----------|---------|
| tRPC | Server Actions provide type-safe mutations natively in Next.js |
| REST API | No external consumers in MVP — Server Actions are sufficient |
| Redis | No caching, rate limiting, or session store needed for MVP |
| Zustand/Redux | No complex client state — server state via Server Components |
| TanStack Query | Server Components handle data fetching — no client-side cache needed |
| next-themes | Light theme only for MVP |
| next-intl | English only for MVP |
