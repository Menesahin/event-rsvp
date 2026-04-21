# Next.js 16.2 Best Practices Reference

## Cache Components & `use cache` Directive

Next.js 16 made caching entirely opt-in. Nothing is cached by default.

### Enable

```ts
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true, // Required to use "use cache"
};
```

### Three Scopes

```ts
// 1. File-level — all exports cached
"use cache";
export async function getAllEvents() { ... }
export async function getEventCount() { ... }

// 2. Function-level (RECOMMENDED for most cases)
async function getUpcomingEvents(limit: number) {
  "use cache";
  cacheTag('events-upcoming');
  cacheLife('minutes');
  return db.event.findMany({
    where: { status: 'APPROVED', date: { gte: new Date() } },
    take: limit,
  });
}

// 3. Component-level (async Server Component)
async function EventCard({ id }: { id: string }) {
  "use cache";
  cacheTag(`event-${id}`);
  cacheLife('hours');
  const event = await getEvent(id);
  return <div>{event.title}</div>;
}
```

### cacheLife Profiles

Named profiles: `'seconds'`, `'minutes'`, `'hours'`, `'days'`, `'weeks'`, `'max'`

Custom:
```ts
cacheLife({ stale: 60, revalidate: 3600, expire: 86400 });
// stale: client uses cache without server check (seconds)
// revalidate: trigger background refresh (SWR)
// expire: too stale, wait for fresh data
```

### Cache Invalidation (Next.js 16 APIs)

```ts
// In Server Actions (user-triggered) — instant read-your-writes
'use server';
import { updateTag } from 'next/cache';

export async function updateEvent(id: string, data: UpdateEventInput) {
  await db.event.update({ where: { id }, data });
  updateTag(`event-${id}`);   // Expire + immediate re-fetch
  updateTag('events-upcoming'); // Also refresh listing
}

// In webhooks/route handlers — SWR-style
import { revalidateTag } from 'next/cache';
revalidateTag('events-upcoming', 'hours'); // Second arg REQUIRED

// For uncached dynamic data — Server Actions only
import { refresh } from 'next/cache';
export async function markNotificationRead(id: string) {
  await db.notification.update({ where: { id }, data: { read: true } });
  refresh(); // Refresh dynamic (non-cached) data only
}
```

### Cookies/Headers Outside Cache Scope

```ts
// WRONG — cookies() inside cached function
async function getUser() {
  "use cache"; // ERROR: cookies() is dynamic
  const token = (await cookies()).get('session')?.value;
}

// CORRECT — read dynamic data outside, pass as arg
async function Page() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  return <UserData userId={userId} />;
}

async function UserData({ userId }: { userId: string }) {
  "use cache";
  cacheTag(`user-${userId}`);
  const user = await db.user.findUnique({ where: { id: userId } });
  return <div>{user?.name}</div>;
}
```

---

## proxy.ts (Replaces middleware.ts)

```ts
// src/proxy.ts (NOT middleware.ts)
import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  // Full Node.js runtime — fs, crypto, native modules available
  const token = request.cookies.get('session')?.value;

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Key differences from middleware:**
- Runs on Node.js (not Edge Runtime)
- Full access to `fs`, `crypto`, native modules
- `fetch()` cache options have NO effect inside proxy
- Config: `skipProxyUrlNormalize` (was `skipMiddlewareUrlNormalize`)

**IMPORTANT:** proxy.ts is NOT a security boundary. Always re-verify auth in Server Components/Actions via guards.

---

## Async Request APIs (Strictly Enforced)

```ts
// ALL must be awaited — sync access removed in Next.js 16
const { slug } = await params;
const { q } = await searchParams;
const cookieStore = await cookies();
const headersList = await headers();
const { isEnabled } = await draftMode();

// Page component prop types
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function EventPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { q } = await searchParams;
  // ...
}

// generateMetadata — also async params
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return { title: event.title };
}
```

---

## Server Components Patterns

```tsx
// Default: ALL components are Server Components
// Only add 'use client' when you need hooks, browser APIs, event handlers

// Pattern: Server parent passes data to Client child
async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await eventRepository.getBySlug(slug);
  const session = await auth(); // nullable

  return (
    <>
      <EventHeader event={event} />           {/* Server Component */}
      <RSVPButton                              {/* Client Component */}
        eventId={event.id}
        userRSVP={userRSVP}
        isAuthenticated={!!session}
      />
    </>
  );
}

// Pattern: Server Components as children of Client Components
<ClientShell>
  <ServerComponent />  {/* Renders on server, passed as children */}
</ClientShell>

// Pattern: Streaming with Suspense
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <StaticHeader />
      <Suspense fallback={<EventCardsSkeleton />}>
        <UpcomingEvents />
      </Suspense>
    </div>
  );
}
```

---

## Server Actions Best Practices

```ts
// src/lib/actions/event.ts
'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';
import { eventRepository } from '@/lib/repositories/event.repository';
import { ForbiddenError, ValidationError } from '@/lib/errors';

const log = logger.child({ module: 'EventActions' });

const CreateEventSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(5000),
  date: z.string().datetime(),
  location: z.string().min(1).max(200),
  capacity: z.number().int().min(1).max(10000),
});

export async function createEvent(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  // 1. Validate
  const raw = Object.fromEntries(formData);
  const parsed = CreateEventSchema.safeParse({
    ...raw,
    capacity: Number(raw.capacity),
  });
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' };
  }

  // 2. Authenticate
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  // 3. Authorize
  if (session.user.role === 'ATTENDEE') {
    return { success: false, error: 'Forbidden' };
  }

  // 4. Execute
  try {
    const event = await eventRepository.create({
      ...parsed.data,
      organizerId: session.user.id,
    });
    log.info({ eventId: event.id, userId: session.user.id }, 'Event created');
    updateTag('events-upcoming');
    redirect(`/dashboard/events/${event.id}`);
  } catch (error) {
    log.error({ err: error }, 'Failed to create event');
    return { success: false, error: 'Failed to create event' };
  }
}
```

---

## Metadata & SEO

```ts
// Static metadata (layout.tsx)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Event RSVP', template: '%s | Event RSVP' },
  description: 'The RSVP platform for tech communities.',
  openGraph: {
    title: 'Event RSVP',
    description: 'The RSVP platform for tech communities.',
    type: 'website',
  },
};

// Dynamic metadata (event detail page)
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params; // MUST await
  const event = await eventRepository.getBySlug(slug);
  if (!event) return { title: 'Event Not Found' };

  return {
    title: event.title,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      images: event.coverImage ? [event.coverImage] : [],
    },
  };
}
```

---

## Error Handling

```tsx
// app/(public)/events/[slug]/error.tsx
'use client';

export default function EventError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      {/* unstable_retry re-fetches server data — preferred over reset() */}
      <button onClick={() => unstable_retry()}>Try again</button>
    </div>
  );
}

// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
    </div>
  );
}
```

---

## Performance

### Turbopack (Default in 16)
No config needed — it's the default bundler. Opt out: `next dev --webpack`.

### React Compiler (Opt-in)
```ts
// next.config.ts
const nextConfig = { reactCompiler: true };
// npm install babel-plugin-react-compiler@latest
```

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src={event.coverImage}
  alt={event.title}
  width={800}
  height={450}
  priority           // for LCP images (above the fold)
  className="rounded-lg object-cover"
/>
```

New defaults in 16: `minimumCacheTTL=14400` (4 hours), `qualities=[75]`.

### Dynamic Imports
```tsx
import dynamic from 'next/dynamic';

const EventForm = dynamic(() => import('@/components/dashboard/event-form'), {
  loading: () => <FormSkeleton />,
});
```

---

## next.config.ts Reference

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,     // Enable "use cache" + PPR
  reactCompiler: true,        // Opt-in automatic memoization

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // Allow all HTTPS images (MVP)
    ],
  },

  serverExternalPackages: ['pino', 'pino-pretty'],
};

export default nextConfig;
```

---

## Removed Features (Do NOT Use)

| Removed | Replacement |
|---------|-------------|
| AMP support | Remove all AMP config |
| `next lint` | Use ESLint CLI directly |
| `serverRuntimeConfig` | Use `process.env` |
| `publicRuntimeConfig` | Use `process.env` with `NEXT_PUBLIC_` prefix |
| `images.domains` | `images.remotePatterns` |
| `next/legacy/image` | `next/image` |
| `experimental.ppr` | `cacheComponents: true` |
| `experimental.dynamicIO` | `cacheComponents` |
| `middleware.ts` (deprecated) | `proxy.ts` |

---

## Prisma 7 Breaking Changes (Used in This Project)

Prisma 7 introduced breaking changes from Prisma 6. See also `docs/adr/005-prisma-7-adapter.md`.

### `url` moved out of schema.prisma

```prisma
// WRONG (Prisma 6 style — Prisma 7 fails validation)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// CORRECT (Prisma 7)
datasource db {
  provider = "postgresql"
}
```

The URL is set in `prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

### PrismaClient requires adapter

```ts
// WRONG (Prisma 7 fails without adapter)
const prisma = new PrismaClient();

// CORRECT (use PrismaPg adapter)
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

### Generated client imports

Prisma 7 generates to `src/generated/prisma/` (configured via `output` in schema). **No barrel index** — import from `/client` explicitly:

```ts
// WRONG
import { PrismaClient, UserRole } from "@/generated/prisma";

// CORRECT
import { PrismaClient, UserRole } from "@/generated/prisma/client";
```

---

## Docker Deployment (Production-Ready)

See `docs/adr/006-docker-deployment.md` for full rationale.

### next.config.ts requirement

```ts
const nextConfig: NextConfig = {
  output: "standalone",           // REQUIRED for Docker — produces .next/standalone/server.js
  serverExternalPackages: ["pino", "pino-pretty"],
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};
```

### Dockerfile pattern (multi-stage)

1. **base** — Node 22 alpine + `npm install -g pnpm@VERSION` (do NOT use corepack — keyid verification bug)
2. **deps** — `pnpm install --frozen-lockfile` with cache mount
3. **builder** — `pnpm prisma generate && pnpm build`
4. **runner** — Copy `.next/standalone`, `.next/static`, `public/`, `src/generated/`, `prisma/` with non-root user

```dockerfile
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl wget \
    && npm install -g pnpm@10.33.0   # Avoid corepack keyid bug
WORKDIR /app
```

### Common pitfalls

- **Do NOT remove `output: "standalone"`** — breaks Docker.
- **`AUTH_TRUST_HOST=true`** required for NextAuth behind Docker (non-localhost).
- **Non-root user** (uid 1001) — global Docker rule.
- **Healthcheck** via `wget --spider http://localhost:3000`.
- **`.dockerignore`** excludes `docs/`, `.git/`, `node_modules/`, `.env*`.

### docker-compose pattern

Three services:
1. `postgres` (with `pg_isready` healthcheck + named volume)
2. `migrate` — one-shot: `pnpm prisma migrate deploy && pnpm db:seed`, exits after
3. `app` — depends on postgres (healthy) + migrate (completed successfully)
