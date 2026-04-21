# ADR-003: RSVP with Capacity Limit and Waitlist Promotion

## Status
**Accepted** — 2026-04-08

## Context
Events have a fixed capacity. We need to handle what happens when capacity is reached and when attendees cancel. The system must be fair and prevent data inconsistency under concurrent access.

## Decision
Implement a **GOING + WAITLISTED model** with automatic FIFO waitlist promotion using **Serializable database transactions**.

## RSVP State Machine

```
                    ┌─── capacity available ───> GOING
(no RSVP) ──────────┤
                    └─── capacity full ────────> WAITLISTED

GOING ──── cancel ────────────────────────────> CANCELLED
                                                    │
                              (promotes first       │
                               waitlisted to        │
                               GOING)               │
                                                    │
WAITLISTED ── cancel ─────────────────────────> CANCELLED
              (no promotion)                        │
                                                    │
WAITLISTED ── auto-promote ───────────────────> GOING
                                                    │
CANCELLED ── re-RSVP ──> (check capacity again) ───┘
```

## Alternatives Considered

### Option A: Simple Going / Not Going (No Waitlist)
- **Pros:** Dead simple. No promotion logic, no transaction complexity.
- **Cons:** Users who want to attend a full event have no way to express interest. If someone cancels, the spot is silently lost.
- **Rejected because:** Tech events frequently hit capacity. A waitlist is essential for fair access and organizer visibility into demand.

### Option B: Manual Waitlist (Organizer Promotes)
- **Pros:** Organizer has full control over who gets promoted.
- **Cons:** Requires organizer to actively monitor cancellations. Slow — users wait for human action.
- **Rejected because:** Adds organizer burden. Automated FIFO is fair and instant.

### Option C: Optimistic Locking (Version Column)
- **Pros:** Less restrictive than Serializable isolation. Better concurrency throughput.
- **Cons:** Requires retry logic when version conflicts occur. More complex application code.
- **Rejected because:** The throughput benefits don't matter at MVP scale. Serializable is simpler and correct.

## Transaction Design

### Why Serializable Isolation?

The RSVP creation and waitlist promotion involve a **read-then-write** pattern:
1. Read the current GOING count
2. Decide GOING vs WAITLISTED based on count vs capacity
3. Write the RSVP

Without Serializable isolation, two concurrent RSVPs could both read the same count and both go to GOING, exceeding capacity.

Similarly, two concurrent cancellations could both find the same first waitlisted user and both promote them, but only one cancellation actually frees a spot.

### RSVP Creation Transaction

```
BEGIN TRANSACTION (Serializable)
  1. SELECT RSVP WHERE userId = X AND eventId = Y
     - If GOING or WAITLISTED -> error "Already RSVP'd"
     - If CANCELLED -> will reactivate
  2. SELECT COUNT(*) FROM RSVP WHERE eventId = Y AND status = 'GOING'
  3. IF count < event.capacity
       -> INSERT/UPDATE RSVP with status = 'GOING'
     ELSE
       -> INSERT/UPDATE RSVP with status = 'WAITLISTED'
COMMIT
```

### Cancellation + Promotion Transaction

```
BEGIN TRANSACTION (Serializable)
  1. SELECT RSVP WHERE userId = X AND eventId = Y AND status IN ('GOING', 'WAITLISTED')
     - If not found -> error
  2. UPDATE RSVP SET status = 'CANCELLED' WHERE id = rsvp.id
  3. IF rsvp.status was 'GOING':
       SELECT RSVP WHERE eventId = Y AND status = 'WAITLISTED'
         ORDER BY createdAt ASC LIMIT 1
       IF found:
         UPDATE RSVP SET status = 'GOING' WHERE id = waitlisted.id
COMMIT
```

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Two users RSVP for last spot simultaneously | Serializable: one succeeds as GOING, other retried and gets WAITLISTED |
| Two users cancel simultaneously | Each promotes a different waitlisted user (or none if no waitlist) |
| User cancels and immediately re-RSVPs | Treated as new RSVP, may get waitlisted if spot was taken |
| Organizer reduces capacity below GOING count | Existing RSVPs untouched, new RSVPs go to waitlist |
| Event cancelled | All RSVPs (GOING + WAITLISTED) set to CANCELLED |
| RSVP to past event | Rejected at server action level (date check) |
| RSVP to cancelled event | Rejected at server action level (status check) |
| User RSVPs unlimited times (cancel/re-RSVP) | Allowed — no limit on changes |

## Consequences

### Positive
- **Fair:** FIFO waitlist ensures first-come-first-served.
- **Instant:** No human intervention needed for promotion.
- **Correct:** Serializable transactions prevent all race conditions.
- **Simple model:** Three states (GOING, WAITLISTED, CANCELLED) cover all cases.

### Negative
- **Serializable overhead:** Slightly higher lock contention under high concurrency.
- **No notification:** Promoted users don't know they've been promoted until they check (no email in MVP).
- **Single RSVP per user:** Can't RSVP for a group / +1.

### Mitigations
- MVP scale doesn't have enough concurrency for Serializable to matter.
- Post-MVP: add email notification on promotion.
- Post-MVP: add guest count / +1 feature if needed.
