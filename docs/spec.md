# Event RSVP - Feature Specification

## F1: Authentication (Magic Link)

### Description
Passwordless authentication via magic link. In demo/dev mode, the verification link is displayed directly in the UI instead of sending an email.

### User Stories
- **US1.1:** As a visitor, I can enter my email to receive a magic link so I can sign in without a password.
- **US1.2:** As a visitor in demo mode, I can see the magic link directly after entering my email so I can test without email setup.
- **US1.3:** As a signed-in user, I can sign out from the navbar.

### Acceptance Criteria
- [ ] Email input with validation (valid email format)
- [ ] In production: sends magic link via Resend
- [ ] In dev/demo: displays the magic link inline on the sign-in form (better UX — no page navigation needed)
- [ ] Magic link expires after 24 hours
- [ ] Clicking an expired link shows a clear error with option to request a new one
- [ ] After sign-in, user is redirected to the page they came from (or dashboard)
- [ ] New email addresses auto-create an account with ATTENDEE role
- [ ] Session persists across browser refreshes

### Edge Cases
- User enters email that doesn't exist -> auto-create account
- User clicks expired magic link -> show error + re-request option
- User requests multiple magic links -> only the latest one works
- User is already signed in and visits /sign-in -> redirect to dashboard

---

## F2: Event Management (CRUD)

### Description
Organizers can create, edit, and manage events. Events require admin approval before becoming publicly visible.

### User Stories
- **US2.1:** As an organizer, I can create an event with title, description, date/time, location, cover image URL, capacity, and speaker info.
- **US2.2:** As an organizer, I can save an event as a draft before submitting for review.
- **US2.3:** As an organizer, I can submit a draft event for admin approval.
- **US2.4:** As an organizer, I can edit my event's description and cover image after approval.
- **US2.5:** As an organizer, I can cancel my event (which auto-cancels all RSVPs).
- **US2.6:** As an organizer, I can view the attendee count for my events.

### Event Fields

| Field | Type | Required | Editable After Approval |
|-------|------|----------|------------------------|
| Title | string (max 120 chars) | Yes | No |
| Slug | auto-generated from title | Yes | No |
| Description | rich text / markdown | Yes | Yes |
| Date & Time | datetime | Yes | No |
| End Date & Time | datetime | No | No |
| Location | string | Yes | No |
| Cover Image | URL string | No | Yes |
| Capacity | integer (min 1) | Yes | No |

### Event Lifecycle

```
DRAFT ──> PENDING ──> APPROVED ──> (CANCELLED)
  ^          │
  └──────────┘ (rejected by admin)
```

- **DRAFT:** Only visible to the organizer. Can be freely edited.
- **PENDING:** Submitted for review. Organizer cannot edit. Waiting for admin action.
- **APPROVED:** Publicly visible. Only description and cover image are editable.
- **CANCELLED:** Visible with "Cancelled" banner. RSVP disabled. All existing RSVPs auto-cancelled.

### Acceptance Criteria
- [ ] Event form with all required fields + Zod validation
- [ ] Auto-generated slug from title (unique, URL-safe)
- [ ] Draft save without submitting
- [ ] Submit for review button (DRAFT -> PENDING)
- [ ] Restricted editing after approval (only description + cover image)
- [ ] Cancel event action with confirmation dialog
- [ ] Cancelling an event sets all RSVPs to CANCELLED
- [ ] Past events show with RSVP disabled (no status change needed)
- [ ] Organizer dashboard shows all their events grouped by status

### Edge Cases
- Duplicate slug -> append random suffix (e.g., "nextjs-conf-2026-a1b2")
- Organizer tries to edit locked fields on approved event -> fields are disabled in UI, rejected in server action
- Organizer cancels event with waitlisted users -> all RSVPs (going + waitlisted) become CANCELLED
- Event date is in the past -> RSVP button disabled, "This event has ended" message shown

---

## F3: RSVP System

### Description
Authenticated users can RSVP to events. When capacity is reached, additional RSVPs go to a waitlist. When someone cancels, the first waitlisted person is automatically promoted.

### User Stories
- **US3.1:** As an attendee, I can RSVP to an event if capacity is available.
- **US3.2:** As an attendee, I am automatically waitlisted when an event is at capacity.
- **US3.3:** As an attendee, I can cancel my RSVP at any time.
- **US3.4:** As a waitlisted attendee, I am automatically promoted to GOING when someone cancels.
- **US3.5:** As a visitor (not signed in), I see a "Sign in to RSVP" button that redirects to login.

### RSVP States

```
(none) ──> GOING       (capacity available)
(none) ──> WAITLISTED  (capacity full)
GOING ──> CANCELLED    (user cancels -> promote first waitlisted)
WAITLISTED ──> CANCELLED (user cancels -> no promotion needed)
WAITLISTED ──> GOING   (auto-promoted when a GOING user cancels)
CANCELLED ──> GOING    (user re-RSVPs, capacity available)
CANCELLED ──> WAITLISTED (user re-RSVPs, capacity full)
```

### Acceptance Criteria
- [ ] One RSVP per user per event (DB unique constraint)
- [ ] RSVP button shows current state: "RSVP" / "Going" / "On Waitlist" / "Cancelled"
- [ ] Capacity counter: "24/50 attending" with progress bar
- [ ] Waitlist auto-promotion: FIFO order (earliest createdAt first)
- [ ] Promotion happens atomically within a Serializable transaction
- [ ] Users can cancel and re-RSVP unlimited times
- [ ] RSVP disabled for past events
- [ ] RSVP disabled for cancelled events
- [ ] Unauthenticated users see "Sign in to RSVP" -> redirects to /sign-in with callback URL
- [ ] Toast feedback: "You're going!", "You're on the waitlist", "RSVP cancelled"

### Edge Cases
- Two users RSVP simultaneously for the last spot -> one gets GOING, other gets WAITLISTED (Serializable transaction)
- Two users cancel simultaneously -> each promotes a different waitlisted user (no double-promotion)
- User cancels and immediately re-RSVPs -> treated as new RSVP (may go to waitlist if someone took their spot)
- Organizer reduces capacity below current GOING count -> existing RSVPs untouched, new RSVPs go to waitlist
- User tries to RSVP to their own event -> allowed (organizers can attend their own events)
- Event has 0 waitlisted when someone cancels -> no promotion, just decrement going count

---

## F4: Speaker Management

### Description
Organizers can add speaker information to their events. Speakers are per-event data, not platform accounts.

### User Stories
- **US4.1:** As an organizer, I can add one or more speakers when creating/editing an event.
- **US4.2:** As a visitor, I can see speaker details on the event page.

### Speaker Fields

| Field | Type | Required |
|-------|------|----------|
| Name | string | Yes |
| Title/Role | string | No |
| Bio | text | No |
| Avatar | URL string | No |

### Acceptance Criteria
- [ ] Add/remove speakers in the event form (dynamic form fields)
- [ ] At least speaker name is required
- [ ] Speakers displayed on event detail page with avatar, name, title, bio
- [ ] Speakers are deleted when event is deleted (cascade)

### Edge Cases
- Event with no speakers -> speaker section hidden on detail page
- Speaker with no avatar -> show initials fallback

---

## F5: Admin Panel

### Description
Admins can approve or reject pending events, ensuring quality control for the platform.

### User Stories
- **US5.1:** As an admin, I can see a list of events pending approval.
- **US5.2:** As an admin, I can approve a pending event (makes it publicly visible).
- **US5.3:** As an admin, I can reject a pending event (returns it to draft).
- **US5.4:** As an admin, I can view all events across all statuses.

### Acceptance Criteria
- [ ] Admin-only route protection (redirect non-admins)
- [ ] Pending events list with event details preview
- [ ] One-click approve / reject actions
- [ ] Approve: PENDING -> APPROVED, event appears in public listings
- [ ] Reject: PENDING -> DRAFT, organizer can edit and resubmit
- [ ] Admin dashboard shows counts: total events, pending, approved, cancelled

### Edge Cases
- Admin approves an event that the organizer cancelled while it was pending -> should not approve cancelled events (check status in server action)
- Non-admin user accesses /admin -> redirect to /dashboard
- Last admin tries to change their role -> not possible (but not enforced in MVP, only one admin via seed)

---

## F6: Public Pages

### Description
Homepage with hero section and upcoming events. Event listing page. Event detail page accessible without authentication.

### User Stories
- **US6.1:** As a visitor, I can see a hero section and upcoming events on the homepage.
- **US6.2:** As a visitor, I can browse all upcoming events in chronological order.
- **US6.3:** As a visitor, I can view full event details including speakers, capacity, and date.
- **US6.4:** As a visitor, I can copy the event link to share with others.

### Acceptance Criteria
- [ ] Homepage: hero section with tagline + CTA buttons + upcoming events grid
- [ ] Events page: chronological list of APPROVED events (upcoming first, past at bottom)
- [ ] Event detail page: cover image, title, date/time, location, description, speakers, capacity counter
- [ ] Past events visible with "This event has ended" indicator and RSVP disabled
- [ ] Copy link button on event detail page with toast confirmation
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] SEO: proper meta tags, Open Graph for event sharing

### Edge Cases
- No upcoming events -> show empty state with message
- Event with very long description -> truncate on listing, full on detail
- Cover image URL is broken/invalid -> show placeholder image

---

## F7: Dashboard

### Description
Authenticated users' personal area showing their events (as organizer) and RSVPs (as attendee).

### User Stories
- **US7.1:** As an organizer, I can see all my events grouped by status.
- **US7.2:** As an attendee, I can see all events I've RSVP'd to.
- **US7.3:** As an organizer, I can see the attendee count for each of my events.

### Acceptance Criteria
- [ ] Dashboard home: split view of "My Events" (organizer) and "My RSVPs" (attendee)
- [ ] My Events: grouped by status (draft, pending, approved, cancelled)
- [ ] My RSVPs: show event name, date, RSVP status (going/waitlisted/cancelled)
- [ ] Quick actions: edit event, view event, create new event
- [ ] Empty states for no events / no RSVPs
- [ ] Sidebar navigation for dashboard sections

### Edge Cases
- User has no events and no RSVPs -> show welcome message with CTA to browse events
- User is both organizer and attendee -> show both sections
