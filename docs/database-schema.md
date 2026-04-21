# Event RSVP - Database Schema

## Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│      User        │       │    Account       │
├──────────────────┤       ├──────────────────┤
│ id          PK   │───┐   │ id          PK   │
│ name             │   ├──>│ userId      FK   │
│ email       UQ   │   │   │ provider         │
│ emailVerified    │   │   │ providerAccountId│
│ image            │   │   │ ...              │
│ role        ENUM │   │   └──────────────────┘
│ createdAt        │   │
│ updatedAt        │   │   ┌──────────────────┐
└──────────────────┘   │   │    Session       │
         │             ├──>├──────────────────┤
         │             │   │ id          PK   │
         │             │   │ sessionToken UQ  │
         │             │   │ userId      FK   │
         │             │   │ expires          │
         │             │   └──────────────────┘
         │             │
    organizer    rsvps │   ┌──────────────────────┐
         │       ┌─────┘   │ VerificationToken    │
         │       │         ├──────────────────────┤
         ▼       │         │ identifier           │
┌──────────────────┐       │ token           UQ   │
│     Event        │       │ expires              │
├──────────────────┤       │ @@unique(identifier,  │
│ id          PK   │       │          token)       │
│ title            │       └──────────────────────┘
│ slug        UQ   │
│ description      │
│ date             │
│ endDate          │
│ location         │
│ coverImage       │
│ capacity         │
│ status      ENUM │
│ organizerId FK   │
│ createdAt        │
│ updatedAt        │
└──────────────────┘
         │
    speakers    rsvps
         │         │
         ▼         ▼
┌──────────────┐  ┌───────────────────┐
│   Speaker    │  │      RSVP         │
├──────────────┤  ├───────────────────┤
│ id      PK   │  │ id           PK   │
│ name         │  │ status       ENUM │
│ title        │  │ userId       FK   │
│ bio          │  │ eventId      FK   │
│ avatar       │  │ createdAt         │
│ eventId FK   │  │                   │
└──────────────┘  │ @@unique(userId,  │
                  │          eventId) │
                  └───────────────────┘
```

## Enums

### UserRole
| Value | Description |
|-------|-------------|
| `ADMIN` | Platform administrator. Can approve/reject events. |
| `ORGANIZER` | Can create events (requires approval). |
| `ATTENDEE` | Default role. Can RSVP to events. |

### EventStatus
| Value | Description |
|-------|-------------|
| `DRAFT` | Created but not submitted. Only visible to organizer. |
| `PENDING` | Submitted for admin review. Not publicly visible. |
| `APPROVED` | Approved by admin. Publicly visible. |
| `CANCELLED` | Cancelled by organizer. Visible with cancelled banner. |

### RSVPStatus
| Value | Description |
|-------|-------------|
| `GOING` | Confirmed attendance. Within capacity. |
| `WAITLISTED` | Capacity full. Auto-promotes when a spot opens. |
| `CANCELLED` | User cancelled or event was cancelled. |

## Models Detail

### User

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | String | PK, cuid() | |
| name | String? | | Set during first login or profile update |
| email | String | UNIQUE | Primary identifier for auth |
| emailVerified | DateTime? | | Set by NextAuth on magic link verification |
| image | String? | | Avatar URL |
| role | UserRole | DEFAULT ATTENDEE | Escalation: ATTENDEE < ORGANIZER < ADMIN |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | @updatedAt | |

**Relations:**
- `accounts` -> Account[] (NextAuth)
- `sessions` -> Session[] (NextAuth)
- `organizedEvents` -> Event[] (as organizer)
- `rsvps` -> RSVP[]

### Event

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | String | PK, cuid() | |
| title | String | | Max 120 chars (validated in Zod) |
| slug | String | UNIQUE | Auto-generated from title |
| description | String | | Supports markdown |
| date | DateTime | | Event start date/time |
| endDate | DateTime? | | Optional end time |
| location | String | | Free text (venue name, address, or "Online") |
| coverImage | String? | | URL to cover image |
| capacity | Int | | Min 1 (validated in Zod) |
| status | EventStatus | DEFAULT DRAFT | See lifecycle in spec.md |
| organizerId | String | FK -> User.id | |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | @updatedAt | |

**Relations:**
- `organizer` -> User
- `speakers` -> Speaker[]
- `rsvps` -> RSVP[]

**Indexes:**
- `@@index([status, date])` — Homepage query: approved + upcoming
- `@@index([organizerId])` — Dashboard: my events
- `@@index([date])` — Chronological listing

### RSVP

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | String | PK, cuid() | |
| status | RSVPStatus | DEFAULT GOING | |
| userId | String | FK -> User.id | ON DELETE CASCADE |
| eventId | String | FK -> Event.id | ON DELETE CASCADE |
| createdAt | DateTime | DEFAULT now() | Used for waitlist FIFO ordering |

**Constraints:**
- `@@unique([userId, eventId])` — One RSVP per user per event

**Indexes:**
- `@@index([eventId, status])` — Count going/waitlisted per event (hot path)
- `@@index([userId])` — Dashboard: my RSVPs

### Speaker

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | String | PK, cuid() | |
| name | String | | Required |
| title | String? | | e.g., "Senior Engineer at Google" |
| bio | String? | | Short speaker bio |
| avatar | String? | | URL to speaker photo |
| eventId | String | FK -> Event.id | ON DELETE CASCADE |

**Indexes:**
- `@@index([eventId])` — Fetch speakers for an event

## Key Query Patterns

| Query | Used By | Index |
|-------|---------|-------|
| Events WHERE status=APPROVED AND date >= now ORDER BY date | Homepage, Events page | [status, date] |
| Events WHERE organizerId = X | Dashboard | [organizerId] |
| Events WHERE status = PENDING | Admin panel | [status, date] |
| RSVP COUNT WHERE eventId = X AND status = GOING | Event detail, capacity check | [eventId, status] |
| RSVP WHERE eventId = X AND status = WAITLISTED ORDER BY createdAt LIMIT 1 | Waitlist promotion | [eventId, status] |
| RSVP WHERE userId = X AND eventId = Y | Check user's RSVP status | @@unique [userId, eventId] |
| RSVPs WHERE userId = X | Dashboard: my RSVPs | [userId] |

## Cascade Behavior

| Parent Delete | Child Action |
|--------------|--------------|
| User deleted | Account, Session, RSVP -> CASCADE DELETE |
| Event deleted | Speaker, RSVP -> CASCADE DELETE |
| Event cancelled | RSVP status -> CANCELLED (application logic, not DB cascade) |

## Seed Data

See [tasks.md](tasks.md) for seed data specification.

### Users
- `admin@eventrsvp.dev` (ADMIN)
- `organizer@eventrsvp.dev` (ORGANIZER)
- `attendee@eventrsvp.dev` (ATTENDEE)

### Events
- "Next.js Conf Istanbul" — APPROVED, 50 capacity, 2 speakers, 3 RSVPs
- "React Meetup" — PENDING
- "GraphQL Workshop" — DRAFT
- "TypeScript Deep Dive" — APPROVED, 20 capacity, 20 GOING + 2 WAITLISTED
