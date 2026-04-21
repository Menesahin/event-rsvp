# Event RSVP - UI Wireframes

## Design Principles

- **Modern Minimal:** Clean lines, generous whitespace, lu.ma-inspired
- **Light theme only:** White backgrounds, subtle gray borders, accent color for CTAs
- **Mobile-first:** All layouts responsive, touch-friendly tap targets
- **shadcn/ui:** Consistent component library, no custom design system

---

## Homepage (`/`)

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Event RSVP              [Events]  [Sign In]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│         Where tech communities                          │
│             come together.                              │
│                                                         │
│    Simple event management with smart RSVP.             │
│                                                         │
│    [Browse Events]   [Create Event]                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Upcoming Events                                        │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  ┌─────────────┐│  │  ┌─────────────┐│              │
│  │  │ Cover Image ││  │  │ Cover Image ││              │
│  │  └─────────────┘│  │  └─────────────┘│              │
│  │  APR 15, 2026   │  │  APR 22, 2026   │              │
│  │  Next.js Conf   │  │  React Meetup   │              │
│  │  Istanbul       │  │  Istanbul       │              │
│  │  ░░░░░░░░░░ 3/50│  │  ░░░░░░░░░ 18/30│              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  ...more cards  │  │  ...more cards  │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│               [View All Events →]                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  © 2026 Event RSVP                                     │
└─────────────────────────────────────────────────────────┘
```

### Mobile Homepage
```
┌──────────────────────┐
│ [Logo]        [Menu] │
├──────────────────────┤
│                      │
│  Where tech          │
│  communities         │
│  come together.      │
│                      │
│  [Browse Events]     │
│  [Create Event]      │
│                      │
├──────────────────────┤
│ Upcoming Events      │
│                      │
│ ┌──────────────────┐ │
│ │ Cover Image      │ │
│ │ APR 15, 2026     │ │
│ │ Next.js Conf     │ │
│ │ Istanbul         │ │
│ │ ░░░░░░░░░░ 3/50  │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ ...next card     │ │
│ └──────────────────┘ │
│                      │
│ [View All Events →]  │
├──────────────────────┤
│ © 2026 Event RSVP    │
└──────────────────────┘
```

---

## Events Listing (`/events`)

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Event RSVP              [Events]  [Sign In]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  All Events                                             │
│                                                         │
│  Upcoming                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────┐│
│  │  Cover Image    │  │  Cover Image    │  │  Cover  ││
│  │  APR 15         │  │  APR 22         │  │  MAY 01 ││
│  │  Next.js Conf   │  │  React Meetup   │  │  TS D.. ││
│  │  Istanbul       │  │  Istanbul       │  │  Ankara ││
│  │  ░░░░░░░ 3/50   │  │  ░░░░░░░ 18/30  │  │  20/20 ││
│  └─────────────────┘  └─────────────────┘  └─────────┘│
│                                                         │
│  Past Events                                            │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  (dimmed)       │  │  (dimmed)       │              │
│  │  MAR 10         │  │  FEB 20         │              │
│  │  GraphQL Day    │  │  Rust Workshop  │              │
│  │  ENDED          │  │  ENDED          │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Event Detail (`/events/[slug]`)

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Event RSVP              [Events]  [Dashboard]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │              Cover Image (full width)           │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────┐  ┌──────────────────────┐│
│  │                          │  │                      ││
│  │  Next.js Conf Istanbul   │  │  📅 Apr 15, 2026     ││
│  │                          │  │     10:00 - 18:00    ││
│  │  Organized by            │  │                      ││
│  │  John Doe                │  │  📍 Istanbul Tech    ││
│  │                          │  │     Hub, Levent      ││
│  │  Join us for the biggest │  │                      ││
│  │  Next.js event in        │  │  ░░░░░░░░░░░ 3/50   ││
│  │  Turkey. We'll cover...  │  │  3 attending         ││
│  │                          │  │                      ││
│  │  (full description)      │  │  [    RSVP    ]      ││
│  │                          │  │                      ││
│  │                          │  │  [Copy Link]         ││
│  └──────────────────────────┘  └──────────────────────┘│
│                                                         │
│  Speakers                                               │
│  ┌───────────────────┐  ┌───────────────────┐          │
│  │  (avatar)         │  │  (avatar)         │          │
│  │  Jane Smith       │  │  Bob Wilson       │          │
│  │  Sr. Engineer     │  │  CTO at XYZ       │          │
│  │  at Vercel        │  │                   │          │
│  │  Short bio text.. │  │  Short bio text.. │          │
│  └───────────────────┘  └───────────────────┘          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### RSVP Button States

```
Not signed in:      [ Sign in to RSVP ]     (ghost style, redirects)
Available:          [       RSVP       ]     (primary, solid)
Going:              [    ✓ Going       ]     (green outline)
Waitlisted:         [  ⏳ On Waitlist  ]     (yellow outline)
Cancelled:          [    RSVP Again    ]     (primary, solid)
Past event:         [   Event Ended    ]     (disabled, gray)
Cancelled event:    [    Cancelled     ]     (disabled, red text)
```

### Mobile Event Detail
```
┌──────────────────────┐
│ [←]           [Menu] │
├──────────────────────┤
│ ┌──────────────────┐ │
│ │   Cover Image    │ │
│ └──────────────────┘ │
│                      │
│ Next.js Conf         │
│ Istanbul             │
│                      │
│ 📅 Apr 15, 2026     │
│    10:00 - 18:00     │
│ 📍 Istanbul Tech Hub │
│                      │
│ ░░░░░░░░░░░░░ 3/50  │
│ 3 attending          │
│                      │
│ [       RSVP       ] │
│ [     Copy Link    ] │
│                      │
│ Description          │
│ Join us for the...   │
│                      │
│ Speakers             │
│ ┌──────────────────┐ │
│ │ (avatar) Jane    │ │
│ │ Sr. Engineer     │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ (avatar) Bob     │ │
│ │ CTO at XYZ       │ │
│ └──────────────────┘ │
└──────────────────────┘
```

---

## Sign In (`/sign-in`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│              ┌───────────────────────┐                  │
│              │                       │                  │
│              │    [Logo] Event RSVP  │                  │
│              │                       │                  │
│              │  Sign in to your      │                  │
│              │  account              │                  │
│              │                       │                  │
│              │  Email                │                  │
│              │  ┌───────────────────┐│                  │
│              │  │ you@example.com   ││                  │
│              │  └───────────────────┘│                  │
│              │                       │                  │
│              │  [  Send Magic Link  ]│                  │
│              │                       │                  │
│              └───────────────────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Verify Request (Dev Mode)

```
┌───────────────────────┐
│                       │
│    ✉️ Check your email │
│                       │
│  A sign in link has   │
│  been sent to         │
│  you@example.com      │
│                       │
│  ── Dev Mode ──       │
│  Click to sign in:    │
│  [  Open Magic Link  ]│
│                       │
│  [← Back to Sign In] │
│                       │
└───────────────────────┘
```

---

## Dashboard (`/dashboard`)

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Event RSVP                        [avatar ▾]   │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  MENU    │  Dashboard                                   │
│          │                                              │
│ Dashboard│  My Events                    [+ New Event]  │
│ My Events│  ┌───────────────────────────────────────┐   │
│ My RSVPs │  │ Title        │ Status    │ RSVPs │ Act│   │
│          │  ├──────────────┼───────────┼───────┼────┤   │
│          │  │ Next.js Conf │ APPROVED  │ 3/50  │ ✎ 👁│   │
│          │  │ React Meetup │ ● PENDING │ -     │ ✎  │   │
│          │  │ GQL Workshop │ ○ DRAFT   │ -     │ ✎  │   │
│          │  └───────────────────────────────────────┘   │
│          │                                              │
│          │  My RSVPs                                    │
│          │  ┌───────────────────────────────────────┐   │
│          │  │ Event         │ Date      │ Status   │   │
│          │  ├───────────────┼───────────┼──────────┤   │
│          │  │ TS Deep Dive  │ May 1     │ ✓ Going  │   │
│          │  │ Rust Workshop │ Jun 10    │ ⏳ Wait  │   │
│          │  └───────────────────────────────────────┘   │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

---

## Create Event (`/dashboard/events/new`)

```
┌──────────┬──────────────────────────────────────────────┐
│          │                                              │
│  MENU    │  Create Event                                │
│          │                                              │
│          │  Title *                                     │
│          │  ┌──────────────────────────────────────┐    │
│          │  │ Next.js Conf Istanbul 2026           │    │
│          │  └──────────────────────────────────────┘    │
│          │                                              │
│          │  Description *                               │
│          │  ┌──────────────────────────────────────┐    │
│          │  │ Join us for the biggest Next.js...   │    │
│          │  │                                      │    │
│          │  │                                      │    │
│          │  └──────────────────────────────────────┘    │
│          │                                              │
│          │  Date & Time *          End Time              │
│          │  ┌────────────────┐    ┌────────────────┐    │
│          │  │ 2026-04-15 10:00│   │ 2026-04-15 18:00│   │
│          │  └────────────────┘    └────────────────┘    │
│          │                                              │
│          │  Location *                                  │
│          │  ┌──────────────────────────────────────┐    │
│          │  │ Istanbul Tech Hub, Levent            │    │
│          │  └──────────────────────────────────────┘    │
│          │                                              │
│          │  Cover Image URL                             │
│          │  ┌──────────────────────────────────────┐    │
│          │  │ https://example.com/cover.jpg        │    │
│          │  └──────────────────────────────────────┘    │
│          │                                              │
│          │  Capacity *                                  │
│          │  ┌──────────────────────────────────────┐    │
│          │  │ 50                                   │    │
│          │  └──────────────────────────────────────┘    │
│          │                                              │
│          │  Speakers                                    │
│          │  ┌──────────────────────────────────────┐    │
│          │  │  Name: Jane Smith                    │    │
│          │  │  Title: Sr. Engineer at Vercel       │    │
│          │  │  Bio: ...                            │    │
│          │  │  Avatar URL: ...              [🗑️]   │    │
│          │  └──────────────────────────────────────┘    │
│          │  [+ Add Speaker]                             │
│          │                                              │
│          │  [Save Draft]  [Submit for Review]           │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

---

## Admin Panel (`/admin/events`)

```
┌──────────┬──────────────────────────────────────────────┐
│          │                                              │
│  ADMIN   │  Pending Events                              │
│          │                                              │
│ Dashboard│  ┌─────────────────────────────────────────┐ │
│ Events   │  │                                         │ │
│          │  │  React Meetup Istanbul                  │ │
│          │  │  by organizer@eventrsvp.dev             │ │
│          │  │  Apr 22, 2026 · Istanbul · Cap: 30     │ │
│          │  │                                         │ │
│          │  │  "Join us for a casual React meetup..." │ │
│          │  │                                         │ │
│          │  │  [✓ Approve]  [✗ Reject]                │ │
│          │  │                                         │ │
│          │  └─────────────────────────────────────────┘ │
│          │                                              │
│          │  ┌─────────────────────────────────────────┐ │
│          │  │  ... more pending events                │ │
│          │  └─────────────────────────────────────────┘ │
│          │                                              │
│          │  No more pending events? ✨                  │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

---

## Event Card Component

Used in homepage and events listing.

```
┌─────────────────────┐
│ ┌─────────────────┐ │
│ │                 │ │  Cover image (16:9 aspect ratio)
│ │   Cover Image   │ │  Placeholder if no image
│ │                 │ │
│ └─────────────────┘ │
│                     │
│  APR 15, 2026       │  Date formatted
│                     │
│  Next.js Conf       │  Title (truncate at 2 lines)
│  Istanbul           │
│                     │
│  📍 Istanbul Tech   │  Location (truncate at 1 line)
│                     │
│  ░░░░░░░░░░░░ 3/50  │  Capacity progress bar
│  3 attending        │
│                     │
└─────────────────────┘

States:
- Past event: dimmed card, "ENDED" badge
- Full capacity: "FULL" badge, progress bar 100%
- Cancelled: "CANCELLED" badge, red tint
```

---

## Empty States

```
No upcoming events:
┌─────────────────────────┐
│                         │
│    📅                   │
│    No upcoming events   │
│                         │
│    Check back later or  │
│    create your own!     │
│                         │
│    [Create Event]       │
│                         │
└─────────────────────────┘

No RSVPs:
┌─────────────────────────┐
│                         │
│    🎫                   │
│    No RSVPs yet         │
│                         │
│    Browse events and    │
│    RSVP to get started. │
│                         │
│    [Browse Events]      │
│                         │
└─────────────────────────┘
```
