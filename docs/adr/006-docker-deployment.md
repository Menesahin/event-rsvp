# ADR-006: Docker Containerization

## Status
**Accepted** — 2026-04-08

## Context
The MVP initially deferred deployment concerns. After feature completion, we need a reproducible, self-hostable deployment target. Options considered: Vercel (platform-as-a-service), Docker (self-hosted), Railway/Fly.io (PaaS with Docker).

## Decision
Use **Docker + Docker Compose** for containerized deployment with a multi-stage Dockerfile and separate migration service.

### Architecture

```
┌────────────────────────────────────────┐
│ docker-compose                         │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────┐    ┌──────────────────┐  │
│  │ postgres │<---│ migrate (init)   │  │
│  │ :5432    │    │ prisma migrate + │  │
│  └──────────┘    │ seed, then exit  │  │
│       ^          └──────────────────┘  │
│       |                                │
│       |          ┌──────────────────┐  │
│       └----------│ app :3000        │  │
│                  │ Next.js          │  │
│                  │ standalone       │  │
│                  └──────────────────┘  │
└────────────────────────────────────────┘
```

### Dockerfile (multi-stage)

- **base**: Node 20.18 alpine + libc6-compat + openssl + corepack (pnpm)
- **deps**: Install dependencies with pnpm cache mount
- **builder**: Prisma generate + Next.js build (standalone output)
- **runner**: Minimal runtime with non-root user, health check, standalone server

### next.config.ts
Added `output: "standalone"` to produce a self-contained server.js that includes minimal node_modules. Reduces image size significantly vs. copying full node_modules.

### docker-compose services
1. **postgres** — PostgreSQL 16 alpine with named volume + healthcheck
2. **migrate** — one-shot service that runs `prisma migrate deploy && db:seed` after postgres is healthy, then exits
3. **app** — Next.js standalone server, depends on postgres (healthy) + migrate (completed)

### Environment
Two env files for clarity:
- `.env.example` — local development (DATABASE_URL points to localhost)
- `.env.docker.example` — Docker Compose (DATABASE_URL uses service name `postgres`)

## Alternatives Considered

### Option A: Vercel + Neon
- **Pros:** Zero-config for Next.js, serverless scale, free tier.
- **Cons:** Vendor lock-in, harder to self-host, separate DB provider.
- **Rejected because:** We want portable deployment that works anywhere Docker runs.

### Option B: Single Dockerfile + external PostgreSQL
- **Pros:** Simpler, one container.
- **Cons:** User must provision PostgreSQL separately, no one-command setup.
- **Rejected because:** `docker compose up` gives complete local stack — better DX.

### Option C: Bundle migration into app entrypoint
- **Pros:** Fewer services.
- **Cons:** Couples app startup to migration, race conditions with replicas.
- **Rejected because:** Separate migrate service runs once cleanly before app starts.

## Key Decisions

### Non-root user
Runtime stage creates `nextjs` user (uid 1001). Follows global Docker rules.

### Base image: Node 20.18 alpine
- Pinned minor version (no `:latest`)
- Alpine for minimal size
- Requires `libc6-compat` and `openssl` for Prisma

### Build cache mount
`--mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store` speeds up repeated builds by reusing pnpm's content-addressable store.

### Health checks
- Postgres: `pg_isready`
- App: HTTP GET / via wget

### AUTH_TRUST_HOST
NextAuth requires `AUTH_TRUST_HOST=true` when running behind Docker/reverse proxies because the hostname is not `localhost`.

## Consequences

### Positive
- **Portable**: Runs anywhere Docker runs (VPS, Kubernetes, local dev).
- **Reproducible**: Same environment in dev and prod.
- **One-command setup**: `docker compose up` gives full stack with seeded DB.
- **Security**: Non-root user, pinned image versions.

### Negative
- **Image size**: ~200-300MB (vs. serverless zero-config).
- **Build time**: Initial build is slow (Prisma generate + Next.js build). Mitigated by cache mount.
- **Complexity**: Three services to understand vs. one.

### Mitigations
- `.dockerignore` excludes docs, .git, node_modules to keep build context small.
- Standalone output minimizes runtime image size.
- Cache mount makes rebuilds fast (~30s vs. ~3min cold).
