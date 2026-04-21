# Event RSVP - Project Overview

## Vision

A modern, minimal event RSVP platform built for tech communities. Think lu.ma meets Meetup, stripped down to what actually matters: creating events, managing attendance, and getting out of the way.

## Problem

Tech community organizers juggle multiple tools to manage events:
- Google Forms for RSVPs (no capacity management, no waitlist)
- Eventbrite (overkill for free community events, cluttered UI)
- Meetup.com (subscription fees, dated design)
- Luma (great but limited customization)

None of these provide a simple, self-hostable solution focused specifically on tech community needs.

## Solution

Event RSVP provides:
- **Simple event creation** with admin quality control (approval workflow)
- **Smart RSVP** with automatic capacity management and waitlist promotion
- **Speaker showcase** for tech talks, workshops, and meetups
- **Zero-friction auth** via magic link (no passwords to remember)
- **Clean, modern UI** that loads fast and works on mobile

## Target Audience

**Primary:** Tech community organizers
- Developer meetup organizers
- Hackathon coordinators
- Tech talk / conference hosts
- Workshop facilitators

**Secondary:** Tech community members
- Developers looking for local events
- People who want a quick RSVP experience without account friction

## Scope (MVP)

### In Scope
- Event CRUD with approval workflow
- RSVP with capacity + waitlist
- Speaker information per event
- Magic link authentication (with demo bypass)
- Public event pages (RSVP requires login)
- Admin panel for event approval
- Organizer dashboard
- Copy link sharing
- Responsive design (mobile-first)

### Out of Scope (Future)
- Email/push notifications
- Event search and filtering
- User profiles
- Comments / discussion
- Calendar integration (Google Cal, iCal)
- Recurring events
- Ticket pricing / payments
- Social login (Google, GitHub)
- Multi-language support
- Dark theme
- Analytics dashboard
- Event categories / tags
- Community / group management

## User Roles

| Role | Can Do |
|------|--------|
| **Visitor** (unauthenticated) | View event listings and details |
| **Attendee** | RSVP to events, view own RSVPs in dashboard |
| **Organizer** | Create events (requires admin approval), manage own events, view attendee list |
| **Admin** | Approve/reject events, manage all events, all organizer permissions |

## Key Metrics (Success Criteria)

- Event creation to approval < 24h (process, not technical)
- RSVP action < 2 seconds (technical)
- Zero double-RSVPs (enforced by DB constraint)
- Waitlist promotion happens instantly on cancellation
