# ADR-005: Prisma 7 PrismaPg Adapter Pattern

## Status
**Accepted** — 2026-04-08

## Context
Prisma 7 introduced breaking changes from Prisma 6:
- `url` property removed from `datasource` block in schema.prisma
- Connection URL moved to `prisma.config.ts`
- `PrismaClient` constructor requires `adapter` or `accelerateUrl` argument
- Generated client output changed from `prisma-client-js` to `prisma-client`
- Generated files have no index.ts barrel — must import from `client.ts` directly

## Decision
Use `@prisma/adapter-pg` with `PrismaPg` adapter factory for direct PostgreSQL connections.

```ts
// src/lib/db.ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

## Consequences
- All imports must use `@/generated/prisma/client` (not `@/generated/prisma`)
- Type imports (UserRole, EventStatus, etc.) also from `@/generated/prisma/client`
- `prisma.config.ts` holds the DATABASE_URL for migrations
- `src/lib/db.ts` holds the adapter config for runtime
