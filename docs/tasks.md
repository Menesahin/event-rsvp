# Event RSVP - Implementation Tasks

## Phase 1: Foundation ✅

### T1.1: Project Scaffolding ✅
- [x] Next.js 16.2.3 scaffold with TypeScript, Tailwind 4, ESLint, App Router, src dir
- [x] Install core deps: prisma, @prisma/client, @prisma/adapter-pg, pg, next-auth, @auth/prisma-adapter, zod, sonner, lucide-react, pino, server-only
- [x] Init shadcn/ui + add components: button, card, input, label, badge, dialog, separator, progress, avatar, dropdown-menu
- [x] Create `.env.example`, next.config.ts (serverExternalPackages, remotePatterns)
- **Deliverable:** App builds and runs ✅

### T1.2: Database Schema ✅
- [x] Prisma 7 schema with all models (User, Event, RSVP, Speaker + NextAuth models)
- [x] Enums: UserRole, EventStatus, RSVPStatus
- [x] Indexes and constraints (@@unique, @@index)
- [x] `src/lib/db.ts` — Prisma singleton with PrismaPg adapter (Prisma 7 requirement)
- [x] `prisma.config.ts` — datasource URL config (Prisma 7: url moved out of schema)
- **Note:** Prisma 7 breaking change — `url` no longer in schema.prisma, moved to prisma.config.ts. PrismaClient requires `adapter` argument.
- **Deliverable:** Prisma client generated ✅

### T1.3: Auth Configuration ✅
- [x] `src/auth.ts` — NextAuth v5 config with Resend provider + dev bypass
- [x] `src/app/api/auth/[...nextauth]/route.ts`
- [x] `src/types/next-auth.d.ts` — Session type extended with id + role
- [x] Session callback injects user.id and user.role from DB
- **Deliverable:** Auth endpoints registered ✅

### T1.4: Guards & Utilities ✅
- [x] `src/lib/guards/require-auth.ts` — redirect to /sign-in
- [x] `src/lib/guards/require-role.ts` — role hierarchy check
- [x] `src/lib/utils.ts` — cn() utility (shadcn generated)
- [x] `src/lib/utils/slug.ts` — slugify + generateUniqueSlug
- [x] `src/lib/utils/date.ts` — formatEventDate, formatEventTime, isUpcoming, isPast, formatRelativeDate
- [x] `src/lib/errors/base.error.ts` — AppError abstract class
- [x] `src/lib/errors/index.ts` — ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError
- [x] `src/lib/result.ts` — Result<T, E> type with ok/err helpers
- [x] `src/lib/logger.ts` — Pino structured logger (pretty in dev, JSON in prod)
- [x] `src/lib/validations/event.ts` — Zod schemas for event CRUD
- **Deliverable:** All utility functions ready ✅

### T1.5: Root Layout & Theme ✅
- [x] `src/app/layout.tsx` — Geist fonts, metadata (title template, OG), Sonner toaster
- [x] `src/app/globals.css` — Tailwind + shadcn theme (light only)
- **Deliverable:** Build succeeds, base layout ready ✅

---

## Phase 2: Auth Flow ✅

### T2.1: Sign-in Page ✅
- [x] `src/app/(auth)/layout.tsx` — centered card layout, gray-50 bg
- [x] `src/app/(auth)/sign-in/page.tsx` — redirects to /dashboard if already signed in
- [x] `src/components/auth/sign-in-form.tsx` — Client Component with useActionState
  - Email input with Zod validation
  - Submit button with pending state
  - Error display
  - Dev mode: shows magic link inline after submit
- **Deliverable:** Email input form works ✅

### T2.2: Auth Server Action ✅
- [x] `src/lib/actions/auth.ts` — `requestMagicLink` server action
  - Zod email validation
  - Dev mode: retrieves stored callback URL from VerificationToken
  - Production: sends via Resend
  - Pino logging
- **Deliverable:** Magic link generated ✅

### T2.3: Verify Request Page ✅
- [x] `src/app/(auth)/verify-request/page.tsx` — "Check your email" card
- [x] Dev mode magic link display integrated directly in sign-in-form.tsx (simpler than separate component)
- **Deliverable:** Auth flow complete ✅

### T2.4: Sign-out ✅
- [x] `src/components/layout/sign-out-button.tsx` — Client Component with next-auth/react signOut
- [x] Redirects to homepage after sign-out
- **Note:** Will be wired into navbar in Phase 3
- **Deliverable:** Sign-out component ready ✅

---

## Phase 3: Public Pages ✅

### T3.1: Navbar & Footer ✅
- [x] `src/components/layout/navbar.tsx` — Server Component, auth-aware (SignIn/UserMenu)
- [x] `src/components/layout/user-menu.tsx` — Client Component, dropdown with Dashboard/Admin/SignOut
- [x] `src/components/layout/footer.tsx` — Server Component
- **Deliverable:** Navigation across pages ✅

### T3.2: Event Repository ✅
- [x] `src/lib/repositories/event.repository.ts` — getUpcoming, getPast, getBySlug, getByOrganizer, getPending, getById, create, update, updateStatus
- [x] `src/lib/repositories/rsvp.repository.ts` — getUserRSVP, getGoingCount, getFirstWaitlisted, getUserRSVPs
- **Deliverable:** All queries available ✅

### T3.3: Event Card + Homepage ✅
- [x] `src/components/shared/event-card.tsx` — cover image, date, title, location, progress bar, badges (Ended/Full)
- [x] `src/components/shared/empty-state.tsx` — reusable empty state
- [x] `src/components/landing/hero-section.tsx` — tagline, CTA buttons
- [x] `src/components/landing/upcoming-events.tsx` — async SC, fetches 6 events
- [x] `src/app/page.tsx` — hero + Suspense-wrapped upcoming events + navbar + footer
- **Deliverable:** Homepage with hero + events ✅

### T3.4: Events Listing + Detail Pages ✅
- [x] `src/app/(public)/layout.tsx` — Navbar + Footer wrapper
- [x] `src/app/(public)/events/page.tsx` — upcoming + past sections, empty state
- [x] `src/app/(public)/events/[slug]/page.tsx` — cover image, title, organizer, date/time, location, description, speakers, capacity progress, RSVP placeholder (6 states), copy link, generateMetadata
- [x] `src/components/events/speaker-card.tsx` — avatar, name, title, bio
- [x] `src/components/shared/copy-link-button.tsx` — Client Component, clipboard API
- **Note:** RSVP button is placeholder HTML, will be wired to server action in Phase 4
- **Deliverable:** Full public pages ✅

---

## Phase 4: RSVP System ✅

### T4.1: RSVP Repository ✅ (done in Phase 3)

### T4.2: RSVP Server Actions ✅
- [x] `src/lib/actions/rsvp.ts` — createRSVP + cancelRSVP
  - Serializable transactions for race condition safety
  - Waitlist auto-promotion (FIFO) on cancellation
  - Full auth + validation guard chain

### T4.3: RSVP Button ✅
- [x] `src/components/events/rsvp-button.tsx` — Client Component
  - 6 states: not-signed-in, available, going, waitlisted, cancelled/re-RSVP, past, cancelled-event
  - useTransition for pending state
  - Toast feedback via Sonner
  - Wired into event detail page
  - `getUserRSVPs(userId)` — with event data
- **Deliverable:** RSVP query functions

### T4.2: RSVP Server Actions
- Create `src/lib/actions/rsvp.ts`
  - `createRSVP(eventId)` — Serializable transaction
    - Check existing RSVP
    - Count going vs capacity
    - Create GOING or WAITLISTED
  - `cancelRSVP(eventId)` — Serializable transaction
    - Set CANCELLED
    - Promote first waitlisted if was GOING
- **Deliverable:** RSVP logic with waitlist promotion

### T4.3: RSVP Button Component
- Create `src/components/events/rsvp-button.tsx` (Client Component)
  - 6 states: not-signed-in, available, going, waitlisted, cancelled, disabled
---

## Phase 5: Dashboard ✅

- [x] Dashboard layout + sidebar + requireAuth guard
- [x] Dashboard home — My Events table + My RSVPs table + empty states
- [x] Event server actions — createEvent, updateEvent, submitForReview, cancelEvent
- [x] Event form — dynamic speakers, field locking for approved events
- [x] Create/Edit/Manage event pages with ownership checks
- **Deliverable:** Full dashboard CRUD ✅

---

## Phase 6: Admin ✅

- [x] Admin layout + sidebar + requireRole(ADMIN) guard
- [x] Admin dashboard — stats cards (total/pending/approved/cancelled)
- [x] Admin actions — approveEvent, rejectEvent server actions
- [x] Pending events page — event preview + approve/reject buttons
- **Deliverable:** Admin can approve/reject events ✅

---

## Phase 7: Polish ✅

- [x] Seed data — 3 roles + 22 extra attendees, 4 events (approved/pending/draft/full+waitlist)
- [x] Empty states — EmptyState component used across all pages
- [x] SEO metadata — root layout + generateMetadata on event detail
- [x] Loading/pending states — useTransition on all action buttons
- [x] Error handling — notFound on missing/unauthorized events
- **Deliverable:** Seed + polish ✅
- **Deliverable:** All pages work on all screen sizes
