# ADR-004: Admin Approval Flow for Events

## Status
**Accepted** — 2026-04-08

## Context
We need quality control for events published on the platform. Without moderation, anyone with an ORGANIZER role could publish spam, inappropriate, or low-quality events that damage community trust.

## Decision
Implement a **mandatory admin approval workflow** for all events. Events go through a `DRAFT -> PENDING -> APPROVED` lifecycle. Only APPROVED events are publicly visible.

## Event Lifecycle

```
DRAFT ───────> PENDING ───────> APPROVED
  │               │                 │
  │               │                 └──> CANCELLED (by organizer or admin)
  │               │
  │               └──> DRAFT (rejected by admin, organizer can edit and resubmit)
  │
  └──> CANCELLED (by organizer, before submission)
```

### Status Definitions

| Status | Visibility | Editable | RSVP |
|--------|-----------|----------|------|
| DRAFT | Organizer only | All fields | No |
| PENDING | Organizer + Admin | No (locked for review) | No |
| APPROVED | Everyone | Description + cover image only | Yes |
| CANCELLED | Everyone (with banner) | No | No |

## Alternatives Considered

### Option A: No Approval (Auto-Publish)
- **Pros:** Zero friction for organizers, no admin bottleneck.
- **Cons:** No quality control, spam risk, inappropriate content.
- **Rejected because:** Platform credibility depends on event quality. One spam event damages trust for the entire community.

### Option B: Post-Publish Moderation
- **Pros:** Events go live immediately, admin reviews afterward. Faster for organizers.
- **Cons:** Spam/inappropriate events are visible to users before review. Damage is done before moderation.
- **Rejected because:** Even brief visibility of spam events degrades user trust. Pre-publish review is safer.

### Option C: Trusted Organizers (Approval for New Organizers Only)
- **Pros:** Reduces admin workload over time. Trusted organizers can publish freely.
- **Cons:** More complex role system (trust levels). How many events before "trusted"? Edge cases around trust revocation.
- **Rejected because:** Over-engineered for MVP. Can add trusted organizer tier post-MVP when the admin workload justifies it.

## Editing Restrictions After Approval

Once an event is APPROVED, only **description** and **cover image** can be edited. Critical fields (title, date, location, capacity) are locked.

**Rationale:** Users who RSVP'd made their decision based on the date, location, and capacity. Changing these after approval would break the RSVP contract. If an organizer needs to change critical details, they should cancel the event and create a new one.

| Field | Editable After Approval | Why |
|-------|------------------------|-----|
| Title | No | Part of the SEO slug, shared in links |
| Date/Time | No | Attendees planned around this |
| Location | No | Attendees planned travel |
| Capacity | No | Could affect waitlist fairness |
| Description | Yes | Corrections, agenda updates are normal |
| Cover Image | Yes | Visual refresh doesn't affect RSVPs |
| Speakers | No | Part of the event content commitment |

## Rejection Flow

When admin rejects an event:
1. Status returns to DRAFT
2. Organizer can see the event in their dashboard
3. Organizer can edit all fields and resubmit

**Note:** MVP does not include rejection reason/feedback. The organizer sees the event back in DRAFT and must infer what needs changing. Post-MVP: add a rejection reason text field.

## Consequences

### Positive
- **Quality control:** Every public event is vetted by an admin.
- **Trust:** Users know events on the platform are legitimate.
- **Simple:** Four status states cover the full lifecycle.
- **Safe editing:** Locked fields protect RSVP contract.

### Negative
- **Admin bottleneck:** Single admin must review all events. Slow if admin is unavailable.
- **Friction for organizers:** Can't publish instantly. May frustrate experienced organizers.
- **No rejection feedback:** Organizer doesn't know why their event was rejected (MVP limitation).

### Mitigations
- MVP targets small community — admin load is manageable.
- Post-MVP: add rejection reason field.
- Post-MVP: add trusted organizer tier to bypass approval.
- Post-MVP: add email notification when event is approved/rejected.
