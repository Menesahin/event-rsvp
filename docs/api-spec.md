# Event RSVP - API Specification

## Overview

This application uses **Server Actions** for all mutations and **Server Components** for data fetching. There are no REST API endpoints except for auth callbacks.

## API Routes

### `POST /api/auth/[...nextauth]`
NextAuth.js catch-all handler. Handles:
- `POST /api/auth/signin/resend` — Send magic link
- `GET /api/auth/callback/resend` — Verify magic link
- `POST /api/auth/signout` — Sign out
- `GET /api/auth/session` — Get session

---

## Server Actions

### Auth Actions (`src/lib/actions/auth.ts`)

#### `requestMagicLink(email: string)`
Initiates magic link sign-in flow.

**Input:**
```ts
{ email: string } // validated with z.string().email()
```

**Behavior:**
- Production: sends email via Resend
- Dev/Demo: stores verification URL, returns it to client

**Returns:**
```ts
{ success: true; magicLinkUrl?: string } // magicLinkUrl only in dev mode
| { success: false; error: string }
```

---

### Event Actions (`src/lib/actions/event.ts`)

#### `createEvent(formData: CreateEventInput)`
Creates a new event in DRAFT status.

**Auth:** Required (ORGANIZER or ADMIN role)

**Input:**
```ts
interface CreateEventInput {
  title: string;        // max 120 chars
  description: string;
  date: string;         // ISO 8601
  endDate?: string;     // ISO 8601
  location: string;
  coverImage?: string;  // URL
  capacity: number;     // min 1
  speakers: Array<{
    name: string;
    title?: string;
    bio?: string;
    avatar?: string;    // URL
  }>;
}
```

**Returns:**
```ts
{ success: true; eventId: string; slug: string }
| { success: false; error: string }
```

**Side effects:** None (event is DRAFT)

---

#### `updateEvent(eventId: string, data: UpdateEventInput)`
Updates an existing event.

**Auth:** Required (event owner or ADMIN)

**Input:**
```ts
// For DRAFT events: all fields editable
// For APPROVED events: only description and coverImage
interface UpdateEventInput {
  title?: string;
  description?: string;
  date?: string;
  endDate?: string;
  location?: string;
  coverImage?: string;
  capacity?: number;
  speakers?: Array<{ name: string; title?: string; bio?: string; avatar?: string }>;
}
```

**Validation:**
- If event status is APPROVED, only `description` and `coverImage` fields are accepted
- All other fields are silently ignored for approved events

**Returns:**
```ts
{ success: true }
| { success: false; error: string }
```

**Side effects:** `revalidatePath('/events/[slug]')`, `revalidatePath('/dashboard')`

---

#### `submitForReview(eventId: string)`
Changes event status from DRAFT to PENDING.

**Auth:** Required (event owner)

**Precondition:** Event must be in DRAFT status

**Returns:**
```ts
{ success: true }
| { success: false; error: string }
```

**Side effects:** `revalidatePath('/admin/events')`, `revalidatePath('/dashboard')`

---

#### `cancelEvent(eventId: string)`
Cancels an event and all its RSVPs.

**Auth:** Required (event owner or ADMIN)

**Precondition:** Event must be DRAFT, PENDING, or APPROVED

**Behavior:**
1. Set event status to CANCELLED
2. Set ALL RSVPs (GOING + WAITLISTED) to CANCELLED

**Returns:**
```ts
{ success: true }
| { success: false; error: string }
```

**Side effects:** `revalidatePath('/events')`, `revalidatePath('/events/[slug]')`, `revalidatePath('/dashboard')`

---

### RSVP Actions (`src/lib/actions/rsvp.ts`)

#### `createRSVP(eventId: string)`
Creates or reactivates an RSVP for the current user.

**Auth:** Required

**Precondition:** Event must be APPROVED and date must be in the future

**Behavior (Serializable transaction):**
1. Check existing RSVP for user+event
   - If exists and status is GOING or WAITLISTED -> error "Already RSVP'd"
   - If exists and status is CANCELLED -> reactivate (update status)
   - If not exists -> create new
2. Count GOING RSVPs for event
3. If count < capacity -> status = GOING
4. If count >= capacity -> status = WAITLISTED

**Returns:**
```ts
{ success: true; status: "GOING" | "WAITLISTED" }
| { success: false; error: string }
```

**Side effects:** `revalidatePath('/events/[slug]')`

---

#### `cancelRSVP(eventId: string)`
Cancels the current user's RSVP and promotes waitlisted user if applicable.

**Auth:** Required

**Precondition:** User has an active RSVP (GOING or WAITLISTED)

**Behavior (Serializable transaction):**
1. Set user's RSVP status to CANCELLED
2. If cancelled RSVP was GOING:
   - Find first WAITLISTED RSVP (ORDER BY createdAt ASC)
   - If found, update status to GOING (promotion)

**Returns:**
```ts
{ success: true; promotedUserId?: string }
| { success: false; error: string }
```

**Side effects:** `revalidatePath('/events/[slug]')`

---

### Admin Actions (`src/lib/actions/admin.ts`)

#### `approveEvent(eventId: string)`
Approves a pending event.

**Auth:** Required (ADMIN role)

**Precondition:** Event must be in PENDING status

**Returns:**
```ts
{ success: true }
| { success: false; error: string }
```

**Side effects:** `revalidatePath('/admin/events')`, `revalidatePath('/events')`

---

#### `rejectEvent(eventId: string)`
Rejects a pending event (returns to DRAFT).

**Auth:** Required (ADMIN role)

**Precondition:** Event must be in PENDING status

**Returns:**
```ts
{ success: true }
| { success: false; error: string }
```

**Side effects:** `revalidatePath('/admin/events')`, `revalidatePath('/dashboard')`

---

## Repository Functions (Data Fetching)

These are called from Server Components, not exposed as API endpoints.

### Event Repository (`src/lib/repositories/event.repository.ts`)

| Function | Returns | Used By |
|----------|---------|---------|
| `getBySlug(slug)` | Event with speakers | Event detail page |
| `getUpcoming(limit?)` | Event[] (APPROVED, date >= now) | Homepage, events page |
| `getPast(limit?)` | Event[] (APPROVED, date < now) | Events page (past section) |
| `getByOrganizer(userId)` | Event[] (all statuses) | Dashboard |
| `getPending()` | Event[] (PENDING status) | Admin panel |
| `getById(id)` | Event | Edit page |

### RSVP Repository (`src/lib/repositories/rsvp.repository.ts`)

| Function | Returns | Used By |
|----------|---------|---------|
| `getUserRSVP(userId, eventId)` | RSVP or null | Event detail (RSVP button state) |
| `getGoingCount(eventId)` | number | Event detail (capacity counter) |
| `getFirstWaitlisted(eventId)` | RSVP or null | Waitlist promotion |
| `getUserRSVPs(userId)` | RSVP[] with event | Dashboard |

### User Repository (`src/lib/repositories/user.repository.ts`)

| Function | Returns | Used By |
|----------|---------|---------|
| `getById(id)` | User | Session callback |

## Error Handling

All server actions return a discriminated union:

```ts
type ActionResult<T = void> =
  | { success: true } & T
  | { success: false; error: string };
```

Common error messages:
- `"Unauthorized"` — Not authenticated
- `"Forbidden"` — Wrong role
- `"Not found"` — Resource doesn't exist
- `"Invalid input"` — Zod validation failed (includes field errors)
- `"Already RSVP'd"` — Duplicate RSVP attempt
- `"Event is not accepting RSVPs"` — Past or cancelled event
