# Enterprise Patterns Reference

## Repository Pattern (Prisma)

All database access goes through repository files. Pages and Server Actions call repositories, never Prisma directly.

### Prisma Singleton

```ts
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => new PrismaClient();

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
```

### Repository Structure

```ts
// src/lib/repositories/event.repository.ts
import 'server-only';
import prisma from '@/lib/db';
import type { Event, EventStatus, Prisma } from '@prisma/client';

export const eventRepository = {
  async getBySlug(slug: string) {
    return prisma.event.findUnique({
      where: { slug },
      include: { speakers: true, organizer: { select: { name: true, image: true } } },
    });
  },

  async getUpcoming(limit = 10) {
    return prisma.event.findMany({
      where: { status: 'APPROVED', date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: limit,
      include: { _count: { select: { rsvps: { where: { status: 'GOING' } } } } },
    });
  },

  async getPast(limit = 10) {
    return prisma.event.findMany({
      where: { status: 'APPROVED', date: { lt: new Date() } },
      orderBy: { date: 'desc' },
      take: limit,
    });
  },

  async getByOrganizer(userId: string) {
    return prisma.event.findMany({
      where: { organizerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { rsvps: { where: { status: 'GOING' } } } } },
    });
  },

  async getPending() {
    return prisma.event.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: { organizer: { select: { name: true, email: true } } },
    });
  },

  async getById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: { speakers: true },
    });
  },

  async create(data: Prisma.EventCreateInput) {
    return prisma.event.create({ data });
  },

  async update(id: string, data: Prisma.EventUpdateInput) {
    return prisma.event.update({ where: { id }, data });
  },

  async updateStatus(id: string, status: EventStatus) {
    return prisma.event.update({ where: { id }, data: { status } });
  },
};
```

### Key Rules
- Every repository file starts with `import 'server-only'`
- Export a plain object with async methods (no class needed for MVP)
- Include only the relations needed for each query
- Use `_count` for aggregate queries instead of fetching all records
- Transaction support: accept optional `tx` parameter for transactional operations

---

## Custom Error Hierarchy

```ts
// src/lib/errors/base.error.ts
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly isOperational: boolean = true;
  readonly timestamp: string = new Date().toISOString();

  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}

// src/lib/errors/index.ts
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = 'FORBIDDEN';
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';
}
```

### Usage in Server Actions

```ts
'use server';
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/errors';

export async function updateEvent(eventId: string, data: unknown) {
  const parsed = UpdateEventSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const event = await eventRepository.getById(eventId);
  if (!event) {
    return { success: false, error: 'Event not found' };
  }

  if (event.organizerId !== session.user.id && session.user.role !== 'ADMIN') {
    return { success: false, error: 'Forbidden' };
  }

  // For APPROVED events, only allow description + coverImage
  if (event.status === 'APPROVED') {
    const { description, coverImage } = parsed.data;
    await eventRepository.update(eventId, { description, coverImage });
  } else {
    await eventRepository.update(eventId, parsed.data);
  }

  return { success: true };
}
```

---

## Result Pattern

For domain/business logic where you want typed errors without throwing.

```ts
// src/lib/result.ts
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
```

### Domain-Specific Error Types

```ts
// src/lib/errors/rsvp.errors.ts
export type RSVPError =
  | { type: 'ALREADY_RSVPD' }
  | { type: 'EVENT_FULL'; waitlisted: boolean }
  | { type: 'EVENT_NOT_FOUND' }
  | { type: 'EVENT_NOT_ACTIVE'; status: string }
  | { type: 'PAST_EVENT' };
```

### Usage

```ts
import { ok, err, type Result } from '@/lib/result';
import type { RSVPError } from '@/lib/errors/rsvp.errors';

export async function createRSVP(
  userId: string,
  eventId: string
): Promise<Result<{ status: 'GOING' | 'WAITLISTED' }, RSVPError>> {
  const event = await eventRepository.getById(eventId);
  if (!event) return err({ type: 'EVENT_NOT_FOUND' });
  if (event.status !== 'APPROVED') return err({ type: 'EVENT_NOT_ACTIVE', status: event.status });
  if (event.date < new Date()) return err({ type: 'PAST_EVENT' });

  const existing = await rsvpRepository.getUserRSVP(userId, eventId);
  if (existing && existing.status !== 'CANCELLED') return err({ type: 'ALREADY_RSVPD' });

  const goingCount = await rsvpRepository.getGoingCount(eventId);
  const status = goingCount < event.capacity ? 'GOING' : 'WAITLISTED';

  await rsvpRepository.upsert(userId, eventId, status);
  return ok({ status });
}

// Consumer — exhaustive handling
const result = await createRSVP(userId, eventId);
if (!result.ok) {
  switch (result.error.type) {
    case 'ALREADY_RSVPD':
      return { success: false, error: 'You already have an RSVP' };
    case 'EVENT_FULL':
      return { success: false, error: 'Event is at capacity' };
    case 'EVENT_NOT_FOUND':
      return { success: false, error: 'Event not found' };
    case 'EVENT_NOT_ACTIVE':
      return { success: false, error: 'Event is not accepting RSVPs' };
    case 'PAST_EVENT':
      return { success: false, error: 'This event has already ended' };
    // TypeScript errors if a case is missing
  }
}
const { status } = result.value; // typed as { status: 'GOING' | 'WAITLISTED' }
```

---

## Structured Logging with Pino

### Setup

```ts
// src/lib/logger.ts
import pino, { type Logger } from 'pino';

export const logger: Logger =
  process.env.NODE_ENV === 'production'
    ? pino({
        level: 'info',
        timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
        messageKey: 'message',
        base: {
          env: process.env.NODE_ENV,
          service: 'event-rsvp',
        },
      })
    : pino({
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, levelFirst: true },
        },
        level: 'debug',
      });
```

### next.config.ts requirement

```ts
const nextConfig = {
  serverExternalPackages: ['pino', 'pino-pretty'],
};
```

### Module-Scoped Child Loggers

```ts
// Each module creates its own child with context
// src/lib/actions/rsvp.ts
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'RSVPActions' });

export async function createRSVP(eventId: string) {
  const session = await auth();
  log.info({ eventId, userId: session?.user?.id }, 'RSVP attempt');

  try {
    const result = await rsvpService.create(session.user.id, eventId);
    log.info({ eventId, userId: session.user.id, status: result.status }, 'RSVP created');
    return { success: true, status: result.status };
  } catch (error) {
    log.error({ err: error, eventId, userId: session.user.id }, 'RSVP creation failed');
    return { success: false, error: 'Failed to create RSVP' };
  }
}
```

### Log Level Guidelines

| Level | When | Example |
|-------|------|---------|
| `trace` | Very granular, dev only | Query timing, cache hits |
| `debug` | Dev diagnostics | Request payload, computed values |
| `info` | Business events | `User created`, `Event approved`, `RSVP created` |
| `warn` | Recoverable issues | Retry attempt, deprecated usage, rate limit approaching |
| `error` | Errors needing attention | Caught exceptions, failed transactions |
| `fatal` | App cannot continue | DB connection lost, startup failure |

### Logging Rules
- Always pass error as `{ err: error }` (Pino serializes it properly)
- Include context: `{ eventId, userId, action }` — never just a string message
- Don't log sensitive data (passwords, tokens, full email addresses)
- Use `info` for successful operations, `error` for failures
- In production: level `info` (no trace/debug)

---

## Guard Pattern

### requireAuth

```ts
// src/lib/guards/require-auth.ts
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/sign-in');
  }
  return session.user;
}
```

### requireRole

```ts
// src/lib/guards/require-role.ts
import { requireAuth } from './require-auth';
import { redirect } from 'next/navigation';
import type { UserRole } from '@prisma/client';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  ATTENDEE: 0,
  ORGANIZER: 1,
  ADMIN: 2,
};

export async function requireRole(minimumRole: UserRole) {
  const user = await requireAuth();
  if (ROLE_HIERARCHY[user.role as UserRole] < ROLE_HIERARCHY[minimumRole]) {
    redirect('/dashboard');
  }
  return user;
}
```

### Double-Check Principle

Guards MUST run in BOTH:
1. Layout/Page level — prevents unauthorized UI rendering
2. Server Action level — prevents unauthorized mutations

```ts
// Layout guard
export default async function AdminLayout({ children }) {
  await requireRole('ADMIN');
  return <>{children}</>;
}

// Server Action guard (ALSO required — layout can be bypassed)
export async function approveEvent(eventId: string) {
  const user = await requireRole('ADMIN');
  // ...
}
```

---

## Zod Validation at Boundaries

### Single Source of Truth

```ts
// src/lib/validations/event.ts
import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().min(1, 'Description is required').max(5000),
  date: z.string().datetime('Invalid date format'),
  endDate: z.string().datetime().optional(),
  location: z.string().min(1, 'Location is required').max(200),
  coverImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  capacity: z.number().int().min(1, 'Minimum 1').max(10000),
  speakers: z.array(z.object({
    name: z.string().min(1, 'Speaker name required').max(100),
    title: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
  })).default([]),
});

// Infer type — no separate interface needed
export type CreateEventInput = z.infer<typeof createEventSchema>;

// Partial schema for updates
export const updateEventSchema = createEventSchema.partial();

// Approved event update — only allowed fields
export const approvedEventUpdateSchema = z.object({
  description: z.string().min(1).max(5000).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
});
```

### Four Validation Boundaries

```ts
// 1. Server Action boundary (PRIMARY — always validate here)
export async function createEvent(prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = createEventSchema.safeParse({
    ...raw,
    capacity: Number(raw.capacity),
    speakers: JSON.parse(raw.speakers as string || '[]'),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }
  // ...use parsed.data (fully typed)
}

// 2. Route Handler boundary (if any REST endpoints)
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ issues: parsed.error.flatten() }, { status: 400 });
  }
}

// 3. External API response boundary
const ExternalSchema = z.object({ id: z.string(), name: z.string() });
const data = ExternalSchema.parse(await response.json());

// 4. Environment variable boundary
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  DEV_MODE: z.string().transform(v => v === 'true').default('false'),
});
export const env = envSchema.parse(process.env);
```

---

## Early Return / Guard Clause Pattern

```ts
// BAD — pyramid of doom
async function processRSVP(eventId: string, userId: string) {
  if (eventId) {
    const event = await getEvent(eventId);
    if (event) {
      if (event.status === 'APPROVED') {
        if (event.date > new Date()) {
          const existing = await getRSVP(userId, eventId);
          if (!existing || existing.status === 'CANCELLED') {
            // finally do the thing
          }
        }
      }
    }
  }
}

// GOOD — flat with guard clauses
async function processRSVP(eventId: string, userId: string) {
  if (!eventId || !userId) return err({ type: 'INVALID_INPUT' });

  const event = await getEvent(eventId);
  if (!event) return err({ type: 'EVENT_NOT_FOUND' });
  if (event.status !== 'APPROVED') return err({ type: 'EVENT_NOT_ACTIVE' });
  if (event.date <= new Date()) return err({ type: 'PAST_EVENT' });

  const existing = await getRSVP(userId, eventId);
  if (existing && existing.status !== 'CANCELLED') return err({ type: 'ALREADY_RSVPD' });

  // Happy path — flat and readable
  const status = (await getGoingCount(eventId)) < event.capacity ? 'GOING' : 'WAITLISTED';
  await upsertRSVP(userId, eventId, status);
  return ok({ status });
}
```

### React Component Guards

```tsx
export function EventDetail({ event, userRSVP, isAuth }: Props) {
  if (!event) return <NotFound />;
  if (event.status === 'CANCELLED') return <CancelledBanner event={event} />;
  if (event.status !== 'APPROVED') return <NotFound />;

  // Happy path
  return (
    <div>
      <EventHeader event={event} />
      <RSVPButton event={event} userRSVP={userRSVP} isAuth={isAuth} />
    </div>
  );
}
```

---

## SOLID in Practice

### S — Single Responsibility
- One component per file
- One concern per function (fetch OR render, not both)
- Repository: data access only. Action: orchestration only. Component: rendering only.

### O — Open/Closed
- Use interfaces for extensibility (e.g., notification channels)
- Compose behavior via props/children, not modification

### L — Liskov Substitution
- Repository interface implementations are interchangeable
- Any component accepting `EventCardProps` works with any event

### I — Interface Segregation
- Components receive only the props they need
- Don't pass full ORM models to components — use DTOs

### D — Dependency Inversion
- Pages depend on repository abstractions, not Prisma directly
- Server Actions call repositories, not `prisma.event.create()`
- `import 'server-only'` enforces the boundary

---

## DRY / KISS / AHA

### DRY (Don't Repeat Yourself)
- Shared Zod schemas: define once, infer types
- Shared guard functions: `requireAuth()`, `requireRole()`
- Shared UI: `EventCard`, `EmptyState`, `StatusBadge`
- Shared utils: `formatEventDate()`, `generateSlug()`

### KISS (Keep It Simple)
- Plain object repositories (not class hierarchies)
- `useState` for simple state (not reducers)
- Three similar lines > premature abstraction
- No ORM abstraction over Prisma — Prisma IS the abstraction

### AHA (Avoid Hasty Abstractions)
- Duplicate code 2-3 times before abstracting
- Two components looking similar may diverge — wait for the pattern to stabilize
- Generic `<DataTable>` = premature. `<EventTable>` = right level.

---

## Server Action Security Checklist

Every Server Action must follow this order:

```
1. VALIDATE    — Zod parse all input (FormData or args)
2. AUTHENTICATE — await auth(), check session exists
3. AUTHORIZE   — check role, check ownership, check resource state
4. EXECUTE     — perform the mutation
5. LOG         — log the action with context
6. INVALIDATE  — updateTag() or revalidatePath()
7. RESPOND     — return Result or redirect
```

Never skip steps 1-3. Server Actions are public POST endpoints — treat all input as hostile.
