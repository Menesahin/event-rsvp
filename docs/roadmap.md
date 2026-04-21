# Event RSVP - Roadmap

## MVP (Current Scope)

Target: Functional platform with polished UI/UX for tech community events.

### Phase 1: Foundation ✅
- [x] Project scaffolding (Next.js 16.2.3, TypeScript 5.9, Tailwind 4, shadcn/ui)
- [x] Database schema (Prisma 7 + PostgreSQL + PrismaPg adapter)
- [x] Auth setup (NextAuth v5 + magic link + dev bypass)
- [x] Guard functions (requireAuth, requireRole) + error classes + logger + Result type
- [x] Base layout + theme

### Phase 2: Auth Flow ✅
- [x] Sign-in page (email input + useActionState)
- [x] Verify-request page (dev mode: inline magic link display)
- [x] Session management (NextAuth v5 + role in session)
- [x] Sign-out flow (component ready, wired in Phase 3)

### Phase 3: Public Pages ✅
- [x] Homepage (hero + Suspense-streamed upcoming events)
- [x] Events listing (upcoming + past sections)
- [x] Event detail page (speakers, capacity progress, copy link, RSVP placeholder)
- [x] Navbar (auth-aware dropdown) + footer
- [x] Responsive grid layout (1/2/3 columns)

### Phase 4: RSVP System ✅
- [x] RSVP creation (going / waitlisted) with Serializable transactions
- [x] RSVP cancellation + waitlist FIFO promotion
- [x] RSVP button (6 states: sign-in, rsvp, going, waitlisted, re-rsvp, disabled)
- [x] Capacity progress bar

### Phase 5: Dashboard ✅
- [x] Dashboard home (my events table + my RSVPs table)
- [x] Create event form (with dynamic speakers)
- [x] Edit event (field locking for approved events)
- [x] Event management (stats cards, submit for review, cancel)

### Phase 6: Admin ✅
- [x] Admin panel layout + requireRole(ADMIN) guard
- [x] Admin dashboard (stats cards)
- [x] Pending events list + approve/reject actions

### Phase 7: Polish ✅
- [x] Seed data (3 roles + 22 extra, 4 events with all statuses)
- [x] Empty states (reusable EmptyState component)
- [x] Loading/pending states (useTransition throughout)
- [x] Error handling (notFound for missing resources)
- [x] SEO metadata (title templates, OG tags, generateMetadata)

---

## Post-MVP Roadmap

Features prioritized by user impact and implementation effort.

### v1.1 — Notifications & Discovery
- [ ] Email notifications (RSVP confirmation, waitlist promotion, event approval)
- [ ] In-app notification inbox
- [ ] Event search (title, location)
- [ ] Event tags/categories (React, AI, DevOps, etc.)
- [ ] Filter by tag

### v1.2 — Social & Engagement
- [ ] User public profiles (attended events, organized events)
- [ ] Event comments / discussion
- [ ] Social share buttons (Twitter/X, LinkedIn)
- [ ] Calendar integration (Google Calendar, iCal export)
- [ ] Dark theme support

### v1.3 — Community Features
- [ ] Community / group management
- [ ] Community-scoped events
- [ ] Member roles within communities
- [ ] Community discovery page

### v1.4 — Platform Growth
- [ ] Social login (Google, GitHub OAuth)
- [ ] Recurring events
- [ ] Event series / multi-day events
- [ ] Analytics dashboard (event views, RSVP trends)
- [ ] Multi-language support (i18n)

### v2.0 — Monetization & Scale
- [ ] Paid events / ticket pricing
- [ ] Stripe integration
- [ ] Custom branding per community
- [ ] API for third-party integrations
- [ ] Webhook notifications
- [ ] Rate limiting
- [ ] CDN image upload (UploadThing or S3)
- [ ] Performance monitoring (Sentry, Vercel Analytics)

---

## Technical Debt & Improvements

Track items that aren't features but improve the codebase:

- [ ] E2E tests (Playwright)
- [ ] Unit tests for RSVP business logic
- [ ] CI/CD pipeline
- [ ] Database backups strategy
- [ ] Structured logging
- [ ] Error tracking (Sentry)
- [ ] Performance benchmarks
- [ ] Accessibility audit (WCAG 2.1 AA)
