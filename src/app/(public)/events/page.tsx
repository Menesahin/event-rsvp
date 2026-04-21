import type { Metadata } from "next";
import { eventRepository } from "@/lib/repositories/event.repository";
import { EventCard } from "@/components/shared/event-card";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Events",
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    eventRepository.getUpcoming(50),
    eventRepository.getPast(20),
  ]);

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="No events yet"
        description="Check back later or create your own!"
        actionLabel="Create Event"
        actionHref="/dashboard/events/new"
      />
    );
  }

  return (
    <div className="space-y-12">
      {upcoming.length > 0 && (
        <section>
          <h1 className="mb-6 text-2xl font-bold">Upcoming Events</h1>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-muted-foreground">
            Past Events
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
