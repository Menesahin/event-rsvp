# React 19 Best Practices Reference

## Actions — Core Paradigm

React 19's primary pattern: async functions passed to transitions automatically handle pending state, errors, and sequential execution.

```tsx
// Before React 19 — manual state management
const [isPending, setIsPending] = useState(false);
const [error, setError] = useState(null);
const handleSubmit = async () => {
  setIsPending(true);
  const err = await updateName(name);
  setIsPending(false);
  if (err) setError(err);
};

// React 19 — Actions handle it
const [isPending, startTransition] = useTransition();
const handleSubmit = () => {
  startTransition(async () => {
    const err = await updateName(name);
    if (err) setError(err);
  });
};
```

---

## useActionState

Combines action execution + state management. **Import from `'react'`** (not `'react-dom'`).

```tsx
'use client';
import { useActionState } from 'react'; // NOT react-dom

function ProfileForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: FormState | null, formData: FormData) => {
      const result = await updateProfile(formData);
      if (result.error) return { error: result.error };
      return { success: true };
    },
    null // initialState
  );

  return (
    <form action={formAction}>
      <input name="name" required />
      <SubmitButton isPending={isPending} />
      {state?.error && <p className="text-red-500">{state.error}</p>}
      {state?.success && <p className="text-green-500">Saved!</p>}
    </form>
  );
}
```

**Rules:**
- Actions execute sequentially (queued), not in parallel
- `isPending` is true from dispatch until action settles
- Return errors from the action function — don't throw
- `prevState` receives the return value of the previous action call

**With Server Actions (recommended pattern for this project):**

```tsx
'use client';
import { useActionState } from 'react';
import { createRSVP } from '@/lib/actions/rsvp';

function RSVPButton({ eventId }: { eventId: string }) {
  const [state, action, isPending] = useActionState(
    async (prev: RSVPState | null) => {
      return await createRSVP(eventId);
    },
    null
  );

  return (
    <form action={action}>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Processing...' : 'RSVP'}
      </button>
    </form>
  );
}
```

---

## useOptimistic

Instant UI feedback with automatic revert on failure.

```tsx
'use client';
import { useOptimistic, useTransition } from 'react';

interface RSVPSectionProps {
  currentCount: number;
  capacity: number;
  userRSVP: 'GOING' | 'WAITLISTED' | 'CANCELLED' | null;
}

function RSVPSection({ currentCount, capacity, userRSVP }: RSVPSectionProps) {
  const [optimisticCount, setOptimisticCount] = useOptimistic(currentCount);
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(userRSVP);
  const [isPending, startTransition] = useTransition();

  async function handleRSVP() {
    startTransition(async () => {
      // Immediate UI update
      setOptimisticCount(optimisticCount + 1);
      setOptimisticStatus('GOING');

      // Actual server call — reverts automatically on error
      await createRSVP(eventId);
    });
  }

  return (
    <div>
      <p>{optimisticCount}/{capacity} attending</p>
      <button onClick={handleRSVP} disabled={isPending}>
        {optimisticStatus === 'GOING' ? 'Going' : 'RSVP'}
      </button>
    </div>
  );
}
```

**With reducer for complex state:**

```tsx
const [optimisticItems, dispatch] = useOptimistic(
  items,
  (state, action: { type: 'add' | 'remove'; item: Item }) => {
    switch (action.type) {
      case 'add': return [...state, { ...action.item, pending: true }];
      case 'remove': return state.filter(i => i.id !== action.item.id);
    }
  }
);
```

---

## use() Hook

New primitive — can be called conditionally (unlike all other hooks).

```tsx
import { use } from 'react';

// Read context after early returns (impossible with useContext)
function EventCard({ event }: { event: Event | null }) {
  if (!event) return null;
  const theme = use(ThemeContext); // Works after conditional return
  return <div style={{ color: theme.primary }}>{event.title}</div>;
}

// Read promise (suspends until resolved)
function AttendeeList({ attendeesPromise }: { attendeesPromise: Promise<User[]> }) {
  const attendees = use(attendeesPromise); // Suspends
  return (
    <ul>
      {attendees.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

**Streaming pattern (Server → Client):**

```tsx
// Server Component — creates promise but doesn't await
export default function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const attendeesPromise = rsvpRepository.getAttendees(slug); // NOT awaited

  return (
    <div>
      <EventHeader slug={slug} />
      <Suspense fallback={<AttendeesSkeleton />}>
        <AttendeeList attendeesPromise={attendeesPromise} />
      </Suspense>
    </div>
  );
}

// Client Component — consumes promise
'use client';
function AttendeeList({ attendeesPromise }: { attendeesPromise: Promise<User[]> }) {
  const attendees = use(attendeesPromise);
  return <ul>{attendees.map(...)}</ul>;
}
```

**Rules:**
- CAN be called inside conditionals and loops
- CANNOT be called inside try-catch (use Error Boundary)
- In Server Components: prefer `async/await` over `use()`
- Create promise in Server Component, pass to Client — avoids recreation on render

---

## Form Handling

### `<form action={fn}>`

```tsx
// React 19: form action prop accepts a function
<form action={async (formData: FormData) => {
  'use server';
  await saveEvent(formData);
}}>
  <input name="title" required />
  <button type="submit">Save</button>
</form>
```

- On successful action: uncontrolled inputs reset automatically
- Function action always uses POST
- `<button formAction={fn}>` for multiple submit handlers in one form

### useFormStatus

```tsx
import { useFormStatus } from 'react-dom';

// MUST be in a CHILD of <form>, not the same component
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save'}
    </button>
  );
}

// Usage
<form action={serverAction}>
  <input name="title" />
  <SubmitButton /> {/* Child of form */}
</form>
```

---

## ref as Prop (No forwardRef)

```tsx
// React 19 — ref is a regular prop
function TextInput({
  placeholder,
  ref,
}: {
  placeholder: string;
  ref?: React.Ref<HTMLInputElement>;
}) {
  return <input placeholder={placeholder} ref={ref} />;
}

// Usage — unchanged
const inputRef = useRef<HTMLInputElement>(null);
<TextInput ref={inputRef} placeholder="Search events..." />
```

**Ref cleanup function (new):**

```tsx
<div ref={(node) => {
  // setup: node is mounted
  const observer = new IntersectionObserver(callback);
  observer.observe(node);

  return () => {
    // cleanup: node is unmounted
    observer.disconnect();
  };
}} />
```

**TypeScript:** Ref callbacks must return `void` or a cleanup function. Implicit arrow returns that return non-void will error.

---

## Context as Provider

```tsx
// React 19 — direct context rendering
<ThemeContext value="light">
  {children}
</ThemeContext>

// DEPRECATED — don't use
<ThemeContext.Provider value="light">
  {children}
</ThemeContext.Provider>
```

---

## Document Metadata in Components

```tsx
// Render title/meta anywhere — React hoists to <head>
function EventDetail({ event }: { event: Event }) {
  return (
    <article>
      <title>{event.title}</title>
      <meta name="description" content={event.description.slice(0, 160)} />
      <h1>{event.title}</h1>
      {/* ... */}
    </article>
  );
}
```

Works in client-only, SSR, and Server Components. Auto-deduplicated.

---

## Suspense & Streaming

### Nested Suspense for progressive reveal

```tsx
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<EventsSkeleton />}>
    <UpcomingEvents />
    <Suspense fallback={<PastEventsSkeleton />}>
      <PastEvents />
    </Suspense>
  </Suspense>
</Suspense>
```

### Navigation without flash (use Transitions)

```tsx
// Link with transition keeps current page visible while loading
import Link from 'next/link';

// Next.js handles this automatically with <Link>
<Link href={`/events/${slug}`}>View Event</Link>
```

### Key reset for route changes

```tsx
// New key = new component instance = new Suspense boundary
<EventDetail key={slug} slug={slug} />
```

---

## React Compiler

When enabled (`reactCompiler: true` in next.config.ts):

- **Remove** manual `useMemo`, `useCallback`, `React.memo` added for performance
- **Keep** them only when they express semantic meaning (stable refs for external effects)
- The compiler enforces Rules of React — code with violations won't be optimized
- Install: `npm install babel-plugin-react-compiler@latest`

---

## useDeferredValue (New initialValue)

```tsx
// React 19: provide initialValue for first render
const deferredQuery = useDeferredValue(query, '');
//                                              ^^ shown on initial render

// Useful for search-as-you-type
function EventSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query, '');

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: query !== deferredQuery ? 0.5 : 1 }}>
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults query={deferredQuery} />
        </Suspense>
      </div>
    </div>
  );
}
```

---

## Deprecated Features (Do NOT Use)

| Deprecated | Use Instead |
|-----------|-------------|
| `forwardRef` | `ref` as regular prop |
| `<Context.Provider>` | `<Context value={x}>` |
| `ReactDOM.useFormState` | `useActionState` from `'react'` |
| `propTypes` / `defaultProps` on functions | TypeScript + ES6 defaults |
| String refs `ref="input"` | Callback refs or `useRef` |
| Legacy context (`contextTypes`) | `createContext` |
| `ReactDOM.render` | `createRoot().render()` |
| `ReactDOM.findDOMNode` | Refs |
| `element.ref` access | `element.props.ref` |

---

## TypeScript Changes

```ts
// useRef — always needs argument
useRef(null);        // OK
useRef(undefined);   // OK
useRef();            // ERROR in React 19 types

// Ref callbacks — must return void or cleanup
<div ref={node => { instance = node; }} />        // ERROR: implicit return
<div ref={node => { instance = node; return; }} /> // OK

// ReactElement props is now unknown (was any)
type Props = ReactElement["props"]; // unknown — need type assertion
```
