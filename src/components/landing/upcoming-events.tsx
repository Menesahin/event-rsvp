import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/shared/event-card";
import { EmptyState } from "@/components/shared/empty-state";
import { eventRepository } from "@/lib/repositories/event.repository";

export async function UpcomingEvents() {
  const events = await eventRepository.getUpcoming(6);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold">Upcoming Events</h2>

      {events.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No upcoming events"
          description="Check back later or create your own!"
          actionLabel="Create Event"
          actionHref="/dashboard/events/new"
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {events.length >= 6 && (
            <div className="mt-8 text-center">
              <Link href="/events">
                <Button variant="outline">View All Events</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
